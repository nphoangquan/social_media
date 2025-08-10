import prisma from "@/lib/client";
import Image from "next/image";
import type { User } from "@prisma/client";

const UserMediaCard = async ({ user }: { user: User }) => {
  const media = await prisma.post.findMany({
    where: { userId: user.id, img: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, img: true },
  });

  if (media.length === 0) return null;

  return (
    <div className="p-6 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-lg dark:shadow-zinc-800/20 text-sm border border-zinc-100/50 dark:border-zinc-800/50">
      <div className="mb-4 font-medium text-zinc-500 dark:text-zinc-400">Recent Photos</div>
      <div className="grid grid-cols-3 gap-2">
        {media.map((m) => (
          <div key={m.id} className="relative w-full pt-[100%] rounded-lg overflow-hidden">
            {m.img && (
              <Image src={m.img} alt="" fill className="object-cover" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserMediaCard;



