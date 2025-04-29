"use client";

import { switchLike } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import { useOptimistic, useState, useEffect } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import PostDetail from "./PostDetail";
import { Post, User, Comment } from "@prisma/client";
import { useRouter } from "next/navigation";

const PostInteraction = ({
  postId,
  likes,
  commentNumber,
  post,
}: {
  postId: number;
  likes: string[];
  commentNumber: number;
  post: Post & { user: User; comments: (Comment & { user: User })[]; currentUserId?: string };
}) => {
  const { userId } = useAuth();
  const [showPostDetail, setShowPostDetail] = useState(false);
  const router = useRouter();
  
  const currentUserId = userId || post.currentUserId || '';
  
  const [likeState, setLikeState] = useState({
    likeCount: likes.length,
    isLiked: currentUserId ? likes.includes(currentUserId) : false,
  });

  // Update likeState when likes prop changes
  useEffect(() => {
    setLikeState({
      likeCount: likes.length,
      isLiked: currentUserId ? likes.includes(currentUserId) : false,
    });
  }, [likes, currentUserId]);

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
    if (!currentUserId) return;
    
    // Apply optimistic update for immediate UI feedback
    switchOptimisticLike("");
    
    try {
      // Call the server action
      await switchLike(postId);

      // Update state with our calculated values
      setLikeState({
        likeCount: likes.includes(currentUserId) ? likes.length - 1 : likes.length + 1,
        isLiked: !likes.includes(currentUserId)
      });
      
      // Refresh the feed to get updated likes
      router.refresh();
    } catch (err) {
      console.error("Error liking post:", err);
      // Revert optimistic update if there was an error
      setLikeState({
        likeCount: likes.length,
        isLiked: likes.includes(currentUserId)
      });
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
        <div className="flex items-center gap-4 bg-zinc-100/80 dark:bg-zinc-800/50 px-4 py-2 rounded-xl group cursor-pointer" onClick={() => setShowPostDetail(true)}>
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
      {showPostDetail && (
        <PostDetail
          post={post}
          onClose={() => setShowPostDetail(false)}
        />
      )}
    </div>
  );
};

export default PostInteraction;