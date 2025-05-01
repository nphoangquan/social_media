"use client";

import { addStory } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { Story, User } from "@prisma/client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useEffect } from "react";
import { Plus, Video } from "lucide-react";

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
  // Initialize with filtered stories
  const [storyList, setStoryList] = useState(() => {
    const now = new Date();
    return stories.filter(story => new Date(story.expiresAt) > now);
  });
  const [img, setImg] = useState<CloudinaryResult | null>(null);
  const [resourceType, setResourceType] = useState<string>("image");

  const { user } = useUser();

  // Add auto-expiration check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setStoryList(prev => prev.filter(story => new Date(story.expiresAt) > now));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Sync with stories prop when it changes
  useEffect(() => {
    const now = new Date();
    setStoryList(stories.filter(story => new Date(story.expiresAt) > now));
  }, [stories]);

  const add = async () => {
    if (!img?.secure_url) return;

    addOptimisticStory({
      id: Date.now(),
      img: resourceType === "video" ? null : img.secure_url,
      video: resourceType === "video" ? img.secure_url : null,
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
        birthDate: null,
        createdAt: new Date(Date.now()),
      },
    });

    try {
      const createdStory = await addStory(img.secure_url, resourceType);
      setStoryList((prev) => [createdStory!, ...prev]);
      setImg(null);
      window.location.reload();
    } catch {
      // Error handling silently ignored
    }
  };

  const [optimisticStories, addOptimisticStory] = useOptimistic(
    storyList,
    (state, newStory: StoryWithUser) => [newStory, ...state]
  );

  return (
    <>
      <CldUploadWidget
        uploadPreset="social-media"
        onSuccess={(result, { widget }) => {
          const info = result.info as CloudinaryResult;
          setImg(info);
          setResourceType(info.resource_type);
          widget.close();
        }}
        options={{
          resourceType: "auto",
          clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "mp4", "mov", "avi"],
          maxFileSize: 10000000,
          styles: {
            palette: {
              window: "#0a0a0a",
              windowBorder: "#a1a1aa",
              windowShadow: "rgba(0, 0, 0, 0.95)",
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
          }
        }}
      >
        {({ open }) => {
          return (
            <div className="cursor-pointer mr-2">
              <div 
                className="relative w-28 h-48 rounded-xl overflow-hidden shadow-md transition-all duration-300"
                onClick={() => open()}
              >
                {/* Black gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black" />
                
                {/* Content container with direct hover effects */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Plus icon with emerald gradient background */}
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full w-12 h-12 flex items-center justify-center mb-3 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(16,185,129,0.7)] relative overflow-hidden group">
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                    <Plus className="w-6 h-6 text-zinc-800 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  
                  {/* Text with direct effect on hover */}
                  <span className="text-white font-medium text-sm relative">
                    Create story
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 scale-x-0 transition-transform duration-300 hover:scale-x-100"></span>
                  </span>
                </div>
              </div>
              
              {img && (
                <form action={add} className="mt-2 flex justify-center">
                  <button 
                    type="submit"
                    className="bg-emerald-600 text-white px-5 py-2 text-sm rounded-lg transition-colors duration-300 hover:bg-emerald-500 font-medium"
                  >
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
        <Link
          key={story.id}
          href={`/story/${story.id}`}
          className="cursor-pointer group relative mr-2"
        >
          <div className="relative w-28 h-48 rounded-xl overflow-hidden shadow-md transition-transform duration-500 group-hover:scale-105">
            {/* Story content - conditionally render image or video */}
            <div className="w-full h-full overflow-hidden">
              {story.video ? (
                <>
                  <video
                    src={story.video}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    playsInline
                    muted
                    preload="metadata"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                    <Video className="w-3 h-3 text-white" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-1"></div>
                    </div>
                  </div>
                </>
              ) : (
                <Image
                  src={story.img || "/noAvatar.png"}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
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
        </Link>
      ))}
    </>
  );
};

export default StoryList;
