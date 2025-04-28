import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import FriendsList from "@/components/friends/FriendsList";
import FriendDetail from "@/components/friends/FriendDetail";
import { Suspense } from "react";
import FriendsSearch from "@/components/friends/FriendsSearch";

type PageProps = {
  searchParams: { username?: string };
};

export default async function FriendsPage({
  searchParams,
}: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-200 mb-2">Not authenticated</h1>
          <p className="text-zinc-400">Please sign in to view your friends</p>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const selectedUsername = params.username;
  
  // Get the first 10 friends for initial render
  const followers = await prisma.follower.findMany({
    where: {
      followingId: userId,
    },
    include: {
      follower: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10, // Only take the first 10 for initial load
  });

  // Map followers to user objects
  const initialFriends = followers.map(follow => follow.follower);

  // Get total count for search component
  const totalCount = await prisma.follower.count({
    where: {
      followingId: userId,
    },
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto py-8 px-4">
      {/* Friend list sidebar - always visible on desktop, hidden on mobile when a friend is selected */}
      <div className={`w-full md:w-1/3 lg:w-1/4 ${selectedUsername ? 'hidden md:block' : 'block'}`}>
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 p-6 border border-zinc-100/50 dark:border-zinc-800/50">
          <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Friends</h1>
          <div className="mb-4">
            <FriendsSearch totalFriends={totalCount} />
          </div>
          <FriendsList initialFriends={initialFriends} selectedUsername={selectedUsername} />
        </div>
      </div>
      
      {/* Friend detail - visible on desktop, or on mobile when a friend is selected */}
      <div className={`${selectedUsername ? 'block' : 'hidden md:block'} w-full md:w-2/3 lg:w-3/4`}>
        <Suspense fallback={
          <div className="h-full flex items-center justify-center">
            <p className="text-zinc-500 dark:text-zinc-400">Loading profile...</p>
          </div>
        }>
          {selectedUsername ? (
            <>
              {/* Mobile back button */}
              <div className="mb-4 md:hidden">
                <a 
                  href="/friends" 
                  className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  <span>Back to friends</span>
                </a>
              </div>
              
              <FriendDetail username={selectedUsername} />
            </>
          ) : (
            <div className="h-full flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50">
              <div className="text-center p-8">
                <div className="flex justify-center mb-4">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-300 dark:text-zinc-600">
                    <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 20C18 17.7909 15.3137 16 12 16C8.68629 16 6 17.7909 6 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium text-zinc-700 dark:text-zinc-300 mb-2">Select a friend</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Choose from your friends list to view their profile</p>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
} 