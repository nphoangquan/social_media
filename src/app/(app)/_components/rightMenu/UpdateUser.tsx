"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Image as ImageIcon } from "lucide-react";
import { env } from "@/shared/config/env";
import { updateUserAvatar } from "@/lib/actions";
import type { User } from "@prisma/client";

const UpdateUser = ({ user }: { user: User }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(user.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatar(user.avatar || null);
  }, [user.avatar]);

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "social-media");
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${env.client.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.secure_url as string;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const url = await uploadToCloudinary(file);
      setAvatar(url);
    } catch (err) {
      setError("Failed to upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (avatar) {
        await updateUserAvatar(avatar);
      }
      setOpen(false);
    } catch (err) {
      setError("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs"
      >
        Update
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Update Profile</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Close dialog" title="Close dialog">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-zinc-100 dark:ring-zinc-800">
                  <Image src={avatar || "/noAvatar.png"} alt="Avatar" fill className="object-cover" />
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Change avatar
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateUser;



