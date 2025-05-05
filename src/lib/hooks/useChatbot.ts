import { useState } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
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
        content: "Xin chào! Tôi là trợ lý AI của Introvertia. Tôi có thể giúp gì cho bạn?"
      };
      setMessages([welcomeMessage]);
    }
  };

  const sendMessage = async (content: string, fetchUserPosts: boolean = false): Promise<string> => {
    if (!content.trim()) return "";
    
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
          fetchUserPosts
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response from chatbot");
      }
      
      const data = await response.json();
      const reply = data.reply || "Sorry, I couldn't process your request.";
      
      // Thêm tin nhắn AI vào danh sách
      const botMessage: ChatMessage = { role: "assistant", content: reply };
      setMessages(prev => [...prev, botMessage]);
      
      return reply;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      return "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.";
    } finally {
      setLoading(false);
    }
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
    clearMessages,
    initWithWelcomeMessage
  };
} 