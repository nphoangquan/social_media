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
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    const chatIdNumber = parseInt(chatId);

    // Kiểm tra xem người dùng có phải là thành viên trong cuộc trò chuyện này không
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatId: chatIdNumber,
        userId: userId
      }
    });

    if (!participant) {
      return NextResponse.json({ error: "Not a participant in this chat" }, { status: 403 });
    }

    // Lấy thông tin cuộc trò chuyện với danh sách thành viên
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatIdNumber
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error getting chat info:", error);
    return NextResponse.json(
      { error: "Failed to get chat info" },
      { status: 500 }
    );
  }
} 