"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import { initSocket } from "@/lib/socket";

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
 * Start a new chat with a user or get existing chat
 */
export async function startNewChat(userId: string, otherUserId: string): Promise<number> {
  // Check if chat already exists between these users
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

  // Create a new chat
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
 * Send a message in a chat
 */
export async function sendMessage(chatId: number, content: string, img?: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is a participant in this chat
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatId: chatId,
      userId: userId
    }
  });

  if (!participant) {
    throw new Error("Not a participant in this chat");
  }

  // Create the message
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

  // Update the chat timestamp
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() }
  });

  // Mark as unread for other participants
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
    // Send realtime notification
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
 * Get all messages for a chat
 */
export async function getChatMessages(chatId: number): Promise<Message[]> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is a participant in this chat
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatId: chatId,
      userId: userId
    }
  });

  if (!participant) {
    throw new Error("Not a participant in this chat");
  }

  const messages = await prisma.message.findMany({
    where: {
      chatId: chatId
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return messages;
}

/**
 * Mark a chat as read
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
 * Get unread messages count
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
 * Delete a message
 */
export async function deleteMessage(messageId: number) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if the message belongs to the user
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

  // Delete the message
  await prisma.message.delete({
    where: {
      id: messageId
    }
  });

  // Update chat timestamps if needed
  if (message.chat) {
    revalidatePath(`/messages/${message.chat.id}`, "page");
    revalidatePath("/messages", "page");
  }

  // Send realtime delete notification if needed
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