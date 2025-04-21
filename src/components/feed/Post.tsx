import Image from "next/image";
import Comments from "./Comments";
import { Post as PostType, User } from "@prisma/client";
import PostInteraction from "./PostInteraction";
import { Suspense } from "react";
import PostInfo from "./PostInfo";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

type FeedPostType = PostType & { user: User } & {
  likes: [{ userId: string }];
} & {
  _count: { comments: number };
  video?: string;
};

const Post = async ({ post }: { post: FeedPostType }) => {
  const { userId } = await auth();
  return (
    <div className="flex flex-col gap-6 px-4 py-3">
      {/* USER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
          <Link 
            href={`/profile/${post.user.username}`}
            className="font-medium text-zinc-800 dark:text-zinc-200 hover:underline cursor-pointer"
          >
            {post.user.name && post.user.surname
              ? post.user.name + " " + post.user.surname
              : post.user.username}
          </Link>
        </div>
        {userId === post.user.id && <PostInfo post={post} />}
      </div>
      {/* DESC */}
      <div className="flex flex-col gap-4">
        {/* Hiển thị mô tả trước media */}
        {post.desc && (
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{post.desc}</p>
        )}
        
        {/* Hiển thị ảnh hoặc video */}
        {post.img ? (
          <div className="mx-[-16px] my-2">
            <Image
              src={post.img}
              width={1200}
              height={800}
              className="w-full h-auto"
              alt=""
              priority
            />
          </div>
        ) : post.video && (
          <div className="mx-[-16px] my-2 bg-zinc-900 rounded-xl overflow-hidden">
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
        />
      </Suspense>
      <Suspense fallback={
        <div className="h-8 flex items-center justify-center">
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/50 border-solid border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </div>
      }>
        <Comments post={post} />
      </Suspense>
    </div>
  );
};

export default Post;