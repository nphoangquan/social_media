import Feed from "@/components/feed/Feed";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { notFound } from "next/navigation";

const ProfilePage = async ({ params }: { params: { username: string } }) => {
  const {username} = await params;

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
    include: {
      _count: {
        select: {
          followers: true,
          followings: true,
          posts: true,
        },
      },
    },
  });

  if (!user) return notFound();

  const { userId: currentUserId } = await auth();

  let isBlocked;

  if (currentUserId) {
    const res = await prisma.block.findFirst({
      where: {
        blockerId: user.id,
        blockedId: currentUserId,
      },
    });

    if (res) isBlocked = true;
  } else {
    isBlocked = false;
  }

  if (isBlocked) return notFound();

  return (
    <div className="flex gap-6 pt-6">
      <div className="hidden xl:block w-[20%]">
        <LeftMenu type="profile" />
      </div>
      <div className="w-full lg:w-[70%] xl:w-[50%]">
        <div className="flex flex-col gap-8">
          {/* Profile Header */}
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-zinc-800/50">
            {/* Cover Image */}
            <div className="w-full h-52 md:h-64 relative">
              <Image
                src={user.cover || "/noCover.png"}
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            
            {/* Profile Info */}
            <div className="relative px-8 pb-8">
              {/* Avatar */}
              <div className="relative -mt-20 mb-6 flex justify-center md:justify-start">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-zinc-900 shadow-xl">
                  <Image
                    src={user.avatar || "/noAvatar.png"}
                    alt=""
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between">
                <div className="text-center md:text-left mb-5 md:mb-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-2">
                    {user.name && user.surname
                      ? user.name + " " + user.surname
                      : user.username}
                  </h1>
                  <p className="text-sm text-zinc-400">@{user.username}</p>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-12">
                  <div className="flex flex-col items-center md:items-start">
                    <span className="text-xl font-bold text-zinc-100">{user._count.posts}</span>
                    <span className="text-xs text-zinc-400">Posts</span>
                  </div>
                  <div className="flex flex-col items-center md:items-start">
                    <span className="text-xl font-bold text-zinc-100">{user._count.followers}</span>
                    <span className="text-xs text-zinc-400">Followers</span>
                  </div>
                  <div className="flex flex-col items-center md:items-start">
                    <span className="text-xl font-bold text-zinc-100">{user._count.followings}</span>
                    <span className="text-xs text-zinc-400">Following</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Feed username={user.username}/>
        </div>
      </div>
      <div className="hidden lg:block w-[30%]">
        <RightMenu user={user} />
      </div>
    </div>
  );
};

export default ProfilePage;