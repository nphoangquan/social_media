import { initSocket } from "@/lib/socket";
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Initialize Socket.IO server 
    const io = initSocket(null);
    
    // Ensure the server is ready to accept connections
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