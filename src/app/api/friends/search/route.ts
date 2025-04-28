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

  // Get search term from query params
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");
  
  if (!term) {
    return NextResponse.json({ friends: [] });
  }
  
  try {
    // Get all of the current user's friends first
    const followerIds = await prisma.follower.findMany({
      where: {
        followingId: userId,
      },
      select: {
        followerId: true,
      },
    });
    
    const friendIds = followerIds.map(f => f.followerId);
    
    // Search for friends that match the search term
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
      take: 10, // Limit results
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