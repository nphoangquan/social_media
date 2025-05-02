'use server';

import prisma from "@/lib/client";
import { FeedPostType } from "@/components/feed/Post";
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
          take: 2, // Initially load only 2 comments for preview
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

    // Transform posts to include all likes and currentUserId
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

    // Transform comments to include like count and whether current user has liked
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