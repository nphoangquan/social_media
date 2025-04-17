import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import Image from "next/image";
import Link from "next/link";

const ProfileCard = async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      _count: {
        select: {
          followers: true,
        },
      },
    },
  });

  if (!user) return null;

  return (
    <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50">
      {/* TOP */}
      <div className="relative h-32 -mx-6 -mt-6 mb-4">
        <Image
          src={user.cover || "/noCover.png"}
          alt=""
          fill
          className="object-cover rounded-t-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      {/* AVATAR */}
      <div className="relative flex flex-col items-center -mt-14 mb-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-zinc-900 mb-3">
          <Image
            src={user.avatar || "/noAvatar.png"}
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="text-center">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
            {user.name && user.surname
              ? user.name + " " + user.surname
              : user.username}
          </h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {user._count.followers} Followers
          </span>
        </div>
        <Link href={`/profile/${user.username}`} className="mt-4">
          <button className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-sm font-medium px-6 py-2 rounded-xl transition-colors">
            View Profile
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProfileCard;
