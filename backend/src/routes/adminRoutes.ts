import { Router } from 'express';
import { getSystemStats, getAllUsers, updateUserStatus } from '../controllers/adminController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/stats', authenticate, authorize(['admin']), getSystemStats);
router.get('/users', authenticate, authorize(['admin']), getAllUsers);
router.put('/users/:userId/status', authenticate, authorize(['admin']), updateUserStatus);

export default router;
