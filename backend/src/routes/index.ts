import { Router } from 'express';
import authRoutes from './authRoutes';
import interviewRoutes from './interviewRoutes';
import fraudRoutes from './fraudRoutes';
import chatRoutes from './chatRoutes';
import reportRoutes from './reportRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/interviews', interviewRoutes);
router.use('/fraud', fraudRoutes);
router.use('/chat', chatRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

export default router;
