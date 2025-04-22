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
          <div className="absolute top-8 right-0 bg-zinc-900 p-4 w-40 rounded-xl flex flex-col gap-3 text-sm shadow-lg border border-zinc-800 z-30">
            <button 
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => setOpen(false)}
              type="button"
            >
              <Eye className="w-4 h-4 text-white group-hover:text-emerald-500 transition-colors" />
              <span className="text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 animate-gradient-slow bg-[length:200%_auto]">View</span>
            </button>
            
            <button 
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => {
                setOpen(false);
                setIsEditing(true);
              }}
              type="button"
            >
              <Edit className="w-4 h-4 text-white group-hover:text-emerald-500 transition-colors" />
              <span className="text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 animate-gradient-slow bg-[length:200%_auto]">Edit</span>
            </button>
            
            <button 
              className="flex items-center gap-2 group cursor-pointer"
              type="button"
              onClick={handleDeleteClick}
            >
              <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-400 transition-colors" />
              <span className="text-red-500 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-gradient-slow bg-[length:200%_auto]">Delete</span>
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