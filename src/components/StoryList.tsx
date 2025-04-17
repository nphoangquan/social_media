"use client";

import { addStory } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { Story, User } from "@prisma/client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useOptimistic, useState } from "react";
import { Plus } from "lucide-react";

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

type StoryWithUser = Story & {
  user: User;
};

const StoryList = ({
  stories,
  userId,
}: {
  stories: StoryWithUser[];
  userId: string;
}) => {
  const [storyList, setStoryList] = useState(stories);
  const [img, setImg] = useState<CloudinaryResult | null>(null);

  const { user } = useUser();

  const add = async () => {
    if (!img?.secure_url) return;

    addOptimisticStory({
      id: Math.random(),
      img: img.secure_url,
      createdAt: new Date(Date.now()),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      userId: userId,
      user: {
        id: userId,
        username: "Sending...",
        avatar: user?.imageUrl || "/noAvatar.png",
        cover: "",
        description: "",
        name: "",
        surname: "",
        city: "",
        work: "",
        school: "",
        website: "",
        createdAt: new Date(Date.now()),
      },
    });

    try {
      const createdStory = await addStory(img.secure_url);
      setStoryList((prev) => [createdStory!, ...prev]);
      setImg(null);
    } catch {
      // Error handling silently ignored
    }
  };

  const [optimisticStories, addOptimisticStory] = useOptimistic(
    storyList,
    (state, value: StoryWithUser) => [value, ...state]
  );
  return (
    <>
      <CldUploadWidget
        uploadPreset="social"
        onSuccess={(result, { widget }) => {
          setImg(result.info as CloudinaryResult);
          widget.close();
        }}
        options={{
          styles: {
            palette: {
              window: "#0a0a0a", // dark background instead of transparent blue
              windowBorder: "#a1a1aa",
              windowShadow: "rgba(0, 0, 0, 0.95)", // dark shadow
              tabIcon: "#10b981",
              menuIcons: "#10b981",
              textDark: "#ffffff",
              textLight: "#f4f4f5",
              link: "#10b981",
              action: "#10b981",
              inactiveTabIcon: "#a1a1aa",
              error: "#e11d48",
              inProgress: "#10b981",
              complete: "#10b981",
              sourceBg: "#0a0a0a",
            },
            fonts: {
              default: null,
              "'Inter', sans-serif": {
                url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
                active: true,
              },
            },
          },
          // showPoweredBy: false,
          // sources: ["local", "url", "camera", "google_drive", "dropbox", "shutterstock", "gettyimages", "instagram", "facebook", "unsplash"],
          // multiple: false,
          // maxFiles: 1,
          // resourceType: "auto",
          // clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "mp4", "mov", "avi", "webm"],
          // maxFileSize: 50000000,
          // theme: "minimal",
        }}
      >
        {({ open }) => {
          return (
            <div
              className="flex flex-col items-center gap-2 cursor-pointer relative group"
              onClick={() => open()}
            >
              <div className="relative w-20 h-20 overflow-hidden rounded-full shadow-md">
                <div className="absolute inset-0 ring-4 ring-white dark:ring-zinc-900 z-10" />
                <Image
                  src={img?.secure_url || user?.imageUrl || "/noAvatar.png"}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-emerald-500/80 dark:bg-emerald-600/80 text-white rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
              </div>
              {img ? (
                <form action={add} onClick={(e) => e.stopPropagation()}>
                  <button className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-4 py-1.5 text-xs rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-800/20 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors font-medium shadow-sm hover:shadow-md">
                    Share
                  </button>
                </form>
              ) : (
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Add Story
                </span>
              )}
            </div>
          );
        }}
      </CldUploadWidget>
      {/* STORIES */}
      {optimisticStories.map((story) => (
        <div
          className="flex flex-col items-center gap-2 cursor-pointer group"
          key={story.id}
        >
          <div className="relative w-20 h-20 overflow-hidden rounded-full shadow-md">
            <div className="absolute inset-0 ring-4 ring-emerald-500/40 dark:ring-emerald-600/30 z-10" />
            <Image
              src={story.user.avatar || "/noAvatar.png"}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {story.user.name || story.user.username}
          </span>
        </div>
      ))}
    </>
  );
};

export default StoryList;
