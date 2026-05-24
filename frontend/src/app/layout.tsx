'use client';

import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { authService } from '../services/api';
import { useStore } from '../store/useStore';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useStore((state) => state.setUser);
  const logoutStore = useStore((state) => state.logoutStore);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const res = await authService.getProfile();
          if (res.success) {
            setUser(res.user, token);
          } else {
            logoutStore();
          }
        }
      } catch (err) {
        console.error('Failed to load user profile on boot:', err);
        logoutStore();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setUser, logoutStore]);

  return (
    <html lang="en">
      <head>
        <title>IntelliHire Shield - AI Interview Fraud Detection Platform</title>
        <meta name="description" content="Next-generation SaaS platform protecting interview integrity through real-time eye-tracking, face detection, voice analysis, and collaborative AI agents." />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col justify-between`}>
        <QueryClientProvider client={queryClient}>
          {loading ? (
            <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
              <div className="relative flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                <p className="text-sm font-semibold tracking-wider text-indigo-400 uppercase animate-pulse">Initializing IntelliHire Shield...</p>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col">{children}</div>
          )}
        </QueryClientProvider>
      </body>
    </html>
  );
}
