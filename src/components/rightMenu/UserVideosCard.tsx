import prisma from "@/lib/client";
import { User } from "@prisma/client";
import Link from "next/link";

const UserVideosCard = async ({ user }: { user: User }) => {
  const postsWithVideo = await prisma.post.findMany({
    where: {
      userId: user.id,
      video: {
        not: null,
      },
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (postsWithVideo.length === 0) {
    return null; // Don't show component if no videos
  }

  return (
    <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 text-sm">
      {/* TOP */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-medium text-zinc-600 dark:text-zinc-300">User Videos</span>
        <Link href={`/profile/${user.username}/videos`} className="text-emerald-500 dark:text-emerald-400 text-xs hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
          See all
        </Link>
      </div>
      {/* BOTTOM */}
      <div className="flex flex-col gap-3">
        {postsWithVideo.map((post) => (
          <Link 
            href={`/post/${post.id}`}
            key={post.id}
            className="relative aspect-video rounded-xl overflow-hidden group border border-zinc-200 dark:border-zinc-800"
          >
            <video 
              src={post.video!} 
              className="w-full h-full object-cover"
              preload="metadata"
              autoPlay={false}
              muted
              playsInline
              controls={false}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserVideosCard; 