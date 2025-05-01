"use client";

import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Video } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createStory } from "@/lib/actions";

export default function CreateStoryModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if file is video or image
    const isVideoFile = selectedFile.type.startsWith('video/');
    setIsVideo(isVideoFile);

    // Create preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
    setFile(selectedFile);

    // Clean up the old preview URL
    return () => URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || isUploading) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', isVideo ? 'video' : 'image');

      await createStory(formData);
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error uploading story:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Create Story</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preview */}
            <div className="aspect-[9/16] rounded-xl bg-zinc-100 dark:bg-zinc-800/50 overflow-hidden relative">
              {!preview && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Click to upload your story
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-zinc-600 dark:text-zinc-300">Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Video className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-zinc-600 dark:text-zinc-300">Video</span>
                    </button>
                  </div>
                </div>
              )}
              {preview && !isVideo && (
                <Image
                  src={preview}
                  alt="Story preview"
                  fill
                  className="object-cover"
                />
              )}
              {preview && isVideo && (
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                  loop
                />
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*"
              onChange={handleFileChange}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={!file || isUploading}
              className="w-full py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Share Story'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 