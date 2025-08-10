'use client';

import { useEffect, useState } from 'react';
import { getUnreadCount } from '@/lib/actions/messages';
import { io, Socket } from 'socket.io-client';
import { isFeatureEnabled } from '@/shared/constants/featureFlags';
import { useAuth } from '@clerk/nextjs';

export default function MessagesBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;

    // Load unread count
    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();

    // Set socket cho real-time updates
    if (!socket && isFeatureEnabled('enableSocketNotifications')) {
      const newSocket = io('', {
        path: '/api/socket',
        autoConnect: false
      });
      
      newSocket.connect();
      newSocket.emit('join', userId);
      
      setSocket(newSocket);
    }

    if (socket) {
      const handleNewMessage = async () => {
        // Khi nhận được tin nhắn mới, cập nhật số lượng tin nhắn chưa đọc
        try {
          const count = await getUnreadCount();
          setUnreadCount(count);
        } catch (error) {
          console.error('Error updating unread count:', error);
        }
      };
      
      socket.on('new_message', handleNewMessage);
      
      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [userId, socket]);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-medium text-white">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
} 