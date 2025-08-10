import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import FriendsList from "./_components/FriendsList";
import FriendsSearch from "./_components/FriendsSearch";

export default async function FriendsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-200 mb-2">Not authenticated</h1>
          <p className="text-zinc-400">Please sign in to view your friends</p>
        </div>
      </div>
    );
  }

  // Lấy 10 người bạn đầu tiên cho việc hiển thị ban đầu
  const followers = await prisma.follower.findMany({
    where: {
      followingId: userId,
    },
    include: {
      follower: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 15, // Chỉ lấy 15 người đầu tiên cho việc tải ban đầu
  });

  // Chuyển đổi từ người theo dõi sang đối tượng người dùng
  const initialFriends = followers.map(follow => follow.follower);

  // Lấy tổng số lượng cho component tìm kiếm
  const totalCount = await prisma.follower.count({
    where: {
      followingId: userId,
    },
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto py-8 px-4">
      {/* Thanh bên danh sách bạn bè */}
      <div className="w-full">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 p-6 border border-zinc-100/50 dark:border-zinc-800/50">
          <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Friends</h1>
          <div className="mb-4">
            <FriendsSearch totalFriends={totalCount} />
          </div>
          <FriendsList initialFriends={initialFriends} />
        </div>
      </div>
    </div>
  );
} 