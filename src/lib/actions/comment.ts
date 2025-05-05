'use server';

import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";

export async function getPostComments(postId: number) {
  try {
    // Lấy ID người dùng hiện tại
    const { userId } = await auth();
    
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
        parentId: null, // Chỉ lấy bình luận cấp cao nhất
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

    // Chuyển đổi bình luận để bao gồm số lượng thích và xem người dùng hiện tại đã thích hay chưa
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