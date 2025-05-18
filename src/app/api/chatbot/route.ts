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
    
    // Mặc định sử dụng chế độ tìm kiếm 'both' để chatbot được tự do tìm kiếm
    const defaultSearchMode: 'user_data' | 'global' | 'both' = 'both';
    
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
    
    // Mặc định sử dụng chế độ tìm kiếm 'both' để chatbot được tự do tìm kiếm
    const searchMode: 'user_data' | 'global' | 'both' = 'both';
    
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
        
        // Nếu có từ khóa, tìm theo từ khóa, nếu không thì lấy một số người dùng gần đây
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
        } else {
          // Nếu không có từ khóa, lấy 5 người dùng gần đây
          data.foundUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
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
        } else {
          // Nếu không có từ khóa, lấy 5 bài viết gần đây
          data.foundPosts = await prisma.post.findMany({
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
        } else {
          // Nếu không có từ khóa, lấy 5 bình luận gần đây
          data.foundComments = await prisma.comment.findMany({
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
    const systemPrompt = `Bạn là một trợ lý AI thông minh và đa năng cho mạng xã hội, với khả năng tự do truy xuất và đưa ra thông tin phù hợp.
    
    Hãy tuân thủ các quy tắc sau:
    1. Hỗ trợ người dùng một cách toàn diện và chủ động
    2. Trả lời thoải mái mà không bị ràng buộc chặt chẽ vào từ khóa cụ thể
    3. Cung cấp thông tin hữu ích từ dữ liệu có sẵn 
    4. Đảm bảo thông tin đưa ra phải chính xác, không bịa thông tin
    5. Sử dụng ngôn ngữ tự nhiên, thân thiện và phù hợp với ngữ cảnh
    6. Nếu không có thông tin cụ thể, hãy cung cấp thông tin tổng quan hoặc gợi ý có liên quan

    Chế độ tìm kiếm: ${queryAnalysis.searchMode} (đã được cấu hình để tìm kiếm cả dữ liệu người dùng và toàn cục)
    
    Dữ liệu liên quan:
    ${JSON.stringify(relevantData, null, 2)}
    
    Người dùng hiện tại có username: ${currentUser?.username || 'unknown'}
    
    Hãy phân tích dữ liệu được cung cấp và đưa ra câu trả lời hữu ích nhất. Nếu câu hỏi yêu cầu dữ liệu không có trong context, hãy đưa ra các thông tin tổng quan liên quan và gợi ý cho người dùng.`;

    // Gọi OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1600,
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