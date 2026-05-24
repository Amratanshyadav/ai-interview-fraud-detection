import { Response, NextFunction } from 'express';
import { FraudEvent } from '../models/FraudEvent';
import { AuthenticatedRequest } from '../middlewares/auth';
import { agentOrchestrator } from '../agents/agentOrchestrator';
import { logger } from '../config/logger';
import { MockDBStore } from '../utils/mockDB';

export const logFraudEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { interviewId, type, severity, confidence, details } = req.body;

    if (global.isMockDB) {
      const mockEvent = {
        _id: `mock_event_${Date.now()}`,
        interviewId,
        type,
        severity,
        confidence: confidence || 1.0,
        details: details || '',
        timestamp: new Date(),
      };

      MockDBStore.fraudEvents.push(mockEvent);
      logger.info(`[MOCK DB] Fraud event logged for interview ${interviewId}: ${type} [${severity}]`);

      // Asynchronously trigger Risk Scoring & Sockets Alerts Pipeline
      agentOrchestrator.processEvent(interviewId, mockEvent).catch((err) => {
        logger.error(`AI Orchestrator process failure: ${err.message}`);
      });

      return res.status(201).json({
        success: true,
        message: 'Fraud event logged and queued (Mock DB Mode)',
        event: mockEvent,
      });
    }

    const event = new FraudEvent({
      interviewId,
      type,
      severity,
      confidence: confidence || 1.0,
      details: details || '',
      timestamp: new Date(),
    });

    await event.save();
    logger.info(`Fraud event logged for interview ${interviewId}: ${type} [${severity}]`);

    agentOrchestrator.processEvent(interviewId, event).catch((err) => {
      logger.error(`AI Orchestrator process failure: ${err.message}`);
    });

    return res.status(201).json({
      success: true,
      message: 'Fraud event logged and queued for AI orchestration successfully.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewEvents = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { interviewId } = req.params;

    if (global.isMockDB) {
      const list = MockDBStore.fraudEvents.filter((e) => e.interviewId === interviewId);
      return res.status(200).json({ success: true, events: list });
    }

    const events = await FraudEvent.find({ interviewId }).sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    next(error);
  }
};
