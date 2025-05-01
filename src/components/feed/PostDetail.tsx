"use client";

import { Post, User, Comment } from "@prisma/client";
import Image from "next/image";
import { X } from "lucide-react";
import CommentList from "./CommentList";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { getPostComments } from "@/lib/actions/comment";
import PostInteraction from "./PostInteraction";

type CommentWithUser = Comment & {
  user: User;
  likes?: number;
  replies?: CommentWithUser[];
};

type LikeType = {
  userId: string;
};

type PostWithUserAndComments = Post & {
  user: User;
  comments: CommentWithUser[];
  likes?: LikeType[];
  currentUserId?: string;
};

export default function PostDetail({
  post,
  onClose,
}: {
  post: PostWithUserAndComments;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [comments, setComments] = useState<CommentWithUser[]>(post.comments || []);
  const [postLikes, setPostLikes] = useState<string[]>(post.likes?.map(like => like.userId) || []);
  // State to track whether the full description is shown
  const [isExpanded, setIsExpanded] = useState(false);
  // State to track post content for updates
  const [postContent, setPostContent] = useState({
    desc: post.desc,
    img: post.img,
    video: post.video
  });
  
  // Calculate initial comment count including replies
  const calculateTotalComments = useCallback((commentList: CommentWithUser[]) => {
    let total = 0;
    commentList.forEach(comment => {
      total++; // Count the parent comment
      if (comment.replies && Array.isArray(comment.replies)) {
        total += comment.replies.length; // Add reply count
      }
    });
    return total;
  }, []);
  
  // State to track comment count
  const [commentCount, setCommentCount] = useState(calculateTotalComments(comments));
  
  // Configure the character limit for truncation
  const MAX_CHARS = 150;
  
  // Determine if the description needs truncation
  const needsTruncation = postContent.desc && postContent.desc.length > MAX_CHARS;
  
  // Get the truncated or full description depending on expanded state
  const getDisplayedDesc = () => {
    if (!postContent.desc) return "";
    if (isExpanded || !needsTruncation) return postContent.desc;
    return postContent.desc.substring(0, MAX_CHARS) + "...";
  };

  // Handle post update events
  const handlePostUpdate = useCallback((event: Event) => {
    const { postId, updatedPost } = (event as CustomEvent).detail;
    
    if (postId === post.id && updatedPost) {
      // Update post content with the new data
      setPostContent({
        desc: updatedPost.desc || "",
        img: updatedPost.img || null,
        video: updatedPost.video || null
      });
      
      // Reset expanded state when description changes
      setIsExpanded(false);
    }
  }, [post.id]);

  // Handle like update events
  const handleLikeUpdate = useCallback((event: Event) => {
    const { postId, userId, isLiked } = (event as CustomEvent).detail;
    
    if (postId === post.id) {
      setPostLikes(prevLikes => {
        if (isLiked) {
          // Add like if not already present
          if (!prevLikes.includes(userId)) {
            return [...prevLikes, userId];
          }
        } else {
          // Remove like
          return prevLikes.filter(likeId => likeId !== userId);
        }
        return prevLikes;
      });
    }
  }, [post.id]);

  // Thêm handleDeletePost để xử lý sự kiện khi bài viết bị xóa
  const handleDeletePost = useCallback((event: Event) => {
    const { postId } = (event as CustomEvent).detail;
    
    if (postId === post.id) {
      // Đóng modal khi bài viết bị xóa
      onClose();
    }
  }, [post.id, onClose]);

  // Function to reload comments
  const refreshComments = useCallback(async () => {
    try {
      const updatedComments = await getPostComments(post.id);
      if (updatedComments) {
        setComments(updatedComments);
        setCommentCount(calculateTotalComments(updatedComments));
      }
    } catch (error) {
      console.error("Error refreshing comments:", error);
    }
  }, [post.id, calculateTotalComments]);

  // Thêm handleCommentUpdate để xử lý sự kiện khi comment được thêm/xóa
  const handleCommentUpdate = useCallback((event: Event) => {
    const { postId: eventPostId, action } = (event as CustomEvent).detail;
    
    if (eventPostId === post.id) {
      // Cập nhật số lượng comment tức thì
      setCommentCount(prevCount => {
        if (action === 'add') {
          return prevCount + 1;
        } else if (action === 'delete') {
          return Math.max(0, prevCount - 1);
        }
        return prevCount;
      });
      
      // Sau đó cập nhật toàn bộ danh sách comments
      refreshComments();
    }
  }, [post.id, refreshComments]);

  useEffect(() => {
    setMounted(true);
    
    // Add event listeners
    window.addEventListener('likeUpdate', handleLikeUpdate);
    window.addEventListener('deletePost', handleDeletePost);
    window.addEventListener('commentUpdate', handleCommentUpdate);
    window.addEventListener('postUpdate', handlePostUpdate);
    
    return () => {
      setMounted(false);
      window.removeEventListener('likeUpdate', handleLikeUpdate);
      window.removeEventListener('deletePost', handleDeletePost);
      window.removeEventListener('commentUpdate', handleCommentUpdate);
      window.removeEventListener('postUpdate', handlePostUpdate);
    };
  }, [handleLikeUpdate, handleDeletePost, handleCommentUpdate, handlePostUpdate]);

  // Cập nhật likes từ prop post khi có thay đổi
  useEffect(() => {
    if (post.likes) {
      const likeUserIds = post.likes.map(like => like.userId);
      setPostLikes(likeUserIds);
    }
  }, [post.likes]);

  // Cập nhật comments từ prop post khi có thay đổi
  useEffect(() => {
    if (post.comments) {
      setComments(post.comments);
      setCommentCount(calculateTotalComments(post.comments));
    }
  }, [post.comments, calculateTotalComments]);

  // Sử dụng useEffect để lắng nghe sự thay đổi của postId và cập nhật dữ liệu
  useEffect(() => {
    refreshComments();
  }, [post.id, refreshComments]);

  // Update commentCount whenever comments change
  useEffect(() => {
    setCommentCount(calculateTotalComments(comments));
  }, [comments, calculateTotalComments]);

  if (!mounted) return null;

  // Create a version of the post with updated comments and likes
  const postWithUpdatedData = {
    ...post,
    desc: postContent.desc,
    img: postContent.img,
    video: postContent.video,
    comments: comments,
    likes: postLikes.map(userId => ({ userId })),
    _count: {
      comments: commentCount,
      likes: postLikes.length
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 flex flex-col relative">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Post</h2>
          <button 
            title="Close"
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {/* Post Content */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <Link 
                href={`/profile/${post.user.username}`} 
                className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-100 dark:ring-zinc-800 cursor-pointer group"
              >
                <Image
                  src={post.user.avatar || "/noAvatar.png"}
                  fill
                  alt=""
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </Link>
              <div>
                <Link 
                  href={`/profile/${post.user.username}`}
                  className="relative group"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 cursor-pointer transition-all duration-500 animate-gradient-slow bg-[length:200%_auto]">
                    {post.user.name && post.user.surname
                      ? post.user.name + " " + post.user.surname
                      : post.user.username}
                  </span>
                </Link>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}
                </div>
              </div>
            </div>

            {postContent.desc && (
              <div className="mb-4">
                <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
                  {getDisplayedDesc()}
                </p>
                {needsTruncation && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="text-emerald-600 dark:text-emerald-500 font-medium text-sm mt-1 hover:underline focus:outline-none"
                  >
                    {isExpanded ? "See less" : "See more"}
                  </button>
                )}
              </div>
            )}

            {postContent.img && (
              <div className="rounded-xl overflow-hidden mb-4">
                <Image
                  src={postContent.img}
                  width={1200}
                  height={800}
                  alt=""
                  className="w-full h-auto"
                />
              </div>
            )}

            {postContent.video && (
              <div className="rounded-xl overflow-hidden mb-4 bg-zinc-900">
                <video
                  src={postContent.video}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          {/* Post Interaction */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <PostInteraction
              postId={post.id}
              likes={postLikes}
              commentNumber={commentCount}
              post={postWithUpdatedData}
            />
          </div>

          {/* Comments Section */}
          <div className="p-4 pb-8">
            <CommentList 
              comments={comments} 
              postId={post.id} 
              showAll={true} 
              post={postWithUpdatedData}
              onCommentAdded={refreshComments}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
} 