import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/client";
import ChatsList from "@/components/messages/ChatsList"; 
import ChatContainer from "@/components/messages/ChatContainer";

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const { chatId } = await params;
  const chatIdNum = parseInt(chatId);
  
  // Verify user is part of this chat
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      userId: userId,
      chatId: chatIdNum,
    },
  });
  
  if (!participant) {
    redirect("/messages");
  }
  
  // Mark messages as read
  await prisma.chatParticipant.update({
    where: {
      id: participant.id
    },
    data: {
      isRead: true,
    },
  });
  
  // Get initial chats data for the client component
  const initialChats = await prisma.chatParticipant.findMany({
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
    },
    take: 15
  });
  
  // Transform data for the client component
  const chats = initialChats.map(participant => ({
    chat: participant.chat,
    isRead: participant.isRead
  }));
  
  return (
    <div className="flex-1 flex">
      <div className="flex w-full h-[calc(100vh-6rem)] overflow-hidden rounded-2xl">
        {/* Chat list sidebar */}
        <div className="w-80 md:w-96 border-r border-zinc-800 shrink-0 bg-zinc-900/30 backdrop-blur-sm rounded-l-lg">
          <ChatsList userId={userId} activeChatId={chatIdNum} initialChats={chats} />
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 bg-zinc-900/30 backdrop-blur-sm relative rounded-r-lg">
          <ChatContainer chatId={chatIdNum} userId={userId} />
        </div>
      </div>
    </div>
  );
} 