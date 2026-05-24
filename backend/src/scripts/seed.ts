import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_interview_fraud_detection';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users.');

    // Create Recruiter
    const recruiter = new User({
      name: 'Sarah Jenkins',
      email: 'recruiter@intellihire.com',
      password: 'password123', // Will be hashed automatically by schema pre-save hook
      role: 'recruiter',
      status: 'active',
    });

    // Create Candidate
    const candidate = new User({
      name: 'Alex Rivera',
      email: 'candidate@intellihire.com',
      password: 'password123',
      role: 'candidate',
      status: 'active',
    });

    // Create Admin
    const admin = new User({
      name: 'System Admin',
      email: 'admin@intellihire.com',
      password: 'password123',
      role: 'admin',
      status: 'active',
    });

    await recruiter.save();
    await candidate.save();
    await admin.save();

    console.log('Database seeded successfully!');
    console.log('-----------------------------------');
    console.log('Recruiter Login:');
    console.log('  Email: recruiter@intellihire.com');
    console.log('  Password: password123');
    console.log('-----------------------------------');
    console.log('Candidate Login:');
    console.log('  Email: candidate@intellihire.com');
    console.log('  Password: password123');
    console.log('-----------------------------------');
    console.log('Admin Login:');
    console.log('  Email: admin@intellihire.com');
    console.log('  Password: password123');
    console.log('-----------------------------------');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
