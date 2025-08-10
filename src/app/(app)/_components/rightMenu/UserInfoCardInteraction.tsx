"use client";

import { switchBlock, switchFollow } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Ban, Check, SquareX, UserCheck, UserMinus, UserPlus, UserX } from "lucide-react";

const UserInfoCardInteraction = ({
  userId,
  username,
  isUserBlocked,
  isFollowing,
  isFollowingSent,
}: {
  userId: string;
  username: string;
  isUserBlocked: boolean;
  isFollowing: boolean;
  isFollowingSent: boolean;
}) => {
  const { userId: currentUserId } = useAuth();
  const [blocked, setBlocked] = useState(isUserBlocked);
  const [following, setFollowing] = useState(isFollowing);
  const [requestSent, setRequestSent] = useState(isFollowingSent);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    setBlocked(isUserBlocked);
  }, [isUserBlocked]);

  useEffect(() => {
    setFollowing(isFollowing);
  }, [isFollowing]);

  useEffect(() => {
    setRequestSent(isFollowingSent);
  }, [isFollowingSent]);

  const onFollow = async () => {
    if (!currentUserId || isProcessing) return;
    setIsProcessing("follow");
    try {
      // Backend toggles request/follow state depending on current status
      await switchFollow(userId);
      // Optimistically toggle request state when not following
      if (!following) setRequestSent(prev => !prev);
    } finally {
      setIsProcessing(null);
    }
  };

  const onToggleFollow = async () => {
    if (!currentUserId || isProcessing) return;
    setIsProcessing("toggle-follow");
    try {
      // Backend toggles: when following -> unfollow, otherwise creates/cancels request
      await switchFollow(userId);
      if (following) {
        setFollowing(false);
        setRequestSent(false);
      }
    } finally {
      setIsProcessing(null);
    }
  };

  const onToggleBlock = async () => {
    if (!currentUserId || isProcessing) return;
    setIsProcessing("toggle-block");
    try {
      await switchBlock(userId);
      setBlocked(prev => !prev);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Follow/Unfollow or Request/Cancel */}
      {following && (
        <button
          onClick={onToggleFollow}
          disabled={!!isProcessing}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs disabled:opacity-50 flex items-center gap-1"
          title="Unfollow"
        >
          <UserMinus className="w-4 h-4" />
          <span className="hidden sm:inline">Unfollow</span>
        </button>
      )}

      <button
        onClick={onFollow}
        disabled={!!isProcessing}
        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs disabled:opacity-50 flex items-center gap-1"
        title={requestSent ? "Cancel request" : "Send request"}
      >
        {requestSent ? <SquareX className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
        <span className="hidden sm:inline">{requestSent ? "Cancel" : "Request"}</span>
      </button>

      {/* Block/Unblock */}
      <button
        onClick={onToggleBlock}
        disabled={!!isProcessing}
        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs disabled:opacity-50 flex items-center gap-1"
        title={blocked ? "Unblock" : "Block"}
      >
        {blocked ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
        <span className="hidden sm:inline">{blocked ? "Unblock" : "Block"}</span>
      </button>
    </div>
  );
};

export default UserInfoCardInteraction;



