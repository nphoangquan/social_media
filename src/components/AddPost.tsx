"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import CreatePostModal from "./CreatePostModal";
import { useUserAvatar } from "@/lib/hooks/useUserAvatar";

const AddPost = () => {
  // Use Clerk to check if user is loaded
  const { isLoaded: clerkLoaded } = useUser();
  // Use our custom hook for avatar
  const { avatarUrl } = useUserAvatar();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!clerkLoaded) {
    return "Loading...";
  }

  return (
    <>
      <div className="p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 flex gap-4 justify-between text-sm">
        {/* AVATAR */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-100 dark:ring-zinc-800">
          <Image
            src={avatarUrl || "/noAvatar.png"}
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Post Input Trigger */}
        <button 
          className="flex-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-full px-4 text-left text-zinc-500 dark:text-zinc-400 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700/50 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          What&apos;s on your mind?
        </button>
      </div>

      {isModalOpen && (
        <CreatePostModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default AddPost;