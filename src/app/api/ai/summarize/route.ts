import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Khởi tạo OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Kiểm tra xác thực người dùng
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy dữ liệu từ request
    const data = await req.json();
    const { text } = data;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 });
    }

    // Text quá ngắn không cần tóm tắt
    if (text.length < 200) {
      return NextResponse.json({ summary: text });
    }

    // Gọi OpenAI API để tóm tắt nội dung
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Bạn là AI chuyên tóm tắt nội dung văn bản dài thành văn bản ngắn gọn, rõ ràng, giữ lại các điểm quan trọng nhất."
        },
        {
          role: "user",
          content: `Hãy tóm tắt nội dung sau thành đoạn văn ngắn gọn, dễ hiểu, giữ lại các ý chính quan trọng nhất: ${text}`
        }
      ],
      max_tokens: 500,
    });

    const summary = response.choices[0]?.message?.content || "";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
} 