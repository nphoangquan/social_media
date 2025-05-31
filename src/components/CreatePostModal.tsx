"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useTransition, useEffect, useRef } from "react";
import { Smile, Image as ImageIcon, Video, X, Wand2 } from "lucide-react";
import { addPost } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useCaption } from "@/lib/hooks/useCaption";

// Import emoji picker dynamically để tránh lỗi SSR
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { 
  ssr: false,
  loading: () => <div className="p-2">Loading...</div>
});

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
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lastUploadedImage, setLastUploadedImage] = useState<File | null>(null);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const { generateCaption } = useCaption();
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Xử lý click bên ngoài để đóng emoji picker
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node) && 
          showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      setMounted(false);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const uploadToCloudinary = async (file: File, resourceType: "image" | "video") => {
    setUploading(true);
    try {
      // Lưu lại file hình ảnh để có thể sử dụng cho tạo caption
      if (resourceType === "image") {
        setLastUploadedImage(file);
      }
      
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
    
    // Kiểm tra kích thước file (tối đa 25MB)
    if (file.size > 25 * 1024 * 1024) {
      alert("File quá lớn. Kích thước tối đa là 25MB");
      return;
    }
    
    uploadToCloudinary(file, "image");
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Kiểm tra kích thước file (tối đa 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert("File quá lớn. Kích thước tối đa là 100MB");
      return;
    }
    
    uploadToCloudinary(file, "video");
  };

  // Xử lý khi chọn emoji
  const handleEmojiClick = (emojiData: { emoji: string }) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      
      // Chèn emoji vào vị trí con trỏ hiện tại
      const newText = desc.slice(0, start) + emoji + desc.slice(end);
      setDesc(newText);
      
      // Cập nhật lại vị trí con trỏ sau khi chèn emoji
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + emoji.length;
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
      }, 0);
    } else {
      setDesc(desc + emoji);
    }
  };

  // Thêm hàm xử lý tạo caption
  const handleGenerateCaption = async () => {
    if (!lastUploadedImage || mediaType !== "image") return;
    
    setGeneratingCaption(true);
    try {
      const caption = await generateCaption(lastUploadedImage);
      if (caption) {
        setDesc(caption);
      }
    } catch (error) {
      console.error("Error generating caption:", error);
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPending) return;
    
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("desc", desc);
        
        const newPost = await addPost(formData, media?.secure_url || "", mediaType);
        
        // Đặt lại trạng thái form
        setMedia(undefined);
        setMediaType(undefined);
        setDesc("");
        setLastUploadedImage(null);
        
        if (newPost) {
          const newPostEvent = new CustomEvent('newPost', {
            detail: { post: newPost }
          });
          window.dispatchEvent(newPostEvent);
        }
        
        router.refresh();
        
        // Đóng modal sau khi đăng bài viết thành công
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
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Tạo post</h2>
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
              ref={textareaRef}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Nguyen Phan Hoang Quan - 22DTHH2 - 2280602604"
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
                    setLastUploadedImage(null);
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
                Thêm vào post
              </div>
              <div className="flex items-center gap-4">
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
                  className="text-zinc-500 hover:text-emerald-500 transition-colors rounded-full p-2 relative"
                  onClick={() => imageInputRef.current?.click()}
                  title="Add photo"
                  disabled={uploading}
                >
                  <ImageIcon className="w-6 h-6" />
                  {uploading && mediaType === "image" && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                    </span>
                  )}
                </button>

                {/* Video upload button */}
                <button 
                  type="button"
                  className="text-zinc-500 hover:text-emerald-500 transition-colors rounded-full p-2 relative"
                  onClick={() => videoInputRef.current?.click()}
                  title="Add video"
                  disabled={uploading}
                >
                  <Video className="w-6 h-6" />
                  {uploading && mediaType === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                    </span>
                  )}
                </button>
                
                {/* Thêm nút tạo caption bằng AI */}
                {mediaType === "image" && (
                  <button 
                    type="button"
                    className="text-zinc-500 hover:text-violet-500 transition-colors rounded-full p-2 relative"
                    onClick={handleGenerateCaption}
                    title="Tạo caption bằng AI"
                    disabled={generatingCaption || !lastUploadedImage}
                  >
                    <Wand2 className="w-6 h-6" />
                    {generatingCaption && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></span>
                      </span>
                    )}
                  </button>
                )}

                {/* Emoji button */}
                <div className="relative">
                  <button 
                    type="button"
                    className="text-zinc-500 hover:text-emerald-500 transition-colors rounded-full p-2"
                    title="Add emoji"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="w-6 h-6" />
                  </button>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div 
                      ref={emojiPickerRef}
                      className="absolute right-0 bottom-12 z-50 shadow-lg dark:shadow-zinc-800/30"
                    >
                      <EmojiPicker 
                        onEmojiClick={handleEmojiClick}
                        lazyLoadEmojis={true}
                        searchDisabled={false}
                        skinTonesDisabled={false}
                        width={300}
                        height={400}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Post Button */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={isPending || uploading || generatingCaption || (!desc.trim() && !media)}
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