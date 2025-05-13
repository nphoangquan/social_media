import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { cn } from "@/lib/utils";
import { ExternalLink, Users } from "lucide-react";

// Cache kết quả trong thời gian ngắn nhưng tái xác thực thường xuyên
const getUser = unstable_cache(
  async (userId: string) => {
    return prisma.user.findUnique({
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
  },
  ['user-profile-card'],
  { revalidate: 5 } // Tái xác thực mỗi 5 giây
);

const ProfileCard = async () => {
  const { userId } = await auth();

  if (!userId) return null;

  // Sử dụng hàm cached để lấy dữ liệu người dùng
  const user = await getUser(userId);

  if (!user) return null;

  return (
    <div className="relative p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden group">
      {/* Ambient background effects - Hiệu ứng nền */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400/20 via-purple-500/20 to-emerald-600/20"></div>
      <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-purple-400/5 dark:bg-purple-400/10 rounded-full blur-3xl group-hover:bg-purple-400/10 dark:group-hover:bg-purple-400/15 transition-all duration-700"></div>
      
      {/* Cover Photo with enhanced gradient overlay - Ảnh nền với hiệu ứng gradient che phủ */}
      <div className="relative h-36 -mx-6 -mt-6 mb-4 overflow-hidden">
        <Image
          src={user.cover || "/noCover.png"}
          alt=""
          fill
          className="object-cover rounded-t-2xl transform group-hover:scale-105 transition-transform duration-700"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/5 group-hover:from-black/30 transition-all duration-500"></div>
      </div>
      
      {/* Avatar with enhanced animations - Ảnh đại diện với hiệu ứng zoom*/}
      <div className="flex justify-center -mt-16 mb-4 relative z-10">
        <Link href={`/profile/${user.username}`} className="block">
          <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-zinc-900 group-hover:ring-emerald-200 dark:group-hover:ring-emerald-900/30 transition-all duration-300 cursor-pointer">
            {/* Pulse effect behind avatar */}
            <div className="absolute inset-0 rounded-full animate-pulse-slow bg-gradient-to-r from-emerald-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <Image
              src={user.avatar || "/noAvatar.png"}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority
            />
            
            {/* Subtle hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </Link>
      </div>
      
      {/* User info with enhanced styling */}
      <div className="text-center relative z-10">
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-300">
          {user.name && user.surname
            ? user.name + " " + user.surname
            : user.username}
        </h2>
        
        {/* Followers badge */}
        <div className="flex items-center justify-center gap-2 text-sm mb-4">
          <div className="py-1.5 px-3 bg-zinc-50/80 dark:bg-zinc-800/30 rounded-lg border border-zinc-100/80 dark:border-zinc-700/30 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{user._count.followers}</span>
            <span className="text-zinc-500 dark:text-zinc-400">Followers</span>
          </div>
        </div>
      </div>
      
      {/* Button with enhanced styling */}
      <Link href={`/profile/${user.username}`} className="block">
        <button className={cn(
          "relative w-full flex items-center justify-center gap-2 overflow-hidden",
          "bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700",
          "hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-500 dark:hover:to-emerald-600",
          "text-white text-sm font-medium px-8 py-2.5 rounded-xl transition-all duration-300",
          "group-hover:shadow-md group-hover:shadow-emerald-500/10 dark:group-hover:shadow-emerald-400/5",
        )}>
          <span>Profile</span>
          <ExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          
          {/* Button hover effect */}
          <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      </Link>
    </div>
  );
};

export default ProfileCard;
