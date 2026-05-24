import { Router } from 'express';
import { getChatHistory, markMessagesAsRead } from '../controllers/chatController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/:interviewId/history', authenticate, getChatHistory);
router.put('/:interviewId/read', authenticate, markMessagesAsRead);

export default router;
