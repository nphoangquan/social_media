"use client";

import { acceptFollowRequest, declineFollowRequest } from "@/lib/actions";
import { FollowRequest, User } from "@prisma/client";
import Image from "next/image";
import { useOptimistic, useState } from "react";
import { Check, X } from "lucide-react";

type RequestWithUser = FollowRequest & {
  sender: User;
};

const FriendRequestList = ({ requests }: { requests: RequestWithUser[] }) => {
  const [requestState, setRequestState] = useState(requests);

  const accept = async (requestId: number, userId: string) => {
    removeOptimisticRequest(requestId);
    try {
      await acceptFollowRequest(userId);
      setRequestState((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      console.error("Error accepting follow request:", err);
    }
  };
  
  const decline = async (requestId: number, userId: string) => {
    removeOptimisticRequest(requestId);
    try {
      await declineFollowRequest(userId);
      setRequestState((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      console.error("Error declining follow request:", err);
    }
  };

  const [optimisticRequests, removeOptimisticRequest] = useOptimistic(
    requestState,
    (state, value: number) => state.filter((req) => req.id !== value)
  );
  
  return (
    <div className="flex flex-col gap-4">
      {optimisticRequests.map((request) => (
        <div 
          className="flex items-center justify-between bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl p-3 group hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all" 
          key={request.id}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-zinc-900 shadow-md">
              <Image
                src={request.sender.avatar || "/noAvatar.png"}
                alt=""
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {request.sender.name && request.sender.surname
                ? request.sender.name + " " + request.sender.surname
                : request.sender.username}
            </span>
          </div>
          <div className="flex gap-2">
            <form action={() => accept(request.id, request.sender.id)}>
              <button
                title="Accept Friend Request"
                className="w-7 h-7 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
              >
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>
            </form>
            <form action={() => decline(request.id, request.sender.id)}>
              <button
                title="Decline Friend Request"
                className="w-7 h-7 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
              >
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </form>
          </div>
        </div>
      ))}
      
      {optimisticRequests.length === 0 && (
        <div className="text-center py-2 text-zinc-500 dark:text-zinc-400">
          No pending requests
        </div>
      )}
    </div>
  );
};

export default FriendRequestList;
