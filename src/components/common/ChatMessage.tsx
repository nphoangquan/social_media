"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/hooks/useChatbot";

type ChatMessageProps = {
  message: ChatMessageType;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useUser();
  const [typedText, setTypedText] = useState("");
  const isUser = message.role === "user";
  
  // Hiệu ứng gõ chữ dần dần cho tin nhắn từ AI
  useEffect(() => {
    if (message.role === "assistant") {
      let index = 0;
      const content = message.content;
      
      // Reset typedText
      setTypedText("");
      
      // Tạo hiệu ứng gõ chữ
      const typingInterval = setInterval(() => {
        if (index < content.length) {
          // Đảm bảo lấy đúng ký tự tại vị trí index
          setTypedText(content.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typingInterval);
        }
      }, 10); // Tốc độ gõ chữ
      
      return () => clearInterval(typingInterval);
    }
  }, [message]);

  return (
    <div className={`flex gap-2 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-emerald-500 flex items-center justify-center shrink-0">
          <span className="text-white font-semibold text-sm">AI</span>
        </div>
      )}
      
      <div 
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser 
            ? 'bg-emerald-500 text-white' 
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
        }`}
      >
        <p className="text-sm whitespace-pre-line">
          {isUser ? message.content : typedText}
        </p>
      </div>
      
      {isUser && (
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
          <Image
            src={user?.imageUrl || "/noavatar.png"}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
} 