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
Introvertia là một mạng xã hội dành cho mọi người, tạo không gian an toàn để kết nối và chia sẻ.
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

// Hướng dẫn sử dụng trang web
const USAGE_GUIDE = `
Hướng dẫn sử dụng Introvertia:

1. Đăng bài và tương tác:
   - Viết bài đăng với nút "Tạo bài đăng" ở trang chủ
   - Upload ảnh/video bằng cách kéo thả hoặc nhấn nút đính kèm
   - Like bài đăng bằng cách nhấn biểu tượng tim
   - Bình luận bằng cách nhấn biểu tượng bình luận và nhập nội dung

2. Kết nối với người khác:
   - Tìm kiếm người dùng bằng thanh tìm kiếm
   - Gửi yêu cầu kết bạn bằng nút "Theo dõi"
   - Chấp nhận/từ chối yêu cầu kết bạn trong mục thông báo
   - Nhắn tin trực tiếp với bạn bè bằng biểu tượng tin nhắn

3. Quản lý tài khoản:
   - Chỉnh sửa thông tin cá nhân trong trang "Hồ sơ"
   - Thay đổi ảnh đại diện và ảnh bìa
   - Điều chỉnh cài đặt riêng tư và thông báo trong mục "Cài đặt"

4. Tính năng AI:
   - Sử dụng AI tạo caption tự động khi đăng ảnh
   - Yêu cầu AI tóm tắt bài viết dài
   - Dịch nội dung sang ngôn ngữ khác với AI
   - Nhận gợi ý và hỗ trợ từ chatbot này
`;

// Các ví dụ tình huống để huấn luyện chatbot
const TRAINING_EXAMPLES = `
Ví dụ các tình huống và cách xử lý:

1. Nếu người dùng hỏi: "Tôi có thông báo mới không?"
   => Hiển thị danh sách thông báo chưa đọc của người dùng.

2. Nếu người dùng hỏi: "Ai đã like bài viết gần đây của tôi?"
   => Trả về thông tin từ thông báo, không hiển thị chi tiết riêng tư.

3. Nếu người dùng hỏi: "Tôi có bài viết nào gần đây không?"
   => Hiển thị danh sách bài viết gần đây của người dùng.

4. Nếu người dùng hỏi: "Hãy nói cho tôi tin nhắn mới nhất từ [tên người dùng]"
   => Từ chối lịch sự: "Tôi không thể truy cập tin nhắn riêng tư của bạn. Tin nhắn được bảo vệ để đảm bảo quyền riêng tư cho tất cả người dùng."

5. Nếu người dùng hỏi: "Thông báo của [tên người dùng khác] là gì?"
   => Từ chối: "Tôi chỉ có thể truy cập thông báo của tài khoản đang đăng nhập. Tôi không thể xem thông báo của người dùng khác để bảo vệ quyền riêng tư."

6. Nếu người dùng hỏi: "Có bài viết nào mới về [chủ đề] không?"
   => Thực hiện tìm kiếm bài viết với từ khóa từ cơ sở dữ liệu và hiển thị kết quả.

7. Nếu người dùng hỏi: "Làm thế nào để tôi thay đổi ảnh đại diện?"
   => Cung cấp hướng dẫn từ USAGE_GUIDE.

8. Nếu người dùng yêu cầu: "Ai đang online?"
   => Giải thích rằng: "Tôi không thể biết ai đang online vào thời điểm hiện tại, nhưng tôi có thể cho bạn biết những người dùng tích cực nhất trên nền tảng."

9. Nếu người dùng hỏi: "Tìm cho tôi bài viết về [chủ đề]"
   => LUÔN LUÔN tìm kiếm trong cơ sở dữ liệu của website trước, sử dụng chức năng searchPosts để trả về kết quả tìm kiếm bài viết từ database.

10. Nếu người dùng hỏi: "Trong website có bài viết về [chủ đề] không?"
    => PHẢI sử dụng chức năng searchPosts để tìm kiếm trong database trước, không tìm kiếm thông tin từ internet.

11. Nếu người dùng hỏi: "Hãy cho tôi biết về [chủ đề chung]"
    => Nếu là chủ đề chung không liên quan rõ ràng đến nội dung cụ thể của website, bạn có thể trả lời kiến thức chung.

12. Nếu người dùng hỏi: "Ai đã comment bài viết của tôi?"
    => Truy xuất thông tin từ thông báo, chỉ hiển thị thông tin chung không chi tiết.

13. Nếu người dùng hỏi: "Ai là người dùng phổ biến nhất trên Introvertia?"
    => Sử dụng chức năng activeUsers để hiển thị thông tin người dùng tích cực.

14. Nếu người dùng hỏi: "Làm thế nào để xem các bài viết phổ biến?"
    => Hướng dẫn cách sử dụng tính năng xem bài viết phổ biến từ USAGE_GUIDE.

15. Nếu người dùng hỏi: "Tôi muốn xem lại thông báo cũ"
    => Hiển thị tất cả thông báo của người dùng, không chỉ thông báo mới.

16. Nếu người dùng hỏi: "Làm thế nào để tôi ẩn thông báo đã đọc?"
    => Cung cấp hướng dẫn về cách quản lý thông báo từ USAGE_GUIDE.

17. Nếu người dùng hỏi: "Có bài nào đang được thảo luận nhiều không?"
    => Sử dụng chức năng recentPosts để hiển thị bài viết có nhiều bình luận.

18. Nếu người dùng hỏi: "Làm thế nào để đăng story?"
    => Cung cấp hướng dẫn cụ thể về việc đăng story từ USAGE_GUIDE.

19. Nếu người dùng hỏi: "Introvertia có tính năng gì đặc biệt?"
    => Mô tả các tính năng đặc biệt từ phần WEBSITE_INFO.

20. Nếu người dùng hỏi: "Ai đang follow tôi?"
    => Từ chối nhẹ nhàng vì đây là thông tin cá nhân mà chatbot không truy cập được.
`;

// Các hướng dẫn thêm về ngữ cảnh và xử lý
const ADDITIONAL_GUIDELINES = `
Hướng dẫn bổ sung về xử lý các yêu cầu tìm kiếm và truy vấn:

1. LUÔN LUÔN ưu tiên tìm kiếm từ cơ sở dữ liệu của website khi người dùng hỏi về bài viết, chủ đề, nội dung trong website.

2. Cách phân biệt yêu cầu tìm kiếm trong website và yêu cầu thông tin chung:
   - Nếu câu hỏi bao gồm "trong website", "trên Introvertia", "trên nền tảng", "có bài viết về", "tìm bài về", "ai đăng bài về"... => Tìm kiếm trong database.
   - Nếu câu hỏi mang tính tổng quát hơn như "giải thích về [khái niệm]", "cho tôi biết về [chủ đề tổng quát]" không nhắc đến bài viết => Có thể trả lời kiến thức chung.

3. Khi người dùng yêu cầu tìm kiếm bài viết, sử dụng requestType "searchPosts" và searchQuery để truy vấn database chứ KHÔNG dựa vào kiến thức có sẵn.

4. Khi trả lời về bài viết trong website, chỉ trả lời dựa trên dữ liệu thực tế từ database, không dựa vào suy đoán.

5. Với các câu hỏi về cách sử dụng tính năng cụ thể (đăng bài, tìm bạn, thay đổi cài đặt...), luôn tham khảo hướng dẫn từ USAGE_GUIDE.

6. Không bao giờ tiết lộ thông tin cá nhân của người dùng khác (kể cả khi có trong database) như thông tin liên hệ, vị trí cụ thể, v.v.

7. Khi hiển thị thông báo, bài viết của người dùng, chỉ hiển thị thông tin mà người dùng đã đăng công khai.
`;

interface PostWithUser {
  id: number;
  desc: string;
  createdAt: Date;
  user: {
    username: string;
    name: string | null;
    surname: string | null;
  };
  likes?: Array<{ id: number }>;
  comments?: Array<{ id: number }>;
}

interface ActiveUser {
  username: string;
  name: string | null;
  surname: string | null;
  _count: {
    posts: number;
  };
}

interface NotificationWithSender {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    username: string;
    name: string | null;
    surname: string | null;
  };
}

export async function POST(req: Request) {
  try {
    // Kiểm tra xác thực người dùng
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy dữ liệu từ request
    const data = await req.json();
    const { 
      messages, 
      fetchUserPosts = false,
      searchQuery = null,
      requestType = null 
    } = data;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Thêm thông tin cơ bản cho chatbot
    let systemPrompt = `Bạn là trợ lý AI của mạng xã hội Introvertia, một nền tảng dành cho mọi người.
Thông tin về nền tảng:
${WEBSITE_INFO}

Hướng dẫn sử dụng Introvertia:
${USAGE_GUIDE}

Hướng dẫn quan trọng về quyền riêng tư và an toàn dữ liệu:
1. KHÔNG được cung cấp thông tin cá nhân của người dùng như mật khẩu, email, số điện thoại, thông tin thanh toán hoặc tin nhắn riêng tư.
2. Chỉ cung cấp thông tin công khai như bài viết công khai, thông tin chung về website.
3. Trả lời một cách thân thiện, hữu ích, và tôn trọng.
4. Bạn có thể trả lời các câu hỏi chung về cách sử dụng nền tảng.
5. Từ chối lịch sự khi được yêu cầu thông tin nhạy cảm hoặc riêng tư.
6. Khi được hỏi về bài viết, chỉ đề cập đến nội dung công khai.
7. Khi người dùng hỏi về thông báo, bạn CHỈ được cung cấp thông báo của người dùng đang đăng nhập (ID: ${userId}). TUYỆT ĐỐI KHÔNG cung cấp thông báo của người dùng khác.

Ưu tiên tìm kiếm nội dung từ cơ sở dữ liệu:
1. Khi người dùng hỏi về bài viết, chủ đề hoặc nội dung trong website, LUÔN LUÔN tìm kiếm từ cơ sở dữ liệu trước, KHÔNG cung cấp thông tin từ kiến thức chung.
2. Khi người dùng rõ ràng yêu cầu tìm kiếm bài viết, sử dụng chức năng searchPosts thay vì trả lời theo kiến thức chung.
3. Nếu không có kết quả tìm kiếm nào trong database, hãy nói rõ rằng không tìm thấy bài viết nào về chủ đề đó trong hệ thống.
4. CHỈ sử dụng kiến thức chung khi câu hỏi KHÔNG liên quan đến nội dung cụ thể trong website.

Cách xử lý các câu hỏi khác nhau:
1. Khi người dùng hỏi "Tôi có thông báo mới nào không?": Hiển thị thông báo chưa đọc của người dùng hiện tại.
2. Khi người dùng hỏi "Ai đã like bài viết của tôi?": Cung cấp thông tin từ thông báo của họ, nhưng không liệt kê chi tiết tài khoản.
3. Khi người dùng hỏi về thông báo của người khác: Từ chối lịch sự, giải thích rằng bạn không thể truy cập thông tin riêng tư của người dùng khác.
4. Khi người dùng hỏi về tin nhắn: Từ chối truy cập và giải thích rằng tin nhắn là riêng tư.
5. Khi người dùng hỏi về hoạt động trang web: Cung cấp thông tin công khai như bài viết mới, người dùng tích cực.
6. Khi người dùng hỏi "Có bài viết nào về [chủ đề]?": Tìm kiếm trong database sử dụng chức năng searchPosts.
7. Khi người dùng yêu cầu "Tìm bài viết về [chủ đề]": Sử dụng chức năng searchPosts, không cung cấp thông tin từ kiến thức chung.

${TRAINING_EXAMPLES}

${ADDITIONAL_GUIDELINES}

Ngày hiện tại: ${new Date().toLocaleDateString('vi-VN')}
`;

    // Xử lý yêu cầu dựa trên loại request
    let additionalInfo = "";

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
          additionalInfo += "\nĐây là một số bài viết gần đây của bạn:\n";
          
          userPosts.forEach((post: { id: number; desc: string | null; createdAt: Date }, index: number) => {
            const date = new Date(post.createdAt).toLocaleDateString('vi-VN');
            additionalInfo += `${index + 1}. Ngày ${date}: "${post.desc?.substring(0, 100)}${post.desc && post.desc.length > 100 ? '...' : ''}"\n`;
          });
        } else {
          additionalInfo += "\nBạn chưa có bài viết nào gần đây.\n";
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    }

    // Xử lý yêu cầu tìm kiếm bài viết theo từ khóa
    if (requestType === "searchPosts" && searchQuery) {
      try {
        // Phân tích từ khóa tìm kiếm thành các từ và cụm từ có ý nghĩa
        const searchTerms = searchQuery
          .toLowerCase()
          .split(/\s+/)
          .filter((term: string) => term.length > 2 && !["và", "hoặc", "hay", "với", "cùng", "cho", "các", "những", "một", "trong", "ngoài", "của", "về"].includes(term));
        
        // Thêm các từ khóa đồng nghĩa cho một số chủ đề phổ biến
        const synonymExpansions: {[key: string]: string[]} = {
          "tuyển dụng": ["việc làm", "công việc", "nghề nghiệp", "tuyển", "tuyển người", "cơ hội", "job", "hiring", "nhân sự", "ứng tuyển", "tuyển nhân viên", "tuyển nhân sự", "career", "jobs", "recruitment", "tuyển dụng", "nghề", "nghề nghiệp", "chuyên nghiệp", "chuyên môn", "ngành nghề", "ngành", "nghiệp", "lương", "tuyển", "tuyển người", "việc", "nhân viên"],
          "việc làm": ["tuyển dụng", "công việc", "nghề nghiệp", "tuyển", "tuyển người", "cơ hội", "job", "hiring", "nhân sự", "ứng tuyển", "tuyển nhân viên", "tuyển nhân sự", "career", "jobs", "recruitment", "nghề", "nghề nghiệp", "chuyên nghiệp", "chuyên môn", "ngành nghề", "ngành", "nghiệp", "lương", "tuyển", "tuyển người", "việc", "nhân viên"],
          "công việc": ["việc làm", "tuyển dụng", "nghề nghiệp", "tuyển", "tuyển người", "cơ hội", "job", "hiring", "nhân sự", "ứng tuyển", "tuyển nhân viên", "tuyển nhân sự", "career", "jobs", "recruitment", "nghề", "nghề nghiệp", "chuyên nghiệp", "chuyên môn", "ngành nghề", "ngành", "nghiệp", "lương", "tuyển", "tuyển người", "việc", "nhân viên"],
          "học tập": ["giáo dục", "đào tạo", "học", "giảng dạy", "trường học", "sinh viên", "học sinh", "education", "học hành", "lớp học", "khóa học", "đại học", "cao đẳng", "trung học", "trường học", "giáo dục", "đào tạo"],
          "du lịch": ["travel", "phượt", "chuyến đi", "tour", "khám phá", "địa điểm", "danh lam", "thắng cảnh", "du ngoạn", "du khách", "lữ hành", "tham quan", "cảnh đẹp", "kỳ nghỉ", "vacation"],
          "công nghệ": ["technology", "tech", "kỹ thuật", "phát triển", "ứng dụng", "app", "internet", "máy tính", "it", "software", "phần mềm", "công nghệ thông tin", "CNTT", "IT", "công nghệ số", "digital", "cyber", "trí tuệ nhân tạo", "AI", "artificial intelligence", "machine learning", "deep learning", "data", "dữ liệu", "big data"],
          "sức khỏe": ["health", "y tế", "bệnh", "chăm sóc", "dinh dưỡng", "thể chất", "tinh thần", "thuốc", "khám bệnh", "bác sĩ", "nha sĩ", "healthcare", "wellness", "well-being", "fitness", "medical", "tập luyện", "exercise", "vitamin", "vaccine", "tiêm chủng", "phòng bệnh", "chữa bệnh", "khám chữa bệnh", "bệnh viện", "clinic", "phòng khám"],
          "thể thao": ["sports", "bóng đá", "tennis", "bơi lội", "thể dục", "vận động", "tập luyện", "gym", "thể hình", "yoga", "pilates", "marathon", "chạy bộ", "đạp xe", "bóng rổ", "cầu lông", "võ thuật", "football", "basketball", "swimming", "running", "cycling", "fitness", "athletics"]
        };
        
        // Danh sách từ khóa quan trọng cho từng lĩnh vực chính
        const keyTopicKeywords: {[key: string]: string[]} = {
          "tuyển dụng": ["tuyển dụng", "việc làm", "công việc", "nghề nghiệp", "tuyển", "hiring", "job", "jobs", "career", "vacancy", "recruitment", "ứng tuyển", "lương", "salary", "jd", "mô tả công việc", "job description", "vị trí", "position", "hr", "nhân sự"],
          "giải trí": ["game", "trò chơi", "giải trí", "meme", "hài hước", "vui", "cười", "entertainment", "funny", "joke", "comedy", "humor", "phim", "movie", "âm nhạc", "music", "ca sĩ", "ca nhạc", "bài hát", "song", "anime", "manga", "video", "tiktok", "youtube"]
        };
        
        // Mở rộng tìm kiếm với các từ đồng nghĩa
        const expandedTerms = [...searchTerms];
        for (const term of searchTerms) {
          for (const [key, synonyms] of Object.entries(synonymExpansions)) {
            if (term.includes(key) || key.includes(term)) {
              expandedTerms.push(...synonyms);
            }
          }
        }
        
        // Loại bỏ trùng lặp từ khóa
        const uniqueTerms = [...new Set(expandedTerms)];
        
        // Tạo các điều kiện tìm kiếm
        const searchConditions = uniqueTerms.map((term: string) => ({
          desc: {
            contains: term,
            mode: 'insensitive' as const
          }
        }));
        
        // Tìm kiếm chính xác với từ khóa ban đầu
        const exactSearch = {
          desc: {
            contains: searchQuery,
            mode: 'insensitive' as const
          }
        };
        
        // Kết hợp tìm kiếm chính xác với tìm kiếm theo từng từ
        const searchResults = await prisma.post.findMany({
          where: {
            OR: [exactSearch, ...searchConditions]
          },
          include: {
            user: {
              select: {
                username: true,
                name: true,
                surname: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20 // Lấy nhiều kết quả hơn để có thể lọc
        });

        // Chuyển đổi query thành mảng từ khóa chính
        const mainQueryKeywords = searchQuery
          .toLowerCase()
          .split(/\s+/)
          .filter((term: string) => term.length > 2);

        // Tính điểm phù hợp ngữ nghĩa cho từng kết quả
        const scoredResults = searchResults.map(post => {
          let score = 0;
          const postContent = post.desc.toLowerCase();
          
          // Kiểm tra xem post có thuộc các chủ đề chính không
          const queryDomain = Object.keys(keyTopicKeywords).find(domain => {
            // Kiểm tra xem query có chứa từ khóa của domain này không
            return keyTopicKeywords[domain].some((keyword: string) => 
              searchQuery.toLowerCase().includes(keyword)
            );
          });
          
          if (queryDomain) {
            // Nếu query thuộc một domain cụ thể, kiểm tra xem post có liên quan không
            const domainKeywords = keyTopicKeywords[queryDomain];
            const postMatchesDomain = domainKeywords.some((keyword: string) => 
              postContent.includes(keyword)
            );
            
            // Nếu post không thuộc domain mà query yêu cầu, chấp nhận điểm thấp
            if (!postMatchesDomain) {
              score -= 30; // Giảm điểm đáng kể nếu không thuộc domain
            } else {
              score += 15; // Tăng điểm nếu thuộc domain
            }
          }
          
          // Cho điểm nếu tất cả từ khóa chính xuất hiện trong bài đăng
          const allMainKeywordsPresent = mainQueryKeywords.every((keyword: string) => 
            postContent.includes(keyword)
          );
          if (allMainKeywordsPresent) {
            score += 10;
          }
          
          // Cho điểm theo số từ khóa xuất hiện trong bài đăng
          for (const term of uniqueTerms) {
            if (postContent.includes(term)) {
              score += 1;
              
              // Cho thêm điểm nếu từ khóa xuất hiện nhiều lần
              const matches = postContent.match(new RegExp(term, 'gi'));
              if (matches && matches.length > 1) {
                score += Math.min(matches.length - 1, 3); // Tối đa 3 điểm cho việc lặp lại
              }
            }
          }
          
          // Phạt nếu bài đăng quá ngắn nhưng có điểm
          if (score > 0 && postContent.length < 50) {
            score -= 5;
          }
          
          // Kiểm tra và phạt điểm cho nội dung có vẻ là meme, nếu đang tìm kiếm nghiêm túc
          if (queryDomain === 'tuyển dụng') {
            const memeIndicators = ['haha', 'lol', 'lmao', 'emoji', 'tralala', '🤣', '😂', '🔥', '💀', '👏', 'meme', 'funny', 'joke', 'brainrot'];
            for (const indicator of memeIndicators) {
              if (postContent.includes(indicator)) {
                score -= 5;
              }
            }
          }
          
          return { post, score };
        });

        // Sắp xếp theo điểm từ cao đến thấp
        scoredResults.sort((a, b) => b.score - a.score);

        // Lọc bỏ kết quả có điểm quá thấp
        const filteredResults = scoredResults.filter(item => item.score > 0);
        
        // Lấy tối đa 10 kết quả
        const topResults = filteredResults.slice(0, 10).map(item => item.post);

        if (topResults.length > 0) {
          additionalInfo += `\nKết quả tìm kiếm cho "${searchQuery}" trong Introvertia:\n`;
          
          topResults.forEach((post: PostWithUser, index: number) => {
            const date = new Date(post.createdAt).toLocaleDateString('vi-VN');
            const userName = post.user.name && post.user.surname 
              ? `${post.user.name} ${post.user.surname}` 
              : post.user.username;
            additionalInfo += `${index + 1}. Bài viết của ${userName} (${date}): "${post.desc.substring(0, 150)}${post.desc.length > 150 ? '...' : ''}"\n`;
          });
        } else if (searchResults.length > 0 && filteredResults.length === 0) {
          // Trường hợp có kết quả nhưng bị lọc hết do chất lượng kém
          additionalInfo += `\nTìm thấy một số bài viết nhưng không có bài nào thực sự liên quan đến "${searchQuery}".\nHãy thử tìm kiếm với từ khóa cụ thể hơn hoặc từ khóa khác.\n`;
          
          // Gợi ý các lĩnh vực có thể tìm kiếm
          if (searchQuery.toLowerCase().includes("tuyển dụng") || 
              searchQuery.toLowerCase().includes("việc làm") || 
              searchQuery.toLowerCase().includes("công việc")) {
            additionalInfo += "\nBạn có thể thử tìm kiếm với các từ khóa như: tuyển dụng IT, tuyển nhân viên marketing, việc làm remote, công việc bán thời gian...\n";
          }
        } else {
          // Nếu không tìm thấy kết quả, thử tìm kiếm linh hoạt hơn với các từ ngắn
          const flexibleTerms = searchQuery
            .toLowerCase()
            .split(/\s+/)
            .filter((term: string) => term.length > 1);
            
          if (flexibleTerms.length > 0) {
            const flexibleConditions = flexibleTerms.map((term: string) => ({
              desc: {
                contains: term,
                mode: 'insensitive' as const
              }
            }));
            
            const flexibleResults = await prisma.post.findMany({
              where: {
                OR: flexibleConditions
              },
              include: {
                user: {
                  select: {
                    username: true,
                    name: true,
                    surname: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 5
            });
            
            if (flexibleResults && flexibleResults.length > 0) {
              // Tính điểm các kết quả linh hoạt
              const scoredFlexResults = flexibleResults.map(post => {
                let score = 0;
                const postContent = post.desc.toLowerCase();
                
                for (const term of flexibleTerms) {
                  if (postContent.includes(term)) {
                    score += 1;
                  }
                }
                
                // Kiểm tra và phạt điểm cho nội dung có vẻ là meme, nếu đang tìm kiếm tuyển dụng
                if (searchQuery.toLowerCase().includes('tuyển dụng') || 
                    searchQuery.toLowerCase().includes('việc làm') || 
                    searchQuery.toLowerCase().includes('công việc')) {
                  const memeIndicators = ['haha', 'lol', 'lmao', 'emoji', 'tralala', '🤣', '😂', '🔥', '💀', '👏', 'meme', 'funny', 'joke', 'brainrot'];
                  for (const indicator of memeIndicators) {
                    if (postContent.includes(indicator)) {
                      score -= 3;
                    }
                  }
                }
                
                return { post, score };
              });
              
              // Lọc và sắp xếp kết quả
              const filteredFlexResults = scoredFlexResults
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .map(item => item.post);
              
              if (filteredFlexResults.length > 0) {
                additionalInfo += `\nKết quả liên quan đến "${searchQuery}" trong Introvertia:\n`;
                
                filteredFlexResults.forEach((post: PostWithUser, index: number) => {
                  const date = new Date(post.createdAt).toLocaleDateString('vi-VN');
                  const userName = post.user.name && post.user.surname 
                    ? `${post.user.name} ${post.user.surname}` 
                    : post.user.username;
                  additionalInfo += `${index + 1}. Bài viết của ${userName} (${date}): "${post.desc.substring(0, 150)}${post.desc.length > 150 ? '...' : ''}"\n`;
                });
              } else {
                additionalInfo += `\nKhông tìm thấy bài viết nào thực sự liên quan đến "${searchQuery}" trong cơ sở dữ liệu Introvertia.\nHãy thử tìm kiếm với từ khóa khác hoặc đặt câu hỏi cụ thể hơn.\n`;
                
                // Gợi ý các lĩnh vực có thể tìm kiếm
                if (searchQuery.toLowerCase().includes("tuyển dụng") || 
                    searchQuery.toLowerCase().includes("việc làm") || 
                    searchQuery.toLowerCase().includes("công việc")) {
                  additionalInfo += "\nBạn có thể thử tìm kiếm với các từ khóa như: tuyển dụng IT, tuyển nhân viên marketing, việc làm remote, công việc bán thời gian...\n";
                }
              }
            } else {
              additionalInfo += `\nKhông tìm thấy bài viết nào với từ khóa "${searchQuery}" trong cơ sở dữ liệu Introvertia.\nHãy thử tìm kiếm với từ khóa khác hoặc đặt câu hỏi cụ thể hơn.\n`;
            }
          } else {
            additionalInfo += `\nKhông tìm thấy bài viết nào với từ khóa "${searchQuery}" trong cơ sở dữ liệu Introvertia.\nHãy thử tìm kiếm với từ khóa khác hoặc đặt câu hỏi cụ thể hơn.\n`;
          }
        }
      } catch (error) {
        console.error("Error searching posts:", error);
      }
    }

    // Lấy bài viết phổ biến gần đây
    if (requestType === "recentPosts") {
      try {
        const recentPosts = await prisma.post.findMany({
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                username: true,
                name: true,
                surname: true
              }
            },
            likes: {
              select: {
                id: true
              }
            },
            comments: {
              select: {
                id: true
              }
            }
          },
          take: 5
        });

        if (recentPosts && recentPosts.length > 0) {
          additionalInfo += "\nBài viết phổ biến gần đây:\n";
          
          recentPosts.forEach((post: PostWithUser, index: number) => {
            const date = new Date(post.createdAt).toLocaleDateString('vi-VN');
            const userName = post.user.name && post.user.surname 
              ? `${post.user.name} ${post.user.surname}` 
              : post.user.username;
            const likeCount = post.likes?.length || 0;
            const commentCount = post.comments?.length || 0;
            
            additionalInfo += `${index + 1}. ${userName} (${date}): "${post.desc.substring(0, 100)}${post.desc.length > 100 ? '...' : ''}" - ${likeCount} lượt thích, ${commentCount} bình luận\n`;
          });
        } else {
          additionalInfo += "\nKhông có bài viết nào gần đây.\n";
        }
      } catch (error) {
        console.error("Error fetching recent posts:", error);
      }
    }

    // Lấy thông tin người dùng hoạt động tích cực
    if (requestType === "activeUsers") {
      try {
        // Lấy người dùng có nhiều bài viết nhất
        const activeUsers = await prisma.user.findMany({
          select: {
            username: true,
            name: true,
            surname: true,
            _count: {
              select: {
                posts: true
              }
            }
          },
          orderBy: {
            posts: {
              _count: 'desc'
            }
          },
          take: 5
        });

        if (activeUsers && activeUsers.length > 0) {
          additionalInfo += "\nNgười dùng tích cực trên Introvertia:\n";
          
          activeUsers.forEach((user: ActiveUser, index: number) => {
            const userName = user.name && user.surname 
              ? `${user.name} ${user.surname}` 
              : user.username;
            additionalInfo += `${index + 1}. ${userName} (@${user.username}) - ${user._count.posts} bài viết\n`;
          });
        }
      } catch (error) {
        console.error("Error fetching active users:", error);
      }
    }
    
    // Lấy thông báo của người dùng
    if (requestType === "userNotifications") {
      try {
        const notifications = await prisma.notification.findMany({
          where: {
            receiverId: userId,
          },
          include: {
            sender: {
              select: {
                username: true,
                name: true,
                surname: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        });

        if (notifications && notifications.length > 0) {
          const unreadCount = notifications.filter(notif => !notif.isRead).length;
          
          additionalInfo += `\nThông báo của bạn (${unreadCount} chưa đọc):\n`;
          
          notifications.forEach((notification: NotificationWithSender, index: number) => {
            const date = new Date(notification.createdAt).toLocaleDateString('vi-VN');
            const time = new Date(notification.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            
            // Không sử dụng userName để giữ quyền riêng tư, chỉ hiển thị nội dung thông báo
            const status = notification.isRead ? "" : " (Chưa đọc)";
            additionalInfo += `${index + 1}. [${date} ${time}]${status} ${notification.message}\n`;
          });
        } else {
          additionalInfo += "\nBạn không có thông báo nào.\n";
        }
      } catch (error) {
        console.error("Error fetching user notifications:", error);
      }
    }
    
    // Bổ sung thông tin vào system prompt
    if (additionalInfo) {
      systemPrompt += additionalInfo;
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