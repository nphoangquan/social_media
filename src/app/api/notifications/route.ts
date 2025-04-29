import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";

// Lấy danh sách thông báo của người dùng
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy URL search params
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const unreadOnly = url.searchParams.get("unread") === "true";
    
    // Tính toán offset cho phân trang
    const skip = (page - 1) * limit;
    
    // Query điều kiện
    const where = {
      receiverId: userId,
      ...(unreadOnly ? { isRead: false } : {}),
    };
    
    // Đếm tổng số thông báo
    const totalCount = await prisma.notification.count({ where });
    
    // Lấy thông báo với phân trang và thông tin về người gửi
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
    
    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Đánh dấu thông báo đã đọc
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, readAll } = body;

    if (readAll) {
      // Đánh dấu tất cả thông báo là đã đọc
      await prisma.notification.updateMany({
        where: { receiverId: userId },
        data: { isRead: true },
      });

      return NextResponse.json({ message: "All notifications marked as read" });
    } else if (notificationId) {
      // Đánh dấu một thông báo cụ thể là đã đọc
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      if (notification.receiverId !== userId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return NextResponse.json({ message: "Notification marked as read" });
    } else {
      return NextResponse.json(
        { error: "Missing notificationId or readAll parameter" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// Xóa thông báo
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, deleteAll } = body;

    if (deleteAll) {
      // Xóa tất cả thông báo
      await prisma.notification.deleteMany({
        where: { receiverId: userId },
      });

      return NextResponse.json({ message: "All notifications deleted" });
    } else if (notificationId) {
      // Xóa một thông báo cụ thể
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      if (notification.receiverId !== userId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      await prisma.notification.delete({
        where: { id: notificationId },
      });

      return NextResponse.json({ message: "Notification deleted" });
    } else {
      return NextResponse.json(
        { error: "Missing notificationId or deleteAll parameter" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
} 