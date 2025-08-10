import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import FriendRequestList from "./_components/FriendRequestList";

export default async function FriendRequestsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-200 mb-2">Not authenticated</h1>
          <p className="text-zinc-400">Please sign in to view friend requests</p>
        </div>
      </div>
    );
  }

  const requests = await prisma.followRequest.findMany({
    where: {
      receiverId: userId,
    },
    include: {
      sender: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 p-6 border border-zinc-100/50 dark:border-zinc-800/50">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Friend Requests</h1>
        
        <FriendRequestList requests={requests} />
      </div>
    </div>
  );
} 