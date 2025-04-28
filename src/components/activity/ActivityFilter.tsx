"use client";

import { FileText, Heart, MessageCircle } from "lucide-react";

type FilterType = 'all' | 'posts' | 'likes' | 'comments';

export default function ActivityFilter({
  currentFilter,
  onFilterChange,
}: {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-zinc-100/80 dark:bg-zinc-800/50 p-1 rounded-xl text-sm">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          currentFilter === 'all'
            ? 'bg-white dark:bg-zinc-700 text-emerald-500 dark:text-emerald-400'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400'
        }`}
      >
        All
      </button>
      
      <button
        onClick={() => onFilterChange('posts')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          currentFilter === 'posts'
            ? 'bg-white dark:bg-zinc-700 text-emerald-500 dark:text-emerald-400'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400'
        }`}
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">Posts</span>
      </button>
      
      <button
        onClick={() => onFilterChange('likes')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          currentFilter === 'likes'
            ? 'bg-white dark:bg-zinc-700 text-emerald-500 dark:text-emerald-400'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400'
        }`}
      >
        <Heart className="w-4 h-4" />
        <span className="hidden sm:inline">Likes</span>
      </button>
      
      <button
        onClick={() => onFilterChange('comments')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          currentFilter === 'comments'
            ? 'bg-white dark:bg-zinc-700 text-emerald-500 dark:text-emerald-400'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400'
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Comments</span>
      </button>
    </div>
  );
} 