import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
}

interface Interview {
  _id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  accessKey: string;
  recruiterId?: any;
  candidateId?: any;
}

interface StoreState {
  user: User | null;
  accessToken: string | null;
  activeInterview: Interview | null;
  chatMessages: any[];
  fraudEvents: any[];
  setUser: (user: User | null, token?: string | null) => void;
  setActiveInterview: (interview: Interview | null) => void;
  setChatMessages: (messages: any[]) => void;
  addChatMessage: (message: any) => void;
  setFraudEvents: (events: any[]) => void;
  addFraudEvent: (event: any) => void;
  logoutStore: () => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  accessToken: null,
  activeInterview: null,
  chatMessages: [],
  fraudEvents: [],
  setUser: (user, token = null) => {
    if (token) {
      localStorage.setItem('accessToken', token);
    }
    set({ user, accessToken: token || localStorage.getItem('accessToken') });
  },
  setActiveInterview: (interview) => set({ activeInterview: interview }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setFraudEvents: (events) => set({ fraudEvents: events }),
  addFraudEvent: (event) => set((state) => ({ fraudEvents: [...state.fraudEvents, event] })),
  logoutStore: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null, activeInterview: null, chatMessages: [], fraudEvents: [] });
  },
}));
