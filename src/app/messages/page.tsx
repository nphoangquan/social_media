import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatsList from "@/components/messages/ChatsList";
import NoSelectedChat from "@/components/messages/NoSelectedChat";

export default async function MessagesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="flex-1 flex">
      <div className="flex w-full h-[calc(100vh-6rem)] overflow-hidden rounded-lg">
        {/* Chat list sidebar */}
        <div className="w-80 md:w-96 border-r border-zinc-800 shrink-0 bg-zinc-900/30 backdrop-blur-sm rounded-l-lg">
          <ChatsList userId={userId} />
        </div>
        
        {/* Main chat area - when no chat is selected */}
        <div className="flex-1 bg-zinc-950/70 relative rounded-r-lg">
          <NoSelectedChat />
        </div>
      </div>
    </div>
  );
} 