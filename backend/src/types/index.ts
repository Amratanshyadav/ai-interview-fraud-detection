import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'candidate' | 'recruiter' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  loginAttempts: number;
  lockUntil?: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

export interface IInterview extends Document {
  title: string;
  recruiterId: Types.ObjectId;
  candidateId: Types.ObjectId;
  scheduledAt: Date;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  accessKey: string;
  duration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface IFraudEvent extends Document {
  interviewId: Types.ObjectId;
  type:
    | 'multiple_faces'
    | 'no_face'
    | 'eye_looking_away'
    | 'tab_blur'
    | 'voice_detected'
    | 'dev_tools_opened'
    | 'copy_paste_attempt'
    | 'virtual_camera';
  severity: 'low' | 'medium' | 'high';
  timestamp: Date; // time when event took place
  confidence: number; // 0.0 to 1.0
  details: string; // text description
  createdAt: Date;
}

export interface IChatMessage extends Document {
  interviewId: Types.ObjectId;
  senderId: Types.ObjectId;
  message: string;
  messageType: 'text' | 'file' | 'system';
  fileUrl?: string;
  readBy: Types.ObjectId[];
  createdAt: Date;
}

export interface IAIReport extends Document {
  interviewId: Types.ObjectId;
  fraudScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  integrityIndex: 'high_trust' | 'suspicious' | 'critical';
  behavioralSummary: string;
  recruiterRecommendations: string[];
  fingerprintSummary: string; // Dynamic behavioral fingerprint signature
  createdAt: Date;
  updatedAt: Date;
}
