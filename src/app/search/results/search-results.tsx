"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { searchContent } from "@/lib/actions";

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
  };
}

interface SearchResultsData {
  users: User[];
  posts: Post[];
}

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResultsData>({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "people" | "posts">("all");

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults({ users: [], posts: [] });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const searchResults = await searchContent(query);
        setResults(searchResults);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Lọc
  const displayUsers = activeTab === "all" || activeTab === "people" ? results.users : [];
  const displayPosts = activeTab === "all" || activeTab === "posts" ? results.posts : [];

  return (
    <div className="min-h-screen bg-zinc-900 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/search" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold text-zinc-100">
            Search Results for &ldquo;{query}&rdquo;
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-700 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-medium ${
              activeTab === "all"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`px-4 py-2 font-medium ${
              activeTab === "people"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            People
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 font-medium ${
              activeTab === "posts"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Posts
          </button>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        ) : (
          <div>
            {/* No results */}
            {displayUsers.length === 0 && displayPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-zinc-400 text-lg">No results found</p>
                <p className="text-zinc-500 mt-2">
                  Try different keywords or check your spelling
                </p>
              </div>
            )}

            {/* Users */}
            {displayUsers.length > 0 && (
              <div className="mb-8">
                {activeTab !== "people" && (
                  <h2 className="text-lg font-medium text-zinc-200 mb-4">People</h2>
                )}
                <div className="space-y-4">
                  {displayUsers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-3 p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <div className="relative w-12 h-12 overflow-hidden rounded-full bg-zinc-700">
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
                        <p className="text-zinc-200 font-medium">
                          {user.name} {user.surname}
                        </p>
                        <p className="text-zinc-400 text-sm">@{user.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts */}
            {displayPosts.length > 0 && (
              <div>
                {activeTab !== "posts" && (
                  <h2 className="text-lg font-medium text-zinc-200 mb-4">Posts</h2>
                )}
                <div className="space-y-4">
                  {displayPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="block p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
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
                        <div>
                          <p className="text-zinc-300 text-sm font-medium">
                            {post.user.name || post.user.username}
                          </p>
                          <p className="text-zinc-500 text-xs">@{post.user.username}</p>
                        </div>
                      </div>
                      <p className="text-zinc-200 line-clamp-3">{post.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 