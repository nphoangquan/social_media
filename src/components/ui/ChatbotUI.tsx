'use client';

import { Loader2 } from "lucide-react";
import Image from "next/image";
import React from "react";

interface ChatbotWelcomeProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function ChatbotWelcome({ suggestions, onSuggestionClick }: ChatbotWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 flex items-center justify-center">
        <Image 
          src="/introvertia-icon.png" 
          alt="Introvertia Logo" 
          width={32} 
          height={32}
          className="opacity-80" 
        />
      </div>
      <div>
        <h3 className="text-zinc-200 font-medium mb-1">Tôi là trợ lý AI.</h3>
        <p className="text-zinc-400 text-sm">Bạn có thể hỏi tôi:</p>
      </div>
      <div className="w-full space-y-2 mt-2">
        {suggestions.map((suggestion, idx) => (
          <button 
            key={idx} 
            className="w-full py-2 px-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-emerald-700/50 rounded-lg text-left text-sm text-zinc-300 hover:text-white transition-colors"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ChatMessageProps {
  role: string;
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[90%] rounded-xl p-3 ${
          role === 'user'
            ? 'bg-emerald-600 text-white ml-8'
            : 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 mr-8'
        }`}
      >
        <div className="relative">
          <div className="text-sm whitespace-pre-wrap">{content}</div>
          <div className={`absolute w-2 h-2 rotate-45 ${
            role === 'user' 
              ? 'bg-emerald-600 -right-1 top-2' 
              : 'bg-zinc-800 border-r border-b border-zinc-700/50 -left-1 top-2'
          }`}></div>
        </div>
      </div>
    </div>
  );
}

export function ThinkingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-3 flex items-center space-x-3 max-w-[90%] mr-8">
        <Loader2 className="animate-spin text-emerald-500" size={16} />
        <span className="text-sm text-zinc-300">Đang load...</span>
        <div className="absolute w-2 h-2 rotate-45 bg-zinc-800 border-r border-b border-zinc-700/50 -left-1 top-5"></div>
      </div>
    </div>
  );
}

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function ChatInput({ message, setMessage, isLoading, onSubmit, inputRef }: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="p-3 border-t border-zinc-800 bg-zinc-900">
      <div className="flex space-x-2 relative">
        <input
          type="text"
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 py-2.5 px-4 bg-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 border border-zinc-700 focus:border-emerald-600/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600/30 transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="p-2.5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-600 disabled:hover:to-emerald-700 transition-all group overflow-hidden"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <div className="relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </div>
          )}
        </button>
      </div>
    </form>
  );
} 