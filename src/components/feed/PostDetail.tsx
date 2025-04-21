"use client";

import { Post, User, Comment } from "@prisma/client";
import Image from "next/image";
import { X } from "lucide-react";
import CommentList from "./CommentList";
import Link from "next/link";

type PostWithUserAndComments = Post & {
  user: User;
  comments: (Comment & { user: User })[];
};

export default function PostDetail({
  post,
  onClose,
}: {
  post: PostWithUserAndComments;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-10">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-3xl h-[80vh] shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Post</h2>
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
                className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-100 dark:ring-zinc-800 cursor-pointer"
              >
                <Image
                  src={post.user.avatar || "/noAvatar.png"}
                  fill
                  alt=""
                  className="object-cover"
                />
              </Link>
              <div>
                <Link 
                  href={`/profile/${post.user.username}`}
                  className="font-medium text-zinc-800 dark:text-zinc-200 hover:underline cursor-pointer"
                >
                  {post.user.name && post.user.surname
                    ? post.user.name + " " + post.user.surname
                    : post.user.username}
                </Link>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(post.createdAt).toLocaleDateString()}
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

          {/* Comments Section */}
          <div className="p-4">
            <CommentList comments={post.comments} postId={post.id} showAll={true} post={post} />
          </div>
        </div>
      </div>
    </div>
  );
} 