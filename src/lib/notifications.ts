import prisma from "@/lib/client";

// Tạo thông báo mới (sử dụng trong server actions)
export async function createNotification(
  type: string,
  message: string,
  receiverId: string,
  senderId: string,
  data: { postId?: number; commentId?: number; link?: string }
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        message,
        receiverId,
        senderId,
        postId: data.postId,
        commentId: data.commentId,
        link: data.link,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            username: true,
            name: true,
            surname: true,
            avatar: true,
          },
        },
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
} 