'use server';

import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";

export async function getPostComments(postId: number) {
  try {
    // Get current user ID
    const { userId } = await auth();
    
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
        parentId: null, // Only fetch top-level comments
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

    return commentsWithLikes;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
} 