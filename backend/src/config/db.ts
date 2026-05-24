import mongoose from 'mongoose';
import { logger } from './logger';

// Extend NodeJS Global interface to support our resilient mock flag
declare global {
  var isMockDB: boolean;
}

export const connectDB = async (): Promise<void> => {
  try {
    // Disable command buffering globally so Mongoose operations fail fast rather than hanging
    mongoose.set('bufferCommands', false);

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_interview_fraud_detection';
    
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully.');
      global.isMockDB = false;
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB error: ${err.message}`);
    });

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000, // Fail fast in 2s
    });
  } catch (error: any) {
    logger.warn(`-------------------------------------------------------------------`);
    logger.warn(`Could not connect to MongoDB Atlas: ${error.message}`);
    logger.warn(`Resilient Fallback Activated: RUNNING IN IN-MEMORY MOCK DATABASE MODE!`);
    logger.warn(`All registrations, logins, and screenings will succeed in-memory!`);
    logger.warn(`-------------------------------------------------------------------`);
    
    global.isMockDB = true;
  }
};
