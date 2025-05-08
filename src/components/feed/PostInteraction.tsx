"use client";

import { switchLike } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import PostDetail from "./PostDetail";
import ShareModal from "./ShareModal";
import { Post, User, Comment } from "@prisma/client";
import { useRouter } from "next/navigation";
import ReportPostButton from "./ReportPostButton";

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

  // Store optimistic like state internally
  const [optimisticLikeState, setOptimisticLikeState] = useState({
    likeCount: likes.length,
    isLiked: currentUserId ? likes.includes(currentUserId) : false,
  });

  // Update likeState when likes prop changes
  useEffect(() => {
    const newState = {
      likeCount: likes.length,
      isLiked: currentUserId ? likes.includes(currentUserId) : false,
    };
    
    setLikeState(newState);
    setOptimisticLikeState(newState);
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

  // Listen for like updates from other components
  const handleLikeUpdate = useCallback((event: Event) => {
    const { postId: eventPostId, userId: eventUserId, isLiked } = (event as CustomEvent).detail;
    
    if (eventPostId === postId && eventUserId === currentUserId) {
      // Update optimistic state when an event is received from other components
      setOptimisticLikeState(prev => ({
        likeCount: isLiked ? prev.likeCount + 1 : prev.likeCount - 1,
        isLiked: isLiked
      }));
    }
  }, [postId, currentUserId]);

  // Đăng ký lắng nghe sự kiện comment
  useEffect(() => {
    window.addEventListener('commentUpdate', handleCommentUpdate);
    window.addEventListener('likeUpdate', handleLikeUpdate);
    
    return () => {
      window.removeEventListener('commentUpdate', handleCommentUpdate);
      window.removeEventListener('likeUpdate', handleLikeUpdate);
    };
  }, [handleCommentUpdate, handleLikeUpdate]);

  const likeAction = async () => {
    if (!currentUserId) {
      router.push('/sign-in');
      return;
    }
    
    // Apply optimistic update for immediate UI feedback
    const newIsLiked = !optimisticLikeState.isLiked;
    const newLikeCount = newIsLiked 
      ? optimisticLikeState.likeCount + 1 
      : optimisticLikeState.likeCount - 1;
    
    // Update optimistic state immediately for local UI
    setOptimisticLikeState({
      likeCount: newLikeCount,
      isLiked: newIsLiked
    });
    
    // Dispatch event to notify other components
    const likeUpdateEvent = new CustomEvent('likeUpdate', {
      detail: { 
        postId, 
        userId: currentUserId, 
        isLiked: newIsLiked 
      }
    });
    window.dispatchEvent(likeUpdateEvent);
    
    try {
      // Call the server action
      await switchLike(postId);
      
      // Update actual state with optimistic values on success
      setLikeState({
        likeCount: newLikeCount,
        isLiked: newIsLiked
      });
      
      // Refresh data in background without blocking UI
      router.refresh();
    } catch (err) {
      console.error("Error liking post:", err);
      
      // Revert optimistic update if there was an error
      setOptimisticLikeState(likeState);
      
      // Dispatch event to revert changes in other components
      const revertEvent = new CustomEvent('likeUpdate', {
        detail: { 
          postId, 
          userId: currentUserId, 
          isLiked: likeState.isLiked 
        }
      });
      window.dispatchEvent(revertEvent);
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

  // Check if the current user is the owner of the post
  const isOwner = currentUserId === post.userId;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <div className="flex items-center gap-4 bg-zinc-100/80 dark:bg-zinc-800/50 px-4 py-2 rounded-xl group">
            <button 
              title="Like Post" 
              className="hover:scale-110 transition-transform"
              onClick={(e) => {
                e.preventDefault();
                likeAction();
              }}
            >
              <Heart
                className={`w-4 h-4 cursor-pointer transition-colors ${
                  optimisticLikeState.isLiked 
                    ? "fill-emerald-500 text-emerald-500 dark:fill-emerald-400 dark:text-emerald-400" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400"
                }`}
              />
            </button>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {optimisticLikeState.likeCount}
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
        <div className="flex gap-2">
          {!isOwner && (
            <div className="hidden sm:flex items-center bg-zinc-100/80 dark:bg-zinc-800/50 px-3 py-2 rounded-xl">
              <ReportPostButton postId={postId} variant="compact" />
            </div>
          )}
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
        </div>
      </div>
      
      {!isOwner && (
        <div className="flex sm:hidden justify-end">
          <ReportPostButton postId={postId} />
        </div>
      )}
      
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