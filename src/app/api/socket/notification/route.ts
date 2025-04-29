import { initSocket, NotificationPayload } from "@/lib/socket";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Lấy nội dung thông báo từ request body
    const notification: NotificationPayload = await req.json();
    
    // Khởi tạo socket.io server
    const io = initSocket(null);
    
    // Gửi thông báo đến user
    io.to(notification.receiverId).emit('notification', notification);
    
    return NextResponse.json({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("Socket notification error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send notification" },
      { status: 500 }
    );
  }
} 