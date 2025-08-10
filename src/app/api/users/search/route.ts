import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const q = z.object({ query: z.string().min(1) }).safeParse({ query: searchParams.get("query") });
    if (!q.success) return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    const { query } = q.data;

    // Lấy danh sách người dùng mà người dùng hiện tại chưa chặn và chưa bị chặn bởi người dùng hiện tại
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { surname: { contains: query, mode: "insensitive" } },
              { username: { contains: query, mode: "insensitive" } },
            ],
          },
          {
            // Loại trừ những người dùng đã chặn người dùng hiện tại
            blockedBy: {
              none: {
                blockerId: userId,
              },
            },
          },
          {
            // Loại trừ những người dùng bị chặn bởi người dùng hiện tại
            blocks: {
              none: {
                blockedId: userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
      },
      take: 10,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
} 