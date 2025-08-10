"use client";

import Image from "next/image";
import Comments from "./Comments";
import { Post as PostType, User, Comment } from "@prisma/client";
import PostInteraction from "./PostInteraction";
import { Suspense, useEffect, useState, useCallback } from "react";
import PostInfo from "./PostInfo";
import Link from "next/link";
import { getPostDetails } from "@/lib/actions/post";
import PostDetail from "./PostDetail";
import { useSummarize } from "@/shared/hooks/useSummarize";
import { Wand2 } from "lucide-react";
import TranslateButton from "@/shared/ui/TranslateButton";

export type FeedPostType = PostType & { 
  user: User;
  likes: { userId: string }[];
  _count: { comments: number; likes?: number };
  video?: string | null;
  comments: (Comment & { user: User })[];
  currentUserId?: string;
};

type PostDetailsType = {
  comments: (Comment & { 
    user: User;
    likes: number;
    replies: (Comment & { 
      user: User;
      likes: number;
    })[];
  })[];
  currentUserId: string | null;
};

const Post = ({ post }: { post: FeedPostType }) => {
  const [postData, setPostData] = useState<PostDetailsType>({
    comments: [],
    currentUserId: null,
  });
  // State để theo dõi xem mô tả đầy đủ có được hiển thị hay không
  const [isExpanded, setIsExpanded] = useState(false);
  // State để điều khiển hiển thị modal PostDetail
  const [showPostDetail, setShowPostDetail] = useState(false);
  // State để theo dõi lượt thích của bài viết
  const [currentLikes, setCurrentLikes] = useState<{ userId: string }[]>(post.likes || []);
  // State để theo dõi nếu bài viết đã bị xóa
  const [isDeleted, setIsDeleted] = useState(false);
  // State để theo dõi số lượng bình luận
  const [commentCount, setCommentCount] = useState(post._count.comments);
  // State để theo dõi nội dung bài viết cho các cập nhật
  const [postContent, setPostContent] = useState({
    desc: post.desc,
    img: post.img,
    video: post.video
  });
  // State để theo dõi nếu nội dung đã được tóm tắt
  const [isSummarized, setIsSummarized] = useState(false);
  // State để lưu trữ nội dung gốc
  const [originalDesc, setOriginalDesc] = useState(post.desc || "");
  // State để lưu trữ nội dung đã tóm tắt
  const [summarizedDesc, setSummarizedDesc] = useState("");
  // State để theo dõi nếu nội dung đã được dịch
  const [isTranslated, setIsTranslated] = useState(false);
  // State để lưu trữ nội dung đã dịch
  const [translatedDesc, setTranslatedDesc] = useState("");
  // Hook để tóm tắt
  const { generateSummary, loading: summarizing } = useSummarize();
  
  // Cấu hình giới hạn ký tự cho việc cắt ngắn
  const MAX_CHARS = 150;
  
  // Xác định xem mô tả có cần cắt ngắn không
  const needsTruncation = postContent.desc && postContent.desc.length > MAX_CHARS;
  
  // Đặt mô tả gốc khi nội dung bài viết thay đổi
  useEffect(() => {
    setOriginalDesc(postContent.desc || "");
    // Đặt lại states khi bài viết thay đổi
    setIsSummarized(false);
    setSummarizedDesc("");
    setIsTranslated(false);
    setTranslatedDesc("");
  }, [postContent.desc]);
  
  // Lấy mô tả hiển thị
  const getDisplayedDesc = () => {
    // Nếu đã dịch, hiển thị nội dung đã dịch
    if (isTranslated) return translatedDesc;
    
    // Nếu đã tóm tắt, hiển thị nội dung đã tóm tắt
    if (isSummarized) return summarizedDesc;
    
    // Nếu không, xử lý logic cắt ngắn
    if (!postContent.desc) return "";
    if (isExpanded || !needsTruncation) return postContent.desc;
    return postContent.desc.substring(0, MAX_CHARS) + "...";
  };
  
  // Xử lý khi nhấn nút tóm tắt
  const handleSummarize = async () => {
    // Nếu đã tóm tắt, chuyển về nội dung gốc
    if (isSummarized) {
      setIsSummarized(false);
      return;
    }
    
    // Chỉ tóm tắt nếu chưa đang tóm tắt và nội dung đủ dài
    if (!summarizing && originalDesc.length > 200) {
      try {
        const summary = await generateSummary(originalDesc);
        if (summary) {
          setSummarizedDesc(summary);
          setIsSummarized(true);
          // Khi đã tóm tắt, luôn hiển thị nội dung đầy đủ (không cắt ngắn)
          setIsExpanded(true);
          // Đặt lại trạng thái dịch khi tóm tắt
          setIsTranslated(false);
        }
      } catch (error) {
        console.error("Error summarizing post:", error);
      }
    }
  };

  // Xử lý khi văn bản đã được dịch
  const handleTranslated = (translatedText: string) => {
    setTranslatedDesc(translatedText);
    setIsTranslated(true);
    // Đặt lại trạng thái tóm tắt khi dịch
    setIsSummarized(false);
    // Khi đã dịch, luôn hiển thị nội dung đầy đủ (không cắt ngắn)
    setIsExpanded(true);
  };

  // Xử lý đặt lại bản dịch
  const handleResetTranslation = () => {
    setIsTranslated(false);
    setTranslatedDesc("");
  };

  // State để theo dõi nếu người dùng đã tương tác với lượt thích
  const [userLikeInteracted, setUserLikeInteracted] = useState(false);

  const handleLikeUpdate = useCallback((event: Event) => {
    const { postId, userId, isLiked } = (event as CustomEvent).detail;
    
    if (postId === post.id) {
      // Đánh dấu rằng đã có tương tác xảy ra
      setUserLikeInteracted(true);
      
      setCurrentLikes(prevLikes => {
        if (isLiked) {
          // Thêm lượt thích nếu chưa có
          if (!prevLikes.some(like => like.userId === userId)) {
            return [...prevLikes, { userId }];
          }
        } else {
          // Xóa lượt thích
          return prevLikes.filter(like => like.userId !== userId);
        }
        return prevLikes;
      });
    }
  }, [post.id]);

  // Xử lý sự kiện xóa bài viết
  const handleDeletePost = useCallback((event: Event) => {
    const { postId } = (event as CustomEvent).detail;
    
    if (postId === post.id) {
      // Đánh dấu bài viết này đã bị xóa
      setIsDeleted(true);
      // Đóng modal nếu đang mở
      setShowPostDetail(false);
    }
  }, [post.id]);

  // Xử lý sự kiện cập nhật bình luận
  const handleCommentUpdate = useCallback((event: Event) => {
    const { postId: eventPostId, action } = (event as CustomEvent).detail;
    
    if (eventPostId === post.id) {
      setCommentCount(prevCount => {
        if (action === 'add') {
          return prevCount + 1;
        } else if (action === 'delete') {
          return Math.max(0, prevCount - 1);
        }
        return prevCount;
      });
    }
  }, [post.id]);

  // Xử lý sự kiện cập nhật bài viết
  const handlePostUpdate = useCallback((event: Event) => {
    const { postId, updatedPost } = (event as CustomEvent).detail;
    
    if (postId === post.id && updatedPost) {
      // Cập nhật nội dung bài viết với dữ liệu mới
      setPostContent({
        desc: updatedPost.desc || "",
        img: updatedPost.img || null,
        video: updatedPost.video || null
      });
      
      // Đặt lại trạng thái mở rộng khi mô tả thay đổi
      setIsExpanded(false);
    }
  }, [post.id]);

  useEffect(() => {
    // Thêm các event listeners
    window.addEventListener('likeUpdate', handleLikeUpdate);
    window.addEventListener('deletePost', handleDeletePost);
    window.addEventListener('commentUpdate', handleCommentUpdate);
    window.addEventListener('postUpdate', handlePostUpdate);
    
    // Dọn dẹp
    return () => {
      window.removeEventListener('likeUpdate', handleLikeUpdate);
      window.removeEventListener('deletePost', handleDeletePost);
      window.removeEventListener('commentUpdate', handleCommentUpdate);
      window.removeEventListener('postUpdate', handlePostUpdate);
    };
  }, [handleLikeUpdate, handleDeletePost, handleCommentUpdate, handlePostUpdate]);

  // Cập nhật khi lượt thích bài viết thay đổi từ props, nhưng chỉ khi người dùng chưa tương tác
  useEffect(() => {
    if (!userLikeInteracted) {
      setCurrentLikes(post.likes || []);
    }
  }, [post.likes, userLikeInteracted]);

  // Cập nhật số lượng bình luận từ props
  useEffect(() => {
    setCommentCount(post._count.comments);
  }, [post._count.comments]);

  useEffect(() => {
    const loadPostDetails = async () => {
      const details = await getPostDetails(post.id);
      if (details) {
        setPostData(details);
      }
    };
    loadPostDetails();
  }, [post.id]);

  const postWithComments = {
    ...post,
    desc: postContent.desc,
    img: postContent.img,
    video: postContent.video,
    comments: postData.comments,
    likes: currentLikes,
    _count: {
      ...post._count,
      comments: commentCount
    }
  };

  // Don't render anything if the post has been deleted
  if (isDeleted) return null;

  return (
    <>
      <div className="flex flex-col gap-6 px-4 py-3">
        {/* USER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          </div>
          <PostInfo post={postWithComments} currentUserId={postData.currentUserId || undefined} />
        </div>
        {/* DESC */}
        <div className="flex flex-col gap-4">
          {/* Hiển thị mô tả trước media */}
          {postContent.desc && (
            <div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
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
          
          {/* Hiển thị ảnh hoặc video có thể bấm vào */}
          {postContent.img ? (
            <div 
              className="mx-[-16px] my-2 cursor-pointer relative overflow-hidden"
              onClick={() => setShowPostDetail(true)}
            >
              <div className="transition-transform duration-300 hover:scale-[1.01]">
                <Image
                  src={postContent.img}
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  alt=""
                  priority
                />
              </div>
            </div>
          ) : postContent.video && (
            <div 
              className="mx-[-16px] my-2 bg-zinc-900 rounded-xl overflow-hidden cursor-pointer relative"
              onClick={() => setShowPostDetail(true)}
            >
              <div className="transition-transform duration-300 hover:scale-[1.01]">
                <video
                  src={postContent.video}
                  className="w-full"
                  controls
                  playsInline
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
        </div>
        {/* INTERACTION */}
        <Suspense fallback={
          <div className="h-8 flex items-center justify-center">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/50 border-solid border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        }>
          <PostInteraction
            postId={post.id}
            likes={currentLikes.map((like) => like.userId)}
            commentNumber={commentCount}
            post={postWithComments}
          />
        </Suspense>
        <Suspense fallback={
          <div className="h-8 flex items-center justify-center">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/50 border-solid border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        }>
          <Comments post={postWithComments} />
        </Suspense>
      </div>

      {/* Post Detail Modal */}
      {showPostDetail && (
        <PostDetail 
          post={postWithComments} 
          onClose={() => setShowPostDetail(false)}
        />
      )}
    </>
  );
};

export default Post;


