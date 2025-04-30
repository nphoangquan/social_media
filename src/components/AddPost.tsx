"use client";

import { useUser } from "@clerk/nextjs";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState, useTransition } from "react";
import AddPostButton from "./AddPostButton";
import { addPost } from "@/lib/actions";
import { Smile, Image as ImageIcon, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

const AddPost = () => {
  const { user, isLoaded } = useUser();
  const [media, setMedia] = useState<CloudinaryResult>();
  const [mediaType, setMediaType] = useState<"image" | "video">();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isLoaded) {
    return "Loading...";
  }

  const handleSubmit = async (formData: FormData) => {
    if (isPending) return;
    
    startTransition(async () => {
      try {
        await addPost(formData, media?.secure_url || "", mediaType);
        setMedia(undefined);
        setMediaType(undefined);
        formData.set("desc", "");
        const textarea = document.querySelector('textarea[name="desc"]') as HTMLTextAreaElement;
        if (textarea) textarea.value = "";
        router.refresh();
      } catch (error) {
        console.error("Error posting:", error);
      }
    });
  };

  return (
    <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 flex gap-4 justify-between text-sm">
      {/* AVATAR */}
      <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-zinc-100 dark:ring-zinc-800">
        <Image
          src={user?.imageUrl || "/noAvatar.png"}
          alt=""
          fill
          className="object-cover"
        />
      </div>
      {/* POST */}
      <div className="flex-1">
        {/* TEXT INPUT */}
        <form action={handleSubmit} className="flex gap-4">
          <textarea
            placeholder="Nguyen Phan Hoang Quan - 2280602604 - 22DTHH2 - HUTECH"
            className="flex-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-3 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-600 dark:text-zinc-300 outline-none resize-none border border-transparent focus:border-emerald-500/20 dark:focus:border-emerald-500/10 transition-colors"
            name="desc"
          ></textarea>
          <div className="flex flex-col justify-between">
            <Smile className="w-5 h-5 cursor-pointer text-zinc-400 hover:text-emerald-500 dark:text-zinc-500 dark:hover:text-emerald-400 transition-colors" />
            <AddPostButton />
          </div>
        </form>
        {/* POST OPTIONS */}
        <div className="flex items-center gap-6 mt-4 text-zinc-500 dark:text-zinc-400 flex-wrap">
          <CldUploadWidget
            uploadPreset="social-media"
            onSuccess={(result, { widget }) => {
              setMedia(result.info as CloudinaryResult);
              setMediaType("image");
              widget.close();
            }}
            options={{
              resourceType: "image",
              clientAllowedFormats: ["jpg", "jpeg", "png", "gif"],
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
                <div
                  className="flex items-center gap-2 cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors group"
                  onClick={() => open()}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Photo</span>
                </div>
              );
            }}
          </CldUploadWidget>
          <CldUploadWidget
            uploadPreset="social-media"
            onSuccess={(result, { widget }) => {
              setMedia(result.info as CloudinaryResult);
              setMediaType("video");
              widget.close();
            }}
            options={{
              resourceType: "video",
              clientAllowedFormats: ["mp4", "mov", "avi", "webm"],
              maxFileSize: 100000000,
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
            {({ open }) => (
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors group"
                onClick={() => open()}
              >
                <Video className="w-5 h-5" />
                <span className="text-sm font-medium">Video</span>
              </div>
            )}
          </CldUploadWidget>
          {/* <div className="flex items-center gap-2 cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors group">
            <BarChart2 className="w-5 h-5" />
            <span className="text-sm font-medium">Poll</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors group">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">Event</span>
          </div> */}
        </div>

        {/* Preview Media */}
        {media && (
          <div className="mt-4 relative">
            {mediaType === "image" ? (
              <div className="relative w-full h-[300px] rounded-xl overflow-hidden">
                <Image
                  src={media.secure_url}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative w-full rounded-xl overflow-hidden bg-zinc-900">
                <video
                  src={media.secure_url}
                  className="w-full"
                  controls
                  autoPlay
                  muted
                  loop
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setMedia(undefined);
                setMediaType(undefined);
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-zinc-900/50 hover:bg-zinc-900/70 text-white transition-colors cursor-pointer"
              aria-label="Remove media"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPost;