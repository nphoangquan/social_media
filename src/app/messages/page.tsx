import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatsList from "@/components/messages/ChatsList";
import NoSelectedChat from "@/components/messages/NoSelectedChat";
import prisma from "@/lib/client";

export default async function MessagesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
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
      <div className="flex w-full h-[calc(100vh-6rem)] overflow-hidden rounded-lg">
        {/* Chat list sidebar */}
        <div className="w-80 md:w-96 border-r border-zinc-800 shrink-0 bg-zinc-900/30 backdrop-blur-sm rounded-l-lg">
          <ChatsList userId={userId} initialChats={chats} />
        </div>
        
        {/* Main chat area - when no chat is selected */}
        <div className="flex-1 bg-zinc-900/30 backdrop-blur-sm relative rounded-r-lg">
          <NoSelectedChat />
        </div>
      </div>
    </div>
  );
} 