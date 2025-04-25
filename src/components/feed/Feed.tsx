import Post, { FeedPostType } from "./Post";
import prisma from "@/lib/client";
import { Post as PostType, User, Comment } from "@prisma/client";

const Feed = async ({ username }: { username?: string }) => {
  let rawPosts: (PostType & {
    user: User;
    likes: { userId: string }[];
    _count: { comments: number };
    comments: (Comment & { user: User })[];
  })[] = [];

  if (username) {
    rawPosts = await prisma.post.findMany({
      where: {
        user: {
          username: username,
        },
      },
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
        comments: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    rawPosts = await prisma.post.findMany({
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
        comments: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });
  }

  const posts: FeedPostType[] = rawPosts.map(post => ({
    ...post,
    likes: post.likes.length > 0 ? [post.likes[0]] : [{ userId: '' }]
  }));
  
  return (
    <div className="flex flex-col bg-transparent">
      {posts.length ? (
        posts.map(post => (
          <div key={post.id} className="mb-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-md dark:shadow-zinc-800/20">
            <Post post={post}/>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-md dark:shadow-zinc-800/20">
          No posts found!
        </div>
      )}
    </div>
  );
};

export default Feed;