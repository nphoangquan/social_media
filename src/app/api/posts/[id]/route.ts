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

    const Post = z.object({
      desc: z.string().min(1).max(255),
      img: z.string().optional(),
      video: z.string().optional(),
    });

    const validatedFields = Post.safeParse(body);

    if (!validatedFields.success) {
      return Promise.resolve(new NextResponse("Invalid fields", { status: 400 }));
    }

    // Verify post ownership
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
        userId,
      },
    });

    if (!post) {
      return Promise.resolve(new NextResponse("Not found or unauthorized", { status: 404 }));
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        desc: validatedFields.data.desc,
        img: validatedFields.data.img || null,
        video: validatedFields.data.video || null,
      },
    });

    return Promise.resolve(NextResponse.json(updatedPost));
  } catch (error) {
    console.error("[POST_PATCH]", error);
    return Promise.resolve(new NextResponse("Internal error", { status: 500 }));
  }
} 