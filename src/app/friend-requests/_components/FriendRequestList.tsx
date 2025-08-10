"use client";

import Image from "next/image";
import Link from "next/link";
import { acceptFollowRequest, declineFollowRequest } from "@/lib/actions";
import { useState } from "react";
import { FollowRequest, User } from "@prisma/client";

type RequestWithUser = FollowRequest & {
  sender: User;
};

const FriendRequestList = ({ requests }: { requests: RequestWithUser[] }) => {
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const handleAccept = async (requestId: number) => {
    if (isProcessing) return;
    setIsProcessing(requestId);
    await acceptFollowRequest(requestId);
    setIsProcessing(null);
  };

  const handleDecline = async (requestId: number) => {
    if (isProcessing) return;
    setIsProcessing(requestId);
    await declineFollowRequest(requestId);
    setIsProcessing(null);
  };

  if (!requests.length) {
    return (
      <div className="text-center text-zinc-500 dark:text-zinc-400 py-6">
        Không có lời mời kết bạn nào
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div key={request.id} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-zinc-900">
              <Image
                src={request.sender.avatar || "/noAvatar.png"}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Link href={`/profile/${request.sender.username}`} className="font-medium text-zinc-800 dark:text-zinc-200">
                {request.sender.name && request.sender.surname
                  ? `${request.sender.name} ${request.sender.surname}`
                  : request.sender.username}
              </Link>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">đã gửi lời mời kết bạn</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAccept(request.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-50"
              disabled={isProcessing === request.id}
            >
              Chấp nhận
            </button>
            <button
              onClick={() => handleDecline(request.id)}
              className="px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-sm disabled:opacity-50"
              disabled={isProcessing === request.id}
            >
              Từ chối
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequestList;


