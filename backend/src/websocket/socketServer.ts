import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/token';
import { ChatMessage } from '../models/ChatMessage';
import { User } from '../models/User';
import { logger } from '../config/logger';

let ioInstance: Server | null = null;

export const initSocketServer = (server: HttpServer): Server => {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Authentication Middleware for WebSockets
  ioInstance.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      if (!token) {
        return next(new Error('Authentication failed. Connection refused.'));
      }

      const rawToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const decoded = verifyAccessToken(rawToken);
      socket.data = { userId: decoded.id, role: decoded.role };
      next();
    } catch (err: any) {
      logger.warn(`Websocket authentication failure: ${err.message}`);
      next(new Error('Unauthorized connection.'));
    }
  });

  ioInstance.on('connection', (socket: Socket) => {
    const { userId, role } = socket.data;
    logger.info(`Websocket Client Connected: ${userId} - Role: ${role}`);

    // Join Private Interview Room
    socket.on('joinRoom', async ({ interviewId }) => {
      socket.join(interviewId);
      logger.info(`Client ${userId} joined room ${interviewId}`);

      // Broadcast system entrance note to participants
      const user = await User.findById(userId);
      if (user) {
        socket.to(interviewId).emit('presenceUpdate', {
          userId,
          name: user.name,
          role,
          status: 'online',
        });
      }
    });

    // Real-Time Chat Message Handler
    socket.on('sendMessage', async ({ interviewId, message }) => {
      try {
        const chatMsg = new ChatMessage({
          interviewId,
          senderId: userId,
          message,
          messageType: 'text',
        });
        await chatMsg.save();

        const populatedMsg = await chatMsg.populate('senderId', 'name email role');
        
        // Broadcast message to everyone in the room
        ioInstance?.to(interviewId).emit('receiveMessage', populatedMsg);
        logger.info(`Chat message saved & broadcasted inside room ${interviewId}`);
      } catch (err: any) {
        logger.error(`Error saving websocket message: ${err.message}`);
      }
    });

    // Dynamic Typing Indicators
    socket.on('typing', ({ interviewId, isTyping }) => {
      socket.to(interviewId).emit('typingStatus', {
        userId,
        isTyping,
      });
    });

    // Disconnect Handler
    socket.on('disconnect', () => {
      logger.info(`Websocket client disconnected: ${userId}`);
    });
  });

  return ioInstance;
};

export const getSocketIOInstance = (): Server | null => {
  return ioInstance;
};
