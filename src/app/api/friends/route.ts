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

  // Lấy trang từ tham số truy vấn
  const { searchParams } = new URL(request.url);
  const q = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
  const page = q.success ? (q.data.page ?? 1) : 1;
  const limit = q.success ? (q.data.limit ?? 15) : 15;
  
  // Tính toán phân trang
  const skip = (page - 1) * limit;
  
  try {
    // Lấy người theo dõi với phân trang
    const followers = await prisma.follower.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Lấy tổng số lượng cho phân trang
    const totalCount = await prisma.follower.count({
      where: {
        followingId: userId,
      },
    });

    // Chuyển đổi từ người theo dõi sang đối tượng người dùng
    const friends = followers.map(follow => follow.follower);

    return NextResponse.json({
      friends,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + limit < totalCount
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
} 