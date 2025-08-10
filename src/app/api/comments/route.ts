import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "@/shared/constants/pagination";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const q = z.object({
    postId: z.string().regex(/^\d+$/),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).safeParse({
    postId: searchParams.get("postId"),
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!q.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const postId = parseInt(q.data.postId);
  const page = q.data.page ?? DEFAULT_PAGE;
  const limit = q.data.limit ?? DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  try {
    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        user: true,
        likes: true,
        replies: { include: { user: true, likes: true }, orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const totalCount = await prisma.comment.count({ where: { postId, parentId: null } });

    const commentsWithLikes = comments.map((comment) => ({
      ...comment,
      likes: comment.likes.length,
      likedByCurrentUser: userId ? comment.likes.some((l) => l.userId === userId) : false,
      replies: comment.replies.map((reply) => ({
        ...reply,
        likes: reply.likes.length,
        likedByCurrentUser: userId ? reply.likes.some((l) => l.userId === userId) : false,
      })),
    }));

    return NextResponse.json({
      comments: commentsWithLikes,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + limit < totalCount,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}