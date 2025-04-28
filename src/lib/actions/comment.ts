'use server';

import prisma from "@/lib/client";

export async function getPostComments(postId: number) {
  try {
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

    // Transform comments to include like count
    const commentsWithLikes = comments.map(comment => ({
      ...comment,
      likes: comment.likes.length,
      replies: comment.replies.map(reply => ({
        ...reply,
        likes: reply.likes.length,
      })),
    }));

    return commentsWithLikes;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
} 