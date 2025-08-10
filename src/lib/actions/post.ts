'use server';

import prisma from "@/lib/client";
import { FeedPostType } from "@/shared/types/post";
import { auth } from "@clerk/nextjs/server";

export async function getPosts(page: number = 1, limit: number = 2, username?: string): Promise<FeedPostType[]> {
  try {
    const { userId } = await auth();
    
    const posts = await prisma.post.findMany({
      where: username ? {
        user: {
          username: username
        }
      } : undefined,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        comments: {
          take: 2, // Ban đầu chỉ tải 2 bình luận để xem trước
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Chuyển đổi bài đăng để bao gồm tất cả lượt thích và currentUserId
    const transformedPosts: FeedPostType[] = posts.map(post => ({
      ...post,
      _count: {
        comments: post._count.comments,
        likes: post._count.likes,
      },
      likes: post.likes.map(like => ({ userId: like.userId })),
      currentUserId: userId || '',
    }));

    return transformedPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPostDetails(postId: number) {
  try {
    const { userId } = await auth();
    
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
        parentId: null,
      },
      include: {
        user: true,
        likes: true,
        replies: {
          include: {
            user: true,
            likes: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Chuyển đổi bình luận để bao gồm số lượt thích và xem người dùng hiện tại đã thích hay chưa
    const commentsWithLikes = comments.map(comment => ({
      ...comment,
      likes: comment.likes.length,
      likedByCurrentUser: userId ? comment.likes.some(like => like.userId === userId) : false,
      replies: comment.replies.map(reply => ({
        ...reply,
        likes: reply.likes.length,
        likedByCurrentUser: userId ? reply.likes.some(like => like.userId === userId) : false,
      })),
    }));

    return {
      comments: commentsWithLikes,
      currentUserId: userId,
    };
  } catch (error) {
    console.error("Error fetching post details:", error);
    return null;
  }
}

export async function getUserPhotos(username?: string, limit: number = 20, page: number = 1): Promise<{ id: number, img: string, postId: number }[]> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return [];
    }
    
    // Tìm tất cả bài đăng có hình ảnh, lọc theo tên người dùng hoặc người dùng hiện tại
    const posts = await prisma.post.findMany({
      where: {
        img: {
          not: null
        },
        user: {
          ...(username ? { username } : { id: userId })
        }
      },
      select: {
        id: true,
        img: true,
        user: {
          select: {
            id: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Chuyển đổi và chỉ trả về hình ảnh với postId của chúng
    return posts
      .filter(post => post.img) // đảm bảo img tồn tại
      .map(post => ({
        id: post.id,
        img: post.img as string,
        postId: post.id
      }));
      
  } catch (error) {
    console.error("Error fetching user photos:", error);
    return [];
  }
}

export async function getUserVideos(username?: string, limit: number = 20, page: number = 1): Promise<{ id: number, video: string, postId: number }[]> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return [];
    }
    
    // Tìm tất cả bài đăng có video, lọc theo tên người dùng hoặc người dùng hiện tại
    const posts = await prisma.post.findMany({
      where: {
        video: {
          not: null
        },
        user: {
          ...(username ? { username } : { id: userId })
        }
      },
      select: {
        id: true,
        video: true,
        user: {
          select: {
            id: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Chuyển đổi và chỉ trả về video với postId của chúng
    return posts
      .filter(post => post.video) // đảm bảo video tồn tại
      .map(post => ({
        id: post.id,
        video: post.video as string,
        postId: post.id
      }));
      
  } catch (error) {
    console.error("Error fetching user videos:", error);
    return [];
  }
} 