import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Interview } from '../models/Interview';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logger } from '../config/logger';
import { MockDBStore } from '../utils/mockDB';

export const createInterview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, candidateEmail, scheduledAt, duration } = req.body;
    const recruiterId = req.user?.id;

    if (!recruiterId) {
      return res.status(401).json({ success: false, message: 'Recruiter session required.' });
    }

    // Resilient Fallback Check
    if (global.isMockDB) {
      let candidate = MockDBStore.users.find((u) => u.email === candidateEmail);
      if (!candidate) {
        candidate = {
          _id: `mock_candidate_${Date.now()}`,
          name: candidateEmail.split('@')[0],
          email: candidateEmail,
          password: 'password123',
          role: 'candidate',
          status: 'active',
          comparePassword: async (pwd: string) => pwd === 'password123',
        };
        MockDBStore.users.push(candidate);
      }

      const accessKey = crypto.randomBytes(3).toString('hex').toUpperCase();

      const newInterview = {
        _id: `mock_interview_${Date.now()}`,
        title,
        recruiterId: { _id: recruiterId, name: 'Sarah Jenkins', email: 'recruiter@intellihire.com' },
        candidateId: { _id: candidate._id, name: candidate.name, email: candidate.email },
        scheduledAt: new Date(scheduledAt),
        duration: duration || 30,
        accessKey,
        status: 'scheduled',
      };

      MockDBStore.interviews.push(newInterview);
      logger.info(`[MOCK DB] Created interview session: ${title} - Key: ${accessKey}`);

      return res.status(201).json({
        success: true,
        message: 'Interview scheduled successfully (Mock DB)',
        interview: newInterview,
      });
    }

    let candidate = await User.findOne({ email: candidateEmail });
    if (!candidate) {
      candidate = new User({
        name: candidateEmail.split('@')[0],
        email: candidateEmail,
        password: crypto.randomBytes(8).toString('hex'),
        role: 'candidate',
      });
      await candidate.save();
    }

    const accessKey = crypto.randomBytes(3).toString('hex').toUpperCase();

    const interview = new Interview({
      title,
      recruiterId,
      candidateId: candidate._id,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 30,
      accessKey,
      status: 'scheduled',
    });

    await interview.save();
    logger.info(`Interview scheduled: ${interview.title} - Key: ${accessKey}`);

    return res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      interview,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterInterviews = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const recruiterId = req.user?.id;

    if (global.isMockDB) {
      const list = MockDBStore.interviews.filter(
        (i) => i.recruiterId === recruiterId || i.recruiterId?._id === recruiterId
      );
      return res.status(200).json({ success: true, interviews: list });
    }

    const interviews = await Interview.find({ recruiterId })
      .populate('candidateId', 'name email status')
      .sort({ scheduledAt: -1 });

    return res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateInterviews = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const candidateId = req.user?.id;

    if (global.isMockDB) {
      const list = MockDBStore.interviews.filter(
        (i) => i.candidateId === candidateId || i.candidateId?._id === candidateId
      );
      return res.status(200).json({ success: true, interviews: list });
    }

    const interviews = await Interview.find({ candidateId })
      .populate('recruiterId', 'name email')
      .sort({ scheduledAt: -1 });

    return res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

export const joinInterviewByKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { accessKey } = req.body;
    const userId = req.user?.id;

    if (global.isMockDB) {
      const interview = MockDBStore.interviews.find((i) => i.accessKey === accessKey);
      if (!interview) {
        return res.status(404).json({ success: false, message: 'Interview not found.' });
      }

      const candId = interview.candidateId?._id || interview.candidateId;
      const recId = interview.recruiterId?._id || interview.recruiterId;

      const isCandidate = candId === userId;
      const isRecruiter = recId === userId;

      if (!isCandidate && !isRecruiter) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }

      if (isCandidate && interview.status === 'scheduled') {
        interview.status = 'ongoing';
      }

      return res.status(200).json({
        success: true,
        interview,
        role: isRecruiter ? 'recruiter' : 'candidate',
      });
    }

    const interview = await Interview.findOne({ accessKey })
      .populate('recruiterId', 'name email')
      .populate('candidateId', 'name email status');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Invalid access key. Interview session not found.',
      });
    }

    const isCandidate = interview.candidateId._id.toString() === userId;
    const isRecruiter = interview.recruiterId._id.toString() === userId;

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You are not a registered participant of this interview.',
      });
    }

    if (isCandidate && interview.status === 'scheduled') {
      interview.status = 'ongoing';
      await interview.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Joined interview successfully',
      interview,
      role: isRecruiter ? 'recruiter' : 'candidate',
    });
  } catch (error) {
    next(error);
  }
};

export const endInterview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user?.id;

    if (global.isMockDB) {
      const interview = MockDBStore.interviews.find((i) => i._id === interviewId);
      if (!interview) return res.status(404).json({ success: false, message: 'Session not found.' });

      interview.status = 'completed';
      return res.status(200).json({ success: true, interview });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    if (
      interview.recruiterId.toString() !== userId &&
      interview.candidateId.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    interview.status = 'completed';
    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Interview marked as completed successfully',
      interview,
    });
  } catch (error) {
    next(error);
  }
};
