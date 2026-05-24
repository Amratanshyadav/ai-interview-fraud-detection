import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Interview } from '../models/Interview';
import { AIReport } from '../models/AIReport';
import { logger } from '../config/logger';

export const getSystemStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalInterviews = await Interview.countDocuments();
    const completedInterviews = await Interview.countDocuments({ status: 'completed' });
    const ongoingInterviews = await Interview.countDocuments({ status: 'ongoing' });

    // Calculate aggregate average fraud index
    const reports = await AIReport.find({});
    const averageFraudScore = reports.length > 0 
      ? Math.round(reports.reduce((acc, curr) => acc + curr.fraudScore, 0) / reports.length) 
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalInterviews,
        completedInterviews,
        ongoingInterviews,
        averageFraudScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    logger.info(`Admin updated user standing: ${user.email} -> ${status}`);
    return res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};
