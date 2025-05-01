"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { synchronizeUserAvatar } from "@/lib/actions";

// This component doesn't render anything but helps handle avatar refresh
export default function AvatarRefresh() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [prevImageUrl, setPrevImageUrl] = useState('');
  const [syncInProgress, setSyncInProgress] = useState(false);
  
  // Watch for changes to the Clerk avatar
  useEffect(() => {
    if (!user || !isLoaded || syncInProgress) return;
    
    // Only trigger a refresh if the image URL has changed
    if (user.imageUrl && user.imageUrl !== prevImageUrl) {
      console.log("Avatar image URL changed, syncing with database...");
      setPrevImageUrl(user.imageUrl);
      setSyncInProgress(true);
      
      // Automatically synchronize with the database when avatar changes
      synchronizeUserAvatar().then((result) => {
        if (result.success) {
          console.log("Avatar synchronized successfully");
          
          // Force a server component refresh after successful sync
          const timeout = setTimeout(() => {
            // Refresh the current route
            router.refresh();
          }, 500);
          
          return () => clearTimeout(timeout);
        } else {
          console.error("Failed to sync avatar:", result.error);
        }
      }).catch(error => {
        console.error("Error during avatar sync:", error);
      }).finally(() => {
        setSyncInProgress(false);
      });
    }
  }, [user, isLoaded, prevImageUrl, router, syncInProgress]);
  
  // This component doesn't render anything visible
  return null;
} 