import prisma from "@/lib/client";
import { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

const UserMediaCard = async ({ user }: { user: User }) => {
  const postsWithMedia = await prisma.post.findMany({
    where: {
      userId: user.id,
      img: {
        not: null,
      },
    },
    take: 8,
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 text-sm">
      {/* TOP */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-medium text-zinc-600 dark:text-zinc-300">User Media</span>
        <Link href={`/profile/${user.username}/photos`} className="text-emerald-500 dark:text-emerald-400 text-xs hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
          See all
        </Link>
      </div>
      {/* BOTTOM */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {postsWithMedia.length
          ? postsWithMedia.map((post) => (
              <div className="relative aspect-square rounded-xl overflow-hidden group" key={post.id}>
                <Image
                  src={post.img!}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))
          : <span className="text-zinc-500 dark:text-zinc-400 col-span-full text-center py-4">No media found!</span>}
      </div>
    </div>
  );
};

export default UserMediaCard;