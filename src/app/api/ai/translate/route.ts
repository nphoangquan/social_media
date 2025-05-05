import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supportedLanguages } from "./languages";

// Khởi tạo OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mảng các ngôn ngữ được hỗ trợ
export async function POST(req: Request) {
  try {
    // Kiểm tra xác thực người dùng
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy dữ liệu từ request
    const data = await req.json();
    const { text, targetLanguage } = data;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 });
    }

    if (!targetLanguage || typeof targetLanguage !== "string") {
      return NextResponse.json({ error: "Target language is required" }, { status: 400 });
    }

    // Kiểm tra ngôn ngữ được hỗ trợ
    const isSupported = supportedLanguages.some(lang => lang.code === targetLanguage);
    if (!isSupported) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    // Lấy tên ngôn ngữ từ mã
    const languageName = supportedLanguages.find(lang => lang.code === targetLanguage)?.name || targetLanguage;

    // Gọi OpenAI API để dịch nội dung
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Bạn là AI chuyên dịch nội dung sang các ngôn ngữ khác nhau một cách chính xác. Hãy dịch văn bản được cung cấp sang ${languageName}. Giữ nguyên các emoji, hashtag, và đường link.`
        },
        {
          role: "user",
          content: `Dịch văn bản sau sang ${languageName}: ${text}`
        }
      ],
      max_tokens: 1000,
    });

    const translatedText = response.choices[0]?.message?.content || "";

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Error translating content:", error);
    return NextResponse.json(
      { error: "Failed to translate content" },
      { status: 500 }
    );
  }
} 