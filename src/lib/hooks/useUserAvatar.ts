"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

// Hook tùy chỉnh để đảm bảo sử dụng avatar nhất quán trong toàn bộ ứng dụng
export function useUserAvatar() {
  const { user, isLoaded } = useUser();
  const [avatarUrl, setAvatarUrl] = useState<string>("/noAvatar.png");

  useEffect(() => {
    if (!user || !isLoaded) return;

    // Sử dụng imageUrl của Clerk, luôn được cập nhật
    if (user.imageUrl) {
      setAvatarUrl(user.imageUrl);
    }
  }, [user, isLoaded]);

  return { avatarUrl, isLoaded };
} 