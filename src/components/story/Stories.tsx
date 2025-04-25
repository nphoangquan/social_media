"use client";

import { Story, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateStoryModal from "./CreateStoryModal";

type StoryWithUser = Story & {
  user: User;
};

export default function Stories({ stories }: { stories: StoryWithUser[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto scrollbar-none p-4">
        {/* Create Story */}
        <div className="shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-28 h-40 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative group cursor-pointer hover:border-emerald-500/50 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white">Create Story</span>
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
              {story.img && (
                <Image
                  src={story.img}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              {story.video && (
                <video
                  src={story.video}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                  loop
                />
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