import { Server as NetServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { NextApiResponse } from 'next';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

// Global instance of Socket.IO server
let globalSocketIO: SocketIOServer | null = null;

// Định nghĩa một interface cho server có thuộc tính io
interface ServerWithIO extends NetServer {
  io?: SocketIOServer;
}

// Tạo type linh hoạt cho res parameter
type SocketResponse = {
  socket?: {
    server?: ServerWithIO | Record<string, unknown>;
  };
} | null | undefined;

export const initSocket = (res: SocketResponse): SocketIOServer => {
  // Nếu đã có instance Socket.IO, trả về instance đó
  if (globalSocketIO) {
    return globalSocketIO;
  }

  // Kiểm tra xem res có phải là NextApiResponseServerIO không
  if (res?.socket?.server) {
    const server = res.socket.server as ServerWithIO;
    
    // Kiểm tra xem đã có Socket.IO server chưa
    if (!server.io) {
      console.log('Initializing Socket.IO server...');
      const io = new SocketIOServer(server);
      server.io = io;

      io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join', (userId: string) => {
          socket.join(userId);
          console.log(`User ${userId} joined their room`);
        });

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
        });
      });

      globalSocketIO = io;
    }
    return server.io;
  }

  // Nếu không thể khởi tạo từ res, trả về một mock Socket.IO server
  console.warn('Cannot initialize Socket.IO from request/response. Using mock implementation.');
  if (!globalSocketIO) {
    // Mock Socket.IO server cho môi trường không hỗ trợ
    globalSocketIO = {
      to: () => ({
        emit: () => console.log('Mock socket emit called')
      }),
      on: () => console.log('Mock socket on called'),
      // Thêm các methods khác nếu cần
    } as unknown as SocketIOServer;
  }
  
  return globalSocketIO;
};

export type NotificationPayload = {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  receiverId: string;
  postId?: number;
  commentId?: number;
  link?: string;
  createdAt: Date;
}; 