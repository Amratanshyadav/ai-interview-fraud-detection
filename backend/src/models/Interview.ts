import { Schema, model } from 'mongoose';
import { IInterview } from '../types';

const interviewSchema = new Schema<IInterview>(
  {
    title: {
      type: String,
      required: [true, 'Interview title is required'],
      trim: true,
    },
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter ID is required'],
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate ID is required'],
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled time is required'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    accessKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      default: 30, // Default 30 mins
    },
  },
  {
    timestamps: true,
  }
);

export const Interview = model<IInterview>('Interview', interviewSchema);
export default Interview;
