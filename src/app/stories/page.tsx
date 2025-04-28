import { getAllStories } from "@/lib/actions/story";
import StoryList from "@/components/story/StoryList";
import Link from "next/link";
import { Plus, Sparkles, Clock } from "lucide-react";
import Image from "next/image";

export default async function StoriesPage() {
  const stories = await getAllStories();

  if (!stories || stories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="relative p-8 bg-zinc-900/30 backdrop-blur-md rounded-3xl max-w-md w-full border border-zinc-800/50 shadow-xl">
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl transform rotate-12"></div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg transform -rotate-12"></div>
          
          <div className="text-center relative z-10">
            <div className="mb-6 relative">
              <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shadow-inner">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 animate-pulse"></div>
                <Plus className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Start Your Story</h1>
            <p className="text-zinc-400 mb-8">Share your moments with friends in a creative way</p>
            <Link 
              href="/stories/create" 
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-medium inline-flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create First Story</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 flex">
      <div className="hidden md:block">
        <StoryList stories={stories} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative p-8 bg-zinc-900/30 backdrop-blur-md rounded-3xl max-w-md w-full border border-zinc-800/50 shadow-xl overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-2">
              <div className="h-1 w-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mr-3"></div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Stories</h1>
              <div className="h-1 w-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full ml-3"></div>
            </div>
            
            <p className="text-zinc-400 text-center text-sm mb-8">
              Select a story from the list or create your own
            </p>
            
            {/* Featured story preview */}
            {stories[0] && (
              <div className="mb-8 relative group">
                <div className="w-full h-48 rounded-xl overflow-hidden mb-3 relative group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  <Image 
                    src={stories[0].img || "/placeholder.png"}
                    alt="Featured story"
                    fill
                    className="object-cover transition-transform group-hover:scale-105 duration-500"
                  />
                  <div className="absolute bottom-3 left-3 z-10 flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 ring-2 ring-white/20">
                      <Image 
                        src={stories[0].user.avatar || "/placeholder.png"}
                        alt={stories[0].user.username || "User"}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <div className="text-sm font-medium text-white">
                      {stories[0].user.name || stories[0].user.username}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-4">
              <Link 
                href={`/story/${stories[0].id}`} 
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium inline-flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] flex-1 justify-center"
              >
                <Clock className="w-4 h-4" />
                <span>View Latest</span>
              </Link>
              <Link 
                href="/stories/create" 
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-medium inline-flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] flex-1 justify-center"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create New</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}