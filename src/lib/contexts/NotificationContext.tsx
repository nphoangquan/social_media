'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useUser } from '@clerk/nextjs';
import { NotificationPayload } from '../socket';

type NotificationContextType = {
  notifications: NotificationPayload[];
  unreadCount: number;
  addNotification: (notification: NotificationPayload) => void;
  clearNotifications: () => void;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  loading: boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { user } = useUser();

  // Fetch thông báo từ API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications);
      
      // Đếm số thông báo chưa đọc
      const unread = data.notifications.filter((n: NotificationPayload) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Thêm thông báo mới
  const addNotification = useCallback((notification: NotificationPayload) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // Lắng nghe sự kiện thông báo mới từ server
  useEffect(() => {
    if (socket && user) {
      socket.on('notification', (notification: NotificationPayload) => {
        console.log('Received notification:', notification);
        if (notification.receiverId === user.id) {
          addNotification(notification);
        }
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket, user, addNotification]);

  // Fetch thông báo khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Xóa tất cả thông báo
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Đánh dấu một thông báo đã đọc
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      // Cập nhật state
      setNotifications((prev) => 
        prev.map((n) => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      
      // Giảm số thông báo chưa đọc
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readAll: true }),
      });

      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      
      // Cập nhật state
      setNotifications((prev) => 
        prev.map((n) => ({ ...n, isRead: true }))
      );
      
      // Reset số thông báo chưa đọc
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Xóa một thông báo
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) throw new Error('Failed to delete notification');
      
      // Cập nhật state
      setNotifications((prev) => {
        const notification = prev.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  // Xóa tất cả thông báo
  const deleteAllNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteAll: true }),
      });

      if (!response.ok) throw new Error('Failed to delete all notifications');
      
      // Cập nhật state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount,
        addNotification, 
        clearNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        fetchNotifications,
        loading
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 