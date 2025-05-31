import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function SearchResultsSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-900 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/search" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="h-7 w-48 bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-700 mb-6">
          <div className="px-4 py-2 font-medium text-emerald-400 border-b-2 border-emerald-400">
            Tất cả
          </div>
          <div className="px-4 py-2 font-medium text-zinc-400">
            Người dùng
          </div>
          <div className="px-4 py-2 font-medium text-zinc-400">
            Bài viết
          </div>
        </div>

        {/* Results Skeleton */}
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </div>
      </div>
    </div>
  );
} 