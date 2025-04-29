import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';

export const useSocket = () => {
  const { user } = useUser();
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket.current && user) {
      // Khởi tạo socket connection
      socket.current = io(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin, {
        path: '/api/socket',
      });

      // Join user's room
      socket.current.emit('join', user.id);

      // Cleanup khi component unmount
      return () => {
        if (socket.current) {
          socket.current.disconnect();
          socket.current = null;
        }
      };
    }
  }, [user]);

  return socket.current;
}; 