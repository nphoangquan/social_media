"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { X, Image as ImageIcon, Video, Save } from "lucide-react";
import { env } from "@/shared/config/env";
import { Post, User } from "@prisma/client";
import { useRouter } from "next/navigation";

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
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>(
    post.img ? "image" : post.video ? "video" : undefined
  );
  const [desc, setDesc] = useState(post.desc);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Set initial mediaType based on post content
  useEffect(() => {
    if (post.img) {
      setMediaType("image");
    } else if (post.video) {
      setMediaType("video");
    }
  }, [post.img, post.video]);

  const uploadToCloudinary = async (file: File, resourceType: "image" | "video") => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'social-media');
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${env.client.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setMedia({
        secure_url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
        resource_type: data.resource_type
      });
      setMediaType(resourceType);
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB");
      return;
    }
    
    uploadToCloudinary(file, "image");
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError("File too large. Maximum size is 100MB");
      return;
    }
    
    uploadToCloudinary(file, "video");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate
      if (!desc || desc.trim() === '') {
        setError('Post content cannot be empty');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare post data
      const updatedData: {
        desc: string;
        img: string | null;
        video: string | null;
      } = {
        desc: desc.trim(),
        img: null,
        video: null
      };

      // Set media based on type
      if (mediaType === "image") {
        updatedData.img = media?.secure_url || post.img || null;
      } else if (mediaType === "video") {
        updatedData.video = media?.secure_url || post.video || null;
      }
      
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(errorText || "Failed to update post");
      }

      const updatedPost = await response.json();
      
      // Dispatch a custom event to notify other components about the post update
      const postUpdateEvent = new CustomEvent('postUpdate', {
        detail: { 
          postId: post.id,
          updatedPost: {
            ...post,
            desc: updatedPost.desc,
            img: updatedPost.img,
            video: updatedPost.video
          }
        }
      });
      window.dispatchEvent(postUpdateEvent);

      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      setError(error instanceof Error ? error.message : "Failed to update post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl dark:shadow-emerald-900/10 border border-zinc-100/20 dark:border-zinc-800/50">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between relative">
          <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">Edit Post</h2>
          <button 
            title="Close" 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-zinc-100 dark:ring-zinc-800">
            <Image
              src={post.user?.avatar || "/noAvatar.png"}
              alt={post.user?.name || "User"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-medium text-lg text-zinc-800 dark:text-zinc-100">
              {post.user?.name || "User"}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Content Area */}
          <div className="p-6 flex-1 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-zinc-100 dark:scrollbar-track-zinc-800 scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                {error}
              </div>
            )}
            
            {/* Text Input */}
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl px-4 py-3 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-700 dark:text-zinc-200 outline-none resize-none min-h-[150px] text-lg border border-transparent focus:border-emerald-500/30 dark:focus:border-emerald-400/20 transition-all"
              autoFocus
            />

            {/* Media Preview */}
            {(media || post.img || post.video) && (
              <div className="mt-5 relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
                {mediaType === "image" || post.img ? (
                  <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
                    <Image
                      src={media?.secure_url || post.img || ""}
                      alt="Preview"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : mediaType === "video" || post.video ? (
                  <div className="relative w-full rounded-xl overflow-hidden bg-zinc-900">
                    <video
                      src={media?.secure_url || post.video || ""}
                      className="w-full max-h-[400px] object-contain"
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
                    if (mediaType) setMediaType(undefined);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-zinc-900/70 hover:bg-zinc-900/90 text-white transition-colors cursor-pointer"
                  aria-label="Remove media"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Media Controls & Submit */}
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            {/* Media Upload Options */}
            <div className="flex items-center gap-6 text-zinc-500 dark:text-zinc-400">
              {/* Hidden file inputs */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={imageInputRef}
                onChange={handleImageChange}
              />
              <input
                type="file"
                accept="video/*"
                className="hidden"
                ref={videoInputRef}
                onChange={handleVideoChange}
              />

              {/* Image upload button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer relative"
                disabled={uploading}
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-base font-medium">Photo</span>
                {uploading && mediaType === "image" && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                  </span>
                )}
              </button>

              {/* Video upload button */}
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-2 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer relative"
                disabled={uploading}
              >
                <Video className="w-6 h-6" />
                <span className="text-base font-medium">Video</span>
                {uploading && mediaType === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                  </span>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-base font-medium rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


