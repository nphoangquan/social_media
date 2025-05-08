"use client";

import { Post, User, Comment } from "@prisma/client";
import Image from "next/image";
import { X } from "lucide-react";
import CommentList from "./CommentList";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import PostInteraction from "./PostInteraction";
import ReportPostButton from "./ReportPostButton";

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
  
  // States for infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  
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

  // Load initial comments
  const loadInitialComments = useCallback(async () => {
    try {
      setIsLoadingComments(true);
      const response = await fetch(`/api/comments?postId=${post.id}&page=1&limit=15`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data.comments);
      setHasMore(data.hasMore);
      setPage(1);
    } catch (error) {
      console.error("Error loading initial comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id]);

  // Load more comments
  const loadMoreComments = useCallback(async () => {
    try {
      if (!hasMore || isLoadingComments) return;
      
      setIsLoadingComments(true);
      const nextPage = page + 1;
      const response = await fetch(`/api/comments?postId=${post.id}&page=${nextPage}&limit=15`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch more comments');
      }
      
      const data = await response.json();
      
      if (data.comments.length > 0) {
        setComments(prevComments => [...prevComments, ...data.comments]);
        setPage(nextPage);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id, page, hasMore, isLoadingComments]);

  // Function to refresh comments after adding a new one
  const refreshComments = useCallback(() => {
    loadInitialComments();
  }, [loadInitialComments]);

  // Handle comment update events
  const handleCommentUpdate = useCallback((event: Event) => {
    const { postId: eventPostId, action, comment } = (event as CustomEvent).detail;
    
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
      
      // Thay vì tải lại toàn bộ comments, cập nhật trực tiếp vào state
      if (action === 'add' && comment) {
        // Thêm comment mới vào đầu danh sách nếu là comment gốc
        if (!comment.parentId) {
          setComments(prevComments => [comment, ...prevComments]);
        }
        // Không cần xử lý replies ở đây vì chúng sẽ hiển thị khi người dùng mở chi tiết comment
      } else if (action === 'delete' && comment) {
        // Xóa comment khỏi danh sách
        setComments(prevComments => 
          prevComments.filter(c => c.id !== comment.id)
        );
      }
    }
  }, [post.id]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (isLoadingComments) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreComments();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingComments, loadMoreComments]);

  useEffect(() => {
    setMounted(true);
    
    // Add event listeners
    window.addEventListener('likeUpdate', handleLikeUpdate);
    window.addEventListener('deletePost', handleDeletePost);
    window.addEventListener('commentUpdate', handleCommentUpdate);
    window.addEventListener('postUpdate', handlePostUpdate);
    
    // Load initial comments
    loadInitialComments();
    
    return () => {
      setMounted(false);
      window.removeEventListener('likeUpdate', handleLikeUpdate);
      window.removeEventListener('deletePost', handleDeletePost);
      window.removeEventListener('commentUpdate', handleCommentUpdate);
      window.removeEventListener('postUpdate', handlePostUpdate);
    };
  }, [handleLikeUpdate, handleDeletePost, handleCommentUpdate, handlePostUpdate, loadInitialComments]);

  // Cập nhật likes từ prop post khi có thay đổi
  useEffect(() => {
    if (post.likes) {
      const likeUserIds = post.likes.map(like => like.userId);
      setPostLikes(likeUserIds);
    }
  }, [post.likes]);

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
          <div className="flex items-center gap-3">
            {post.currentUserId && post.currentUserId !== post.userId && (
              <div className="text-zinc-600 dark:text-zinc-400">
                <ReportPostButton postId={post.id} />
              </div>
            )}
            <button 
              title="Close"
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
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
            
            {/* Post description */}
            {postContent.desc && (
              <div className="mb-4">
                <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
                  {getDisplayedDesc()}
                </p>
                {needsTruncation && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="text-emerald-600 dark:text-emerald-500 font-medium text-sm hover:underline focus:outline-none"
                  >
                    {isExpanded ? "See less" : "See more"}
                  </button>
                )}
              </div>
            )}
            
            {/* Post Image */}
            {postContent.img && (
              <div className="rounded-xl overflow-hidden mb-4">
                <Image 
                  src={postContent.img}
                  width={600}
                  height={400}
                  alt=""
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            
            {/* Post Video */}
            {postContent.video && (
              <div className="rounded-xl overflow-hidden mb-4">
                <video 
                  src={postContent.video}
                  controls
                  className="w-full h-auto"
                ></video>
              </div>
            )}
            
            {/* Post Interactions */}
            <div className="mt-2">
              <PostInteraction 
                postId={post.id}
                likes={postLikes}
                commentNumber={commentCount}
                post={postWithUpdatedData}
              />
            </div>
          </div>
          
          {/* Comments */}
          <div className="p-4 pb-8">
            <CommentList 
              comments={comments} 
              postId={post.id} 
              showAll={true} 
              post={postWithUpdatedData}
              onCommentAdded={refreshComments}
            />
            
            {/* Loader for infinite scroll */}
            {hasMore && (
              <div 
                ref={loadingRef} 
                className="py-4 text-center"
              >
                <div className="w-6 h-6 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  return createPortal(modalContent, document.body);
} 