"use client";

import { User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type FriendsListProps = {
  initialFriends: User[];
  selectedUsername?: string;
};

export default function FriendsList({ initialFriends, selectedUsername }: FriendsListProps) {
  const router = useRouter();
  const [friends, setFriends] = useState<User[]>(initialFriends);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMoreFriends();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef, hasMore, isLoading]);

  const loadMoreFriends = async () => {
    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const response = await fetch(`/api/friends?page=${nextPage}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      
      const data = await response.json();
      
      if (data.friends.length > 0) {
        setFriends(prev => [...prev, ...data.friends]);
        setPage(nextPage);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFriendClick = (username: string) => {
    router.push(`/friends?username=${username}`);
  };

  if (initialFriends.length === 0 && friends.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-zinc-500 dark:text-zinc-400">No friends yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {friends.map((friend) => (
        <button
          key={friend.id}
          onClick={() => handleFriendClick(friend.username)}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left ${
            selectedUsername === friend.username
              ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30"
              : "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 border border-transparent"
          }`}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-zinc-900 shadow-md">
            <Image
              src={friend.avatar || "/noAvatar.png"}
              alt=""
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className={`font-medium ${
              selectedUsername === friend.username
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-zinc-800 dark:text-zinc-200"
            }`}>
              {friend.name && friend.surname
                ? `${friend.name} ${friend.surname}`
                : friend.username}
            </div>
            {friend.city && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {friend.city}
              </div>
            )}
          </div>
        </button>
      ))}
      
      {/* Loader reference element */}
      {(hasMore || isLoading) && (
        <div 
          ref={loaderRef} 
          className="py-4 text-center"
        >
          <div className="w-6 h-6 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
} 