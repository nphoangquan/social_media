import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';

// Khởi tạo PrismaClient trực tiếp nếu không tìm thấy module lib/prisma
const prisma = new PrismaClient();

const openai = new OpenAI();

// Define interface chỉ định phân tích câu hỏi
interface QueryAnalysis {
  type: string;
  entities: string[];
  timeRange: string;
  keywords: string[];
  searchMode: 'user_data' | 'global' | 'both'; // Thêm mode tìm kiếm
  searchTerms: string[]; // Từ khóa tìm kiếm
}

// Interface dữ liệu người dùng
interface UserData {
  id: string;
  username: string;
  name: string | null;
  surname: string | null;
  description: string | null;
  role: string;
  createdAt: Date;
}

// Hàm phân tích câu hỏi để xác định loại thông tin cần tìm
async function analyzeQuery(query: string): Promise<QueryAnalysis> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Phân tích câu hỏi và xác định loại thông tin cần tìm kiếm. 
        Trả về JSON với các trường:
        - type: loại thông tin (user_info, posts, comments, likes, followers, notifications, users, general)
        - entities: mảng các thực thể được đề cập (user, post, comment, etc.)
        - timeRange: khoảng thời gian (recent, all, specific)
        - keywords: mảng các từ khóa quan trọng
        - searchMode: 'user_data' (chỉ tìm trong dữ liệu người dùng), 'global' (tìm trong toàn bộ database), 'both' (tìm cả hai)
        - searchTerms: mảng các từ khóa cụ thể để tìm kiếm (tên người dùng, nội dung bài viết, etc.)`
      },
      { role: "user", content: query }
    ],
    temperature: 0.3,
  });

  try {
    const analysis = JSON.parse(completion.choices[0].message.content || "{}") as Partial<QueryAnalysis>;
    
    // Xác định searchMode dựa trên từ khóa
    let defaultSearchMode: 'user_data' | 'global' | 'both' = 'user_data';
    if (
      query.toLowerCase().includes('tìm') || 
      query.toLowerCase().includes('kiếm') || 
      query.toLowerCase().includes('search') ||
      query.toLowerCase().includes('ai') ||
      query.toLowerCase().includes('người') ||
      query.toLowerCase().includes('bài') ||
      query.toLowerCase().includes('tên')
    ) {
      defaultSearchMode = 'global';
    }
    
    // Đảm bảo các trường mặc định
    const finalAnalysis: QueryAnalysis = {
      type: analysis.type || 'general',
      entities: analysis.entities || [],
      timeRange: analysis.timeRange || 'recent',
      keywords: analysis.keywords || [],
      searchMode: analysis.searchMode || defaultSearchMode,
      searchTerms: analysis.searchTerms || analysis.keywords || []
    };
    
    return finalAnalysis;
  } catch (error) {
    console.error('Error parsing analysis response:', error);
    
    // Xác định chế độ tìm kiếm dựa trên từ khóa
    const searchMode: 'user_data' | 'global' | 'both' = query.toLowerCase().includes('tìm') || 
                        query.toLowerCase().includes('kiếm') || 
                        query.toLowerCase().includes('search') ? 'global' : 'user_data';
    
    return { 
      type: "general", 
      entities: [], 
      timeRange: "recent", 
      keywords: [], 
      searchMode,
      searchTerms: []
    };
  }
}

// Hàm lấy dữ liệu từ database dựa trên phân tích
async function getRelevantData(userId: string, analysis: QueryAnalysis): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {};

  try {
    // Lấy thông tin người dùng hiện tại để có context
    data.currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        description: true,
        role: true,
        createdAt: true
      }
    });

    // Lấy dữ liệu dựa trên mode tìm kiếm
    if (analysis.searchMode === 'global' || analysis.searchMode === 'both') {
      // Tìm kiếm dữ liệu toàn cục
      
      // Tìm kiếm người dùng
      if (analysis.type === 'users' || analysis.type === 'general') {
        const searchTerms = analysis.searchTerms?.filter(term => term.length > 2) || [];
        
        if (searchTerms.length > 0) {
          const searchConditions = searchTerms.map(term => ({
            OR: [
              { username: { contains: term, mode: 'insensitive' as const } },
              { name: { contains: term, mode: 'insensitive' as const } },
              { surname: { contains: term, mode: 'insensitive' as const } },
            ]
          }));
          
          data.foundUsers = await prisma.user.findMany({
            where: {
              OR: searchConditions,
            },
            take: 5,
            select: {
              id: true,
              username: true,
              name: true,
              surname: true,
              description: true,
              avatar: true,
              createdAt: true,
              _count: {
                select: {
                  posts: true,
                  followers: true,
                  followings: true
                }
              }
            }
          });
        }
      }
      
      // Tìm kiếm bài viết
      if (analysis.type === 'posts' || analysis.type === 'general') {
        const searchTerms = analysis.searchTerms?.filter(term => term.length > 2) || [];
        
        if (searchTerms.length > 0) {
          const searchConditions = searchTerms.map(term => ({
            desc: { contains: term, mode: 'insensitive' as const }
          }));
          
          data.foundPosts = await prisma.post.findMany({
            where: {
              OR: searchConditions,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                }
              },
              _count: {
                select: {
                  comments: true,
                  likes: true
                }
              }
            }
          });
        }
      }
      
      // Tìm kiếm comments
      if (analysis.type === 'comments' || analysis.type === 'general') {
        const searchTerms = analysis.searchTerms?.filter(term => term.length > 2) || [];
        
        if (searchTerms.length > 0) {
          const searchConditions = searchTerms.map(term => ({
            desc: { contains: term, mode: 'insensitive' as const }
          }));
          
          data.foundComments = await prisma.comment.findMany({
            where: {
              OR: searchConditions,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                }
              },
              post: {
                select: {
                  id: true,
                  desc: true,
                }
              }
            }
          });
        }
      }
    }
    
    // Nếu mode là 'user_data' hoặc 'both', lấy dữ liệu của người dùng
    if (analysis.searchMode === 'user_data' || analysis.searchMode === 'both') {
      // Lấy dữ liệu cá nhân của người dùng
      switch (analysis.type) {
        case 'posts':
          data.userPosts = await prisma.post.findMany({
            where: { userId },
            take: analysis.timeRange === 'recent' ? 5 : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
              comments: true,
              likes: true
            }
          });
          break;

        case 'comments':
          data.userComments = await prisma.comment.findMany({
            where: { userId },
            take: analysis.timeRange === 'recent' ? 5 : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
              post: true,
              likes: true
            }
          });
          break;

        case 'followers':
          data.followers = await prisma.follower.findMany({
            where: { followingId: userId },
            include: {
              follower: {
                select: {
                  id: true,
                  username: true,
                  name: true
                }
              }
            }
          });
          break;

        case 'followings':
          data.followings = await prisma.follower.findMany({
            where: { followerId: userId },
            include: {
              following: {
                select: {
                  id: true,
                  username: true,
                  name: true
                }
              }
            }
          });
          break;

        case 'notifications':
          data.notifications = await prisma.notification.findMany({
            where: { receiverId: userId },
            take: analysis.timeRange === 'recent' ? 5 : undefined,
            orderBy: { createdAt: 'desc' }
          });
          break;

        case 'likes':
          data.likes = await prisma.like.findMany({
            where: { userId },
            take: analysis.timeRange === 'recent' ? 5 : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
              post: true,
              Comment: true
            }
          });
          break;

        case 'user_info':
          // Mặc định đã lấy thông tin người dùng ở trên với currentUser
          break;

        default:
          // Lấy tóm tắt của tất cả loại dữ liệu
          data.postsCount = await prisma.post.count({ where: { userId } });
          data.followersCount = await prisma.follower.count({ where: { followingId: userId } });
          data.followingsCount = await prisma.follower.count({ where: { followerId: userId } });
          data.recentPosts = await prisma.post.findMany({
            where: { userId },
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              desc: true,
              createdAt: true,
              _count: {
                select: {
                  likes: true,
                  comments: true
                }
              }
            }
          });
          break;
      }
    }

    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return data;
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    // Kiểm tra người dùng đã đăng nhập
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { message } = await req.json();

    // Phân tích câu hỏi
    const queryAnalysis = await analyzeQuery(message);

    // Lấy dữ liệu liên quan
    const relevantData = await getRelevantData(userId, queryAnalysis);
    const currentUser = relevantData.currentUser as UserData | undefined;

    // Tạo system prompt
    const systemPrompt = `Bạn là một trợ lý AI thông minh cho mạng xã hội. 
    Hãy tuân thủ các quy tắc sau:
    1. Chỉ trả lời dựa trên thông tin có sẵn trong context
    2. Nếu không có thông tin hoặc dữ liệu rỗng, hãy nói "Tôi không tìm thấy thông tin về điều này trong dữ liệu" một cách tự nhiên
    3. Không được bịa ra thông tin
    4. Trả lời ngắn gọn, rõ ràng và hữu ích
    5. Sử dụng ngôn ngữ tự nhiên, thân thiện
    6. Với các câu hỏi không liên quan đến mạng xã hội, hãy trả lời một cách chung chung
    
    Phân tích câu hỏi:
    - Loại câu hỏi: ${queryAnalysis.type}
    - Chế độ tìm kiếm: ${queryAnalysis.searchMode} (user_data = chỉ trong dữ liệu người dùng, global = toàn bộ database)
    - Từ khóa tìm kiếm: ${queryAnalysis.searchTerms?.join(', ') || 'Không có'}
    - Thực thể được đề cập: ${queryAnalysis.entities?.join(', ') || 'Không có'}
    - Khoảng thời gian: ${queryAnalysis.timeRange}
    
    Dữ liệu liên quan:
    ${JSON.stringify(relevantData, null, 2)}
    
    Người dùng hiện tại có username: ${currentUser?.username || 'unknown'}
    
    Trả lời câu hỏi của người dùng dựa trên dữ liệu được cung cấp. Nếu là tìm kiếm bài viết/người dùng và không tìm thấy, hãy nói rõ là không tìm thấy thông tin phù hợp.`;

    // Gọi OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    const response = completion.choices[0].message.content;
    return NextResponse.json({ response });
  } catch (error) {
    console.error('[CHATBOT_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 