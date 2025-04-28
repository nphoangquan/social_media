"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

type FriendsSearchProps = {
  totalFriends: number;
};

export default function FriendsSearch({ totalFriends }: FriendsSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/friends/search?term=${encodeURIComponent(term)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search friends');
      }
      
      const data = await response.json();
      setSearchResults(data.friends);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching friends:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFriendClick = (username: string) => {
    setShowResults(false);
    setSearchTerm("");
    router.push(`/friends?username=${username}`);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder={`Search ${totalFriends} friends...`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.length >= 2) {
              handleSearch(e.target.value);
            } else {
              setShowResults(false);
            }
          }}
          onFocus={() => {
            if (searchTerm.length >= 2) {
              setShowResults(true);
            }
          }}
          className="w-full bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl p-2.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:focus:ring-emerald-400/30"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showResults && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 shadow-lg z-10 max-h-48 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map((friend) => (
              <button
                key={friend.id}
                onClick={() => handleFriendClick(friend.username)}
                className="flex items-center gap-3 p-3 w-full text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {friend.name && friend.surname
                    ? `${friend.name} ${friend.surname}`
                    : friend.username}
                </span>
              </button>
            ))
          ) : (
            <div className="p-3 text-zinc-500 dark:text-zinc-400 text-center">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
} 