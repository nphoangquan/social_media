import { useState } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type RequestType = 
  | "searchPosts" 
  | "recentPosts" 
  | "activeUsers" 
  | "userNotifications" 
  | null;

// Các từ khóa để phát hiện ý định tìm kiếm
const SEARCH_INTENT_KEYWORDS = [
  "tìm", "tìm kiếm", "search", "look for", "find", "có bài viết về", 
  "có bài nào về", "có bài đăng", "website có", "introvertia có", 
  "nền tảng có", "bài viết liên quan", "post về", "bài về", "bài đăng về",
  "tìm bài", "tìm post", "tìm nội dung", "tìm thông tin", "có thông tin về",
  "trong website có", "trong introvertia", "trang web có", "xem bài viết về",
  "cho tôi xem bài về", "cho tôi xem", "hãy tìm", "tìm giúp", "tìm hộ", 
  "tìm cho", "tuyển dụng", "việc làm", "công việc", "bài tuyển", "tuyển",
  "ngành nghề", "nghề nghiệp", "tìm việc", "nhân sự", "hr", "tuyển nhân viên",
  "tuyển nhân sự", "bài đăng tuyển", "career", "hiring", "job", "jobs", "ứng tuyển",
  "vacancy", "recruitment", "vị trí", "position", "lương", "salary", "jd",
  "mô tả công việc", "job description", "tuyển dụng ngành", "tuyển dụng vị trí",
  "công việc ngành", "việc làm tại", "việc làm ngành", "cơ hội việc làm",
  "cơ hội nghề nghiệp", "tuyển gấp", "tuyển người", "việc", "nghề", "ngành"
];

// Các từ khóa loại trừ (để phân biệt tìm kiếm trong website với yêu cầu giải thích chung)
const EXCLUSION_KEYWORDS = [
  "làm thế nào", "cách", "hướng dẫn", "giải thích", "là gì", "định nghĩa",
  "khái niệm"
];

// Các cụm từ thường xuất hiện trong câu hỏi mà không phải là từ khóa tìm kiếm
const FILLER_WORDS = [
  "hay gì đó", "hoặc gì đó", "hay sao", "gì đấy", "nào không", "hay không", 
  "hoặc không", "được không", "giúp mình", "cho mình", "cho tôi", "giúp tôi",
  "với từ khóa", "với tư khóa", "với chủ đề", "với nội dung", "về chủ đề"
];

// Từ điển các từ viết tắt tiếng Việt và quốc tế phổ biến
const ABBREVIATION_DICT: Record<string, string> = {
  // Game và công nghệ
  "ww": "wuthering waves",
  "tuyendungk": "tuyển dụng",
  "td": "tuyển dụng",
  "bombardilo": "bombardilo",
  "lol": "league of legends",
  "csgo": "counter strike",
  "pubg": "playerunknown's battlegrounds",
  "ml": "mobile legends",
  "ff": "free fire",
  "zzz": "zenless zone zero",
  "hsr": "honkai star rail",
  "hi3": "honkai impact 3",
  "gg": "google",
  "fb": "facebook",
  "ig": "instagram",
  "tiktok": "tiktok",
  "yt": "youtube",
  "zl": "zalo",
  "ms": "microsoft",
  
  // Công việc và tuyển dụng
  "hr": "human resources",
  "cntt": "công nghệ thông tin",
  "it": "information technology",
  "ceo": "chief executive officer",
  "cfo": "chief financial officer",
  "cto": "chief technology officer",
  "cv": "curriculum vitae",
  "jd": "job description",
  "r&d": "research and development",
  "qa": "quality assurance",
  "qc": "quality control",
  "pm": "project manager",
  "dev": "developer",
  "fe": "frontend",
  "be": "backend",
  "fs": "fullstack",
  "ui": "user interface",
  "ux": "user experience",
  "seo": "search engine optimization",
  "crm": "customer relationship management",
  "kpi": "key performance indicator",
  "nv": "nhân viên",
  "nvvp": "nhân viên văn phòng",
  "ql": "quản lý",
  "tp": "trưởng phòng",
  "tpkd": "trưởng phòng kinh doanh",
  "ns": "nhân sự",
  "kt": "kế toán",
  "kd": "kinh doanh",
  "sale": "sales",
  "mkt": "marketing",
  "tckh": "truyền thông khách hàng",
  "cskh": "chăm sóc khách hàng",
  
  // Từ viết tắt tiếng Việt phổ biến
  "sdt": "số điện thoại",
  "đc": "địa chỉ",
  "tgian": "thời gian",
  "tphcm": "thành phố hồ chí minh",
  "hcm": "hồ chí minh",
  "hn": "hà nội",
  "dn": "đà nẵng",
  "đn": "đà nẵng",
  "hp": "hải phòng",
  "sg": "sài gòn",
  "vn": "việt nam",
  "vl": "việc làm",
  "lm": "làm",
  "kn": "kinh nghiệm",
  "đh": "đại học",
  "th": "trung học",
  "thpt": "trung học phổ thông",
  "thcs": "trung học cơ sở",
};

// Từ điển các slang tiếng Việt phổ biến
const SLANG_DICT: Record<string, string> = {
  "gank": "game",
  "gacha": "game",
  "toxic": "độc hại",
  "newbie": "người mới",
  "noob": "người mới",
  "pro": "chuyên nghiệp",
  "bug": "lỗi",
  "lag": "giật",
  "crash": "sập",
  "hack": "gian lận",
  "boom": "nổ",
  "feed": "cho điểm",
  "carry": "gánh team",
  "buff": "tăng cường",
  "nerf": "làm yếu",
  "meta": "xu hướng mạnh",
  "afk": "away from keyboard",
  "op": "overpowered",
  "pvp": "player versus player",
  "pve": "player versus environment",
  "moba": "multiplayer online battle arena"
};

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thêm hàm khởi tạo tin nhắn chào mừng
  const initWithWelcomeMessage = () => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = { 
        role: "assistant", 
        content: "Xin chào! Tôi là trợ lý AI của Introvertia. Tôi có thể giúp gì cho bạn? Tôi có thể cung cấp thông tin về cách sử dụng trang web, tìm kiếm bài viết, thông báo của bạn, hoặc cho bạn biết về các hoạt động gần đây trên nền tảng."
      };
      setMessages([welcomeMessage]);
    }
  };

  const sendMessage = async (
    content: string, 
    options: {
      fetchUserPosts?: boolean;
      searchQuery?: string;
      requestType?: RequestType;
    } = {}
  ): Promise<string> => {
    if (!content.trim()) return "";
    
    const { 
      fetchUserPosts = false,
      searchQuery = null,
      requestType = null
    } = options;
    
    setLoading(true);
    setError(null);
    
    // Thêm tin nhắn người dùng vào danh sách
    const userMessage: ChatMessage = { role: "user", content };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Chuyển đổi các tin nhắn sang định dạng API
      const apiMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Thêm tin nhắn người dùng mới vào cuối
      apiMessages.push({ role: "user", content });
      
      // Gửi yêu cầu đến API
      const response = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: apiMessages,
          fetchUserPosts,
          searchQuery,
          requestType
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể nhận phản hồi từ chatbot");
      }
      
      const data = await response.json();
      const reply = data.reply || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn.";
      
      // Thêm tin nhắn AI vào danh sách
      const botMessage: ChatMessage = { role: "assistant", content: reply };
      setMessages(prev => [...prev, botMessage]);
      
      return reply;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định";
      setError(errorMessage);
      return "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.";
    } finally {
      setLoading(false);
    }
  };
  
  // Kiểm tra xem tin nhắn có chứa ý định tìm kiếm không
  const containsSearchIntent = (message: string): boolean => {
    const normalizedMessage = message.toLowerCase();
    
    // Kiểm tra các từ khóa tìm kiếm
    for (const keyword of SEARCH_INTENT_KEYWORDS) {
      if (normalizedMessage.includes(keyword)) {
        // Kiểm tra xem có phải là yêu cầu tìm kiếm trong website không
        // (Loại trừ trường hợp tìm kiếm thông tin chung)
        let containsExclusion = false;
        for (const exclusion of EXCLUSION_KEYWORDS) {
          if (normalizedMessage.includes(exclusion)) {
            containsExclusion = true;
            break;
          }
        }
        
        if (!containsExclusion) {
          return true;
        }
      }
    }
    
    // Kiểm tra các mẫu câu cụ thể về tìm kiếm
    const searchPatterns = [
      /trong(\s+website|\s+intro|\s+trang web|\s+hệ thống|\s+nền tảng)?(\s+này)?(\s+có|\s+chứa)?(\s+bài|\s+post|\s+nội dung|\s+thông tin)(\s+về|\s+liên quan)?/i,
      /có(\s+bài|\s+post|\s+thông tin|\s+nội dung)(\s+nào|\s+gì)?(\s+về|\s+liên quan)?/i,
      /tìm(\s+giúp|\s+hộ|\s+cho)?(\s+tôi|\s+mình|\s+em)?(\s+bài|\s+post|\s+nội dung)?(\s+về|\s+liên quan)?/i,
      /cho(\s+tôi|\s+mình|\s+em)(\s+xem|\s+biết)?(\s+bài|\s+post|\s+nội dung)?(\s+về|\s+liên quan)?/i,
      /website(\s+này)?(\s+có)?(\s+bài|\s+post|\s+nội dung)?(\s+về|\s+liên quan)?/i,
      /tìm kiếm(\s+bài|\s+post|\s+nội dung)?(\s+về|\s+liên quan)?/i,
      /hãy(\s+tìm|\s+tìm kiếm|\s+cho)(\s+tôi|\s+mình)?(\s+xem)?(\s+bài|\s+post)?/i,
      /bài(\s+viết|\s+post|\s+đăng)?(\s+về)?(\s+chủ đề)?/i
    ];
    
    for (const pattern of searchPatterns) {
      if (pattern.test(normalizedMessage)) {
        return true;
      }
    }
    
    return false;
  };
  
  // Hàm tìm kiếm bài viết
  const searchPosts = async (query: string): Promise<string> => {
    return sendMessage(`Tìm kiếm bài viết với từ khóa: "${query}"`, {
      requestType: "searchPosts",
      searchQuery: query
    });
  };
  
  // Trích xuất từ khóa tìm kiếm từ tin nhắn
  const extractSearchQuery = (message: string): string | null => {
    let normalizedMessage = message.toLowerCase();
    
    // Loại bỏ các cụm từ thừa không liên quan đến nội dung tìm kiếm
    for (const filler of FILLER_WORDS) {
      normalizedMessage = normalizedMessage.replace(filler, "");
    }
    
    // Phát hiện và xử lý từ viết tắt và slang
    let expandedMessage = normalizedMessage;
    const words = normalizedMessage.split(/\s+/);
    
    // Tạo một bản sao của words để theo dõi các từ đã được xử lý
    const processedWords = [...words];
    
    // Kiểm tra từng từ xem có phải là từ viết tắt hoặc slang không
    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[.,?!;:"'()-]/g, "").trim(); // Loại bỏ dấu câu để so khớp tốt hơn
      
      // Kiểm tra từ trong từ điển viết tắt
      if (ABBREVIATION_DICT[word]) {
        // Đánh dấu từ đã được xử lý
        processedWords[i] = ABBREVIATION_DICT[word];
      }
      
      // Kiểm tra từ trong từ điển slang
      if (SLANG_DICT[word]) {
        // Đánh dấu từ đã được xử lý
        processedWords[i] = SLANG_DICT[word];
      }
    }
    
    // Tạo lại thông điệp đã được mở rộng
    expandedMessage = processedWords.join(" ");
    
    // Tạo một mảng để lưu trữ các từ viết tắt đã tìm thấy trong câu
    const foundAbbreviations: string[] = [];
    
    // Tìm kiếm các từ viết tắt trong câu
    for (const [abbr, expansion] of Object.entries(ABBREVIATION_DICT)) {
      if (normalizedMessage.includes(abbr)) {
        foundAbbreviations.push(abbr);
        
        // Kiểm tra nếu từ viết tắt này là từ khóa chính
        if (isAbbreviationTheMainKeyword(normalizedMessage, abbr)) {
          return expansion; // Trả về nghĩa đầy đủ của từ viết tắt
        }
      }
    }
    
    // Tìm kiếm các slang trong câu
    for (const slang of Object.keys(SLANG_DICT)) {
      if (normalizedMessage.includes(slang)) {
        // Kiểm tra nếu slang này là từ khóa chính
        if (isAbbreviationTheMainKeyword(normalizedMessage, slang)) {
          return slang; // Trả về chính slang đó vì người dùng thường quen với từ slang hơn
        }
      }
    }
    
    // Phát hiện tên game, thương hiệu, tên riêng hoặc từ khóa đặc biệt
    const knownEntities = [
      "wuthering waves", "genshin impact", "honkai", "zenless zone zero", "star rail",
      "minecraft", "fortnite", "pubg", "call of duty", "valorant", "league of legends",
      "csgo", "counter strike", "steam", "epic games", "ubisoft", "ea games", "blizzard",
      "playstation", "xbox", "nintendo", "switch", "ps5", "ps4", "meta quest", "oculus",
      "iphone", "samsung", "android", "windows", "mac", "linux", "ios", "macos",
      "google", "facebook", "instagram", "twitter", "threads", "tiktok",
      "ai", "ai assistant", "chatgpt", "claude", "llama", "generative ai",
      "bombardilo", "bombardilo chăng hạn", "ww", "tuyendungk"
    ];
    
    // Tìm kiếm tên entities đặc biệt trong câu truy vấn
    for (const entity of knownEntities) {
      if (expandedMessage.includes(entity) || normalizedMessage.includes(entity)) {
        // Tạo ngữ cảnh xung quanh entity
        const entityToUse = expandedMessage.includes(entity) ? entity : normalizedMessage.includes(entity) ? entity : "";
        const startIndex = Math.max(0, expandedMessage.indexOf(entityToUse) - 15);
        const endIndex = Math.min(expandedMessage.length, expandedMessage.indexOf(entityToUse) + entityToUse.length + 15);
        const context = expandedMessage.substring(startIndex, endIndex);
        
        // Kiểm tra xem entity có phải là nội dung chính của truy vấn không
        if (context.includes("về " + entityToUse) || 
            context.includes("tìm " + entityToUse) || 
            context.includes("kiếm " + entityToUse) || 
            context.includes("bài " + entityToUse)) {
          return entityToUse;
        }
        
        // Nếu entity nằm trong một câu rõ ràng là để tìm kiếm
        if (expandedMessage.includes("tìm bài về") || 
            expandedMessage.includes("tìm kiếm") || 
            expandedMessage.includes("tìm bài viết") || 
            expandedMessage.includes("tìm post")) {
          return entityToUse;
        }
        
        // Nếu entity xuất hiện một mình hoặc là từ khóa nổi bật trong câu
        if (expandedMessage.split(" ").length < 5 || 
            expandedMessage.startsWith(entityToUse) || 
            expandedMessage.endsWith(entityToUse)) {
          return entityToUse;
        }
      }
    }
    
    // Tiếp tục với logic hiện tại để trích xuất từ khóa
    // ... [Giữ phần code hiện tại bên dưới]

    // Phát hiện và xử lý các mẫu câu trực tiếp về tìm kiếm tuyển dụng
    if (expandedMessage.includes("tuyển dụng") || 
        expandedMessage.includes("việc làm") || 
        expandedMessage.includes("công việc")) {
      
      // Xử lý các mẫu câu kiểu "tìm các bài về tuyển dụng" -> từ khóa tìm là "tuyển dụng"
      const directJobPatterns = [
        /tìm\s+(?:các\s+)?(?:bài|post|bài\s+viết|bài\s+đăng|nội\s+dung)(?:\s+\w+)*\s+(?:về|liên\s+quan\s+(?:đến|tới)|nói\s+về)\s+(tuyển\s+dụng|việc\s+làm|công\s+việc)(?:\s+\w+)*/i,
        /kiếm\s+(?:các\s+)?(?:bài|post|bài\s+viết|bài\s+đăng|nội\s+dung)(?:\s+\w+)*\s+(?:về|liên\s+quan\s+(?:đến|tới)|nói\s+về)\s+(tuyển\s+dụng|việc\s+làm|công\s+việc)(?:\s+\w+)*/i,
        /(?:có|tìm|kiếm)\s+(?:bài|post|bài\s+viết|bài\s+đăng|nội\s+dung)(?:\s+\w+)*\s+(?:về|liên\s+quan\s+(?:đến|tới)|nói\s+về)\s+(tuyển\s+dụng|việc\s+làm|công\s+việc)(?:\s+\w+)*/i,
        /(?:bài|post|bài\s+viết|bài\s+đăng|nội\s+dung)(?:\s+\w+)*\s+(?:về|liên\s+quan\s+(?:đến|tới)|nói\s+về)\s+(tuyển\s+dụng|việc\s+làm|công\s+việc)(?:\s+\w+)*/i
      ];
      
      for (const pattern of directJobPatterns) {
        const match = expandedMessage.match(pattern);
        if (match && match[1]) {
          // Lấy phần từ khóa tuyển dụng và từ bổ sung đi kèm (nếu có)
          let keyword = match[1].trim();
          
          // Trích xuất thêm thông tin bổ sung nếu có (ví dụ: tuyển dụng IT, việc làm marketing)
          const restOfMsg = expandedMessage.substring(expandedMessage.indexOf(keyword) + keyword.length).trim();
          if (restOfMsg.length > 0) {
            // Chỉ thêm từ bổ sung nếu là từ có ý nghĩa và không phải từ khóa phụ
            const ignoreWords = ["nào", "không", "nhé", "đi", "à", "ạ", "cho", "mình", "tôi", "với", "về"];
            if (!ignoreWords.some(word => restOfMsg === word)) {
              keyword += " " + restOfMsg;
            }
          }
          
          return cleanupSearchQuery(keyword);
        }
      }
      
      // Nếu không khớp với mẫu cụ thể, tìm từ khóa "tuyển dụng"/"việc làm"/"công việc" và nội dung bổ sung
      if (expandedMessage.includes("tuyển dụng")) {
        const index = expandedMessage.indexOf("tuyển dụng");
        let keyword = "tuyển dụng";
        
        // Lấy nội dung sau "tuyển dụng" nếu có (ví dụ: tuyển dụng IT)
        const restOfMsg = expandedMessage.substring(index + 10).trim(); // 10 = "tuyển dụng".length
        if (restOfMsg.length > 0 && !/^(không|à|ạ|nhé|nào|với|cho|mình|tôi|về)/.test(restOfMsg)) {
          keyword += " " + restOfMsg;
        }
        
        return cleanupSearchQuery(keyword);
      } 
      else if (expandedMessage.includes("việc làm")) {
        const index = expandedMessage.indexOf("việc làm");
        let keyword = "việc làm";
        
        // Lấy nội dung sau "việc làm" nếu có
        const restOfMsg = expandedMessage.substring(index + 8).trim(); // 8 = "việc làm".length
        if (restOfMsg.length > 0 && !/^(không|à|ạ|nhé|nào|với|cho|mình|tôi|về)/.test(restOfMsg)) {
          keyword += " " + restOfMsg;
        }
        
        return cleanupSearchQuery(keyword);
      }
      else if (expandedMessage.includes("công việc")) {
        const index = expandedMessage.indexOf("công việc");
        let keyword = "công việc";
        
        // Lấy nội dung sau "công việc" nếu có
        const restOfMsg = expandedMessage.substring(index + 9).trim(); // 9 = "công việc".length
        if (restOfMsg.length > 0 && !/^(không|à|ạ|nhé|nào|với|cho|mình|tôi|về)/.test(restOfMsg)) {
          keyword += " " + restOfMsg;
        }
        
        return cleanupSearchQuery(keyword);
      }
    }
    
    // Phát hiện cấu trúc "từ khóa: XXX" hoặc "keyword: XXX" - một mẫu phổ biến
    const keywordPatterns = [
      /từ\s*khóa\s*:\s*["']?([^"']+)["']?/i,
      /keyword\s*:\s*["']?([^"']+)["']?/i,
      /key\s*:\s*["']?([^"']+)["']?/i,
      /khóa\s*:\s*["']?([^"']+)["']?/i
    ];
    
    for (const pattern of keywordPatterns) {
      const match = expandedMessage.match(pattern);
      if (match && match[1] && match[1].trim().length > 1) {
        return cleanupSearchQuery(match[1].trim());
      }
    }
    
    // Tìm từ khóa sau các cụm từ tìm kiếm
    const patterns = [
      /hãy\s+tìm\s+(?:cho|giúp)?\s+(?:tôi|mình|em)?\s+(?:bài\s+viết|bài\s+đăng|bài\s+post|bài|post|nội\s+dung)?\s+về\s+(.+)/i,
      /tìm\s+kiếm\s+bài\s+viết\s+về\s+(.+)/i,
      /tìm\s+bài\s+viết\s+với\s+từ\s+khóa\s*:\s*["']?([^"']+)["']?/i,
      /tìm\s+bài\s+viết\s+với\s+từ\s+khóa\s+(.+)/i,
      /tìm\s+bài\s+viết\s+về\s+(.+)/i,
      /tìm\s+bài\s+về\s+(.+)/i,
      /tìm\s+về\s+(.+)/i,
      /bài\s+viết\s+về\s+(.+)/i,
      /có\s+bài\s+viết\s+nào\s+về\s+(.+)/i,
      /có\s+bài\s+nào\s+về\s+(.+)/i,
      /tìm\s+kiếm\s+(.+)/i,
      /tìm\s+(?:giúp|hộ|cho)?\s+(?:tôi|mình)?\s+(.+)/i,
      /website\s+có\s+(.+)/i,
      /trong\s+website\s+có\s+(.+)/i,
      /post\s+về\s+(.+)/i,
      /bài\s+đăng\s+về\s+(.+)/i,
      /cho\s+(?:tôi|mình)\s+xem\s+bài\s+về\s+(.+)/i,
      /có\s+(?:bài|post|bài\s+viết|nội\s+dung)\s+(?:nào|gì)?\s+(?:về|liên\s+quan\s+đến|liên\s+quan|nói\s+về)?\s+(.+?)(?:\s+không|\s+chưa|\s+ko|\s+k)?$/i,
      /(?:bài|post|bài\s+viết|nội\s+dung)\s+(?:về|liên\s+quan\s+đến|liên\s+quan|nói\s+về)\s+(.+)/i,
      /(?:tìm|kiếm)\s+(?:các|những|mấy)?\s+(?:bài|bài viết|post|nội dung|thông tin)\s+(?:về|liên quan đến|liên quan|nói về)\s+(.+)/i
    ];
    
    // Trích xuất từ khóa bằng nhiều phương pháp
    let extractedKeywords = [];
    
    // 1. Thử từng pattern để tìm từ khóa
    for (const pattern of patterns) {
      const match = expandedMessage.match(pattern);
      if (match && match[1] && match[1].length > 1) {
        // Kiểm tra nếu từ khóa quá dài (>50 ký tự) thì có thể là sai
        if (match[1].length <= 50) {
          extractedKeywords.push(match[1].trim());
        }
      }
    }
    
    // 2. Tìm kiếm theo ngữ cảnh và loại bỏ các từ không liên quan
    // Xác định các cụm từ đánh dấu bắt đầu từ khóa tìm kiếm
    const searchMarkers = [
      "tìm", "tìm kiếm", "bài viết về", "bài về", "có bài về", 
      "post về", "nội dung về", "bài đăng về", "hãy tìm", "tìm giúp", 
      "tìm hộ", "xem bài về", "cho xem", "tuyển dụng", "việc làm",
      "công việc", "nghề nghiệp", "bài tuyển", "tuyển", "từ khóa"
    ];
    
    for (const marker of searchMarkers) {
      const index = expandedMessage.indexOf(marker);
      if (index !== -1) {
        const remaining = expandedMessage.substring(index + marker.length).trim();
        
        // Nếu còn nội dung sau marker, đây có thể là từ khóa tìm kiếm
        if (remaining && remaining.length > 1 && remaining.length <= 50) {
          extractedKeywords.push(remaining);
        }
      }
    }
    
    // 3. Phân tích từ khóa nghề nghiệp và tuyển dụng
    // Nếu tin nhắn liên quan đến tuyển dụng/việc làm, cố gắng tìm thêm chủ đề cụ thể
    if (expandedMessage.includes("tuyển dụng") || 
        expandedMessage.includes("việc làm") ||
        expandedMessage.includes("công việc")) {
      
      // Tìm kiếm ngành nghề cụ thể
      const jobIndustries = [
        "it", "cntt", "công nghệ thông tin", "công nghệ", "lập trình",
        "marketing", "sales", "bán hàng", "kinh doanh",
        "tài chính", "kế toán", "ngân hàng", "finance", "banking", 
        "nhân sự", "hr", "human resources", "tuyển dụng",
        "giáo dục", "giảng dạy", "education", "teaching",
        "y tế", "healthcare", "bác sĩ", "dược",
        "du lịch", "khách sạn", "nhà hàng", "tourism", "hospitality",
        "logistics", "vận tải", "kho vận", "xuất nhập khẩu",
        "xây dựng", "construction", "kiến trúc", "architecture",
        "luật", "pháp lý", "legal", "law",
        "thiết kế", "design", "graphic", "ux", "ui",
        "báo chí", "truyền thông", "media", "journalism",
        "bất động sản", "real estate", "property"
      ];
      
      for (const industry of jobIndustries) {
        if (expandedMessage.includes(industry)) {
          // Nếu tìm thấy ngành nghề, kết hợp với từ khóa tuyển dụng
          if (expandedMessage.includes("tuyển dụng")) {
            extractedKeywords.push(`tuyển dụng ${industry}`);
          } else if (expandedMessage.includes("việc làm")) {
            extractedKeywords.push(`việc làm ${industry}`);
          } else {
            extractedKeywords.push(`công việc ${industry}`);
          }
          // Cũng thêm chỉ ngành nghề làm từ khóa
          extractedKeywords.push(industry);
        }
      }
      
      // Tìm kiếm vị trí công việc cụ thể
      const jobPositions = [
        "developer", "lập trình viên", "kỹ sư", "engineer", "quản lý", "manager",
        "leader", "trưởng", "trưởng phòng", "director", "giám đốc",
        "nhân viên", "staff", "executive", "chuyên viên", "specialist",
        "architect", "kiến trúc sư", "designer", "thiết kế", "coordinator", "điều phối viên",
        "assistant", "trợ lý", "giáo viên", "teacher", "professor", "giảng viên",
        "bác sĩ", "doctor", "y tá", "nurse", "dược sĩ", "pharmacist",
        "kế toán", "accountant", "kỹ thuật viên", "technician"
      ];
      
      for (const position of jobPositions) {
        if (expandedMessage.includes(position)) {
          // Nếu tìm thấy vị trí, thêm vào danh sách keywords
          extractedKeywords.push(position);
          
          // Kết hợp vị trí với từ khóa tuyển dụng
          if (expandedMessage.includes("tuyển dụng")) {
            extractedKeywords.push(`tuyển dụng ${position}`);
          } else if (expandedMessage.includes("việc làm")) {
            extractedKeywords.push(`việc làm ${position}`);
          } else {
            extractedKeywords.push(`công việc ${position}`);
          }
        }
      }
      
      // Nếu không tìm thấy ngành nghề hoặc vị trí cụ thể, mặc định sử dụng "tuyển dụng"
      if (extractedKeywords.length === 0) {
        if (expandedMessage.includes("tuyển dụng")) {
          extractedKeywords.push("tuyển dụng");
        } else if (expandedMessage.includes("việc làm")) {
          extractedKeywords.push("việc làm");
        } else {
          extractedKeywords.push("công việc");
        }
      }
    }
    
    // 4. Nếu sau tất cả vẫn không tìm thấy, thử trích xuất chủ đề chính từ câu
    if (extractedKeywords.length === 0) {
      // Loại bỏ các từ chỉ tìm kiếm và giữ lại phần nội dung
      let processedMessage = expandedMessage;
      for (const searchWord of ["tìm", "kiếm", "bài", "viết", "post", "có", "xem", "hãy", "giúp", "hộ", "cho", "với", "từ", "khóa"]) {
        processedMessage = processedMessage.replace(new RegExp(`\\b${searchWord}\\b`, 'g'), "");
      }
      
      // Làm sạch và trả về kết quả nếu còn nội dung có ý nghĩa
      const cleaned = processedMessage.trim();
      if (cleaned && cleaned.length > 1 && cleaned.length <= 50) { // Giới hạn độ dài từ khóa
        extractedKeywords.push(cleanupSearchQuery(cleaned));
      }
    }
    
    // Nếu có bất kỳ từ khóa nào được trích xuất, lấy từ khóa dài nhất và có ý nghĩa nhất
    if (extractedKeywords.length > 0) {
      // Loại bỏ các từ khóa không phù hợp như toàn bộ câu truy vấn
      extractedKeywords = extractedKeywords.filter(keyword => 
        !keyword.startsWith("kiếm các bài đăng") && 
        !keyword.startsWith("tìm các bài đăng") &&
        !keyword.startsWith("tìm các bài") &&
        !keyword.startsWith("tìm bài viết với từ khóa") &&
        !keyword.includes("liên quan đến") && // Loại bỏ mẫu câu kiểu "bài đăng liên quan đến tuyển dụng"
        !keyword.includes("các bài đăng") && // Loại bỏ mẫu câu kiểu "các bài đăng về tuyển dụng"
        !keyword.includes("tôi ") && // Loại bỏ từ khóa có chứa "tôi" ở đầu
        keyword.length <= 50 // Giới hạn độ dài từ khóa
      );
      
      // Lọc ra các từ khóa quá ngắn (có thể là nhiễu)
      extractedKeywords = extractedKeywords.filter(keyword => keyword.length > 1);
      
      // Nếu sau khi lọc không còn từ khóa nào, thì thêm từ khóa "tuyển dụng" mặc định
      if (extractedKeywords.length === 0 && expandedMessage.includes("tuyển dụng")) {
        extractedKeywords.push("tuyển dụng");
      }
      
      // Nếu sau khi lọc không còn từ khóa nào, vẫn có thể sử dụng "việc làm" hoặc "công việc"
      if (extractedKeywords.length === 0) {
        if (expandedMessage.includes("việc làm")) {
          extractedKeywords.push("việc làm");
        } else if (expandedMessage.includes("công việc")) {
          extractedKeywords.push("công việc");
        }
      }
      
      // Nếu vẫn không có từ khóa nào sau khi lọc, thử lại với phương pháp khác
      if (extractedKeywords.length === 0) {
        // Phương pháp cuối cùng: tách câu theo các từ khóa quan trọng
        if (expandedMessage.includes("tuyển dụng")) {
          extractedKeywords.push("tuyển dụng");
        } else if (expandedMessage.includes("việc làm")) {
          extractedKeywords.push("việc làm");
        } else if (expandedMessage.includes("công việc")) {
          extractedKeywords.push("công việc");
        }
      }
      
      if (extractedKeywords.length > 0) {
        // Sắp xếp theo độ dài, lấy từ khóa dài nhất (thường là chi tiết nhất)
        extractedKeywords.sort((a, b) => {
          // Ưu tiên từ khóa có "tuyển dụng", "việc làm", "công việc" + chi tiết
          const aHasJobKeyword = a.includes("tuyển dụng") || a.includes("việc làm") || a.includes("công việc");
          const bHasJobKeyword = b.includes("tuyển dụng") || b.includes("việc làm") || b.includes("công việc");
          
          if (aHasJobKeyword && !bHasJobKeyword) return -1;
          if (!aHasJobKeyword && bHasJobKeyword) return 1;
          
          // Nếu cùng có hoặc không có từ khóa việc làm, so sánh độ dài
          return b.length - a.length;
        });
        
        // Trả về từ khóa đầu tiên sau khi đã sắp xếp
        return cleanupSearchQuery(extractedKeywords[0]);
      }
    }
    
    // Trường hợp đặc biệt: nếu truy vấn về tuyển dụng nhưng không tìm được từ khóa, mặc định là "tuyển dụng"
    if (expandedMessage.includes("tuyển dụng")) {
      return "tuyển dụng";
    } else if (expandedMessage.includes("việc làm")) {
      return "việc làm";
    } else if (expandedMessage.includes("công việc")) {
      return "công việc";
    }
    
    // Nếu không tìm thấy từ khóa cụ thể, trả về null
    return null;
  };
  
  // Hàm làm sạch từ khóa tìm kiếm
  const cleanupSearchQuery = (query: string): string => {
    let result = query;
    
    // Loại bỏ các từ thừa ở đầu từ khóa
    const prefixesToRemove = [
      "về", "về chủ đề", "chủ đề", "nói về", "liên quan đến", "liên quan", "các",
      "những", "mấy", "các loại", "loại", "kiểu", "dạng", "như", "là", "như là",
      "giống", "giống như", "đang", "đã", "sẽ", "có thể", "thường", "luôn"
    ];
    
    for (const prefix of prefixesToRemove) {
      if (result.startsWith(prefix + " ")) {
        result = result.substring(prefix.length).trim();
      }
    }
    
    // Loại bỏ các từ thừa ở cuối từ khóa
    const suffixesToRemove = [
      "không", "nào", "đi", "nhé", "nha", "ạ", "vậy", "nhỉ", "thế", "này", "đó",
      "ấy", "kia", "chứ", "à", "ha", "vậy không", "không vậy", "đúng không", "phải không",
      "được không", "được chứ", "có không", "đó nhé", "nha bạn", "nhé bạn", "ạ bạn",
      "đây", "được", "đúng vậy", "phải vậy", "đó phải không", "đó đúng không"
    ];
    
    for (const suffix of suffixesToRemove) {
      if (result.endsWith(" " + suffix)) {
        result = result.substring(0, result.length - suffix.length).trim();
      }
    }
    
    // Loại bỏ dấu câu thừa ở đầu và cuối chuỗi
    result = result.replace(/^[.,!?;:'"…]+/, "").replace(/[.,!?;:'"…]+$/, "").trim();
    
    // Loại bỏ từ "bài" hoặc "bài viết" ở đầu từ khóa nếu có
    if (result.startsWith("bài viết ")) {
      result = result.substring(9).trim();
    } else if (result.startsWith("bài ")) {
      result = result.substring(4).trim();
    }
    
    // Loại bỏ từ "post" ở đầu từ khóa nếu có
    if (result.startsWith("post ")) {
      result = result.substring(5).trim();
    }
    
    // Loại bỏ các từ ngữ cảnh tìm kiếm không cần thiết
    const contextWordsToRemove = [
      "trong website", "trên website", "trong trang", "trên trang", "trên introvertia", 
      "trong introvertia", "trong nền tảng", "trên nền tảng", "trong hệ thống", 
      "website này", "trong website này", "introvertia này", "của introvertia",
      "ai đã đăng", "ai đăng", "đọc", "đọc về", "muốn đọc", "muốn xem", "muốn tìm"
    ];
    
    for (const contextWord of contextWordsToRemove) {
      result = result.replace(new RegExp(`\\b${contextWord}\\b`, 'gi'), "").trim();
    }
    
    // Xử lý các trường hợp đặc biệt
    if (result.includes("tuyển dụng") || result.includes("việc làm") || result.includes("công việc")) {
      // Giữ nguyên các từ khóa liên quan đến tuyển dụng để giữ ngữ cảnh tìm kiếm cụ thể
    } else {
      // Loại bỏ các từ chức năng không cần thiết trong trường hợp tìm kiếm thông thường
      const functionWordsToRemove = [
        "muốn", "cần", "hãy", "hãy cho", "cho tôi", "cho mình", "tôi muốn", "mình muốn", 
        "tôi cần", "mình cần", "xin", "làm ơn", "vui lòng", "giúp mình", "giúp tôi",
        "bạn có thể", "bạn", "cậu", "admin", "giúp", "giúp đỡ", "tìm"
      ];
      
      for (const functionWord of functionWordsToRemove) {
        result = result.replace(new RegExp(`\\b${functionWord}\\b`, 'gi'), "").trim();
      }
    }
    
    // Loại bỏ khoảng trắng liên tiếp
    result = result.replace(/\s+/g, " ").trim();
    
    return result;
  };
  
  // Hàm lấy bài viết phổ biến gần đây
  const getRecentPosts = async (): Promise<string> => {
    return sendMessage("Hiển thị các bài viết phổ biến gần đây", {
      requestType: "recentPosts"
    });
  };
  
  // Hàm lấy thông tin người dùng tích cực
  const getActiveUsers = async (): Promise<string> => {
    return sendMessage("Hiển thị người dùng tích cực nhất trên Introvertia", {
      requestType: "activeUsers"
    });
  };
  
  // Hàm lấy bài viết của người dùng hiện tại
  const getUserPosts = async (): Promise<string> => {
    return sendMessage("Hiển thị bài viết gần đây của tôi", {
      fetchUserPosts: true
    });
  };
  
  // Hàm lấy thông báo của người dùng
  const getUserNotifications = async (): Promise<string> => {
    return sendMessage("Hiển thị thông báo của tôi", {
      requestType: "userNotifications"
    });
  };
  
  // Phân tích tự động nội dung tin nhắn để xác định yêu cầu
  const analyzeMessageForIntents = (message: string): RequestType => {
    const normalizedMessage = message.toLowerCase();
    
    // Kiểm tra xem tin nhắn có liên quan đến thông báo
    if (
      normalizedMessage.includes("thông báo") || 
      normalizedMessage.includes("notification") ||
      normalizedMessage.includes("thông báo mới") ||
      normalizedMessage.includes("thông báo gì") ||
      normalizedMessage.includes("ai like") ||
      normalizedMessage.includes("ai thích") ||
      normalizedMessage.includes("ai comment") ||
      normalizedMessage.includes("ai bình luận") ||
      normalizedMessage.includes("ai đã") && (normalizedMessage.includes("like") || normalizedMessage.includes("thích") || normalizedMessage.includes("comment") || normalizedMessage.includes("bình luận")) ||
      normalizedMessage.includes("có ai") && (normalizedMessage.includes("like") || normalizedMessage.includes("thích") || normalizedMessage.includes("comment") || normalizedMessage.includes("bình luận"))
    ) {
      return "userNotifications";
    }
    
    // Kiểm tra yêu cầu riêng tư không được phép
    if (
      (normalizedMessage.includes("tin nhắn") || normalizedMessage.includes("message") || normalizedMessage.includes("chat")) && 
      !normalizedMessage.includes("cách gửi") && 
      !normalizedMessage.includes("hướng dẫn") && 
      !normalizedMessage.includes("cách sử dụng")
    ) {
      // Không có type riêng, sẽ trả lời bằng lời giải thích về quyền riêng tư
      return null;
    }
    
    // Kiểm tra nếu ai đó đang yêu cầu thông tin về người dùng khác
    const askingAboutOthers = /thông\s+báo\s+của\s+\w+|tin\s+nhắn\s+của\s+\w+|message\s+from\s+\w+|notification\s+of\s+\w+/.test(normalizedMessage);
    if (askingAboutOthers) {
      // Không có type riêng, sẽ trả lời bằng lời giải thích về quyền riêng tư
      return null;
    }
    
    // Kiểm tra xem tin nhắn có liên quan đến tìm kiếm bài viết
    // Ưu tiên phát hiện ý định tìm kiếm trước các ý định khác
    
    // 1. Kiểm tra các mẫu câu trực tiếp về tìm kiếm tuyển dụng
    const directJobSearchPatterns = [
      /tìm\s+(?:các\s+)?(?:bài|post|bài\s+viết|bài\s+đăng|nội\s+dung)(?:\s+\w+)*\s+(?:về|liên\s+quan\s+(?:đến|tới)|nói\s+về)\s+(tuyển\s+dụng|việc\s+làm|công\s+việc)/i,
      /kiếm\s+(?:các\s+)?(?:bài|post|bài\s+viết|bài\s+đăng|nội\s+dung)(?:\s+\w+)*\s+(?:về|liên\s+quan\s+(?:đến|tới)|nói\s+về)\s+(tuyển\s+dụng|việc\s+làm|công\s+việc)/i,
      /xem\s+(?:các\s+)?(?:bài|post|bài\s+viết|bài\s+đăng|nội\s+dung)(?:\s+\w+)*\s+(?:về|liên\s+quan\s+(?:đến|tới)|nói\s+về)\s+(tuyển\s+dụng|việc\s+làm|công\s+việc)/i,
      /có\s+(?:bài|post|bài\s+viết|bài\s+đăng|nội\s+dung)(?:\s+nào)?\s+(?:về|liên\s+quan\s+đến)?\s+(tuyển\s+dụng|việc\s+làm|công\s+việc)/i
    ];
    
    for (const pattern of directJobSearchPatterns) {
      if (pattern.test(normalizedMessage)) {
        return "searchPosts";
      }
    }
    
    // 2. Kiểm tra tìm kiếm chung
    if (containsSearchIntent(normalizedMessage)) {
      return "searchPosts";
    }
    
    // Kiểm tra xem tin nhắn có liên quan đến bài viết người dùng
    if (
      normalizedMessage.includes("bài viết của tôi") ||
      normalizedMessage.includes("post của tôi") ||
      normalizedMessage.includes("my posts") ||
      normalizedMessage.includes("bài tôi đã đăng") ||
      normalizedMessage.includes("tôi đã đăng bài nào")
    ) {
      return null; // Để xử lý bằng fetchUserPosts
    }
    
    // Kiểm tra xem tin nhắn có liên quan đến bài viết gần đây
    if (
      normalizedMessage.includes("bài viết gần đây") ||
      normalizedMessage.includes("bài viết mới") ||
      normalizedMessage.includes("post gần đây") ||
      normalizedMessage.includes("bài mới") ||
      normalizedMessage.includes("recent posts") ||
      normalizedMessage.includes("bài viết phổ biến") ||
      normalizedMessage.includes("trending") ||
      normalizedMessage.includes("xu hướng") ||
      normalizedMessage.includes("hot posts")
    ) {
      return "recentPosts";
    }
    
    // Kiểm tra xem tin nhắn có liên quan đến người dùng tích cực
    if (
      normalizedMessage.includes("người dùng tích cực") ||
      normalizedMessage.includes("active users") ||
      normalizedMessage.includes("ai hoạt động nhiều") ||
      normalizedMessage.includes("ai đăng nhiều") ||
      normalizedMessage.includes("user tích cực") ||
      normalizedMessage.includes("top người dùng") ||
      normalizedMessage.includes("người dùng nổi bật") ||
      normalizedMessage.includes("người có nhiều bài viết") ||
      normalizedMessage.includes("top users") ||
      normalizedMessage.includes("ai đang online") || 
      normalizedMessage.includes("ai online") ||
      normalizedMessage.includes("who is online")
    ) {
      return "activeUsers";
    }
    
    // Kiểm tra yêu cầu về hướng dẫn sử dụng
    if (
      normalizedMessage.includes("hướng dẫn") ||
      normalizedMessage.includes("cách sử dụng") ||
      normalizedMessage.includes("guide") ||
      normalizedMessage.includes("làm thế nào") ||
      normalizedMessage.includes("làm sao") ||
      normalizedMessage.includes("how to") ||
      normalizedMessage.includes("tutorial") ||
      normalizedMessage.includes("chỉ dẫn") ||
      normalizedMessage.includes("cách dùng")
    ) {
      // Không có type riêng, xử lý bằng gửi tin nhắn thông thường
      return null;
    }
    
    return null;
  };
  
  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };
  
  return { 
    messages,
    loading,
    error,
    sendMessage,
    searchPosts,
    getRecentPosts,
    getActiveUsers,
    getUserPosts,
    getUserNotifications,
    analyzeMessageForIntents,
    containsSearchIntent,
    extractSearchQuery,
    clearMessages,
    initWithWelcomeMessage
  };
}

// Phát hiện và xử lý từ viết tắt và slang
// Hàm kiểm tra xem một từ viết tắt có phải là từ khóa chính trong câu không
const isAbbreviationTheMainKeyword = (message: string, abbr: string): boolean => {
  // Chuyển đổi tin nhắn thành chữ thường để so sánh không phân biệt hoa thường
  const lowerMessage = message.toLowerCase();
  const lowerAbbr = abbr.toLowerCase();
  
  // Kiểm tra nếu từ viết tắt xuất hiện độc lập (có khoảng trắng trước và sau)
  if (lowerMessage.includes(` ${lowerAbbr} `)) {
    return true;
  }
  
  // Kiểm tra nếu từ viết tắt là từ duy nhất trong câu
  if (lowerMessage.trim() === lowerAbbr) {
    return true;
  }
  
  // Kiểm tra nếu từ viết tắt xuất hiện ở đầu câu và có khoảng trắng phía sau
  if (lowerMessage.startsWith(`${lowerAbbr} `)) {
    return true;
  }
  
  // Kiểm tra nếu từ viết tắt xuất hiện ở cuối câu và có khoảng trắng phía trước
  if (lowerMessage.endsWith(` ${lowerAbbr}`)) {
    return true;
  }
  
  // Kiểm tra sau các từ khóa tìm kiếm phổ biến
  const searchMarkers = ["tìm", "kiếm", "về", "tìm kiếm", "xem", "bài về"];
  for (const marker of searchMarkers) {
    if (lowerMessage.includes(`${marker} ${lowerAbbr}`)) {
      return true;
    }
  }
  
  // Kiểm tra mẫu câu tìm kiếm
  const searchPatterns = [
    new RegExp(`tìm\\s+bài\\s+về\\s+${lowerAbbr}`, "i"),
    new RegExp(`tìm\\s+kiếm\\s+${lowerAbbr}`, "i"),
    new RegExp(`có\\s+bài\\s+về\\s+${lowerAbbr}`, "i"),
    new RegExp(`xem\\s+bài\\s+về\\s+${lowerAbbr}`, "i"),
    new RegExp(`tìm\\s+${lowerAbbr}`, "i")
  ];
  
  for (const pattern of searchPatterns) {
    if (pattern.test(lowerMessage)) {
      return true;
    }
  }
  
  return false;
}; 