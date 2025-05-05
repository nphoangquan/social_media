import prisma from "@/lib/client";
import { NotificationPayload } from "../socket";

// Hàm xác định API URL an toàn cho cả server và client
const getApiUrl = () => {
  // Ưu tiên sử dụng biến môi trường
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Nếu đang ở môi trường client (ý là người dùng đang truy cập trang web)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback cho môi trường server
  return process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
};

// Gửi thông báo socket.io
export const sendNotification = async (notification: NotificationPayload) => {
  try {
    // Gửi thông báo qua API
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/socket/notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send notification: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

// Tạo thông báo khi có người like bài viết
export const createLikeNotification = async (
  senderId: string, 
  receiverId: string, 
  postId: number
) => {
  try {
    // Nếu người gửi và người nhận là cùng một người, không tạo thông báo
    if (senderId === receiverId) return null;
    
    // Lấy thông tin người gửi
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { 
        id: true,
        username: true,
        name: true,
        surname: true,
        avatar: true
      }
    });
    
    if (!sender) return null;
    
    // Lấy thông tin bài post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });
    
    if (!post) return null;
    
    // Tạo message
    const senderName = sender.name && sender.surname 
      ? `${sender.name} ${sender.surname}`
      : sender.username;
    
    const message = `${senderName} liked your post`;
    const link = `/post/${postId}`;
    
    // Tạo thông báo trong DB
    const notification = await prisma.notification.create({
      data: {
        type: 'LIKE',
        message,
        link,
        isRead: false,
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: receiverId } },
        postId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true
          }
        }
      }
    });
    
    // Tạo payload để gửi qua socket
    const payload: NotificationPayload = {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      senderId: notification.senderId,
      senderName: senderName,
      senderAvatar: sender.avatar || undefined,
      receiverId: notification.receiverId,
      postId: notification.postId || undefined,
      link: notification.link || undefined,
      createdAt: notification.createdAt
    };
    
    // Gửi thông báo qua socket
    await sendNotification(payload);
    
    return notification;
  } catch (error) {
    console.error('Error creating like notification:', error);
    return null;
  }
};

// Tạo thông báo khi có người comment bài viết
export const createCommentNotification = async (
  senderId: string, 
  receiverId: string, 
  postId: number,
  commentId: number
) => {
  try {
    // Nếu người gửi và người nhận là cùng một người, không tạo thông báo
    if (senderId === receiverId) return null;
    
    // Lấy thông tin người gửi
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { 
        id: true,
        username: true,
        name: true,
        surname: true,
        avatar: true
      }
    });
    
    if (!sender) return null;
    
    // Lấy thông tin bài post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });
    
    if (!post) return null;
    
    // Tạo message
    const senderName = sender.name && sender.surname 
      ? `${sender.name} ${sender.surname}`
      : sender.username;
    
    const message = `${senderName} commented on your post`;
    const link = `/post/${postId}?comment=${commentId}`;
    
    // Tạo thông báo trong DB
    const notification = await prisma.notification.create({
      data: {
        type: 'COMMENT',
        message,
        link,
        isRead: false,
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: receiverId } },
        postId,
        commentId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true
          }
        }
      }
    });
    
    // Tạo payload để gửi qua socket
    const payload: NotificationPayload = {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      senderId: notification.senderId,
      senderName: senderName,
      senderAvatar: sender.avatar || undefined,
      receiverId: notification.receiverId,
      postId: notification.postId || undefined,
      commentId: notification.commentId || undefined,
      link: notification.link || undefined,
      createdAt: notification.createdAt
    };
    
    // Gửi thông báo qua socket
    await sendNotification(payload);
    
    return notification;
  } catch (error) {
    console.error('Error creating comment notification:', error);
    return null;
  }
};

// Tạo thông báo khi có người follow/kết bạn
export const createFollowNotification = async (
  senderId: string, 
  receiverId: string
) => {
  try {
    // Nếu người gửi và người nhận là cùng một người, không tạo thông báo
    if (senderId === receiverId) return null;
    
    // Lấy thông tin người gửi
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { 
        id: true,
        username: true,
        name: true,
        surname: true,
        avatar: true
      }
    });
    
    if (!sender) return null;
    
    // Tạo message
    const senderName = sender.name && sender.surname 
      ? `${sender.name} ${sender.surname}`
      : sender.username;
    
    const message = `${senderName} followed you`;
    const link = `/profile/${sender.username}`;
    
    // Tạo thông báo trong DB
    const notification = await prisma.notification.create({
      data: {
        type: 'FOLLOW',
        message,
        link,
        isRead: false,
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: receiverId } }
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true
          }
        }
      }
    });
    
    // Tạo payload để gửi qua socket
    const payload: NotificationPayload = {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      senderId: notification.senderId,
      senderName: senderName,
      senderAvatar: sender.avatar || undefined,
      receiverId: notification.receiverId,
      link: notification.link || undefined,
      createdAt: notification.createdAt
    };
    
    // Gửi thông báo qua socket
    await sendNotification(payload);
    
    return notification;
  } catch (error) {
    console.error('Error creating follow notification:', error);
    return null;
  }
};

// Tạo thông báo khi người theo dõi đăng bài mới
export const createNewPostNotification = async (
  senderId: string, 
  postId: number
) => {
  try {
    // Lấy thông tin người đăng bài
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { 
        id: true,
        username: true,
        name: true,
        surname: true,
        avatar: true
      }
    });
    
    if (!sender) return null;
    
    // Lấy danh sách người theo dõi
    const followers = await prisma.follower.findMany({
      where: { followingId: senderId },
      select: { followerId: true }
    });
    
    if (followers.length === 0) return null;
    
    // Tạo thông báo cho từng người theo dõi
    const senderName = sender.name && sender.surname 
      ? `${sender.name} ${sender.surname}`
      : sender.username;
    
    const message = `${senderName} shared a new post`;
    const link = `/post/${postId}`;
    
    const notifications = [];
    
    for (const follower of followers) {
      const notification = await prisma.notification.create({
        data: {
          type: 'POST',
          message,
          link,
          isRead: false,
          sender: { connect: { id: senderId } },
          receiver: { connect: { id: follower.followerId } },
          postId
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              name: true,
              surname: true,
              avatar: true
            }
          }
        }
      });
      
      // Tạo payload để gửi qua socket
      const payload: NotificationPayload = {
        id: notification.id,
        type: notification.type,
        message: notification.message,
        isRead: notification.isRead,
        senderId: notification.senderId,
        senderName: senderName,
        senderAvatar: sender.avatar || undefined,
        receiverId: notification.receiverId,
        postId: notification.postId || undefined,
        link: notification.link || undefined,
        createdAt: notification.createdAt
      };
      
      // Gửi thông báo qua socket
      await sendNotification(payload);
      
      notifications.push(notification);
    }
    
    return notifications;
  } catch (error) {
    console.error('Error creating new post notification:', error);
    return null;
  }
};

// Xóa thông báo
export const deleteNotification = async (notificationId: number) => {
  try {
    // Xóa thông báo từ database
    const deletedNotification = await prisma.notification.delete({
      where: { id: notificationId }
    });
    
    return deletedNotification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return null;
  }
};

export const createBirthdayWishNotification = async (senderId: string, receiverId: string) => {
  try {
    // Nếu người gửi và người nhận là cùng một người, không tạo thông báo
    if (senderId === receiverId) return null;
    
    // Get sender info for notification message
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { 
        id: true,
        username: true,
        name: true,
        surname: true,
        avatar: true
      }
    });

    if (!sender) {
      throw new Error("Sender not found");
    }

    // Tạo message
    const senderName = sender.name && sender.surname 
      ? `${sender.name} ${sender.surname}`
      : sender.username;
    
    const message = `${senderName} wished you a happy birthday!`;
    const link = `/profile/${sender.username}`;

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        type: "BIRTHDAY",
        message,
        link,
        isRead: false,
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: receiverId } }
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true
          }
        }
      }
    });
    
    // Tạo payload để gửi qua socket
    const payload: NotificationPayload = {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      senderId: notification.senderId,
      senderName: senderName,
      senderAvatar: sender.avatar || undefined,
      receiverId: notification.receiverId,
      link: notification.link || undefined,
      createdAt: notification.createdAt
    };
    
    // Gửi thông báo qua socket
    await sendNotification(payload);
    
    return notification;
  } catch (error) {
    console.error("Error creating birthday wish notification:", error);
    return null;
  }
};

// Tạo thông báo khi có người like comment
export const createCommentLikeNotification = async (
  senderId: string, 
  receiverId: string, 
  postId: number,
  commentId: number
) => {
  try {
    // Nếu người gửi và người nhận là cùng một người, không tạo thông báo
    if (senderId === receiverId) return null;
    
    // Lấy thông tin người gửi
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { 
        id: true,
        username: true,
        name: true,
        surname: true,
        avatar: true
      }
    });
    
    if (!sender) return null;
    
    // Lấy thông tin comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true }
    });
    
    if (!comment) return null;
    
    // Tạo message
    const senderName = sender.name && sender.surname 
      ? `${sender.name} ${sender.surname}`
      : sender.username;
    
    const message = `${senderName} liked your comment`;
    const link = `/post/${postId}?comment=${commentId}`;
    
    // Tạo thông báo trong DB
    const notification = await prisma.notification.create({
      data: {
        type: 'LIKE',
        message,
        link,
        isRead: false,
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: receiverId } },
        postId,
        commentId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true
          }
        }
      }
    });
    
    // Tạo payload để gửi qua socket
    const payload: NotificationPayload = {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      senderId: notification.senderId,
      senderName: senderName,
      senderAvatar: sender.avatar || undefined,
      receiverId: notification.receiverId,
      postId: notification.postId || undefined,
      commentId: notification.commentId || undefined,
      link: notification.link || undefined,
      createdAt: notification.createdAt
    };
    
    // Gửi thông báo qua socket
    await sendNotification(payload);
    
    return notification;
  } catch (error) {
    console.error('Error creating comment like notification:', error);
    return null;
  }
}; 