"use client";

import { Post, User, Comment } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import PostInteraction from "../feed/PostInteraction";
import CommentList from "../feed/CommentList";
import { ArrowLeft, MessageCircle, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import PostDetailModal from "../feed/PostDetail";
import { useSummarize } from "@/lib/hooks/useSummarize";
import TranslateButton from "../common/TranslateButton";

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
  standalone = false,
  highlightCommentId,
}: {
  post: PostWithUserAndComments;
  standalone?: boolean;
  highlightCommentId?: number;
}) {
  const [comments, setComments] = useState<CommentWithUser[]>(post.comments || []);
  const [postLikes, setPostLikes] = useState<string[]>(post.likes?.map(like => like.userId) || []);
  // State để hiển thị nội dung đã mở rộng
  const [isExpanded, setIsExpanded] = useState(false);
  // State để kiểm soát PostDetail modal visibility
  const [showPostDetail, setShowPostDetail] = useState(false);
  // State để kiểm soát xem có hiển thị tất cả comments hay không
  const [showAllComments, setShowAllComments] = useState(false);
  // State để kiểm soát nội dung đã tóm tắt
  const [isSummarized, setIsSummarized] = useState(false);
  // State để lưu nội dung gốc
  const [originalDesc, setOriginalDesc] = useState(post.desc || "");
  // State để lưu nội dung đã tóm tắt
  const [summarizedDesc, setSummarizedDesc] = useState("");
  // Hook cho tóm tắt
  const { generateSummary, loading: summarizing } = useSummarize();
  // State để kiểm soát nội dung đã dịch
  const [isTranslated, setIsTranslated] = useState(false);
  // State để lưu nội dung đã dịch
  const [translatedDesc, setTranslatedDesc] = useState("");
  
  // States cho cuộn vô hạn
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  
  // Cài đặt giới hạn ký tự cho cắt ngắn
  const MAX_CHARS = 150;
  
  // Xác định nếu nội dung cần cắt ngắn
  const needsTruncation = post.desc && post.desc.length > MAX_CHARS;
  
  // Đặt nội dung gốc khi post thay đổi
  useEffect(() => {
    setOriginalDesc(post.desc || "");
    // Reset states khi post thay đổi
    setIsSummarized(false);
    setSummarizedDesc("");
    setIsTranslated(false);
    setTranslatedDesc("");
  }, [post.desc]);
  
  // Lấy nội dung hiển thị
  const getDisplayedDesc = () => {
    // Nếu đã dịch, hiển thị nội dung đã dịch
    if (isTranslated) return translatedDesc;
    
    // Nếu đã tóm tắt, hiển thị nội dung đã tóm tắt
    if (isSummarized) return summarizedDesc;
    
    // Nếu không, xử lý logic cắt ngắn
    if (!originalDesc) return "";
    if (isExpanded || !needsTruncation) return originalDesc;
    return originalDesc.substring(0, MAX_CHARS) + "...";
  };
  
  // Xử lý summarize button khi click vào
  const handleSummarize = async () => {
    // Nếu đã tóm tắt, chuyển lại sang nội dung gốc
    if (isSummarized) {
      setIsSummarized(false);
      return;
    }
    
    // Chỉ tóm tắt nếu không đang tóm tắt và nội dung đủ dài
    if (!summarizing && originalDesc.length > 200) {
      try {
        const summary = await generateSummary(originalDesc);
        if (summary) {
          setSummarizedDesc(summary);
          setIsSummarized(true);
          // Khi đã tóm tắt, luôn hiển thị nội dung đầy đủ (không cắt ngắn)
          setIsExpanded(true);
          // Reset translation khi tóm tắt
          setIsTranslated(false);
        }
      } catch (error) {
        console.error("Error summarizing post:", error);
      }
    }
  };

  // Xử lý dịch văn bản
  const handleTranslated = (translatedText: string) => {
    setTranslatedDesc(translatedText);
    setIsTranslated(true);
    // Reset tóm tắt khi dịch
    setIsSummarized(false);
    // Khi dịch, luôn hiển thị nội dung đầy đủ (không cắt ngắn)
    setIsExpanded(true);
  };

  // Xử lý reset dịch
  const handleResetTranslation = () => {
    setIsTranslated(false);
    setTranslatedDesc("");
  };
  
  const router = useRouter();

  // Load comments ban đầu
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

  // Load thêm comments
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

  // Function refresh comments sau khi thêm mới
  const refreshComments = useCallback(() => {
    // Không cần tải lại toàn bộ comments từ server
    // Optimistic update sẽ được xử lý trong CommentList component
  }, []);

  // Update likes từ post prop khi nó thay đổi
  useEffect(() => {
    if (post.likes) {
      const likeUserIds = post.likes.map(like => like.userId);
      setPostLikes(likeUserIds);
    }
  }, [post.likes]);

  // Use useEffect để load initial comments và set up event listeners
  useEffect(() => {
    // Chỉ load initial comments khi component được mount lần đầu
    loadInitialComments();
  }, [post.id, loadInitialComments]);

  // Set up intersection observer cho cuộn vô hạn
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

  // Tính tổng comments
  const calculateTotalComments = useCallback((commentList: CommentWithUser[]) => {
    let total = 0;
    commentList.forEach(comment => {
      total++; // Đếm comment cha
      if (comment.replies && Array.isArray(comment.replies)) {
        total += comment.replies.length; // Thêm số lượng reply
      }
    });
    return total;
  }, []);

  // Tạo một phiên bản của post với comments đã cập nhật
  const postWithUpdatedComments = {
    ...post,
    comments: comments,
    likes: postLikes.map(userId => ({ userId })),
    _count: {
      comments: calculateTotalComments(comments),
      likes: postLikes.length
    }
  };

  return (
    <div className="flex flex-col">
      {standalone && (
        <div className="mb-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      )}
      
      {/* Post Content */}
      <div className={`${standalone ? '' : 'p-4'} mb-6 ${standalone ? '' : 'border-b border-zinc-100 dark:border-zinc-800'}`}>
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

        {post.desc && (
          <div className="mb-4">
            <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
              {getDisplayedDesc()}
            </p>
            <div className="flex items-center gap-3 mt-1">
              {needsTruncation && !isTranslated && !isSummarized && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)} 
                  className="text-emerald-600 dark:text-emerald-500 font-medium text-sm hover:underline focus:outline-none"
                >
                  {isExpanded ? "See less" : "See more"}
                </button>
              )}
              
              {originalDesc.length > 200 && !isTranslated && (
                <button 
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className={`flex items-center gap-1 text-sm font-medium ${summarizing ? 'text-zinc-400 dark:text-zinc-500' : 'text-emerald-600 dark:text-emerald-500 hover:underline'} focus:outline-none transition-colors`}
                >
                  <Wand2 className="w-3 h-3" />
                  {summarizing 
                    ? "Summarizing..." 
                    : isSummarized 
                      ? "Show original" 
                      : "AI summarize"}
                </button>
              )}
              
              {originalDesc && !isSummarized && (
                <TranslateButton 
                  text={originalDesc}
                  onTranslated={handleTranslated}
                  onReset={handleResetTranslation}
                  isTranslated={isTranslated}
                />
              )}
            </div>
          </div>
        )}

        {post.img && (
          <div 
            className="rounded-xl overflow-hidden mb-4 cursor-pointer relative"
            onClick={() => setShowPostDetail(true)}
          >
            <div className="transition-transform duration-300 hover:scale-[1.01]">
              <Image
                src={post.img}
                width={1200}
                height={800}
                alt=""
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {post.video && (
          <div 
            className="rounded-xl overflow-hidden mb-4 bg-zinc-900 cursor-pointer relative"
            onClick={() => setShowPostDetail(true)}
          >
            <div className="transition-transform duration-300 hover:scale-[1.01]">
              <video
                src={post.video}
                controls
                playsInline
                preload="metadata"
                className="w-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>

      {/* Post Interaction */}
      <div className={`${standalone ? '' : 'p-4'} ${standalone ? 'mb-6' : 'border-b border-zinc-100 dark:border-zinc-800'}`}>
        <PostInteraction
          postId={post.id}
          likes={postLikes}
          commentNumber={calculateTotalComments(comments)}
          post={postWithUpdatedComments}
        />
      </div>

      {/* Comments Section */}
      <div className={standalone ? '' : 'p-4 pb-8'}>
        {showAllComments && (
          <div className="mb-4">
            <button 
              onClick={() => setShowAllComments(false)}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hide comments</span>
            </button>
          </div>
        )}
        <CommentList 
          comments={comments} 
          postId={post.id} 
          showAll={showAllComments} 
          post={postWithUpdatedComments}
          onCommentAdded={refreshComments}
          highlightCommentId={highlightCommentId}
          onViewAllCommentsClick={() => setShowAllComments(true)}
        />
        
        {/* Loader for infinite scroll */}
        {hasMore && showAllComments && (
          <div 
            ref={loadingRef} 
            className="py-4 text-center"
          >
            <div className="w-6 h-6 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {/* Post Detail Modal */}
      {showPostDetail && (
        <PostDetailModal
          post={postWithUpdatedComments}
          onClose={() => setShowPostDetail(false)}
        />
      )}
    </div>
  );
} 