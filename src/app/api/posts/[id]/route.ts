import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Promise.resolve(new NextResponse("Unauthorized", { status: 401 }));
    }

    const body = await request.json();
    const { id } = await context.params;
    const postId = parseInt(id);
    
    // Ghi log dữ liệu yêu cầu để gỡ lỗi
    console.log(`Updating post ${postId} with data:`, JSON.stringify(body));

    // Định nghĩa schema mạnh mẽ hơn
    const Post = z.object({
      desc: z.string().min(1).max(3000),
      img: z.string().nullable(),
      video: z.string().nullable(),
    });

    const validatedFields = Post.safeParse(body);

    if (!validatedFields.success) {
      const errors = validatedFields.error.format();
      console.error("Validation errors:", errors);
      return Promise.resolve(
        NextResponse.json(
          { error: "Invalid fields", details: errors },
          { status: 400 }
        )
      );
    }

    // Xác minh quyền sở hữu bài đăng
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
        userId,
      },
    });

    if (!post) {
      return Promise.resolve(new NextResponse("Not found or unauthorized", { status: 404 }));
    }

    try {
      const updatedPost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          desc: validatedFields.data.desc,
          img: validatedFields.data.img,
          video: validatedFields.data.video,
        },
      });

      return Promise.resolve(NextResponse.json(updatedPost));
    } catch (dbError) {
      console.error("[POST_PATCH_DB_ERROR]", dbError);
      return Promise.resolve(
        NextResponse.json(
          { error: "Database error", message: "Failed to update post in database" },
          { status: 500 }
        )
      );
    }
  } catch (error) {
    console.error("[POST_PATCH]", error);
    return Promise.resolve(
      NextResponse.json(
        { error: "Internal error", message: "An unexpected error occurred" },
        { status: 500 }
      )
    );
  }
} 