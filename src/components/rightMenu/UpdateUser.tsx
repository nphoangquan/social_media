"use client";

import { updateProfile } from "@/lib/actions";
import { User } from "@prisma/client";
import Image from "next/image";
import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import UpdateButton from "./UpdateButton";

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

const UpdateUser = ({ user }: { user: User }) => {
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState<CloudinaryResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction] = useActionState(updateProfile, {
    success: false,
    error: false,
  });

  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    if (state.success) {
      router.refresh();
    }
  };

  const uploadToCloudinary = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'social-media');
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setCover({
        secure_url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
        resource_type: 'image'
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Kiểm tra kích thước file (tối đa 25MB)
    if (file.size > 25 * 1024 * 1024) {
      alert("File quá lớn. Kích thước tối đa là 25MB");
      return;
    }
    
    // Kiểm tra file có phải là ảnh không
    if (!file.type.startsWith('image/')) {
      alert("Chỉ hỗ trợ file ảnh");
      return;
    }
    
    uploadToCloudinary(file);
  };

  return (
    <div className="">
      <span
        className="text-emerald-500 text-xs cursor-pointer hover:underline hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
        onClick={() => setOpen(true)}
      >
        Update
      </span>
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <form
            action={(formData) =>
              formAction({ formData, cover: cover?.secure_url || "" })
            }
            className="p-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 flex flex-col gap-4 w-full md:w-1/2 xl:w-1/3 relative"
          >
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Update Profile</h1>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Use the navbar profile to change the avatar or username.
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            <div
              className="flex flex-col gap-2 my-2 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <label className="text-xs text-zinc-600 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Cover Picture
              </label>
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 rounded-md overflow-hidden shadow-sm relative group-hover:shadow-md transition-all">
                  <Image
                    src={cover?.secure_url || user.cover || "/noCover.png"}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <span className="text-xs underline text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {uploading ? "Uploading..." : "Change"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4">
              {["name", "surname", "description", "city", "school", "work", "website"].map((field) => {
                const fieldValue = user[field as keyof User];
                const placeholder = typeof fieldValue === 'string' ? fieldValue : '';
                
                return (
                  <div key={field} className="flex flex-col gap-1 w-full md:w-[48%]">
                    <label htmlFor={field} className="text-xs text-zinc-600 dark:text-zinc-300">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      name={field}
                      className="ring-1 ring-zinc-300 dark:ring-zinc-600 p-[13px] rounded-md text-sm bg-transparent text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:outline-none transition-colors"
                    />
                  </div>
                );
              })}
              <div className="flex flex-col gap-1 w-full md:w-[48%]">
                <label htmlFor="birthDate" className="text-xs text-zinc-600 dark:text-zinc-300">
                  Birth Date
                </label>
                <input
                  type="date"
                  name="birthDate"
                  defaultValue={user.birthDate ? new Date(user.birthDate).toISOString().slice(0, 10) : ''}
                  className="ring-1 ring-zinc-300 dark:ring-zinc-600 p-[13px] rounded-md text-sm bg-transparent text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <UpdateButton />
            {state.success && (
              <span className="text-emerald-500 text-sm">Profile has been updated!</span>
            )}
            {state.error && (
              <span className="text-red-500 text-sm">Something went wrong!</span>
            )}
            <div
              className="absolute text-xl right-4 top-4 text-zinc-600 dark:text-zinc-300 cursor-pointer hover:text-red-500 transition-colors"
              onClick={handleClose}
            >
              ×
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdateUser;