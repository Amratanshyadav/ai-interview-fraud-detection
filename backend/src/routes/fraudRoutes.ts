import { Router } from 'express';
import { logFraudEvent, getInterviewEvents } from '../controllers/fraudController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/event', authenticate, logFraudEvent);
router.get('/:interviewId/events', authenticate, getInterviewEvents);

export default router;
