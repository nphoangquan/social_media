"use client";

import { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import AIChat from "./AIChat";
import { createPortal } from "react-dom";

type ChatbotButtonProps = {
  className?: string;
};

export default function ChatbotButton({ className = "" }: ChatbotButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className={`p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${className}`}
        onClick={toggleChat}
        aria-label="Chat với AI Assistant"
        title="Chat với AI Assistant"
      >
        <Bot className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
      </button>

      {/* Render chatbot modal using portal to avoid z-index issues */}
      {mounted && isOpen && createPortal(
        <AIChat onClose={() => setIsOpen(false)} />,
        document.body
      )}
    </>
  );
} 