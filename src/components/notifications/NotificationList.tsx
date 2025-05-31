'use client';

import { useNotifications } from "@/lib/contexts/NotificationContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import { NotificationPayload } from "@/lib/socket";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { Bell, Heart, MessageCircle, UserPlus, FileText, CheckCheck, Trash2, X, Cake } from "lucide-react";

const NotificationItem = ({ notification }: { notification: NotificationPayload }) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    // Update thời gian
    const updateTimeAgo = () => {
      const date = new Date(notification.createdAt);
      setTimeAgo(
        formatDistanceToNow(date, { addSuffix: true, locale: vi })
      );
    };
    
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update mỗi phút
    
    return () => clearInterval(interval);
  }, [notification.createdAt]);
  
  // Xác định icon dựa trên loại thông báo
  const getIcon = () => {
    switch (notification.type) {
      case 'LIKE':
        return <Heart className="w-4 h-4 text-red-400" />;
      case 'COMMENT':
        return <MessageCircle className="w-4 h-4 text-blue-400" />;
      case 'FOLLOW':
        return <UserPlus className="w-4 h-4 text-green-400" />;
      case 'POST':
        return <FileText className="w-4 h-4 text-yellow-400" />;
      case 'BIRTHDAY':
        return <Cake className="w-4 h-4 text-pink-400" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };
  
  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn Link component activation
    e.stopPropagation(); // Ngăn event propagation
    
    if (isDeleting) return;
    
    setIsDeleting(true);
    await deleteNotification(notification.id);
    setIsDeleting(false);
  };
  
  return (
    <Link 
      href={notification.link || '/notifications'}
      onClick={handleClick}
      className={`flex items-start gap-3 p-4 rounded-lg transition-colors group ${notification.isRead ? 'bg-zinc-900' : 'bg-zinc-800'}`}
    >
      <div className="flex-shrink-0">
        {notification.senderAvatar ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image 
              src={notification.senderAvatar} 
              alt={notification.senderName || 'User'}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <p className={`text-sm ${notification.isRead ? 'text-zinc-300' : 'text-zinc-100 font-medium'}`}>
            {notification.message}
          </p>
          <div className="flex items-center gap-2">
            {notification.isRead && (
              <CheckCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-700 rounded ${isDeleting ? 'cursor-not-allowed' : ''}`}
              title="Delete notification"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <X className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
              )}
            </button>
          </div>
        </div>
        <span className="text-xs text-zinc-500 mt-1">{timeAgo}</span>
      </div>
    </Link>
  );
};

const NotificationList = () => {
  const { notifications, loading, unreadCount, markAllAsRead, deleteAllNotifications } = useNotifications();
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  
  // Nhóm thông báo theo ngày
  const [todayNotifications, setTodayNotifications] = useState<NotificationPayload[]>([]);
  const [earlierNotifications, setEarlierNotifications] = useState<NotificationPayload[]>([]);
  
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayItems: NotificationPayload[] = [];
    const earlierItems: NotificationPayload[] = [];
    
    notifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt);
      if (notificationDate >= today) {
        todayItems.push(notification);
      } else {
        earlierItems.push(notification);
      }
    });
    
    setTodayNotifications(todayItems);
    setEarlierNotifications(earlierItems);
  }, [notifications]);

  const handleDeleteAll = async () => {
    if (isDeletingAll) return;
    
    setIsDeletingAll(true);
    await deleteAllNotifications();
    setIsDeletingAll(false);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-300"></div>
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Bell className="w-16 h-16 text-zinc-600 mb-4" />
        <h3 className="text-xl font-semibold">Không có thông báo</h3>
        <p className="text-zinc-500 mt-2">Bạn sẽ nhận được thông báo khi có sự tương tác với bạn</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
          
          <button 
            onClick={handleDeleteAll}
            disabled={isDeletingAll}
            className={`text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 ${isDeletingAll ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {isDeletingAll ? (
              <>
                <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Xóa tất cả
              </>
            )}
          </button>
        </div>
      </div>
      
      {todayNotifications.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-sm text-zinc-500 uppercase">Hôm nay</h3>
          <div className="flex flex-col divide-y divide-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
            {todayNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      )}
      
      {earlierNotifications.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-sm text-zinc-500 uppercase">Trước đây</h3>
          <div className="flex flex-col divide-y divide-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
            {earlierNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationList; 