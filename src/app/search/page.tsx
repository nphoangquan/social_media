"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search/results?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold text-zinc-100">Search</h1>
        </div>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="w-full mb-8">
          <div className="flex p-3 bg-zinc-800/50 items-center rounded-xl border border-zinc-700/50 hover:bg-zinc-800/70 transition-colors group">
            <input 
              type="text" 
              placeholder="Search people or posts..." 
              className="bg-transparent outline-none text-zinc-300 placeholder-zinc-500 w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button 
              type="submit" 
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        {/* Instructions */}
        <div className="text-zinc-400 text-center mt-8">
          <p>Tìm kiếm người dùng hoặc bài viết</p>
          <p className="text-sm mt-2">Thử gõ tên, tên người dùng, hoặc từ khóa từ bài viết</p>
        </div>
      </div>
    </div>
  );
} 