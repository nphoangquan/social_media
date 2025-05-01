import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    // Get users who current user has not blocked and who have not blocked current user
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
            // Exclude users who have blocked the current user
            blockedBy: {
              none: {
                blockerId: userId,
              },
            },
          },
          {
            // Exclude users who are blocked by the current user
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