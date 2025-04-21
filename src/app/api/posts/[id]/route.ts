import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const postId = parseInt(params.id);

    const Post = z.object({
      desc: z.string().min(1).max(255),
      img: z.string().optional(),
      video: z.string().optional(),
    });

    const validatedFields = Post.safeParse(body);

    if (!validatedFields.success) {
      return new NextResponse("Invalid fields", { status: 400 });
    }

    // Verify post ownership
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
        userId,
      },
    });

    if (!post) {
      return new NextResponse("Not found or unauthorized", { status: 404 });
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

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("[POST_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 