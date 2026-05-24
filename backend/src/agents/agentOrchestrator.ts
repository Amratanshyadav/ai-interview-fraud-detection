import { AIReport } from '../models/AIReport';
import { FraudEvent } from '../models/FraudEvent';
import { Interview } from '../models/Interview';
import { logger } from '../config/logger';
import { getSocketIOInstance } from '../websocket/socketServer';
import { MockDBStore } from '../utils/mockDB';

class AgentOrchestrator {
  private activeRiskScores: Map<string, number> = new Map();

  public async processEvent(interviewId: string, event: any): Promise<void> {
    try {
      let weight = 5;
      if (event.severity === 'medium') weight = 15;
      if (event.severity === 'high') weight = 30;

      const currentScore = this.activeRiskScores.get(interviewId) || 0;
      const newScore = Math.min(100, currentScore + weight);
      this.activeRiskScores.set(interviewId, newScore);

      logger.info(`AI Risk Scoring Agent updated interview ${interviewId}: Score is now ${newScore}/100`);

      const io = getSocketIOInstance();
      if (io) {
        io.to(interviewId).emit('fraudAlert', {
          eventId: event._id || `mock_evt_${Date.now()}`,
          type: event.type,
          severity: event.severity,
          confidence: event.confidence,
          details: event.details,
          timestamp: event.timestamp,
          updatedFraudScore: newScore,
        });
        logger.info(`Websocket alert broadcasted to channel: ${interviewId}`);
      }
    } catch (error: any) {
      logger.error(`Error inside Event Processing Orchestrator: ${error.message}`);
    }
  }

  public async generateFinalReport(interviewId: string): Promise<any> {
    try {
      logger.info(`Compiling collaborative AI Agent recommendations for interview: ${interviewId}`);

      let interview: any = null;
      let events: any[] = [];

      // Resilient Fallback Check
      if (global.isMockDB) {
        interview = MockDBStore.interviews.find((i) => i._id === interviewId);
        events = MockDBStore.fraudEvents.filter((e) => e.interviewId === interviewId);
      } else {
        interview = await Interview.findById(interviewId)
          .populate('candidateId', 'name email')
          .populate('recruiterId', 'name email');
        events = await FraudEvent.find({ interviewId });
      }

      if (!interview) throw new Error('Interview session not found');

      let totalWeightedScore = 0;
      let tabSwitches = 0;
      let multiFaceAlerts = 0;
      let cameraOffAlerts = 0;
      let eyeGazeAlerts = 0;
      let secondaryVoiceAlerts = 0;

      events.forEach((event) => {
        let weight = 5;
        if (event.severity === 'medium') weight = 15;
        if (event.severity === 'high') weight = 30;

        totalWeightedScore += weight;

        if (event.type === 'tab_blur') tabSwitches++;
        if (event.type === 'multiple_faces') multiFaceAlerts++;
        if (event.type === 'no_face') cameraOffAlerts++;
        if (event.type === 'eye_looking_away') eyeGazeAlerts++;
        if (event.type === 'voice_detected') secondaryVoiceAlerts++;
      });

      const finalFraudScore = Math.min(100, Math.max(0, totalWeightedScore));
      const confidenceScore = Math.round(100 - (events.length > 0 ? (totalWeightedScore / 5) : 0));
      const finalConfidence = Math.max(70, Math.min(100, confidenceScore));

      let integrityIndex: 'high_trust' | 'suspicious' | 'critical' = 'high_trust';
      if (finalFraudScore >= 30 && finalFraudScore < 60) {
        integrityIndex = 'suspicious';
      } else if (finalFraudScore >= 60) {
        integrityIndex = 'critical';
      }

      const candidateName = interview.candidateId?.name || 'Candidate';
      const fingerprintSignature = `HASH_SPATIAL_${events.length}_TAB_${tabSwitches}_GAZE_${eyeGazeAlerts}_V_${secondaryVoiceAlerts}`;

      let behavioralSummary = '';
      const recruiterRecommendations: string[] = [];

      if (integrityIndex === 'high_trust') {
        behavioralSummary = `${candidateName} maintained excellent focus throughout the interview. No suspicious actions, voice anomalies, or tab-blur incidents were registered. The camera feed exhibited high structural integrity.`;
        recruiterRecommendations.push(
          'Highly recommended. Proceed with standard technical evaluations.',
          'Verify core programming achievements during face-to-face sessions.'
        );
      } else if (integrityIndex === 'suspicious') {
        behavioralSummary = `${candidateName} finished the evaluation, but exhibited minor suspicious deviations. Specifically, ${tabSwitches} browser tab-switching events were logged along with ${eyeGazeAlerts} eye-gaze shifts away from the interface.`;
        recruiterRecommendations.push(
          'Proceed with caution. Request detailed code walkthroughs.',
          'Analyze whether the logged eye gaze fluctuations match visual layout configurations (e.g. secondary monitors).',
          'Enforce strict fullscreen boundaries on future screening evaluations.'
        );
      } else {
        behavioralSummary = `CRITICAL WARNING: Highly suspicious behavioral pattern memory registered for ${candidateName}. The pipeline logged ${tabSwitches} tab-blur events, ${multiFaceAlerts} frames containing multiple distinct faces, and ${secondaryVoiceAlerts} unauthorized speech packets.`;
        recruiterRecommendations.push(
          'Evaluate candidate logs before extending employment offers.',
          'Conduct a mandatory live interactive interview to verify actual domain proficiency.',
          'Check secondary audio channel recordings to identify surrounding environments.'
        );
      }

      // Resilient Fallback Saving
      if (global.isMockDB) {
        const mockReport = {
          _id: `mock_report_${Date.now()}`,
          interviewId,
          fraudScore: finalFraudScore,
          confidenceScore: finalConfidence,
          integrityIndex,
          behavioralSummary,
          recruiterRecommendations,
          fingerprintSummary: fingerprintSignature,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const existingIdx = MockDBStore.aiReports.findIndex((r) => r.interviewId === interviewId);
        if (existingIdx !== -1) {
          MockDBStore.aiReports[existingIdx] = mockReport;
        } else {
          MockDBStore.aiReports.push(mockReport);
        }

        logger.info(`[MOCK DB] Saved final AI report assessment successfully.`);
        return mockReport;
      }

      let report = await AIReport.findOne({ interviewId });
      if (report) {
        report.fraudScore = finalFraudScore;
        report.confidenceScore = finalConfidence;
        report.integrityIndex = integrityIndex;
        report.behavioralSummary = behavioralSummary;
        report.recruiterRecommendations = recruiterRecommendations;
        report.fingerprintSummary = fingerprintSignature;
        await report.save();
      } else {
        report = new AIReport({
          interviewId,
          fraudScore: finalFraudScore,
          confidenceScore: finalConfidence,
          integrityIndex,
          behavioralSummary,
          recruiterRecommendations,
          fingerprintSummary: fingerprintSignature,
        });
        await report.save();
      }

      logger.info(`Successfully saved final AI Agent evaluation report for interview ${interviewId}`);
      return report;
    } catch (error: any) {
      logger.error(`Failed to compile final AI Report: ${error.message}`);
      throw error;
    }
  }
}

export const agentOrchestrator = new AgentOrchestrator();
