"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "./client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { uploadFile } from "./uploadFile";
import { createLikeNotification, createCommentNotification, createFollowNotification, createNewPostNotification } from "./actions/notifications";

export const switchFollow = async (userId: string) => {
  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    throw new Error("User is not authenticated!");
  }

  try {
    const existingFollow = await prisma.follower.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId,
      },
    });

    if (existingFollow) {
      await prisma.follower.delete({
        where: {
          id: existingFollow.id,
        },
      });
    } else {
      const existingFollowRequest = await prisma.followRequest.findFirst({
        where: {
          senderId: currentUserId,
          receiverId: userId,
        },
      });

      if (existingFollowRequest) {
        await prisma.followRequest.delete({
          where: {
            id: existingFollowRequest.id,
          },
        });
      } else {
        await prisma.followRequest.create({
          data: {
            senderId: currentUserId,
            receiverId: userId,
          },
        });

        // Tạo thông báo khi có người gửi lời mời kết bạn/follow
        await createFollowNotification(currentUserId, userId);
      }
    }
    
    revalidatePath('/profile/[username]', 'page');
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const switchBlock = async (userId: string) => {
  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingBlock = await prisma.block.findFirst({
      where: {
        blockerId: currentUserId,
        blockedId: userId,
      },
    });

    if (existingBlock) {
      await prisma.block.delete({
        where: {
          id: existingBlock.id,
        },
      });
    } else {
      await prisma.block.create({
        data: {
          blockerId: currentUserId,
          blockedId: userId,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const acceptFollowRequest = async (userId: string) => {
  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingFollowRequest = await prisma.followRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: currentUserId,
      },
    });

    if (existingFollowRequest) {
      await prisma.followRequest.delete({
        where: {
          id: existingFollowRequest.id,
        },
      });

      await prisma.follower.create({
        data: {
          followerId: userId,
          followingId: currentUserId,
        },
      });

      // Tạo thông báo cho người gửi lời mời kết bạn
      await createFollowNotification(currentUserId, userId);
    }

    revalidatePath('/friend-requests');
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const declineFollowRequest = async (userId: string) => {
  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingFollowRequest = await prisma.followRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: currentUserId,
      },
    });

    if (existingFollowRequest) {
      await prisma.followRequest.delete({
        where: {
          id: existingFollowRequest.id,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const updateProfile = async (
  prevState: { success: boolean; error: boolean },
  payload: { formData: FormData; cover: string }
) => {
  const { formData, cover } = payload;
  const fields = Object.fromEntries(formData);

  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== "")
  );

  // Convert birthDate string to Date object if it exists
  let birthDateValue: Date | undefined;
  if (filteredFields.birthDate && typeof filteredFields.birthDate === 'string') {
    birthDateValue = new Date(filteredFields.birthDate);
    delete filteredFields.birthDate; // Remove from filtered fields as we'll add it properly later
  }

  const Profile = z.object({
    cover: z.string().optional(),
    name: z.string().max(60).optional(),
    surname: z.string().max(60).optional(),
    birthDate: z.date().optional(),
    description: z.string().max(255).optional(),
    city: z.string().max(60).optional(),
    school: z.string().max(60).optional(),
    work: z.string().max(60).optional(),
    website: z.string().max(60).optional(),
  });

  const validatedFields = Profile.safeParse({ 
    cover, 
    ...filteredFields,
    ...(birthDateValue && { birthDate: birthDateValue })
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: true };
  }

  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: true };
  }

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: validatedFields.data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const switchLike = async (postId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User is not authenticated!!");
  }

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        postId,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });

      // Lấy thông tin người đăng bài
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          userId: true, // ID của người đăng bài
        },
      });
      
      // Tạo thông báo khi like bài viết (chỉ khi người like khác người đăng bài)
      if (post && post.userId !== userId) {
        await createLikeNotification(userId, post.userId, postId);
      }
    }

    revalidatePath("/post/[id]", "page");
    return { success: true };
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const addComment = async (postId: number, desc: string, parentId?: number | null) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User is not authenticated!!");
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        desc,
        userId,
        postId,
        parentId: parentId || null,
      },
    });

    // Nếu đây là comment gốc (không phải reply)
    if (!parentId) {
      // Lấy thông tin người đăng bài
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          userId: true, // ID của người đăng bài
        },
      });

      // Tạo thông báo khi comment bài viết (chỉ khi người comment khác người đăng bài)
      if (post && post.userId !== userId) {
        await createCommentNotification(userId, post.userId, postId, comment.id);
      }
    } else {
      // Đây là reply, lấy thông tin comment gốc
      const parentComment = await prisma.comment.findUnique({
        where: {
          id: parentId,
        },
        select: {
          userId: true, // ID của người comment gốc
        },
      });

      // Tạo thông báo khi reply comment (chỉ khi người reply khác người comment gốc)
      if (parentComment && parentComment.userId !== userId) {
        await createCommentNotification(userId, parentComment.userId, postId, comment.id);
      }
    }
    
    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

//add cac bai post
export const addPost = async (formData: FormData, media: string, mediaType?: "image" | "video") => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User is not Authenticated!");
  }

  const desc = formData.get("desc")?.toString() || "";

  try {
    const post = await prisma.post.create({
      data: {
        desc,
        userId,
        ...(mediaType === "image" && { img: media }),
        ...(mediaType === "video" && { video: media }),
      },
    });

    // Tạo thông báo cho followers khi có bài viết mới
    await createNewPostNotification(userId, post.id);

    revalidatePath("/");
    return post;
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const addStory = async (img: string) => {
  const { userId } = await auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const existingStory = await prisma.story.findFirst({
      where: {
        userId,
      },
    });

    if (existingStory) {
      await prisma.story.delete({
        where: {
          id: existingStory.id,
        },
      });
    }
    const createdStory = await prisma.story.create({
      data: {
        userId,
        img,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: {
        user: true,
      },
    });

    return createdStory;
  } catch (err) {
    console.log(err);
  }
};

export const deletePost = async (postId: number) => {
  const { userId } = await auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    await prisma.post.delete({
      where: {
        id: postId,
        userId,
      },
    });
    revalidatePath("/")
  } catch (err) {
    console.log(err);
  }
};

export const deleteComment = async (commentId: number) => {
  const { userId } = await auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    await prisma.comment.delete({
      where: {
        id: commentId,
        userId, // Only allow users to delete their own comments
      },
    });
    revalidatePath("/");
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export async function createStory(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const file = formData.get('file') as File;
  const type = formData.get('type') as string;

  if (!file) throw new Error('No file provided');

  try {
    // Upload file to storage service (e.g. S3, Cloudinary)
    const uploadedFile = await uploadFile(file);

    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create story in database
    await prisma.story.create({
      data: {
        userId,
        expiresAt,
        ...(type === 'video' 
          ? { video: uploadedFile.url } 
          : { img: uploadedFile.url }
        ),
      },
    });
  } catch (error) {
    console.error('Error creating story:', error);
    throw new Error('Failed to create story');
  }
}

export const deleteStory = async (storyId: number) => {
  const { userId } = await auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const story = await prisma.story.findUnique({
      where: {
        id: storyId,
      },
    });

    if (!story) throw new Error("Story not found!");
    if (story.userId !== userId) throw new Error("Unauthorized!");

    await prisma.story.delete({
      where: {
        id: storyId,
      },
    });

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

// Search for users and posts
export const searchContent = async (query: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User is not authenticated!");
  }

  try {
    // Search for users by username or name
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { surname: { contains: query, mode: 'insensitive' } },
        ],
        // Don't show blocked users or users that have blocked the current user
        AND: [
          {
            NOT: {
              blocks: {
                some: {
                  blockedId: userId,
                }
              }
            }
          },
          {
            NOT: {
              blockedBy: {
                some: {
                  blockerId: userId,
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        avatar: true,
      },
      take: 5, // Limit results
    });

    // Search for posts by description
    const posts = await prisma.post.findMany({
      where: {
        desc: {
          contains: query,
          mode: 'insensitive',
        },
        // Don't show posts from blocked users or users that have blocked the current user
        user: {
          AND: [
            {
              NOT: {
                blocks: {
                  some: {
                    blockedId: userId,
                  }
                }
              }
            },
            {
              NOT: {
                blockedBy: {
                  some: {
                    blockerId: userId,
                  }
                }
              }
            }
          ]
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5, // Limit results
    });

    return { users, posts };
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong with the search!");
  }
};