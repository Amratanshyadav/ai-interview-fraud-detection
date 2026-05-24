import { Router } from 'express';
import {
  createInterview,
  getRecruiterInterviews,
  getCandidateInterviews,
  joinInterviewByKey,
  endInterview,
} from '../controllers/interviewController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.post('/', authenticate, authorize(['recruiter', 'admin']), createInterview);
router.get('/recruiter', authenticate, authorize(['recruiter', 'admin']), getRecruiterInterviews);
router.get('/candidate', authenticate, authorize(['candidate']), getCandidateInterviews);
router.post('/join', authenticate, joinInterviewByKey);
router.put('/:interviewId/end', authenticate, endInterview);

export default router;
