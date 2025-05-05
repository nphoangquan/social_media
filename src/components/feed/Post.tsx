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
import { useSummarize } from "@/lib/hooks/useSummarize";
import { Wand2 } from "lucide-react";
import TranslateButton from "../common/TranslateButton";

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
  // State to track whether the full description is shown
  const [isExpanded, setIsExpanded] = useState(false);
  // State to control PostDetail modal visibility
  const [showPostDetail, setShowPostDetail] = useState(false);
  // State to keep track of post likes
  const [currentLikes, setCurrentLikes] = useState<{ userId: string }[]>(post.likes || []);
  // State to track if post has been deleted
  const [isDeleted, setIsDeleted] = useState(false);
  // State to track comment count
  const [commentCount, setCommentCount] = useState(post._count.comments);
  // State to track post content for updates
  const [postContent, setPostContent] = useState({
    desc: post.desc,
    img: post.img,
    video: post.video
  });
  // State to track if the content is summarized
  const [isSummarized, setIsSummarized] = useState(false);
  // State to store the original content
  const [originalDesc, setOriginalDesc] = useState(post.desc || "");
  // State to store the summarized content
  const [summarizedDesc, setSummarizedDesc] = useState("");
  // State to track if the content is translated
  const [isTranslated, setIsTranslated] = useState(false);
  // State to store the translated content
  const [translatedDesc, setTranslatedDesc] = useState("");
  // Hook for summarization
  const { generateSummary, loading: summarizing } = useSummarize();
  
  // Configure the character limit for truncation
  const MAX_CHARS = 150;
  
  // Determine if the description needs truncation
  const needsTruncation = postContent.desc && postContent.desc.length > MAX_CHARS;
  
  // Set original description when post content changes
  useEffect(() => {
    setOriginalDesc(postContent.desc || "");
    // Reset states when post changes
    setIsSummarized(false);
    setSummarizedDesc("");
    setIsTranslated(false);
    setTranslatedDesc("");
  }, [postContent.desc]);
  
  // Get the displayed description
  const getDisplayedDesc = () => {
    // If translated, show translated content
    if (isTranslated) return translatedDesc;
    
    // If summarized, show summarized content
    if (isSummarized) return summarizedDesc;
    
    // Otherwise, handle truncation logic
    if (!postContent.desc) return "";
    if (isExpanded || !needsTruncation) return postContent.desc;
    return postContent.desc.substring(0, MAX_CHARS) + "...";
  };
  
  // Handle summarize button click
  const handleSummarize = async () => {
    // If already summarized, switch back to original
    if (isSummarized) {
      setIsSummarized(false);
      return;
    }
    
    // Only summarize if not already summarizing and the content is long enough
    if (!summarizing && originalDesc.length > 200) {
      try {
        const summary = await generateSummary(originalDesc);
        if (summary) {
          setSummarizedDesc(summary);
          setIsSummarized(true);
          // When summarized, always show full content (no truncation)
          setIsExpanded(true);
          // Reset translation when summarizing
          setIsTranslated(false);
        }
      } catch (error) {
        console.error("Error summarizing post:", error);
      }
    }
  };

  // Handle translated text
  const handleTranslated = (translatedText: string) => {
    setTranslatedDesc(translatedText);
    setIsTranslated(true);
    // Reset summarization when translating
    setIsSummarized(false);
    // When translated, always show full content (no truncation)
    setIsExpanded(true);
  };

  // Handle reset translation
  const handleResetTranslation = () => {
    setIsTranslated(false);
    setTranslatedDesc("");
  };

  // State to track if user has interacted with likes
  const [userLikeInteracted, setUserLikeInteracted] = useState(false);

  const handleLikeUpdate = useCallback((event: Event) => {
    const { postId, userId, isLiked } = (event as CustomEvent).detail;
    
    if (postId === post.id) {
      // Mark that an interaction has happened
      setUserLikeInteracted(true);
      
      setCurrentLikes(prevLikes => {
        if (isLiked) {
          // Add like if not already present
          if (!prevLikes.some(like => like.userId === userId)) {
            return [...prevLikes, { userId }];
          }
        } else {
          // Remove like
          return prevLikes.filter(like => like.userId !== userId);
        }
        return prevLikes;
      });
    }
  }, [post.id]);

  // Handler for delete post events
  const handleDeletePost = useCallback((event: Event) => {
    const { postId } = (event as CustomEvent).detail;
    
    if (postId === post.id) {
      // Mark this post as deleted
      setIsDeleted(true);
      // Close modal if open
      setShowPostDetail(false);
    }
  }, [post.id]);

  // Handler for comment update events
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

  // Handler for post update events
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

  useEffect(() => {
    // Add event listeners
    window.addEventListener('likeUpdate', handleLikeUpdate);
    window.addEventListener('deletePost', handleDeletePost);
    window.addEventListener('commentUpdate', handleCommentUpdate);
    window.addEventListener('postUpdate', handlePostUpdate);
    
    // Clean up
    return () => {
      window.removeEventListener('likeUpdate', handleLikeUpdate);
      window.removeEventListener('deletePost', handleDeletePost);
      window.removeEventListener('commentUpdate', handleCommentUpdate);
      window.removeEventListener('postUpdate', handlePostUpdate);
    };
  }, [handleLikeUpdate, handleDeletePost, handleCommentUpdate, handlePostUpdate]);

  // Update when post likes change from props, but only if user hasn't interacted
  useEffect(() => {
    if (!userLikeInteracted) {
      setCurrentLikes(post.likes || []);
    }
  }, [post.likes, userLikeInteracted]);

  // Update comment count from props
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
          {postData.currentUserId === post.user.id && <PostInfo post={postWithComments} />}
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