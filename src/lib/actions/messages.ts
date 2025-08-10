"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import { initSocket } from "@/lib/socket";
import { sendMessageSchema } from "@/shared/validation/messages";

export type UserSearchResult = {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
};

export type UserType = {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
};

export type Message = {
  id: number;
  content: string;
  img: string | null;
  createdAt: Date;
  senderId: string;
};

/**
 * Bắt đầu một cuộc trò chuyện mới với người dùng hoặc lấy cuộc trò chuyện đã tồn tại
 */
export async function startNewChat(userId: string, otherUserId: string): Promise<number> {
  // Kiểm tra xem cuộc trò chuyện đã tồn tại giữa những người dùng này chưa
  const existingChat = await prisma.chat.findFirst({
    where: {
      participants: {
        every: {
          userId: {
            in: [userId, otherUserId]
          }
        }
      },
      AND: [
        {
          participants: {
            some: {
              userId: userId
            }
          }
        },
        {
          participants: {
            some: {
              userId: otherUserId
            }
          }
        }
      ]
    },
    include: {
      participants: true
    }
  });

  if (existingChat) {
    return existingChat.id;
  }

  // Tạo một cuộc trò chuyện mới
  const newChat = await prisma.chat.create({
    data: {
      participants: {
        create: [
          { userId: userId },
          { userId: otherUserId }
        ]
      }
    }
  });

  return newChat.id;
}

/**
 * Gửi tin nhắn trong một cuộc trò chuyện
 */
export async function sendMessage(chatId: number, content: string, img?: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Kiểm tra xem người dùng có phải là người tham gia cuộc trò chuyện này không
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatId: chatId,
      userId: userId
    }
  });

  if (!participant) {
    throw new Error("Not a participant in this chat");
  }

  // Validate payload
  const parsed = sendMessageSchema.safeParse({ chatId, content, img });
  if (!parsed.success) {
    throw new Error("Invalid message payload");
  }

  // Tạo tin nhắn
  const message = await prisma.message.create({
    data: {
      content,
      img: img || null,
      sender: {
        connect: { id: userId }
      },
      chat: {
        connect: { id: chatId }
      }
    },
    include: {
      sender: true
    }
  });

  // Cập nhật dấu thời gian của cuộc trò chuyện
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() }
  });

  // Đánh dấu là chưa đọc cho những người tham gia khác
  await prisma.chatParticipant.updateMany({
    where: {
      chatId: chatId,
      userId: { not: userId }
    },
    data: {
      isRead: false
    }
  });

  try {
    // Gửi thông báo thời gian thực
    const otherParticipants = await prisma.chatParticipant.findMany({
      where: {
        chatId: chatId,
        userId: { not: userId }
      },
      select: {
        userId: true
      }
    });

    for (const participant of otherParticipants) {
      const io = initSocket(null);
      io.to(participant.userId).emit("new_message", {
        chatId,
        message: {
          id: message.id,
          content: message.content,
          img: message.img,
          createdAt: message.createdAt,
          senderId: message.senderId,
          senderName: message.sender.name || message.sender.username,
          senderAvatar: message.sender.avatar
        }
      });
    }
  } catch (error) {
    console.error("Failed to send realtime notification:", error);
  }

  revalidatePath("/messages/[chatId]", "page");
  revalidatePath("/messages", "page");
  return {
    id: message.id,
    content: message.content,
    img: message.img,
    createdAt: message.createdAt,
    senderId: message.senderId
  };
}

/**
 * Lấy tất cả tin nhắn cho một cuộc trò chuyện
 */
export async function getChatMessages(chatId: number, limit: number = 15, offset: number = 0): Promise<{ messages: Message[], hasMore: boolean }> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Kiểm tra xem người dùng có phải là người tham gia cuộc trò chuyện này không
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatId: chatId,
      userId: userId
    }
  });

  if (!participant) {
    throw new Error("Not a participant in this chat");
  }

  // Lấy tổng số lượng cho thông tin phân trang
  const totalCount = await prisma.message.count({
    where: {
      chatId: chatId
    }
  });

  // Lấy tin nhắn với phân trang
  const messages = await prisma.message.findMany({
    where: {
      chatId: chatId
    },
    orderBy: {
      createdAt: "desc" // Lấy tin nhắn mới nhất trước
    },
    take: limit,
    skip: offset
  });

  // Đảo ngược tin nhắn để hiển thị tin cũ nhất trước
  const orderedMessages = [...messages].reverse();

  return {
    messages: orderedMessages,
    hasMore: totalCount > offset + limit
  };
}

/**
 * Đánh dấu một cuộc trò chuyện đã đọc
 */
export async function markChatAsRead(chatId: number) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await prisma.chatParticipant.updateMany({
    where: {
      chatId: chatId,
      userId: userId
    },
    data: {
      isRead: true
    }
  });

  revalidatePath("/messages", "page");
  revalidatePath("/messages/[chatId]", "page");
}

/**
 * Lấy số lượng tin nhắn chưa đọc
 */
export async function getUnreadCount(): Promise<number> {
  const { userId } = await auth();
  
  if (!userId) {
    return 0;
  }

  const count = await prisma.chatParticipant.count({
    where: {
      userId: userId,
      isRead: false
    }
  });

  return count;
}

/**
 * Xóa một tin nhắn
 */
export async function deleteMessage(messageId: number) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Kiểm tra xem tin nhắn có thuộc về người dùng không
  const message = await prisma.message.findUnique({
    where: {
      id: messageId
    },
    include: {
      chat: true
    }
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.senderId !== userId) {
    throw new Error("You can only delete your own messages");
  }

  // Xóa tin nhắn
  await prisma.message.delete({
    where: {
      id: messageId
    }
  });

  // Cập nhật dấu thời gian trò chuyện nếu cần
  if (message.chat) {
    revalidatePath(`/messages/${message.chat.id}`, "page");
    revalidatePath("/messages", "page");
  }

  // Gửi thông báo xóa thời gian thực nếu cần
  try {
    const otherParticipants = await prisma.chatParticipant.findMany({
      where: {
        chatId: message.chatId,
        userId: { not: userId }
      },
      select: {
        userId: true
      }
    });

    for (const participant of otherParticipants) {
      const io = initSocket(null);
      io.to(participant.userId).emit("message_deleted", {
        chatId: message.chatId,
        messageId: message.id
      });
    }
  } catch (error) {
    console.error("Failed to send delete notification:", error);
  }

  return true;
} 