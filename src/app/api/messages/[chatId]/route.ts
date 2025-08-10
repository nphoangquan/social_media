import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ chatId: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { userId } = await auth();
  const url = new URL(request.url);
  const querySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  });
  const parsed = querySchema.safeParse({
    page: url.searchParams.get('page') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
  });
  const page = parsed.success ? (parsed.data.page ?? 0) : 0;
  const limit = parsed.success ? (parsed.data.limit ?? 15) : 15;
  const skip = page * limit;

  if (!userId) {
    return Promise.resolve(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  try {
    const { chatId } = await context.params;
    const chatIdInt = parseInt(chatId);

    // Xác minh người dùng là thành viên của cuộc trò chuyện này
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatId: chatIdInt,
        userId: userId
      }
    });

    if (!participant) {
      return Promise.resolve(NextResponse.json({ error: "Not authorized to view this chat" }, { status: 403 }));
    }

    // Lấy tổng số lượng tin nhắn cho phân trang
    const totalCount = await prisma.message.count({
      where: {
        chatId: chatIdInt
      }
    });

    // Lấy tin nhắn với phân trang
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatIdInt
      },
      orderBy: {
        createdAt: "desc" // Lấy tin nhắn mới nhất trước
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

    // Đảo ngược để hiển thị tin nhắn cũ nhất trước tiên cho giao diện người dùng
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