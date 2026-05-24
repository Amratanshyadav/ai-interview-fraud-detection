import { Router } from 'express';
import { getAIReport, exportReportPDF } from '../controllers/reportController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/:interviewId', authenticate, authorize(['recruiter', 'admin']), getAIReport);
router.get('/:interviewId/export', authenticate, authorize(['recruiter', 'admin']), exportReportPDF);

export default router;
