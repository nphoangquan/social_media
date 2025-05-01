"use client";

import Image from "next/image";
import Comments from "./Comments";
import { Post as PostType, User, Comment } from "@prisma/client";
import PostInteraction from "./PostInteraction";
import { Suspense, useEffect, useState } from "react";
import PostInfo from "./PostInfo";
import Link from "next/link";
import { getPostDetails } from "@/lib/actions/post";
import PostDetail from "./PostDetail";

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
    comments: postData.comments,
  };

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
          {post.desc && (
            <div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
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
          
          {/* Hiển thị ảnh hoặc video có thể bấm vào */}
          {post.img ? (
            <div 
              className="mx-[-16px] my-2 cursor-pointer relative overflow-hidden"
              onClick={() => setShowPostDetail(true)}
            >
              <div className="transition-transform duration-300 hover:scale-[1.01]">
                <Image
                  src={post.img}
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  alt=""
                  priority
                />
              </div>
            </div>
          ) : post.video && (
            <div 
              className="mx-[-16px] my-2 bg-zinc-900 rounded-xl overflow-hidden cursor-pointer relative"
              onClick={() => setShowPostDetail(true)}
            >
              <div className="transition-transform duration-300 hover:scale-[1.01]">
                <video
                  src={post.video}
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
            likes={post.likes.map((like) => like.userId)}
            commentNumber={post._count.comments}
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