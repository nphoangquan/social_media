"use client";

import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Video } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addStory } from "@/lib/actions";

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

export default function CreateStoryModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cloudinaryData, setCloudinaryData] = useState<CloudinaryResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if file is video or image
    const isVideoFile = selectedFile.type.startsWith('video/');
    setIsVideo(isVideoFile);

    // Kiểm tra kích thước file - giới hạn khác nhau cho ảnh và video
    if (isVideoFile) {
      // Giới hạn video là 100MB
      if (selectedFile.size > 100 * 1024 * 1024) {
        alert('Video quá lớn. Kích thước tối đa là 100MB');
        return;
      }
    } else {
      // Giới hạn ảnh là 25MB
      if (selectedFile.size > 25 * 1024 * 1024) {
        alert('Ảnh quá lớn. Kích thước tối đa là 25MB');
        return;
      }
    }

    // Create preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
    setFile(selectedFile);

    // Upload to Cloudinary directly
    uploadToCloudinary(selectedFile, isVideoFile ? 'video' : 'image');

    // Clean up the old preview URL
    return () => URL.revokeObjectURL(url);
  };

  const uploadToCloudinary = async (file: File, resourceType: "image" | "video") => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'social-media');
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setCloudinaryData({
        secure_url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
        resource_type: data.resource_type
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || isUploading || !cloudinaryData) return;

    try {
      setIsUploading(true);
      
      // Gửi URL đã upload đến server
      await addStory(cloudinaryData.secure_url, cloudinaryData.resource_type);
      
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
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Tạo Story</h2>
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
                    Bấm để upload story
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
              
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
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
              disabled={!file || isUploading || !cloudinaryData}
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