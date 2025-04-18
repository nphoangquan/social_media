import Image from "next/image";
import Comments from "./Comments";
import { Post as PostType, User } from "@prisma/client";
import PostInteraction from "./PostInteraction";
import { Suspense } from "react";
import PostInfo from "./PostInfo";
import { auth } from "@clerk/nextjs/server";

type FeedPostType = PostType & { user: User } & {
  likes: [{ userId: string }];
} & {
  _count: { comments: number };
};

const Post = async ({ post }: { post: FeedPostType }) => {
  const { userId } = await auth();
  return (
    <div className="flex flex-col gap-6 px-4 py-3">
      {/* USER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-100 dark:ring-zinc-800">
            <Image
              src={post.user.avatar || "/noAvatar.png"}
              fill
              alt=""
              className="object-cover"
            />
          </div>
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {post.user.name && post.user.surname
              ? post.user.name + " " + post.user.surname
              : post.user.username}
          </span>
        </div>
        {userId === post.user.id && <PostInfo postId={post.id} />}
      </div>
      {/* DESC */}
      <div className="flex flex-col gap-4">
        {/* Hiển thị mô tả trước hình ảnh */}
        {post.desc && (
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{post.desc}</p>
        )}
        
        {post.img && (
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
        )}
      </div>
      {/* INTERACTION */}
      <Suspense fallback={
        <div className="h-8 flex items-center justify-center">
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/50 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
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
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/50 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </div>
      }>
        <Comments postId={post.id} />
      </Suspense>
    </div>
  );
};

export default Post;