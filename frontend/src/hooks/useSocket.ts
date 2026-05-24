import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (interviewId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Establish WebSocket Connection with Authentication payloads
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket.IO Connection established successfully.');
      if (interviewId) {
        socket.emit('joinRoom', { interviewId });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket.IO disconnected.');
    });

    return () => {
      socket.disconnect();
    };
  }, [interviewId]);

  const sendMessage = (roomId: string, messageText: string) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', { interviewId: roomId, message: messageText });
    }
  };

  const emitTyping = (roomId: string, isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { interviewId: roomId, isTyping });
    }
  };

  const subscribeToEvent = (eventName: string, callback: (data: any) => void) => {
    const socket = socketRef.current;
    if (socket) {
      socket.on(eventName, callback);
    }
    return () => {
      if (socket) {
        socket.off(eventName, callback);
      }
    };
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    emitTyping,
    subscribeToEvent,
  };
};
