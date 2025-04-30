"use client";

import { Post, User, Comment } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getPostComments } from "@/lib/actions/comment";
import PostInteraction from "../feed/PostInteraction";
import CommentList from "../feed/CommentList";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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
  // State to track whether the full description is shown
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Configure the character limit for truncation
  const MAX_CHARS = 150;
  
  // Determine if the description needs truncation
  const needsTruncation = post.desc && post.desc.length > MAX_CHARS;
  
  // Get the truncated or full description depending on expanded state
  const getDisplayedDesc = () => {
    if (!post.desc) return "";
    if (isExpanded || !needsTruncation) return post.desc;
    return post.desc.substring(0, MAX_CHARS) + "...";
  };
  
  const router = useRouter();

  // Function to reload comments
  const refreshComments = useCallback(async () => {
    try {
      const updatedComments = await getPostComments(post.id);
      if (updatedComments) {
        setComments(updatedComments);
      }
    } catch (error) {
      console.error("Error refreshing comments:", error);
    }
  }, [post.id]);

  // Update likes from post prop when it changes
  useEffect(() => {
    if (post.likes) {
      const likeUserIds = post.likes.map(like => like.userId);
      setPostLikes(likeUserIds);
    }
  }, [post.likes]);

  // Use useEffect to listen for postId changes and update data
  useEffect(() => {
    refreshComments();
  }, [post.id, refreshComments]);

  // Create a version of the post with updated comments
  const postWithUpdatedComments = {
    ...post,
    comments: comments,
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

        {post.img && (
          <div className="rounded-xl overflow-hidden mb-4">
            <Image
              src={post.img}
              width={1200}
              height={800}
              alt=""
              className="w-full h-auto"
            />
          </div>
        )}

        {post.video && (
          <div className="rounded-xl overflow-hidden mb-4 bg-zinc-900">
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
        )}
      </div>

      {/* Post Interaction */}
      <div className={`${standalone ? '' : 'p-4'} ${standalone ? 'mb-6' : 'border-b border-zinc-100 dark:border-zinc-800'}`}>
        <PostInteraction
          postId={post.id}
          likes={postLikes}
          commentNumber={comments.length}
          post={postWithUpdatedComments}
        />
      </div>

      {/* Comments Section */}
      <div className={standalone ? '' : 'p-4 pb-8'}>
        <CommentList 
          comments={comments} 
          postId={post.id} 
          showAll={true} 
          post={postWithUpdatedComments}
          onCommentAdded={refreshComments}
          highlightCommentId={highlightCommentId}
        />
      </div>
    </div>
  );
} 