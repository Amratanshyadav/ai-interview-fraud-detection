import crypto from 'crypto';

export class MockDBStore {
  public static users: any[] = [
    {
      _id: 'mock_recruiter_id_9999',
      name: 'Sarah Jenkins',
      email: 'recruiter@intellihire.com',
      password: 'password123',
      role: 'recruiter',
      status: 'active',
      loginAttempts: 0,
      comparePassword: async (pwd: string) => pwd === 'password123',
    },
    {
      _id: 'mock_candidate_id_9999',
      name: 'Alex Rivera',
      email: 'candidate@intellihire.com',
      password: 'password123',
      role: 'candidate',
      status: 'active',
      loginAttempts: 0,
      comparePassword: async (pwd: string) => pwd === 'password123',
    }
  ];

  public static interviews: any[] = [
    {
      _id: 'mock_interview_id_1',
      title: 'Senior Software Architect Test',
      recruiterId: { _id: 'mock_recruiter_id_9999', name: 'Sarah Jenkins', email: 'recruiter@intellihire.com' },
      candidateId: { _id: 'mock_candidate_id_9999', name: 'Alex Rivera', email: 'candidate@intellihire.com' },
      scheduledAt: new Date(),
      status: 'scheduled',
      accessKey: '5F8D2A',
      duration: 30,
    }
  ];

  public static fraudEvents: any[] = [];
  public static chatMessages: any[] = [];
  public static aiReports: any[] = [];
}
