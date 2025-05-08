"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import NewChatDialog from "./NewChatDialog";

interface ChatsListProps {
  userId: string;
  activeChatId?: number;
  initialChats?: ChatWithParticipant[];
}

interface ChatParticipant {
  userId: string;
  isRead: boolean;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
    role?: string;
  };
}

interface Chat {
  id: number;
  updatedAt: Date;
  participants: ChatParticipant[];
  messages: {
    id: number;
    content: string;
    createdAt: Date;
    senderId: string;
  }[];
}

interface ChatWithParticipant {
  chat: Chat;
  isRead: boolean;
}

export default function ChatsList({ userId, activeChatId, initialChats = [] }: ChatsListProps) {
  const [chats, setChats] = useState<ChatWithParticipant[]>(initialChats);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialChats.length >= 15);
  const [page, setPage] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastChatRef = useRef<HTMLAnchorElement | null>(null);

  const loadChats = async (pageToLoad: number = 0, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chats?page=${pageToLoad}&limit=15`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      
      const data = await response.json();
      
      if (append) {
        setChats(prev => [...prev, ...data.chats]);
      } else {
        setChats(data.chats);
      }
      
      setHasMore(data.hasMore);
      setPage(pageToLoad);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load chat
  useEffect(() => {
    if (initialChats.length === 0) {
      loadChats();
    }
  }, [initialChats.length]);

  // Set intersection observer cho cuộn vô hạn
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadChats(page + 1, true);
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;

    if (lastChatRef.current) {
      observer.observe(lastChatRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, page]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between h-[68px]">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Messages</h2>
        <NewChatDialog userId={userId} />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquarePlus className="w-12 h-12 text-zinc-500 mb-2" />
            <p className="text-zinc-500 mb-1">No messages</p>
            <p className="text-zinc-600 text-sm max-w-xs">Start a conversation - Bắt đầu cuộc trò chuyện</p>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {chats.map((participant, index) => {
              const chat = participant.chat;
              // Lấy người tham gia khác
              const otherParticipants = chat.participants.filter(p => p.userId !== userId);
              const otherUser = otherParticipants[0]?.user;
              const lastMessage = chat.messages[0];
              
              // Tạo ref cho item cuối
              const isLastItem = index === chats.length - 1;
              
              return (
                <Link 
                  key={chat.id}
                  href={`/messages/${chat.id}`}
                  className={`block px-4 py-3 hover:bg-zinc-800/30 transition-colors ${activeChatId === chat.id ? 'bg-zinc-800/50' : ''}`}
                  ref={isLastItem ? lastChatRef : null}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-zinc-800">
                      {otherUser?.avatar && (
                        <Image
                          src={otherUser.avatar} 
                          alt={otherUser.username}
                          className="w-full h-full object-cover"
                          width={48}
                          height={48}
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{otherUser?.name || otherUser?.username}</h3>
                        {lastMessage && (
                          <span className="text-xs text-zinc-500">
                            {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-zinc-400 truncate">
                          {lastMessage 
                            ? (lastMessage.senderId === userId ? 'You: ' : '') + lastMessage.content 
                            : 'No messages'}
                        </p>
                        
                        {!participant.isRead && lastMessage?.senderId !== userId && (
                          <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 