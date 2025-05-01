import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlus } from "lucide-react";
import prisma from "@/lib/client";
import NewChatDialog from "./NewChatDialog";
import Image from "next/image";
interface ChatsListProps {
  userId: string;
  activeChatId?: number;
}

export default async function ChatsList({ userId, activeChatId }: ChatsListProps) {
  // Get all chats that the user is a participant in
  const participants = await prisma.chatParticipant.findMany({
    where: {
      userId: userId,
    },
    include: {
      chat: {
        include: {
          participants: {
            include: {
              user: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              sender: true
            }
          }
        }
      }
    },
    orderBy: {
      chat: {
        updatedAt: 'desc'
      }
    }
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between h-[68px]">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Messages</h2>
        <NewChatDialog userId={userId} />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquarePlus className="w-12 h-12 text-zinc-500 mb-2" />
            <p className="text-zinc-500 mb-1">No messages yet</p>
            <p className="text-zinc-600 text-sm max-w-xs">Start a conversation with your friends using the + button above</p>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {participants.map((participant) => {
              const chat = participant.chat;
              // Get the other participant(s)
              const otherParticipants = chat.participants.filter(p => p.userId !== userId);
              const otherUser = otherParticipants[0]?.user;
              const lastMessage = chat.messages[0];
              
              return (
                <Link 
                  key={chat.id}
                  href={`/messages/${chat.id}`}
                  className={`block px-4 py-3 hover:bg-zinc-800/30 transition-colors ${activeChatId === chat.id ? 'bg-zinc-800/50' : ''}`}
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
                            : 'No messages yet'}
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
          </div>
        )}
      </div>
    </div>
  );
} 