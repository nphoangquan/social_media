import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { z } from "zod";

export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);
  const q = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).safeParse({
    page: url.searchParams.get('page') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
  });
  const page = q.success ? (q.data.page ?? 0) : 0;
  const limit = q.success ? (q.data.limit ?? 15) : 15;
  const skip = page * limit;
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Lấy tổng số lượng cho phân trang
    const totalCount = await prisma.chatParticipant.count({
      where: {
        userId: userId,
      }
    });

    // Lấy cuộc trò chuyện với phân trang
    const participants = await prisma.chatParticipant.findMany({
      where: {
        userId: userId,
      },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: true
              }
            },
            messages: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1,
              include: {
                sender: true
              }
            }
          }
        }
      },
      orderBy: {
        chat: {
          updatedAt: 'desc'
        }
      },
      take: limit,
      skip: skip
    });

    // Chuyển đổi dữ liệu cho giao diện người dùng
    const chats = participants.map(participant => ({
      chat: participant.chat,
      isRead: participant.isRead
    }));

    return NextResponse.json({
      chats,
      hasMore: totalCount > skip + limit,
      totalCount
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
} 