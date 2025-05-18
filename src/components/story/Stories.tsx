"use client";

import { Story, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Plus, Video as VideoIcon } from "lucide-react";
import { useState, useEffect } from "react";
import CreateStoryModal from "./CreateStoryModal";

type StoryWithUser = Story & {
  user: User;
};

export default function Stories({ stories }: { stories: StoryWithUser[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after initial render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto scrollbar-none p-4">
        {/* Create Story */}
        <div className="shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-28 h-40 rounded-xl relative group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* Background with neon emerald color */}
            <div className="absolute inset-0 bg-emerald-600"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent -translate-x-full animate-shimmer group-hover:animate-[shimmer_1.5s_infinite]"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-800/80 backdrop-blur-sm flex items-center justify-center shadow-lg border border-emerald-400/30">
                <Plus className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="text-sm font-medium text-white">Tạo Story</span>
            </div>
          </button>
        </div>

        {/* Stories */}
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/story/${story.id}`}
            className="shrink-0"
          >
            <div className="w-28 h-40 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative group cursor-pointer hover:border-emerald-500/50 transition-colors">
              {story.img && !story.video && (
                <Image
                  src={story.img}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              {story.video && (
                <>
                  <video
                    src={story.video}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay={mounted}
                    playsInline
                    muted
                    loop
                  />
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                    <VideoIcon className="w-3 h-3 text-white" />
                  </div>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
              
              {/* User Avatar */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-4 ring-emerald-500">
                  <Image
                    src={story.user.avatar || "/noAvatar.png"}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="text-xs font-medium text-white text-center truncate">
                  {story.user.name && story.user.surname
                    ? `${story.user.name} ${story.user.surname}`
                    : story.user.username}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Create Story Modal */}
      {showCreateModal && (
        <CreateStoryModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
} 