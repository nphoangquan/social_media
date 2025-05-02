import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import { User } from "@prisma/client";
import Link from "next/link";
import UserInfoCardInteraction from "./UserInfoCardInteraction";
import UpdateUser from "./UpdateUser";

// Lucide Icons
import {
  MapPin,
  GraduationCap,
  Briefcase,
  Link as LinkIcon,
  CalendarDays,
  MoreVertical,
  Cake,
} from "lucide-react";

const UserInfoCard = async ({ user }: { user: User }) => {
  const createdAtDate = new Date(user.createdAt);

  const formattedDate = createdAtDate.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format ngày sinh theo kiểu Việt Nam
  let formattedBirthDate = "";
  if (user.birthDate) {
    const birthDate = new Date(user.birthDate);
    formattedBirthDate = birthDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  let isUserBlocked = false;
  let isFollowing = false;
  let isFollowingSent = false;

  const { userId: currentUserId } = await auth();

  if (currentUserId) {
    const blockRes = await prisma.block.findFirst({
      where: {
        blockerId: currentUserId,
        blockedId: user.id,
      },
    });

    isUserBlocked = !!blockRes;

    const followRes = await prisma.follower.findFirst({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });

    isFollowing = !!followRes;

    const followReqRes = await prisma.followRequest.findFirst({
      where: {
        senderId: currentUserId,
        receiverId: user.id,
      },
    });

    isFollowingSent = !!followReqRes;
  }

  return (
    <div className="p-6 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-lg dark:shadow-zinc-800/20 text-sm border border-zinc-100/50 dark:border-zinc-800/50 hover:shadow-xl dark:hover:shadow-zinc-800/30 transition-all duration-300 flex flex-col gap-4">
      {/* TOP */}
      <div className="flex justify-between items-center mb-2 font-medium text-zinc-500 dark:text-zinc-400">
        <span className="text-xs uppercase tracking-wider font-semibold">User Information</span>
        {currentUserId === user.id ? (
          <UpdateUser user={user} />
        ) : (
          <MoreVertical className="w-4 h-4 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors" />
        )}
      </div>

      {/* BOTTOM */}
      <div className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-300">
        <div className="flex items-center gap-2">
          <span className="text-xl text-zinc-900 dark:text-zinc-100 font-medium">
            {user.name && user.surname ? `${user.name} ${user.surname}` : user.username}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">@{user.username}</span>
        </div>

        {user.description && <p className="leading-relaxed">{user.description}</p>}

        {user.city && (
          <div className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
            <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>
              Living in <b className="text-zinc-800 dark:text-zinc-200">{user.city}</b>
            </span>
          </div>
        )}

        {user.school && (
          <div className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
            <GraduationCap className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>
              Went to <b className="text-zinc-800 dark:text-zinc-200">{user.school}</b>
            </span>
          </div>
        )}

        {user.work && (
          <div className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
            <Briefcase className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>
              Works at <b className="text-zinc-800 dark:text-zinc-200">{user.work}</b>
            </span>
          </div>
        )}

        {user.website && (
          <div className="flex gap-1 items-center group hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <LinkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <Link
              href={user.website}
              className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium"
            >
              {user.website}
            </Link>
          </div>
        )}
        
        {user.birthDate && (
          <div className="flex gap-1 items-center text-xs text-zinc-500 dark:text-zinc-400 group hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <Cake className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Born on <b className="text-zinc-800 dark:text-zinc-200">{formattedBirthDate}</b></span>
          </div>
        )}
        
        <div className="flex gap-1 items-center text-xs text-zinc-500 dark:text-zinc-400 group hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          <CalendarDays className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Joined {formattedDate}</span>
        </div>

        {currentUserId && currentUserId !== user.id && (
          <UserInfoCardInteraction
            userId={user.id}
            isUserBlocked={isUserBlocked}
            isFollowing={isFollowing}
            isFollowingSent={isFollowingSent}
          />
        )}
      </div>
    </div>
  );
};

export default UserInfoCard;
