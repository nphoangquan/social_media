import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Lấy tham số từ URL
  const { searchParams } = new URL(request.url);
  const postId = parseInt(searchParams.get("postId") || "0");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "15", 10);
  
  if (!postId) {
    return NextResponse.json(
      { error: "Post ID is required" },
      { status: 400 }
    );
  }
  
  // Tính toán phân trang
  const skip = (page - 1) * limit;
  
  try {
    // Lấy comments với phân trang
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
      skip,
      take: limit,
    });

    // Lấy tổng số lượng comment cho phân trang
    const totalCount = await prisma.comment.count({
      where: {
        postId: postId,
        parentId: null,
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

    return NextResponse.json({
      comments: commentsWithLikes,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + limit < totalCount
    });
  } catch (error) {
    console.error("Error fetching paginated comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
} 