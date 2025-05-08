"use client";

import { Search, X, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { searchContent } from "@/lib/actions";
import Link from "next/link";
import Image from "next/image";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  name: string | null;
  surname: string | null;
  avatar: string | null;
}

interface Post {
  id: number;
  desc: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
    role?: string;
  };
}

interface SearchResults {
  users: User[];
  posts: Post[];
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Hàm tìm kiếm bị giảm thiểu
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ users: [], posts: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounce(async (query: string) => {
      try {
        const results = await searchContent(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500)(searchQuery);
  }, []);

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length >= 2) {
      debouncedSearch(value);
    } else {
      setSearchResults({ users: [], posts: [] });
    }
  };

  // Xử lý hiển thị tất cả kết quả
  const handleViewAllResults = () => {
    if (query.trim().length >= 2) {
      router.push(`/search/results?q=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
    }
  };

  // Đóng kết quả tìm kiếm khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Đóng kết quả tìm kiếm khi nhấn Escape
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  // Xác định nếu nên hiển thị "Xem tất cả kết quả"
  const hasResults = searchResults.users.length > 0 || searchResults.posts.length > 0;
  const shouldShowViewAll = query.trim().length >= 2 && hasResults;

  return (
    <div ref={searchRef} className="relative">
      <div className='flex p-2.5 bg-zinc-800/50 items-center rounded-xl border border-zinc-700/50 hover:bg-zinc-800/70 transition-colors group'>
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent outline-none text-zinc-300 placeholder-zinc-500 w-48"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsSearchOpen(true)}
        />
        {query ? (
          <X 
            className="w-4 h-4 text-zinc-500 hover:text-zinc-300 cursor-pointer" 
            onClick={() => {
              setQuery("");
              setSearchResults({ users: [], posts: [] });
            }}
          />
        ) : (
          <Search className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {isSearchOpen && (query.trim().length >= 2 || hasResults) && (
        <div className="absolute mt-2 w-80 max-h-[80vh] overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50">
          {isLoading ? (
            <div className="p-4 text-center text-zinc-400">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] mr-2" />
              Searching...
            </div>
          ) : (
            <>
              {/* Users Section */}
              {searchResults.users && searchResults.users.length > 0 && (
                <div className="p-2">
                  <div className="text-sm font-semibold text-zinc-400 px-2 pb-2 border-b border-zinc-700">
                    People
                  </div>
                  <ul>
                    {searchResults.users.map((user) => (
                      <li key={user.id}>
                        <Link 
                          href={`/profile/${user.username}`}
                          className="flex items-center gap-3 p-2 hover:bg-zinc-700/50 rounded-md"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setQuery("");
                          }}
                        >
                          <div className="relative w-8 h-8 overflow-hidden rounded-full bg-zinc-700">
                            {user.avatar && (
                              <Image
                                src={user.avatar}
                                alt={user.username}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-zinc-200 text-sm font-medium">
                              {user.name} {user.surname}
                            </p>
                            <p className="text-zinc-400 text-xs">@{user.username}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Posts Section */}
              {searchResults.posts && searchResults.posts.length > 0 && (
                <div className="p-2">
                  <div className="text-sm font-semibold text-zinc-400 px-2 pb-2 border-b border-zinc-700">
                    Posts
                  </div>
                  <ul>
                    {searchResults.posts.map((post) => (
                      <li key={post.id}>
                        <Link 
                          href={`/post/${post.id}`}
                          className="flex items-center gap-3 p-2 hover:bg-zinc-700/50 rounded-md"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setQuery("");
                          }}
                        >
                          <div className="relative w-8 h-8 overflow-hidden rounded-full bg-zinc-700">
                            {post.user.avatar && (
                              <Image
                                src={post.user.avatar}
                                alt={post.user.username}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-zinc-400 text-xs">
                              {post.user.name || post.user.username}
                            </p>
                            <p className="text-zinc-200 text-sm font-medium truncate">
                              {post.desc.length > 50 ? post.desc.substring(0, 50) + "..." : post.desc}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nút View All Results */}
              {shouldShowViewAll && (
                <div className="p-2 border-t border-zinc-700">
                  <button
                    onClick={handleViewAllResults}
                    className="w-full p-2 flex items-center justify-center gap-2 bg-zinc-700/50 hover:bg-zinc-700 rounded-md text-zinc-300 hover:text-zinc-100 transition-colors"
                  >
                    <span>View all results</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* No Results */}
              {query.trim().length >= 2 && 
                searchResults.users.length === 0 && 
                searchResults.posts.length === 0 && (
                <div className="p-4 text-center text-zinc-400">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 