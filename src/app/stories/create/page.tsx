"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Image as ImageIcon, Film } from "lucide-react";
import Image from "next/image";

export default function CreateStoryPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Kiểm tra kích thước file dựa trên loại file
    const isVideo = selectedFile.type.startsWith("video/");
    // 25MB cho ảnh, 100MB cho video
    const maxSize = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
    
    if (selectedFile.size > maxSize) {
      alert(`File is too large. Maximum size is ${isVideo ? '100MB' : '25MB'}.`);
      return;
    }

    // Kiểm tra loại file
    const type = selectedFile.type.startsWith("image/") ? "image" : "video";
    setFileType(type);
    setFile(selectedFile);

    // Tạo URL preview
    const url = URL.createObjectURL(selectedFile);
    setFilePreview(url);
    
    // Làm sạch URL khi component unmount
    return () => URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !fileType) return;

    try {
      setLoading(true);
      
      // Tải lên trực tiếp đến Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'social-media');
      
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${fileType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!uploadResponse.ok) {
        throw new Error('Upload to Cloudinary failed');
      }
      
      const uploadData = await uploadResponse.json();
      
      // Gửi URL Cloudinary đến API của chúng tôi
      const apiFormData = new FormData();
      apiFormData.append("fileType", fileType);
      apiFormData.append("fileData", uploadData.secure_url);
      
      // Tải lên đến server
      const response = await fetch("/api/stories", {
        method: "POST",
        body: apiFormData,
      });
      
      if (response.ok) {
        setTimeout(() => {
          router.refresh(); // Làm mới dữ liệu
          router.push("/stories");
        }, 0);
      } else {
        const data = await response.json();
        alert(`Failed to create story: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating story:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 rounded-lg">
      <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-zinc-100">Tạo Story</h1>
          <button 
            onClick={() => router.push("/stories")}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {filePreview ? (
            <div className="relative aspect-[9/16] mb-4 rounded-xl overflow-hidden">
              {fileType === "image" ? (
                <Image 
                  src={filePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <video 
                  src={filePreview}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                />
              )}
              
              <button 
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-full transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <div 
              className="aspect-[9/16] mb-4 rounded-xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center p-6 cursor-pointer hover:border-emerald-500/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400 text-center mb-2">Kéo và thả hoặc bấm để tải lên</p>
              <p className="text-zinc-500 text-sm text-center">Tải lên hình ảnh hoặc video cho story</p>
              
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2 text-emerald-500 text-sm">
                  <ImageIcon className="w-4 h-4" />
                  <span>Image (max 25MB)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 text-sm">
                  <Film className="w-4 h-4" />
                  <span>Video (max 100MB)</span>
                </div>
              </div>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
          
          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-3 relative overflow-hidden group rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Background with neon emerald color */}
            <div className="absolute inset-0 bg-emerald-600 group-hover:bg-emerald-500 transition-colors duration-300"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent -translate-x-full animate-shimmer group-hover:animate-[shimmer_1.5s_infinite]"></div>
            
            {/* Content */}
            <span className="relative z-10 text-white font-medium">
              {loading ? "Creating..." : "Tạo Story"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
} 