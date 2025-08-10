import AddPost from "@/shared/ui/AddPost";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import Stories from "@/app/(app)/_components/Stories";
import Feed from "@/app/(app)/_components/Feed";
import LeftMenu from "@/app/(app)/_components/LeftMenu";
import RightMenu from "@/app/(app)/_components/RightMenu";

const Homepage = async () => {
  const { userId: currentUserId } = await auth();
  const stories = currentUserId
    ? await prisma.story.findMany({
        where: { expiresAt: { gt: new Date() } },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    : [];

  return (
    <div className="flex gap-6 pt-6">
      <div className="hidden xl:block w-[16%]">
        <LeftMenu type="home"/>
      </div>
      <div className="w-full lg:w-[75%] xl:w-[62%]">
        <div className="flex flex-col gap-4">
          {currentUserId && stories.length > 0 && (
            <Stories stories={stories as any} />
          )}
          <AddPost />
          <Feed />
        </div>
      </div>
      <div className="hidden lg:block w-[26%]">
        <RightMenu />
      </div>
    </div>
  );
};

export default Homepage;