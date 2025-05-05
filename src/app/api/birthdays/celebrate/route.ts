import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createBirthdayWishNotification } from "@/lib/actions/notifications";

export async function POST(req: Request) {
  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json({ error: "Receiver ID is required" }, { status: 400 });
    }

    // Tạo thông báo chúc mừng sinh nhật
    await createBirthdayWishNotification(currentUserId, receiverId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error celebrating birthday:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 