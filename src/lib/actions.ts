"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "./client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createLikeNotification, createCommentNotification, createFollowNotification, createNewPostNotification, createCommentLikeNotification } from "./actions/notifications";
import { addCommentSchema } from "@/shared/validation/comment";

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

  // Chuyển đổi chuỗi birthDate thành đối tượng Date nếu nó tồn tại
  let birthDateValue: Date | undefined;
  if (filteredFields.birthDate && typeof filteredFields.birthDate === 'string') {
    birthDateValue = new Date(filteredFields.birthDate);
    delete filteredFields.birthDate; // Xóa khỏi filtered fields vì chúng ta sẽ thêm nó lại sau
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
    const parsed = addCommentSchema.safeParse({ postId, desc, parentId: parentId ?? null });
    if (!parsed.success) throw new Error("Invalid comment payload");

    const comment = await prisma.comment.create({
      data: {
        desc,
        userId,
        postId,
        parentId: parentId || null,
      },
      include: {
        user: true,
      }
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
    return comment;
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
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          }
        }
      }
    });

    // Tạo thông báo cho followers khi có bài viết mới
    await createNewPostNotification(userId, post.id);

    revalidatePath("/");
    return {
      ...post,
      comments: [],
      currentUserId: userId
    };
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const addStory = async (media: string, resourceType?: string) => {
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
        ...(resourceType === "video" 
          ? { video: media } 
          : { img: media }),
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
    // Kiểm tra quyền xóa bài viết
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    // Lấy thông tin bài viết
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });
    
    if (!post) {
      return { success: false, error: "Post not found" };
    }
    
    // Nếu là admin hoặc moderator, hoặc chính là người tạo bài viết
    if (user?.role === "admin" || user?.role === "moderator" || post.userId === userId) {
      await prisma.post.delete({
        where: {
          id: postId,
        },
      });
      revalidatePath("/");
      return { success: true, postId };
    } else {
      return { success: false, error: "You don't have permission to delete this post" };
    }
  } catch (err) {
    console.log(err);
    return { success: false, error: "Failed to delete post" };
  }
};

export const deleteComment = async (commentId: number) => {
  const { userId } = await auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    // Kiểm tra quyền xóa bình luận
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    // Lấy thông tin bình luận
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    });
    
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    // Nếu là admin hoặc moderator, hoặc chính là người tạo bình luận
    if (user?.role === "admin" || user?.role === "moderator" || comment.userId === userId) {
      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      });
      revalidatePath("/");
      return { success: true };
    } else {
      throw new Error("You don't have permission to delete this comment");
    }
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
    // Tải file trực tiếp lên Cloudinary
    const formDataForCloudinary = new FormData();
    formDataForCloudinary.append('file', file);
    formDataForCloudinary.append('upload_preset', 'social-media');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${(await import("@/shared/config/env")).env.client.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type === 'video' ? 'video' : 'image'}/upload`,
      {
        method: 'POST',
        body: formDataForCloudinary,
      }
    );
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    const fileUrl = data.secure_url;

    // Tính thời gian hết hạn (24 giờ kể từ bây giờ)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Tạo story trong cơ sở dữ liệu
    await prisma.story.create({
      data: {
        userId,
        expiresAt,
        ...(type === 'video' 
          ? { video: fileUrl } 
          : { img: fileUrl }
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

// Update only avatar URL for current user
export async function updateUserAvatar(avatarUrl: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
    revalidatePath("/", "layout");
    revalidatePath("/profile/[username]", "layout");
    revalidatePath("/settings", "layout");
    return { success: true };
  } catch (err) {
    console.error("Failed to update user avatar:", err);
    return { success: false, error: "Failed to update user avatar" };
  }
}

// Search for users and posts
export const searchContent = async (query: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User is not authenticated!");
  }

  try {
    // Tìm kiếm người dùng theo tên người dùng hoặc tên
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { surname: { contains: query, mode: 'insensitive' } },
        ],
        // Không hiển thị người dùng bị chặn hoặc người dùng đã chặn người dùng hiện tại
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
      take: 5, // Giới hạn kết quả
    });

    // Tìm kiếm bài đăng theo mô tả
    const posts = await prisma.post.findMany({
      where: {
        desc: {
          contains: query,
          mode: 'insensitive',
        },
        // Không hiển thị bài đăng từ người dùng bị chặn hoặc người dùng đã chặn người dùng hiện tại
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
      take: 5, // Giới hạn kết quả
    });

    return { users, posts };
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong with the search!");
  }
};

// Thêm hàm này để đồng bộ hóa avatar người dùng từ Clerk vào cơ sở dữ liệu
export async function synchronizeUserAvatar() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  try {
    // Lấy người dùng hiện tại từ Clerk
    const user = await currentUser();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Cập nhật avatar trong cơ sở dữ liệu với imageUrl hiện tại từ Clerk
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: user.imageUrl }
    });
    
    // Cập nhật tất cả các trang nơi avatar có thể được hiển thị
    revalidatePath("/", "layout");
    revalidatePath("/profile/[username]", "layout");
    revalidatePath("/settings", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to sync user avatar:", error);
    return { success: false, error: "Failed to synchronize avatar" };
  }
}

export const switchCommentLike = async (commentId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User is not authenticated!!");
  }

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        commentId,
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
          commentId,
        },
      });

      // Lấy thông tin bình luận và bài viết của nó
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: {
          userId: true, // ID của người viết bình luận
          postId: true, // ID của bài viết mà bình luận thuộc về
        }
      });
      
      // Create notification for comment like (only if liker is different from comment author)
      if (comment && comment.userId !== userId) {
        await createCommentLikeNotification(userId, comment.userId, comment.postId, commentId);
      }
    }

    revalidatePath("/post/[id]", "page");
    return { success: true };
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};