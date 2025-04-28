import { NextRequest, NextResponse } from "next/server";
import { getPaginatedStories } from "@/lib/actions/story";

export async function GET(request: NextRequest) {
  try {
    // Lấy các tham số từ URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

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