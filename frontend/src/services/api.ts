import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject Access Token into request headers
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authService = {
  register: (data: any) => api.post('/auth/register', data).then((res) => res.data),
  login: (data: any) => api.post('/auth/login', data).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
  getProfile: () => api.get('/auth/profile').then((res) => res.data),
};

export const interviewService = {
  create: (data: any) => api.post('/interviews', data).then((res) => res.data),
  getRecruiter: () => api.get('/interviews/recruiter').then((res) => res.data),
  getCandidate: () => api.get('/interviews/candidate').then((res) => res.data),
  join: (accessKey: string) => api.post('/interviews/join', { accessKey }).then((res) => res.data),
  end: (interviewId: string) => api.put(`/interviews/${interviewId}/end`).then((res) => res.data),
};

export const fraudService = {
  logEvent: (data: any) => api.post('/fraud/event', data).then((res) => res.data),
  getEvents: (interviewId: string) => api.get(`/fraud/${interviewId}/events`).then((res) => res.data),
};

export const chatService = {
  getHistory: (interviewId: string) => api.get(`/chat/${interviewId}/history`).then((res) => res.data),
  markRead: (interviewId: string) => api.put(`/chat/${interviewId}/read`).then((res) => res.data),
};

export const reportService = {
  getReport: (interviewId: string) => api.get(`/reports/${interviewId}`).then((res) => res.data),
  exportPDF: (interviewId: string) => api.get(`/reports/${interviewId}/export`).then((res) => res.data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats').then((res) => res.data),
  getUsers: () => api.get('/admin/users').then((res) => res.data),
  updateUser: (userId: string, status: string) => api.put(`/admin/users/${userId}/status`, { status }).then((res) => res.data),
};
