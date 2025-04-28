"use client";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Video } from "lucide-react";
import { Post, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

interface EditPostWidgetProps {
  post: Post & { user: User };
  onClose: () => void;
}

export default function EditPostWidget({ post, onClose }: EditPostWidgetProps) {
  const [media, setMedia] = useState<CloudinaryResult>();
  const [mediaType, setMediaType] = useState<"image" | "video">();
  const [desc, setDesc] = useState(post.desc);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          desc,
          ...(mediaType === "image" ? { img: media?.secure_url } : {}),
          ...(mediaType === "video" ? { video: media?.secure_url } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 pt-15">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-xl">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Edit Post</h2>
            <button title="Close" 
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-3 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-600 dark:text-zinc-300 outline-none resize-none min-h-[100px] border border-transparent focus:border-emerald-500/20 dark:focus:border-emerald-500/10 transition-colors"
            />

            {/* Media Preview */}
            {(media || post.img || post.video) && (
              <div className="relative">
                {mediaType === "image" || post.img ? (
                  <div className="relative w-full h-[300px] rounded-xl overflow-hidden">
                    <Image
                      src={media?.secure_url || post.img || ""}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : mediaType === "video" || post.video ? (
                  <div className="relative w-full rounded-xl overflow-hidden bg-zinc-900">
                    <video
                      src={media?.secure_url || post.video || ""}
                      className="w-full"
                      controls
                      playsInline
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : null}
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

            {/* Media Upload Options */}
            <div className="flex items-center gap-6 text-zinc-500 dark:text-zinc-400">
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
                    onClick={() => open()}
                    className="flex items-center gap-2 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Change Photo</span>
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
                    onClick={() => open()}
                    className="flex items-center gap-2 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <Video className="w-5 h-5" />
                    <span className="text-sm font-medium">Change Video</span>
                  </button>
                )}
              </CldUploadWidget>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
} 