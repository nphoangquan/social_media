"use client";

import { useUser } from "@clerk/nextjs";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState, useTransition, useEffect } from "react";
import { Smile, Image as ImageIcon, Video, X } from "lucide-react";
import { addPost } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

interface CreatePostModalProps {
  onClose: () => void;
}

const CreatePostModal = ({ onClose }: CreatePostModalProps) => {
  const { user, isLoaded } = useUser();
  const [media, setMedia] = useState<CloudinaryResult>();
  const [mediaType, setMediaType] = useState<"image" | "video">();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [desc, setDesc] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPending) return;
    
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("desc", desc);
        
        const newPost = await addPost(formData, media?.secure_url || "", mediaType);
        
        // Reset form state
        setMedia(undefined);
        setMediaType(undefined);
        setDesc("");
        
        // Dispatch a custom event to notify other components about the new post
        if (newPost) {
          const newPostEvent = new CustomEvent('newPost', {
            detail: { post: newPost }
          });
          window.dispatchEvent(newPostEvent);
        }
        
        // Force data refresh to ensure new post appears
        router.refresh();
        
        // Close modal after successful post
        onClose();
      } catch (error) {
        console.error("Error posting:", error);
      }
    });
  };

  if (!isLoaded || !mounted) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xl max-h-[90vh] shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 flex flex-col relative">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-center relative">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Create post</h2>
          <button 
            type="button"
            onClick={onClose}
            className="absolute right-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-100 dark:ring-zinc-800">
            <Image
              src={user?.imageUrl || "/noAvatar.png"}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-medium text-zinc-800 dark:text-zinc-200">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.username}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="p-4 flex-1 overflow-y-auto scrollbar-none">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Nguyen Phan Hoang Quan - 22DTHH2 - 2280602604"
            //   placeholder="What&apos;s on your mind?"
              className="w-full bg-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-600 dark:text-zinc-300 outline-none resize-none min-h-[120px] text-lg"
              autoFocus
            />

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
                  title="Remove media"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Add to your post */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Add to your post
              </div>
              <div className="flex items-center gap-4">
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
                  {({ open }) => (
                    <button 
                      type="button"
                      className="text-zinc-500 hover:text-emerald-500 transition-colors rounded-full p-2"
                      onClick={() => open()}
                      title="Add photo"
                    >
                      <ImageIcon className="w-6 h-6" />
                    </button>
                  )}
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
                    <button 
                      type="button"
                      className="text-zinc-500 hover:text-emerald-500 transition-colors rounded-full p-2"
                      onClick={() => open()}
                      title="Add video"
                    >
                      <Video className="w-6 h-6" />
                    </button>
                  )}
                </CldUploadWidget>

                <button 
                  type="button"
                  className="text-zinc-500 hover:text-emerald-500 transition-colors rounded-full p-2"
                  title="Add emoji"
                >
                  <Smile className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Post Button */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={isPending || (!desc.trim() && !media)}
              className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white py-2.5 font-medium transition-colors"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-solid border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  Posting...
                </div>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreatePostModal; 