"use client";

import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/actions";
import { useState } from "react";
import { MoreVertical, Eye, Share2, Trash2 } from "lucide-react";

const PostInfo = ({ postId }: { postId: number }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDeleteClick = async () => {
    try {
      setOpen(false);
      await deletePost(postId);
      router.refresh();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  
  return (
    <div className="relative">
      <MoreVertical
        className="w-5 h-5 cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <div className="absolute top-8 right-0 bg-white dark:bg-zinc-800 p-4 w-40 rounded-xl flex flex-col gap-3 text-sm shadow-lg border border-zinc-100 dark:border-zinc-700/50 z-30">
          <button 
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            onClick={() => setOpen(false)}
            type="button"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          
          <button 
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            onClick={() => setOpen(false)}
            type="button"
          >
            <Share2 className="w-4 h-4" />
            <span>Re-post</span>
          </button>
          
          <button 
            className="flex items-center gap-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 transition-colors cursor-pointer"
            type="button"
            onClick={handleDeleteClick}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PostInfo;