"use client";

import { switchLike } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import { useOptimistic, useState, useEffect } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";

const PostInteraction = ({
  postId,
  likes,
  commentNumber,
}: {
  postId: number;
  likes: string[];
  commentNumber: number;
}) => {
  const { userId } = useAuth();
  const [likeState, setLikeState] = useState({
    likeCount: likes.length,
    isLiked: userId ? likes.includes(userId) : false,
  });

  useEffect(() => {
    setLikeState({
      likeCount: likes.length,
      isLiked: userId ? likes.includes(userId) : false,
    });
  }, [likes, userId]);

  const [optimisticLike, switchOptimisticLike] = useOptimistic(
    likeState,
    (state) => {
      return {
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      };
    }
  );

  const likeAction = async () => {
    if (!userId) return;
    
    switchOptimisticLike("");
    try {
      switchLike(postId);
      setLikeState((state) => ({
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      }));
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex gap-4">
        <div className="flex items-center gap-4 bg-zinc-100/80 dark:bg-zinc-800/50 px-4 py-2 rounded-xl group">
          <form action={likeAction}>
            <button title="Like Post" className="hover:scale-110 transition-transform">
              <Heart
                className={`w-4 h-4 cursor-pointer transition-colors ${
                  optimisticLike.isLiked 
                    ? "fill-emerald-500 text-emerald-500 dark:fill-emerald-400 dark:text-emerald-400" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400"
                }`}
              />
            </button>
          </form>
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <span className="text-zinc-500 dark:text-zinc-400">
            {optimisticLike.likeCount}
            <span className="hidden md:inline ml-1">Likes</span>
          </span>
        </div>
        <div className="flex items-center gap-4 bg-zinc-100/80 dark:bg-zinc-800/50 px-4 py-2 rounded-xl group">
          <MessageCircle className="w-4 h-4 cursor-pointer text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <span className="text-zinc-500 dark:text-zinc-400">
            {commentNumber}<span className="hidden md:inline ml-1">Comments</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-zinc-100/80 dark:bg-zinc-800/50 px-4 py-2 rounded-xl group">
        <Share2 className="w-4 h-4 cursor-pointer text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
        <span className="text-zinc-300 dark:text-zinc-600">|</span>
        <span className="text-zinc-500 dark:text-zinc-400">
          <span className="hidden md:inline">Share</span>
        </span>
      </div>
    </div>
  );
};

export default PostInteraction;