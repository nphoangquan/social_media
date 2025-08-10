import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Lấy cụm từ tìm kiếm từ tham số truy vấn
  const { searchParams } = new URL(request.url);
  const q = z.object({ term: z.string().min(1) }).safeParse({ term: searchParams.get("term") });
  if (!q.success) {
    return NextResponse.json({ friends: [] });
  }
  const { term } = q.data;
  
  try {
    // Trước tiên lấy tất cả bạn bè của người dùng hiện tại
    const followerIds = await prisma.follower.findMany({
      where: {
        followingId: userId,
      },
      select: {
        followerId: true,
      },
    });
    
    const friendIds = followerIds.map(f => f.followerId);
    
    // Tìm kiếm bạn bè phù hợp với cụm từ tìm kiếm
    const friends = await prisma.user.findMany({
      where: {
        id: {
          in: friendIds,
        },
        OR: [
          {
            username: {
              contains: term,
              mode: 'insensitive',
            }
          },
          {
            name: {
              contains: term,
              mode: 'insensitive',
            }
          },
          {
            surname: {
              contains: term,
              mode: 'insensitive',
            }
          },
        ],
      },
      take: 10, // Giới hạn kết quả
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error("Error searching friends:", error);
    return NextResponse.json(
      { error: "Failed to search friends" },
      { status: 500 }
    );
  }
} 