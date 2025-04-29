import Feed from "@/components/feed/Feed";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";

type PageProps = {
  params: Promise<{ username: string }>;
};

const ProfilePage = async ({ params }: PageProps) => {
  const { username } = await params;
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-200 mb-2">Not authenticated</h1>
          <p className="text-zinc-400">Please sign in to view profiles</p>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    notFound();
  }

  let isBlocked;

  if (userId) {
    const res = await prisma.block.findFirst({
      where: {
        blockerId: user.id,
        blockedId: userId,
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
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 p-6 border border-zinc-100/50 dark:border-zinc-800/50">
            <div className="mb-6">
              <Link
                href="/friends"
                className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                <span>Back to friends</span>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white dark:ring-zinc-800 shadow-xl mx-auto md:mx-0">
                <Image
                  src={user.avatar || "/noAvatar.png"}
                  alt={user.username}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                  {user.name && user.surname 
                    ? `${user.name} ${user.surname}` 
                    : user.username}
                </h1>
                
                <div className="text-zinc-500 dark:text-zinc-400 mb-4">
                  @{user.username}
                </div>

                {user.description && (
                  <div className="text-zinc-600 dark:text-zinc-300 mb-6 max-w-lg">
                    {user.description}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mb-6 justify-center md:justify-start">
                  {user.city && (
                    <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>{user.city}</span>
                    </div>
                  )}
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