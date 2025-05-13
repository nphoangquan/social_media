'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, ChevronUp, MessageSquare, Sparkles, X } from 'lucide-react';
import { ChatbotWelcome, ChatMessage, ThinkingIndicator, ChatInput } from './ui/ChatbotUI';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    "Bài viết gần đây",
    "Bình luận và lượt thích",
    "Người theo dõi và đang theo dõi",
    "Thông báo"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    
    // Add user message to state
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, 
        { role: 'assistant', content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const resetChat = () => {
    setMessages([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    if (inputRef.current) inputRef.current.focus();
  };

  const openChat = () => {
    setIsAnimating(true);
    setIsOpen(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-full shadow-lg hover:shadow-emerald-700/25 hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 z-50 group"
        aria-label="Mở trợ lý AI"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-white transition-opacity duration-200" />
        </div>
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 ${isMinimized ? 'w-64 h-12' : 'w-[400px] h-[600px]'} bg-zinc-900 rounded-xl shadow-2xl shadow-emerald-900/20 flex flex-col z-50 border border-zinc-800 overflow-hidden transition-all duration-300 ${isAnimating ? 'animate-scaleIn' : ''}`}
      ref={chatContainerRef}
    >
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-900/95 flex justify-between items-center relative">
        
        <div className="flex items-center gap-2">
          {isMinimized ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-medium text-white">AI hỗ trợ</h2>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center relative overflow-hidden group">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">AI hỗ trợ</h2>
                <p className="text-xs text-zinc-400">Introvertia AI</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMinimize}
            className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
            aria-label={isMinimized ? "Mở rộng" : "Thu nhỏ"}
          >
            {isMinimized ? <MessageSquare size={14} /> : <ChevronUp size={14} />}
          </button>
          {!isMinimized && (
            <button
              onClick={resetChat}
              className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
              aria-label="Reload cuộc trò chuyện"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
            aria-label="Đóng trợ lý AI"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Message Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <ChatbotWelcome suggestions={SUGGESTIONS} onSuggestionClick={handleSuggestionClick} />
            ) : (
              messages.map((msg, index) => (
                <ChatMessage key={index} role={msg.role} content={msg.content} />
              ))
            )}
            
            {isLoading && <ThinkingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <ChatInput 
            message={message} 
            setMessage={setMessage} 
            isLoading={isLoading} 
            onSubmit={handleSubmit} 
            inputRef={inputRef as React.RefObject<HTMLInputElement>} 
          />
        </>
      )}
    </div>
  );
} 