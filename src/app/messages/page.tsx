import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatsList from "@/app/messages/_components/ChatsList";
import NoSelectedChat from "@/app/messages/_components/NoSelectedChat";
import prisma from "@/lib/client";

export default async function MessagesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
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
      <div className="flex w-full h-[calc(100vh-6rem)] overflow-hidden rounded-lg">
        {/* Thanh bên danh sách trò chuyện */}
        <div className="w-80 md:w-96 border-r border-zinc-800 shrink-0 bg-zinc-900/30 backdrop-blur-sm rounded-l-lg">
          <ChatsList userId={userId} initialChats={chats} />
        </div>
        
        {/* Khu vực trò chuyện chính - khi không có cuộc trò chuyện nào được chọn */}
        <div className="flex-1 bg-zinc-900/30 backdrop-blur-sm relative rounded-r-lg">
          <NoSelectedChat />
        </div>
      </div>
    </div>
  );
} 