"use client";

import { useState, useRef, useEffect } from "react";
import { useChatbot } from "@/lib/hooks/useChatbot";
import ChatMessage from "./ChatMessage";
import { Bot, Send, Info, X, RefreshCw, CheckSquare, Search } from "lucide-react";

type AIChatProps = {
  onClose: () => void;
};

export default function AIChat({ onClose }: AIChatProps) {
  const { 
    messages, 
    loading, 
    sendMessage, 
    clearMessages, 
    initWithWelcomeMessage,
    searchPosts,
    getRecentPosts,
    getActiveUsers,
    getUserPosts,
    getUserNotifications,
    analyzeMessageForIntents,
    containsSearchIntent,
    extractSearchQuery
  } = useChatbot();
  const [input, setInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [includeUserPosts, setIncludeUserPosts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const welcomeInitializedRef = useRef(false);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cuộn khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus vào input khi mở chat
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Xử lý khi nhập tin nhắn
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Lưu tin nhắn hiện tại để xử lý
    const currentInput = input;
    setInput(""); // Xóa input ngay để tránh gửi lại
    
    // Phân tích ý định từ tin nhắn
    const intentType = analyzeMessageForIntents(currentInput);

    // Kiểm tra nếu tin nhắn có ý định tìm kiếm
    if (containsSearchIntent(currentInput)) {
      const query = extractSearchQuery(currentInput);
      if (query) {
        try {
          console.log(`Tìm kiếm với từ khóa: "${query}"`); // Log để debug
          await searchPosts(query);
        } catch (error) {
          console.error("Error searching posts:", error);
        }
        return;
      }
    }

    // Kiểm tra nếu người dùng đang yêu cầu bài viết của họ
    const askingForOwnPosts = /bài\s+(viết|đăng|post)(\s+của)?\s+tôi|tôi\s+đã\s+đăng\s+bài|my\s+posts/i.test(currentInput.toLowerCase());
    
    // Xử lý các ý định khác
    if (intentType) {
      try {
        switch (intentType) {
          case "userNotifications":
            await getUserNotifications();
            break;
          case "recentPosts":
            await getRecentPosts();
            break;
          case "activeUsers":
            await getActiveUsers();
            break;
          case "searchPosts":
            const query = extractSearchQuery(currentInput);
            if (query) {
              console.log(`Tìm kiếm (intent) với từ khóa: "${query}"`); // Log để debug
              await searchPosts(query);
            } else {
              // Nếu không tìm thấy từ khóa cụ thể, hỏi người dùng
              await sendMessage("Bạn muốn tìm kiếm bài viết về chủ đề gì? Vui lòng cung cấp từ khóa cụ thể.");
            }
            break;
          default:
            await sendMessage(currentInput, { 
              fetchUserPosts: includeUserPosts || askingForOwnPosts 
            });
        }
      } catch (error) {
        console.error("Error processing intent:", error);
      }
      return;
    }

    // Xử lý tin nhắn thông thường
    try {
      await sendMessage(currentInput, { 
        fetchUserPosts: includeUserPosts || askingForOwnPosts 
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = async () => {
    if (!searchQuery.trim() || loading) return;
    
    try {
      await searchPosts(searchQuery);
      setSearchQuery("");
      setShowSearchModal(false);
    } catch (error) {
      console.error("Error searching posts:", error);
    }
  };

  // Khởi tạo tin nhắn chào mừng - chỉ gọi một lần
  useEffect(() => {
    if (!welcomeInitializedRef.current) {
      welcomeInitializedRef.current = true;
      initWithWelcomeMessage();
    }
  }, [initWithWelcomeMessage]);

  return (
    <div className="fixed bottom-20 right-4 md:right-8 lg:right-12 z-50 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="text-emerald-500" size={20} />
          <h3 className="font-medium text-zinc-800 dark:text-zinc-200">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSearchModal(true)}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Tìm kiếm bài viết"
          >
            <Search size={16} className="text-zinc-500 dark:text-zinc-400" />
          </button>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Thông tin"
          >
            <Info size={16} className="text-zinc-500 dark:text-zinc-400" />
          </button>
          <button 
            onClick={() => clearMessages()}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Làm mới cuộc trò chuyện"
          >
            <RefreshCw size={16} className="text-zinc-500 dark:text-zinc-400" />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Đóng"
          >
            <X size={16} className="text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Modal tìm kiếm bài viết */}
      {showSearchModal && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-10 flex flex-col">
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-medium text-zinc-800 dark:text-zinc-200">Tìm kiếm bài viết</h3>
            <button 
              onClick={() => setShowSearchModal(false)}
              className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Đóng"
            >
              <X size={16} className="text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>
          <div className="p-3 flex-1">
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm..."
                className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-emerald-500/20 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-800 dark:text-zinc-200"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              Tìm kiếm bài viết trong cơ sở dữ liệu dựa trên nội dung. Kết quả sẽ hiển thị trong cuộc trò chuyện.
            </p>
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className={`w-full py-2 rounded-lg transition-colors ${
                loading || !searchQuery.trim()
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {loading ? "Đang tìm kiếm..." : "Tìm kiếm"}
            </button>
          </div>
        </div>
      )}

      {/* Thông tin về chatbot */}
      {showInfo && (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-300">
          <p className="mb-2">
            <span className="font-medium">AI Assistant</span> có thể giúp bạn:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tìm hiểu về các tính năng của Introvertia</li>
            <li>Hướng dẫn cách sử dụng nền tảng</li>
            <li>Tìm kiếm bài viết trong website</li>
            <li>Xem bài viết nổi bật gần đây</li>
            <li>Xem người dùng tích cực nhất</li>
            <li>Kiểm tra thông báo của bạn</li>
            <li>Trả lời câu hỏi chung về mạng xã hội</li>
            <li>Cung cấp gợi ý và lời khuyên</li>
          </ul>
          <div className="mt-2 text-xs">
            <p className="font-medium mb-1">Ví dụ câu hỏi:</p>
            <p>• &ldquo;Tìm bài viết về làm việc tại nhà&rdquo;</p>
            <p>• &ldquo;Trong website có bài viết về yoga không?&rdquo;</p>
            <p>• &ldquo;Tôi có thông báo mới nào không?&rdquo;</p>
            <p>• &ldquo;Ai đang là người dùng tích cực nhất?&rdquo;</p>
            <p>• &ldquo;Làm thế nào để đăng story?&rdquo;</p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button 
              onClick={() => setIncludeUserPosts(!includeUserPosts)}
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500"
            >
              {includeUserPosts ? (
                <CheckSquare size={14} className="fill-emerald-600 dark:fill-emerald-500 text-white dark:text-zinc-900" />
              ) : (
                <div className="w-3.5 h-3.5 border border-emerald-600 dark:border-emerald-500 rounded"></div>
              )}
              <span className="text-xs">Cho phép AI truy cập bài viết gần đây của tôi</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
        
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shortcut buttons */}
      <div className="px-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => {
            if (loading) return;
            getUserPosts();
          }}
          disabled={loading}
          className="shrink-0 text-xs py-1.5 px-2.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
        >
          Bài viết của tôi
        </button>
        <button
          onClick={() => {
            if (loading) return;
            getRecentPosts();
          }}
          disabled={loading}
          className="shrink-0 text-xs py-1.5 px-2.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
          Bài viết gần đây
        </button>
        <button
          onClick={() => {
            if (loading) return;
            getUserNotifications();
          }}
          disabled={loading}
          className="shrink-0 text-xs py-1.5 px-2.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          Thông báo của tôi
        </button>
        <button
          onClick={() => {
            if (loading) return;
            getActiveUsers();
          }}
          disabled={loading}
          className="shrink-0 text-xs py-1.5 px-2.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
        >
          Người dùng tích cực
        </button>
        <button
          onClick={() => {
            if (loading) return;
            sendMessage("Cho tôi xem hướng dẫn sử dụng Introvertia");
          }}
          disabled={loading}
          className="shrink-0 text-xs py-1.5 px-2.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
        >
          Hướng dẫn sử dụng
        </button>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn hoặc tìm kiếm bài viết..."
          className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-emerald-500/20 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-800 dark:text-zinc-200"
          disabled={loading}
          ref={inputRef}
        />
        <button
          type="submit"
          aria-label="Gửi tin nhắn"
          disabled={loading || !input.trim()}
          className={`shrink-0 p-2 rounded-lg transition-colors ${
            loading || !input.trim()
              ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
} 