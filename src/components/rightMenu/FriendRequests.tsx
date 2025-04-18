import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
// import Image from "next/image";
import Link from "next/link";
import FriendRequestList from "./FriendRequestList";
import { MoreVertical } from "lucide-react";

const FriendRequests = async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const requests = await prisma.followRequest.findMany({
    where: {
      receiverId: userId,
    },
    include: {
      sender: true,
    },
  });

  if (requests.length === 0) return null;
  
  return (
    <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 text-sm border border-zinc-100/50 dark:border-zinc-800/50 hover:shadow-xl dark:hover:shadow-zinc-800/30 transition-all duration-300">
      {/* TOP */}
      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 font-medium mb-5">
        <span className="text-xs uppercase tracking-wider font-semibold">Friend Requests</span>
        <MoreVertical className="w-4 h-4 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors" />
      </div>
      
      {/* BOTTOM */}
      <div className="flex flex-col gap-5">
        {/* REQUEST LIST */}
        <FriendRequestList requests={requests}/>
        
        {/* SEE ALL BUTTON */}
        <Link href="/requests" className="block">
          <button className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 p-3 text-xs rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/20 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors font-medium w-full shadow-sm hover:shadow-md">
            See all requests
          </button>
        </Link>
      </div>
    </div>
  );
};

export default FriendRequests;