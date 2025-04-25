"use client";

import { Story, User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type StoryWithUser = Story & {
  user: User;
};

export default function StoryViewer({ story }: { story: StoryWithUser }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total duration

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 z-50 p-2 hover:bg-zinc-800/50 rounded-full transition-colors"
        title="Close story"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800">
        <div 
          className="h-full bg-white transition-all duration-50 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* User info */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white">
          <Image
            src={story.user.avatar || "/noAvatar.png"}
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div>
          <div className="font-medium text-white">
            {story.user.name && story.user.surname
              ? `${story.user.name} ${story.user.surname}`
              : story.user.username}
          </div>
          <div className="text-xs text-zinc-400">
            {new Date(story.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Story content */}
      <div className="relative w-full max-w-[500px] aspect-[9/16] rounded-lg overflow-hidden">
        {story.img && (
          <Image
            src={story.img}
            alt=""
            fill
            className="object-cover"
            priority
          />
        )}
        {story.video && (
          <video
            src={story.video}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
            loop
          />
        )}
      </div>
    </div>
  );
} 