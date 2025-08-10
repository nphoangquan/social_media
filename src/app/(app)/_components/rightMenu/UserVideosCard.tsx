import prisma from "@/lib/client";
import type { User } from "@prisma/client";

const UserVideosCard = async ({ user }: { user: User }) => {
  const videos = await prisma.post.findMany({
    where: { userId: user.id, video: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, video: true, desc: true },
  });

  if (videos.length === 0) return null;

  return (
    <div className="p-6 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-lg dark:shadow-zinc-800/20 text-sm border border-zinc-100/50 dark:border-zinc-800/50">
      <div className="mb-4 font-medium text-zinc-500 dark:text-zinc-400">Recent Videos</div>
      <div className="space-y-3">
        {videos.map((v) => (
          <video key={v.id} src={v.video || undefined} controls className="w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
};

export default UserVideosCard;



