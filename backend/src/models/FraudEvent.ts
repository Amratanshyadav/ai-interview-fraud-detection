import { Schema, model } from 'mongoose';
import { IFraudEvent } from '../types';

const fraudEventSchema = new Schema<IFraudEvent>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'multiple_faces',
        'no_face',
        'eye_looking_away',
        'tab_blur',
        'voice_detected',
        'dev_tools_opened',
        'copy_paste_attempt',
        'virtual_camera',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexing for fast retrieval of chronological events for a specific interview
fraudEventSchema.index({ interviewId: 1, timestamp: 1 });

export const FraudEvent = model<IFraudEvent>('FraudEvent', fraudEventSchema);
export default FraudEvent;
