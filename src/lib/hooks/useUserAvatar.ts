"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

// Custom hook to ensure consistent use of avatars across the app
export function useUserAvatar() {
  const { user, isLoaded } = useUser();
  const [avatarUrl, setAvatarUrl] = useState<string>("/noAvatar.png");

  useEffect(() => {
    if (!user || !isLoaded) return;

    // Use Clerk's imageUrl which is always up-to-date
    if (user.imageUrl) {
      setAvatarUrl(user.imageUrl);
    }
  }, [user, isLoaded]);

  return { avatarUrl, isLoaded };
} 