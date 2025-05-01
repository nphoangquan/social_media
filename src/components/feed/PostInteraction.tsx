"use client";

import { switchLike } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import { useOptimistic, useState, useEffect, useCallback } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import PostDetail from "./PostDetail";
import ShareModal from "./ShareModal";
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
  const [showShareModal, setShowShareModal] = useState(false);
  const router = useRouter();
  
  const currentUserId = userId || post.currentUserId || '';
  
  const [likeState, setLikeState] = useState({
    likeCount: likes.length,
    isLiked: currentUserId ? likes.includes(currentUserId) : false,
  });
  
  // State để theo dõi số lượng comment
  const [currentCommentCount, setCurrentCommentCount] = useState(commentNumber);

  // Update likeState when likes prop changes
  useEffect(() => {
    setLikeState({
      likeCount: likes.length,
      isLiked: currentUserId ? likes.includes(currentUserId) : false,
    });
  }, [likes, currentUserId]);
  
  // Update comment count from props
  useEffect(() => {
    setCurrentCommentCount(commentNumber);
  }, [commentNumber]);

  // Handler cho sự kiện thêm comment
  const handleCommentUpdate = useCallback((event: Event) => {
    const { postId: eventPostId, action } = (event as CustomEvent).detail;
    
    if (eventPostId === postId) {
      setCurrentCommentCount(prevCount => {
        if (action === 'add') {
          return prevCount + 1;
        } else if (action === 'delete') {
          return Math.max(0, prevCount - 1);
        }
        return prevCount;
      });
    }
  }, [postId]);

  // Đăng ký lắng nghe sự kiện comment
  useEffect(() => {
    window.addEventListener('commentUpdate', handleCommentUpdate);
    
    return () => {
      window.removeEventListener('commentUpdate', handleCommentUpdate);
    };
  }, [handleCommentUpdate]);

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
    if (!currentUserId) {
      router.push('/sign-in');
      return;
    }
    
    // Apply optimistic update for immediate UI feedback
    switchOptimisticLike("");
    
    try {
      // Call the server action
      await switchLike(postId);

      // Directly update the likes array in memory so we have the correct state
      const updatedLikes = likeState.isLiked 
        ? likes.filter(id => id !== currentUserId) 
        : [...likes, currentUserId];

      // Update state with the new likes array
      setLikeState({
        likeCount: updatedLikes.length,
        isLiked: updatedLikes.includes(currentUserId)
      });
      
      // Trigger a custom event to notify other components about the like update
      const likeUpdateEvent = new CustomEvent('likeUpdate', {
        detail: { postId, userId: currentUserId, isLiked: !likeState.isLiked }
      });
      window.dispatchEvent(likeUpdateEvent);
      
      // Force refresh the data
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

  const handleShare = () => {
    // Ensure user is authenticated to share
    if (!currentUserId) {
      router.push('/sign-in');
      return;
    }
    
    setShowShareModal(true);
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
            {currentCommentCount}<span className="hidden md:inline ml-1">Comments</span>
          </span>
        </div>
      </div>
      <div 
        className="flex items-center gap-4 bg-zinc-100/80 dark:bg-zinc-800/50 px-4 py-2 rounded-xl group cursor-pointer"
        onClick={handleShare}
      >
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
      {showShareModal && (
        <ShareModal
          postId={postId}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default PostInteraction;