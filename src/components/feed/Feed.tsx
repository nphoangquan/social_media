import Post from "./Post";
import prisma from "@/lib/client";

const Feed = async ({ username }: { username?: string }) => {
  // TODO: Định nghĩa type cụ thể thay vì dùng any[]
  let posts: any[] = [];

  if (username) {
    posts = await prisma.post.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    posts = await prisma.post.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });
  }
  
  return (
    <div className="flex flex-col bg-transparent">
      {posts.length ? (
        posts.map(post => (
          <div key={post.id} className="mb-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md dark:shadow-zinc-800/20">
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