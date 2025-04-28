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

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    // Check file type
    const type = selectedFile.type.startsWith("image/") ? "image" : "video";
    setFileType(type);
    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !filePreview) return;

    try {
      setLoading(true);
      
      // Create form data with base64 data
      const formData = new FormData();
      formData.append("fileType", fileType || "");
      formData.append("fileData", filePreview);
      
      // Upload to server
      const response = await fetch("/api/stories", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        setTimeout(() => {
          router.refresh(); // Refresh data
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-zinc-100">Create Story</h1>
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
              <p className="text-zinc-400 text-center mb-2">Drag and drop or click to upload</p>
              <p className="text-zinc-500 text-sm text-center">Upload an image or video for your story</p>
              
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2 text-emerald-500 text-sm">
                  <ImageIcon className="w-4 h-4" />
                  <span>Image</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 text-sm">
                  <Film className="w-4 h-4" />
                  <span>Video</span>
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
              {loading ? "Creating..." : "Create Story"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
} 