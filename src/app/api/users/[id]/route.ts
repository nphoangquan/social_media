import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return Promise.resolve(new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    }));
  }

  const { id } = await context.params;

  // Chỉ cho phép người dùng lấy dữ liệu của chính họ (vì lý do bảo mật)
  if (userId !== id) {
    return Promise.resolve(new NextResponse(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    }));
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        avatar: true,
        cover: true,
        description: true,
        city: true,
        school: true,
        work: true,
        website: true,
      },
    });

    if (!user) {
      return Promise.resolve(new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      }));
    }

    return Promise.resolve(NextResponse.json(user));
  } catch (error) {
    console.error("Error fetching user:", error);
    return Promise.resolve(new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    }));
  }
} 