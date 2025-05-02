import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

type RouteContext = {
  params: Promise<{ chatId: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { userId } = await auth();
  const url = new URL(request.url);
  
  // Default pagination: 15 items per page, start from page 0
  const page = parseInt(url.searchParams.get('page') || '0');
  const limit = parseInt(url.searchParams.get('limit') || '15');
  const skip = page * limit;

  if (!userId) {
    return Promise.resolve(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  try {
    const { chatId } = await context.params;
    const chatIdInt = parseInt(chatId);

    // Verify user is part of this chat
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatId: chatIdInt,
        userId: userId
      }
    });

    if (!participant) {
      return Promise.resolve(NextResponse.json({ error: "Not authorized to view this chat" }, { status: 403 }));
    }

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: {
        chatId: chatIdInt
      }
    });

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatIdInt
      },
      orderBy: {
        createdAt: "desc" // Get newest messages first
      },
      take: limit,
      skip: skip,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Reverse to show oldest messages first for the UI
    const orderedMessages = [...messages].reverse();

    return Promise.resolve(NextResponse.json({
      messages: orderedMessages,
      hasMore: totalCount > skip + limit,
      totalCount
    }));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Promise.resolve(NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 }));
  }
} 