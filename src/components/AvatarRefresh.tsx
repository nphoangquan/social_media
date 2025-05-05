"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { synchronizeUserAvatar } from "@/lib/actions";

// Component này không hiển thị gì nhưng giúp xử lý làm mới avatar
export default function AvatarRefresh() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [prevImageUrl, setPrevImageUrl] = useState('');
  const [syncInProgress, setSyncInProgress] = useState(false);
  
  // Theo dõi các thay đổi đối với avatar Clerk
  useEffect(() => {
    if (!user || !isLoaded || syncInProgress) return;
    
    // Chỉ kích hoạt làm mới nếu URL hình ảnh đã thay đổi
    if (user.imageUrl && user.imageUrl !== prevImageUrl) {
      console.log("Avatar image URL changed, syncing with database...");
      setPrevImageUrl(user.imageUrl);
      setSyncInProgress(true);
      
      // Tự động đồng bộ hóa với cơ sở dữ liệu khi avatar thay đổi
      synchronizeUserAvatar().then((result) => {
        if (result.success) {
          console.log("Avatar synchronized successfully");
          
          // Buộc server component làm mới sau khi đồng bộ thành công
          const timeout = setTimeout(() => {
            // Làm mới route hiện tại
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
  
  // Component này không hiển thị bất kỳ thứ gì nhìn thấy được
  return null;
} 