import { Response, NextFunction } from 'express';
import { AIReport } from '../models/AIReport';
import { FraudEvent } from '../models/FraudEvent';
import { Interview } from '../models/Interview';
import { AuthenticatedRequest } from '../middlewares/auth';
import { agentOrchestrator } from '../agents/agentOrchestrator';
import { logger } from '../config/logger';
import { MockDBStore } from '../utils/mockDB';

export const getAIReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { interviewId } = req.params;

    if (global.isMockDB) {
      let report = MockDBStore.aiReports.find((r) => r.interviewId === interviewId);
      if (!report) {
        logger.info(`[MOCK DB] Generating mock final assessment report...`);
        report = await agentOrchestrator.generateFinalReport(interviewId);
      }
      return res.status(200).json({ success: true, report });
    }

    let report = await AIReport.findOne({ interviewId });

    if (!report) {
      logger.info(`Report not found for interview ${interviewId}. Generating one now...`);
      report = await agentOrchestrator.generateFinalReport(interviewId);
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const exportReportPDF = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { interviewId } = req.params;

    if (global.isMockDB) {
      const interview = MockDBStore.interviews.find((i) => i._id === interviewId);
      if (!interview) return res.status(404).json({ success: false, message: 'Session not found.' });

      let report = MockDBStore.aiReports.find((r) => r.interviewId === interviewId);
      if (!report) {
        report = await agentOrchestrator.generateFinalReport(interviewId);
      }

      const events = MockDBStore.fraudEvents.filter((e) => e.interviewId === interviewId);

      return res.status(200).json({
        success: true,
        filename: `FraudLensReport_${interview.accessKey}.json`,
        metadata: {
          title: interview.title,
          accessKey: interview.accessKey,
          scheduledAt: interview.scheduledAt,
          status: interview.status,
          duration: interview.duration,
          recruiter: interview.recruiterId,
          candidate: interview.candidateId,
        },
        report,
        events,
      });
    }

    const interview = await Interview.findById(interviewId)
      .populate('recruiterId', 'name email')
      .populate('candidateId', 'name email');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    let report = await AIReport.findOne({ interviewId });
    if (!report) {
      report = await agentOrchestrator.generateFinalReport(interviewId);
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'AI Report compilation failed.' });
    }

    const events = await FraudEvent.find({ interviewId }).sort({ timestamp: 1 });

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      filename: `FraudLensReport_${interview.accessKey}.json`,
      metadata: {
        title: interview.title,
        accessKey: interview.accessKey,
        scheduledAt: interview.scheduledAt,
        status: interview.status,
        duration: interview.duration,
        recruiter: interview.recruiterId,
        candidate: interview.candidateId,
      },
      report: {
        fraudScore: report.fraudScore,
        confidenceScore: report.confidenceScore,
        integrityIndex: report.integrityIndex,
        behavioralSummary: report.behavioralSummary,
        recruiterRecommendations: report.recruiterRecommendations,
        fingerprintSummary: report.fingerprintSummary,
      },
      events: events.map((e) => ({
        type: e.type,
        severity: e.severity,
        confidence: e.confidence,
        details: e.details,
        timestamp: e.timestamp,
      })),
    });
  } catch (error) {
    next(error);
  }
};
