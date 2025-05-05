"use client";

import { addComment, deleteComment, switchCommentLike } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { Comment, User, Post } from "@prisma/client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Send, MessageCircle, Trash2, Heart } from "lucide-react";
import PostDetail from "./PostDetail";
import dynamic from "next/dynamic";
import { useUserAvatar } from "@/lib/hooks/useUserAvatar";
import TranslateButton from "../common/TranslateButton";

type CommentWithUser = Comment & { 
  user: User;
  replies?: CommentWithUser[];
  likes?: number;
  likedByCurrentUser?: boolean;
  _hasLikeInteraction?: boolean;
};

export default dynamic(() => Promise.resolve(CommentList), { ssr: false });

function CommentList({
  comments,
  postId,
  showAll = false,
  post,
  onCommentAdded,
  highlightCommentId,
  onViewAllCommentsClick,
}: {
  comments: CommentWithUser[];
  postId: number;
  showAll?: boolean;
  post: Post & { user: User };
  onCommentAdded?: () => void;
  highlightCommentId?: number;
  onViewAllCommentsClick?: () => void;
}) {
  const { user } = useUser();
  const { avatarUrl } = useUserAvatar();
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [optimisticComments, setOptimisticComments] = useState<CommentWithUser[]>(comments);
  const [showPostDetail, setShowPostDetail] = useState(false);
  
  // Listen for comment like updates
  useEffect(() => {
    const handleCommentLikeUpdate = (event: Event) => {
      const { commentId, isLiked } = (event as CustomEvent).detail;
      
      // Update the comment like status
      setOptimisticComments(prevComments => {
        return prevComments.map(comment => {
          // Check if this is the commented comment
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: isLiked 
                ? (typeof comment.likes === 'number' ? comment.likes + 1 : 1) 
                : (typeof comment.likes === 'number' ? Math.max(0, comment.likes - 1) : 0),
              likedByCurrentUser: isLiked,
              // Add a flag to indicate this comment has been interacted with
              _hasLikeInteraction: true
            };
          }
          
          // Check replies
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    likes: isLiked 
                      ? (typeof reply.likes === 'number' ? reply.likes + 1 : 1) 
                      : (typeof reply.likes === 'number' ? Math.max(0, reply.likes - 1) : 0),
                    likedByCurrentUser: isLiked,
                    // Add a flag to indicate this reply has been interacted with
                    _hasLikeInteraction: true
                  };
                }
                return reply;
              })
            };
          }
          
          return comment;
        });
      });
    };
    
    // Add event listeners
    window.addEventListener('commentLikeUpdate', handleCommentLikeUpdate);
    
    // Clean up
    return () => {
      window.removeEventListener('commentLikeUpdate', handleCommentLikeUpdate);
    };
  }, []);
  
  // Update optimistic comments when props change
  useEffect(() => {
    // Merge new comments with existing ones to preserve interaction flags
    setOptimisticComments(prevComments => {
      // Create a map of existing comments with their interaction flags
      const existingCommentsMap = new Map();
      prevComments.forEach(comment => {
        const hasInteraction = comment._hasLikeInteraction;
        existingCommentsMap.set(comment.id, { 
          hasInteraction, 
          replies: new Map(
            (comment.replies || []).map(reply => [
              reply.id, 
              { hasInteraction: reply._hasLikeInteraction }
            ])
          ) 
        });
      });
      
      // Merge with new comments
      return comments.map(comment => {
        const existing = existingCommentsMap.get(comment.id);
        // If this comment has been interacted with, preserve the like state
        if (existing?.hasInteraction) {
          const prevComment = prevComments.find(c => c.id === comment.id);
          return {
            ...comment,
            likes: prevComment?.likes,
            likedByCurrentUser: prevComment?.likedByCurrentUser,
            _hasLikeInteraction: true,
            replies: (comment.replies || []).map(reply => {
              const replyInteraction = existing.replies.get(reply.id);
              if (replyInteraction?.hasInteraction) {
                const prevReply = prevComment?.replies?.find(r => r.id === reply.id);
                return {
                  ...reply,
                  likes: prevReply?.likes,
                  likedByCurrentUser: prevReply?.likedByCurrentUser,
                  _hasLikeInteraction: true
                };
              }
              return reply;
            })
          };
        }
        return comment;
      });
    });
  }, [comments]);
  
  // If highlightCommentId is provided, scroll to that comment
  useEffect(() => {
    if (highlightCommentId) {
      // Find highlighted comment element after render
      setTimeout(() => {
        const commentElement = document.getElementById(`comment-${highlightCommentId}`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [highlightCommentId]);
  
  // Calculate total number of comments including replies
  const calculateTotalCommentsCount = (commentsList: CommentWithUser[]) => {
    let totalCount = commentsList.length;
    commentsList.forEach(comment => {
      if (comment.replies && Array.isArray(comment.replies)) {
        totalCount += comment.replies.length;
      }
    });
    return totalCount;
  };
  
  // Get total count of all comments including replies
  const totalCommentsCount = calculateTotalCommentsCount(optimisticComments);
  
  // Sort comments by likes and get the most recent/popular ones
  const sortedComments = [...optimisticComments].sort((a, b) => 
    (b.likes || 0) - (a.likes || 0)
  );
  
  // Show all comments in sortedComments when in "showAll" mode
  // Otherwise, show only the first comment when total count > 1
  const displayedComments = showAll 
    ? sortedComments 
    : (sortedComments.length > 0 
        ? [sortedComments[0]] 
        : []);

  async function handleSubmit(formData: FormData) {
    if (!user) return;

    const desc = formData.get("comment") as string;
    const parentId = formData.get("parentId") as string;
    if (!desc?.trim()) return;

    // Create optimistic comment with current timestamp
    const now = new Date();
    const optimisticComment: CommentWithUser = {
      id: Math.random(),
      desc: desc.trim(),
      createdAt: now,
      updatedAt: now,
      userId: user.id,
      postId,
      parentId: parentId ? parseInt(parentId) : null,
      likes: 0,
      user: {
        id: user.id,
        username: user.username || "You",
        avatar: avatarUrl || "/noavatar.png",
        cover: "",
        description: "",
        name: user.firstName || "",
        surname: user.lastName || "",
        city: "",
        work: "",
        school: "",
        website: "",
        birthDate: null,
        createdAt: now,
      },
    };

    // Add new comment to the beginning of the list for immediate display
    const newOptimisticComments = [optimisticComment, ...optimisticComments];
    setOptimisticComments(newOptimisticComments);

    try {
      const newComment = await addComment(postId, desc.trim(), parentId ? parseInt(parentId) : null);
      (document.getElementById(`comment-form-${parentId || "root"}`) as HTMLFormElement)?.reset();
      setReplyingTo(null);
      
      // Dispatch a custom event to notify other components about the new comment
      if (newComment) {
        const commentUpdateEvent = new CustomEvent('commentUpdate', {
          detail: { 
            postId, 
            comment: newComment, 
            action: 'add',
            parentId: newComment.parentId 
          }
        });
        window.dispatchEvent(commentUpdateEvent);
      }
      
      // Call the callback to refresh comments from server
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  }

  const CommentItem = ({ comment, isOnlyVisibleComment = false }: { comment: CommentWithUser, isOnlyVisibleComment?: boolean }) => {
    const { user } = useUser();
    const { avatarUrl: replyAvatarUrl } = useUserAvatar();
    const isReplying = replyingTo === comment.id;
    const [showAllReplies, setShowAllReplies] = useState(isOnlyVisibleComment);
    const [isClient, setIsClient] = useState(false);
    const [formattedDate, setFormattedDate] = useState("");
    // State to track if comment text is expanded
    const [isCommentExpanded, setIsCommentExpanded] = useState(false);
    // State to track like status
    const [likeState, setLikeState] = useState({
      likeCount: typeof comment.likes === 'number' ? comment.likes : 0,
      isLiked: comment.likedByCurrentUser || false
    });
    // State to track if user has interacted with like
    const [userLikeInteracted, setUserLikeInteracted] = useState(false);
    // State to track if comment is translated
    const [isTranslated, setIsTranslated] = useState(false);
    // State to store translated comment
    const [translatedDesc, setTranslatedDesc] = useState("");
    
    // Update like state when comment props change, but only if user hasn't interacted
    useEffect(() => {
      if (!userLikeInteracted) {
        setLikeState({
          likeCount: typeof comment.likes === 'number' ? comment.likes : 0,
          isLiked: comment.likedByCurrentUser || false
        });
      }
    }, [comment.likes, comment.likedByCurrentUser, userLikeInteracted]);
    
    // Check if this comment is the one to highlight
    const isHighlighted = highlightCommentId === comment.id;
    
    // Configure the character limit for comment truncation
    const COMMENT_MAX_CHARS = 120;
    
    // Determine if the comment needs truncation
    const needsCommentTruncation = comment.desc && comment.desc.length > COMMENT_MAX_CHARS;
    
    // Get the truncated or full comment text depending on expanded state
    const getDisplayedCommentText = () => {
      // If translated, show translated content
      if (isTranslated) return translatedDesc;
      
      if (!comment.desc) return "";
      if (isCommentExpanded || !needsCommentTruncation) return comment.desc;
      return comment.desc.substring(0, COMMENT_MAX_CHARS) + "...";
    };
    
    // Handle translation
    const handleTranslated = (translatedText: string) => {
      setTranslatedDesc(translatedText);
      setIsTranslated(true);
      // When translated, always show full content
      setIsCommentExpanded(true);
    };

    // Handle reset translation
    const handleResetTranslation = () => {
      setIsTranslated(false);
      setTranslatedDesc("");
    };
    
    useEffect(() => {
      setIsClient(true);
      setFormattedDate(new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(comment.createdAt)));
    }, [comment.createdAt]);
    
    const displayedReplies = showAllReplies ? comment.replies : (comment.replies?.slice(0, 1) || []);

    const handleDeleteComment = async () => {
      try {
        await deleteComment(comment.id);
        
        // Dispatch an event for the comment deletion
        const commentUpdateEvent = new CustomEvent('commentUpdate', {
          detail: { 
            postId, 
            action: 'delete',
            parentId: comment.parentId
          }
        });
        window.dispatchEvent(commentUpdateEvent);
        
        // Call the callback to refresh comments from server
        if (onCommentAdded) {
          onCommentAdded();
        }
      } catch (err) {
        console.error("Failed to delete comment:", err);
      }
    };

    const handleLikeComment = async () => {
      if (!user) return;

      // Mark that user has interacted with like
      setUserLikeInteracted(true);
      
      // Store previous state for potential rollback
      const previousLikeState = {...likeState};
      
      // Apply optimistic update
      setLikeState(prev => ({
        likeCount: prev.isLiked ? Math.max(0, prev.likeCount - 1) : prev.likeCount + 1, 
        isLiked: !prev.isLiked
      }));

      // Dispatch event immediately for real-time updates
      const commentLikeEvent = new CustomEvent('commentLikeUpdate', {
        detail: { 
          commentId: comment.id, 
          isLiked: !likeState.isLiked,
          userId: user.id
        }
      });
      window.dispatchEvent(commentLikeEvent);
      
      // Call the server action in background without awaiting or catching here
      // to avoid UI flash - we'll handle errors in the Promise
      switchCommentLike(comment.id).catch(err => {
        console.error("Error liking comment:", err);
        // Revert optimistic update if there was an error
        setLikeState(previousLikeState);
        
        // Dispatch event to revert changes
        const revertEvent = new CustomEvent('commentLikeUpdate', {
          detail: { 
            commentId: comment.id, 
            isLiked: previousLikeState.isLiked,
            userId: user.id
          }
        });
        window.dispatchEvent(revertEvent);
      });
    };

    return (
      <div 
        id={`comment-${comment.id}`} 
        className={`space-y-2 ${isHighlighted ? 'animate-pulse bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg' : ''}`}
      >
        <div className="flex gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
            <Image
              src={comment.user.avatar || "/noavatar.png"}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className={`bg-zinc-100 dark:bg-zinc-800/50 rounded-lg px-3 py-2 ${isHighlighted ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : ''}`}>
              <div className="font-medium text-sm text-zinc-800 dark:text-zinc-200 mb-1">
                {comment.user.name && comment.user.surname
                  ? `${comment.user.name} ${comment.user.surname}`
                  : comment.user.username}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                <span className="whitespace-pre-line">{getDisplayedCommentText()}</span>
                {needsCommentTruncation && !isTranslated && (
                  <button 
                    onClick={() => setIsCommentExpanded(!isCommentExpanded)} 
                    className="text-emerald-600 dark:text-emerald-500 font-medium text-xs ml-1 hover:underline focus:outline-none inline-flex items-center"
                  >
                    <span>{isCommentExpanded ? "See less" : "See more"}</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-1 px-3">
              <button
                type="button"
                onClick={handleLikeComment}
                className={`text-xs ${likeState.isLiked 
                  ? "text-emerald-500 dark:text-emerald-400" 
                  : "text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400"} 
                  transition-colors flex items-center gap-1`}
              >
                <Heart className={`w-3 h-3 ${likeState.isLiked ? "fill-emerald-500 dark:fill-emerald-400" : ""}`} />
                <span>Like</span>
                {likeState.likeCount > 0 && <span>({likeState.likeCount})</span>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(comment.id);
                  // Reset expanded state when replying
                  if (isCommentExpanded) {
                    setIsCommentExpanded(false);
                  }
                }}
                className="text-xs text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
              >
                Reply
              </button>
              {comment.desc && comment.desc.length > 20 && (
                <TranslateButton 
                  text={comment.desc}
                  onTranslated={handleTranslated}
                  onReset={handleResetTranslation}
                  isTranslated={isTranslated}
                  size="sm"
                />
              )}
              {user?.id === comment.userId && (
                <button
                  type="button"
                  onClick={handleDeleteComment}
                  className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  title="Delete comment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                {isClient ? formattedDate : "Loading..."}
              </div>
            </div>
            {isReplying && user && (
              <div className="flex gap-2 mt-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
                  <Image
                    src={replyAvatarUrl || "/noavatar.png"}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <form
                  id={`comment-form-${comment.id}`}
                  action={handleSubmit}
                  className="flex-1 flex gap-2"
                >
                  <input type="hidden" name="parentId" value={comment.id} />
                  <input
                    name="comment"
                    placeholder={`Reply to ${comment.user.name || comment.user.username}...`}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-emerald-500/20 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-600 dark:text-zinc-300"
                  />
                  <button
                    type="submit"
                    aria-label="Send reply"
                    className="shrink-0 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <Send className="w-4 h-4 cursor-pointer" />
                  </button>
                </form>
              </div>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 mt-2 space-y-2 max-h-[300px] overflow-y-auto scrollbar-none">
                {displayedReplies?.map((reply) => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply}
                    isOnlyVisibleComment={false} 
                  />
                ))}
                {!showAllReplies && comment.replies && comment.replies.length > 1 && (
                  <button
                    onClick={() => setShowAllReplies(true)}
                    className="text-xs text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>View {comment.replies.length - 1} more {comment.replies.length - 1 === 1 ? 'reply' : 'replies'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {user && (
        <div className="flex gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
            <Image
              src={avatarUrl || "/noavatar.png"}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <form
            id="comment-form-root"
            action={handleSubmit}
            className="flex-1 flex gap-2"
          >
            <input
              name="comment"
              placeholder="Write a comment..."
              className="flex-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-emerald-500/20 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-600 dark:text-zinc-300"
            />
            <button
              type="submit"
              aria-label="Send comment"
              className="shrink-0 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Send className="w-4 h-4 cursor-pointer" />
            </button>
          </form>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-4">
        {displayedComments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            isOnlyVisibleComment={!showAll && displayedComments.length === 1 && totalCommentsCount > 1}
          />
        ))}
      </div>

      {/* View All Comments Button */}
      {!showAll && totalCommentsCount > 1 && (
        <button
          onClick={() => {
            if (onViewAllCommentsClick) {
              onViewAllCommentsClick();
            } else {
              setShowPostDetail(true);
            }
          }}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors mt-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>View all {totalCommentsCount} comments</span>
        </button>
      )}

      {/* Post Detail Modal */}
      {showPostDetail && (
        <PostDetail
          post={{
            ...post,
            comments: optimisticComments,
          }}
          onClose={() => setShowPostDetail(false)}
        />
      )}
    </div>
  );
}
