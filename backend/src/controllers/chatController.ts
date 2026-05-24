import { Response, NextFunction } from 'express';
import { ChatMessage } from '../models/ChatMessage';
import { AuthenticatedRequest } from '../middlewares/auth';
import { MockDBStore } from '../utils/mockDB';

export const getChatHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { interviewId } = req.params;

    if (global.isMockDB) {
      const list = MockDBStore.chatMessages
        .filter((c) => c.interviewId === interviewId)
        .map((c) => {
          const sender = MockDBStore.users.find((u) => u._id === c.senderId);
          return {
            ...c,
            senderId: sender ? { _id: sender._id, name: sender.name, email: sender.email, role: sender.role } : c.senderId
          };
        });
      return res.status(200).json({ success: true, messages: list });
    }

    const messages = await ChatMessage.find({ interviewId })
      .populate('senderId', 'name email role')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    if (global.isMockDB) {
      MockDBStore.chatMessages.forEach((c) => {
        if (c.interviewId === interviewId && c.senderId !== userId) {
          if (!c.readBy.includes(userId)) {
            c.readBy.push(userId);
          }
        }
      });
      return res.status(200).json({ success: true, message: 'Mock messages read.' });
    }

    await ChatMessage.updateMany(
      { interviewId, senderId: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    return res.status(200).json({
      success: true,
      message: 'Messages marked as read.',
    });
  } catch (error) {
    next(error);
  }
};
