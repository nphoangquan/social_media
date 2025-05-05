import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/client";

// Khởi tạo OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Thông tin về website cho chatbot
const WEBSITE_INFO = `
Introvertia là một mạng xã hội dành cho người hướng nội, tạo không gian an toàn để kết nối và chia sẻ.
Tính năng chính:
- Đăng bài viết kèm hình ảnh, video
- Bình luận và thảo luận
- Like bài viết và bình luận
- Kết bạn với người dùng khác
- Nhắn tin trực tiếp
- Chia sẻ story
- Tìm kiếm người dùng và bài viết
- AI giúp tạo caption tự động cho ảnh
- AI tóm tắt bài viết dài
- AI dịch bài viết và bình luận sang nhiều ngôn ngữ
`;

export async function POST(req: Request) {
  try {
    // Kiểm tra xác thực người dùng
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy dữ liệu từ request
    const data = await req.json();
    const { messages, fetchUserPosts = false } = data;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Thêm thông tin cơ bản cho chatbot
    let systemPrompt = `Bạn là trợ lý AI của mạng xã hội Introvertia, một nền tảng dành cho người hướng nội.
Thông tin về nền tảng:
${WEBSITE_INFO}

Hướng dẫn quan trọng:
1. KHÔNG được cung cấp thông tin cá nhân của người dùng như mật khẩu, email, số điện thoại, thông tin thanh toán hoặc tin nhắn riêng tư.
2. Chỉ cung cấp thông tin công khai như bài viết công khai, thông tin chung về website.
3. Trả lời một cách thân thiện, hữu ích, và tôn trọng.
4. Bạn có thể trả lời các câu hỏi chung về cách sử dụng nền tảng.
5. Từ chối lịch sự khi được yêu cầu thông tin nhạy cảm hoặc riêng tư.
6. Khi được hỏi về bài viết, chỉ đề cập đến nội dung công khai.

Ngày hiện tại: ${new Date().toLocaleDateString('vi-VN')}
`;

    // Bổ sung thông tin bài viết của người dùng nếu yêu cầu
    if (fetchUserPosts) {
      try {
        // Lấy 5 bài viết gần nhất của người dùng
        const userPosts = await prisma.post.findMany({
          where: {
            userId: userId
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5,
          select: {
            id: true,
            desc: true,
            createdAt: true
          }
        });

        if (userPosts && userPosts.length > 0) {
          let postsInfo = "Đây là một số bài viết gần đây của bạn:\n";
          
          userPosts.forEach((post: { id: number; desc: string | null; createdAt: Date }, index: number) => {
            const date = new Date(post.createdAt).toLocaleDateString('vi-VN');
            postsInfo += `${index + 1}. Ngày ${date}: "${post.desc?.substring(0, 100)}${post.desc && post.desc.length > 100 ? '...' : ''}"\n`;
          });
          
          systemPrompt += `\n${postsInfo}`;
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    }

    // Chuẩn bị messages cho API OpenAI
    const systemMessage = {
      role: "system",
      content: systemPrompt
    };

    const apiMessages = [systemMessage, ...messages];

    // Gọi API OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 800
    });

    const reply = response.choices[0]?.message?.content || "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in chatbot API:", error);
    return NextResponse.json(
      { error: "Failed to process chatbot request" },
      { status: 500 }
    );
  }
} 