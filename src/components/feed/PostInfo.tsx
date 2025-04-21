"use client";

import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/actions";
import { useState } from "react";
import { MoreVertical, Eye, Trash2, Edit } from "lucide-react";
import EditPostWidget from "./EditPostWidget";
import { Post, User } from "@prisma/client";

const PostInfo = ({ post }: { post: Post & { user: User } }) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleDeleteClick = async () => {
    try {
      setOpen(false);
      await deletePost(post.id);
      router.refresh();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  
  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
          aria-label="Post options"
        >
          <MoreVertical className="w-5 h-5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors" />
        </button>
        
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
              onClick={() => {
                setOpen(false);
                setIsEditing(true);
              }}
              type="button"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
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

      {isEditing && (
        <EditPostWidget
          post={post}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};

export default PostInfo;