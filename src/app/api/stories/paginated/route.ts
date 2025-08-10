import { NextRequest, NextResponse } from "next/server";
import { getPaginatedStories } from "@/lib/actions/story";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    // Lấy các tham số từ URL
    const { searchParams } = new URL(request.url);
    const q = z.object({
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    }).safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    const page = q.success ? (q.data.page ?? 1) : 1;
    const limit = q.success ? (q.data.limit ?? 10) : 10;

    // Lấy dữ liệu story theo trang
    const result = await getPaginatedStories(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching paginated stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
} 