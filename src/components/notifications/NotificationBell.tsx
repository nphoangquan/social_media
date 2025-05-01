'use client';

import { Bell } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/lib/contexts/NotificationContext";
import { useEffect, useState } from "react";

const NotificationBell = () => {
  const { unreadCount, fetchNotifications } = useNotifications();
  const [isAnimating, setIsAnimating] = useState(false);

  // Thêm hiệu ứng rung khi có thông báo mới
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [unreadCount]);

  // Refresh thông báo mỗi phút
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <Link 
      href="/notifications" 
      className="relative cursor-pointer"
    >
      <div className="relative z-10">
        <Bell className={`w-5 h-5 text-white transition-opacity duration-200 cursor-pointer ${isAnimating ? 'animate-[wiggle_0.5s_ease-in-out_infinite]' : ''}`} />
        <Bell className={`w-5 h-5 absolute inset-0 text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer ${isAnimating ? 'animate-[wiggle_0.5s_ease-in-out_infinite]' : ''}`} />
      </div>
      
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 min-w-4 flex items-center justify-center px-1 shadow-lg z-10">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell; 