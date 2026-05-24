import { Schema, model } from 'mongoose';
import { IAIReport } from '../types';

const aiReportSchema = new Schema<IAIReport>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      unique: true,
      index: true,
    },
    fraudScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    integrityIndex: {
      type: String,
      enum: ['high_trust', 'suspicious', 'critical'],
      required: true,
    },
    behavioralSummary: {
      type: String,
      required: true,
    },
    recruiterRecommendations: [
      {
        type: String,
      },
    ],
    fingerprintSummary: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AIReport = model<IAIReport>('AIReport', aiReportSchema);
export default AIReport;
