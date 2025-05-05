import { initSocket } from "@/lib/socket";
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Khởi tạo máy chủ Socket.IO 
    const io = initSocket(null);
    
    // Đảm bảo máy chủ đã sẵn sàng nhận kết nối
    if (io) {
      console.log();
    }
    
    return NextResponse.json({ success: true, message: "Socket.IO server initialized" });
  } catch (error) {
    console.error("Socket initialization error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to initialize Socket.IO server" },
      { status: 500 }
    );
  }
} 