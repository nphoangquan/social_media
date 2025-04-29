import { initSocket } from "@/lib/socket";
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Khởi tạo Socket.IO với mock
    initSocket(null);
    return NextResponse.json({ success: true, message: "Socket.IO server initialized" });
  } catch (error) {
    console.error("Socket initialization error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to initialize Socket.IO server" },
      { status: 500 }
    );
  }
} 