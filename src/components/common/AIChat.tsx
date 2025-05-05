"use client";

import { useState, useRef, useEffect } from "react";
import { useChatbot } from "@/lib/hooks/useChatbot";
import ChatMessage from "./ChatMessage";
import { Bot, Send, Info, X, RefreshCw, CheckSquare } from "lucide-react";

type AIChatProps = {
  onClose: () => void;
};

export default function AIChat({ onClose }: AIChatProps) {
  const { messages, loading, sendMessage, clearMessages, initWithWelcomeMessage } = useChatbot();
  const [input, setInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);
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

    try {
      await sendMessage(input, includeUserPosts);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
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

      {/* Thông tin về chatbot */}
      {showInfo && (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-300">
          <p className="mb-2">
            <span className="font-medium">AI Assistant</span> có thể giúp bạn:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tìm hiểu về các tính năng của Introvertia</li>
            <li>Trả lời câu hỏi chung về mạng xã hội</li>
            <li>Cung cấp gợi ý và lời khuyên</li>
            <li>Hỗ trợ sử dụng nền tảng</li>
          </ul>
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

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
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