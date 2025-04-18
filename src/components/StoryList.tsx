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
        uploadPreset="social-media"
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
            frame: {
              background: "rgba(0, 0, 0, 0.8)"
            }
          },
        }}
      >
        {({ open }) => {
          return (
            <div
              className="cursor-pointer group mr-2"
              onClick={() => open()}
            >
              <div className="relative w-28 h-48 rounded-xl overflow-hidden shadow-md bg-zinc-900 transition-transform duration-500 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-black/50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="bg-white dark:bg-zinc-800 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                    <Plus className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <span className="text-white font-medium text-sm mt-2">Create story</span>
                </div>
              </div>
              {img && (
                <form action={add} className="mt-2 flex justify-center">
                  <button className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-4 py-1.5 text-xs rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-800/20 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors font-medium shadow-sm hover:shadow-md">
                    Share
                  </button>
                </form>
              )}
            </div>
          );
        }}
      </CldUploadWidget>
      {/* STORIES */}
      {optimisticStories.map((story) => (
        <div
          className="cursor-pointer group relative mr-2"
          key={story.id}
        >
          <div className="relative w-28 h-48 rounded-xl overflow-hidden shadow-md transition-transform duration-500 group-hover:scale-105">
            {/* Story image with zoom effect */}
            <div className="w-full h-full overflow-hidden">
              <Image
                src={story.img || "/noImage.png"}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            
            {/* User avatar at top */}
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white">
                <Image
                  src={story.user.avatar || "/noAvatar.png"}
                  alt=""
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* Username at bottom with dark background only behind the text */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="bg-gradient-to-t from-black/80 to-transparent h-12 px-2 flex items-end pb-2">
                <span className="text-white text-xs font-medium line-clamp-1">
                  {story.user.name || story.user.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default StoryList;
