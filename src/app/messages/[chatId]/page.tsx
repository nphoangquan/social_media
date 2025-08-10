import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/client";
import ChatsList from "@/app/messages/_components/ChatsList"; 
import ChatContainer from "@/app/messages/_components/ChatContainer";

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
  
  // Xác minh người dùng là thành viên của cuộc trò chuyện này
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      userId: userId,
      chatId: chatIdNum,
    },
  });
  
  if (!participant) {
    redirect("/messages");
  }
  
  // Đánh dấu tin nhắn là đã đọc
  await prisma.chatParticipant.update({
    where: {
      id: participant.id
    },
    data: {
      isRead: true,
    },
  });
  
  // Lấy dữ liệu cuộc trò chuyện ban đầu cho component phía client
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
  
  // Chuyển đổi dữ liệu cho component phía client
  const chats = initialChats.map(participant => ({
    chat: participant.chat,
    isRead: participant.isRead
  }));
  
  return (
    <div className="flex-1 flex">
      <div className="flex w-full h-[calc(100vh-6rem)] overflow-hidden rounded-2xl">
        {/* Thanh bên danh sách trò chuyện */}
        <div className="w-80 md:w-96 border-r border-zinc-800 shrink-0 bg-zinc-900/30 backdrop-blur-sm rounded-l-lg">
          <ChatsList userId={userId} activeChatId={chatIdNum} initialChats={chats} />
        </div>
        
        {/* Khu vực trò chuyện chính */}
        <div className="flex-1 bg-zinc-900/30 backdrop-blur-sm relative rounded-r-lg">
          <ChatContainer chatId={chatIdNum} userId={userId} />
        </div>
      </div>
    </div>
  );
} 