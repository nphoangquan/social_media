import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
// import Image from "next/image";
import StoryList from "./StoryList";

const Stories = async () => {
  const { userId: currentUserId } = await auth();

  if (!currentUserId) return null;

  const stories = await prisma.story.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });
  
  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-md dark:shadow-zinc-800/30 p-4">
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        <StoryList stories={stories} userId={currentUserId}/>
      </div>
    </div>
  );
};

export default Stories;