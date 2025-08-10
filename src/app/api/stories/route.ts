import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { storyCreateSchema } from "@/shared/validation/story";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const validation = storyCreateSchema.safeParse({
      fileType: formData.get("fileType"),
      fileData: formData.get("fileData"),
    });

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { fileType, fileData } = validation.data;

    // Kiểm tra story hiện có từ người dùng này và xóa chúng
    const existingStories = await prisma.story.findMany({
      where: {
        userId,
      },
    });

    if (existingStories.length > 0) {
      await prisma.story.deleteMany({
        where: {
          userId,
        },
      });
    }

    // Tính thời gian hết hạn (24 giờ kể từ bây giờ)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Tạo story trong cơ sở dữ liệu với URL Cloudinary
    const story = await prisma.story.create({
      data: {
        userId,
        ...(fileType === "image" ? { img: fileData } : { video: fileData }),
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, storyId: story.id });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
} 