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

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  // Cập nhật likes từ prop post khi có thay đổi
  useEffect(() => {
    if (post.likes) {
      const likeUserIds = post.likes.map(like => like.userId);
      setPostLikes(likeUserIds);
    }
  }, [post.likes]);

  // Sử dụng useEffect để lắng nghe sự thay đổi của postId và cập nhật dữ liệu
  useEffect(() => {
    refreshComments();
  }, [post.id, refreshComments]);

  if (!mounted) return null;

  // Create a version of the post with updated comments
  const postWithUpdatedComments = {
    ...post,
    comments: comments,
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

            {post.desc && (
              <p className="text-zinc-600 dark:text-zinc-300 mb-4">{post.desc}</p>
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
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <PostInteraction
              postId={post.id}
              likes={postLikes}
              commentNumber={comments.length}
              post={postWithUpdatedComments}
            />
          </div>

          {/* Comments Section */}
          <div className="p-4 pb-8">
            <CommentList 
              comments={comments} 
              postId={post.id} 
              showAll={true} 
              post={postWithUpdatedComments}
              onCommentAdded={refreshComments}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
} 