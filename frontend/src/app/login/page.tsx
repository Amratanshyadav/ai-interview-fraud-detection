'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/api';
import { useStore } from '../../store/useStore';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      if (res.success) {
        setUser(res.user, res.accessToken);
        router.push('/dashboard');
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 px-6 cyber-grid">
      {/* Glow overlays */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[100px]"></div>
      
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/10 relative z-10 shadow-2xl">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="h-3 w-3" /> Back to Home
        </Link>

        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-indigo-400">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">IntelliHire Shield Login</h2>
          <p className="text-xs text-zinc-400">Enter your credentials to manage evaluation sessions.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/35 text-red-400 text-xs font-semibold rounded-lg mb-6 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full bg-zinc-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-medium text-zinc-400">Password</label>
              <Link href="/forgot" className="text-[10px] text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-semibold tracking-wide transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Authentication Verification'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Don't have a screening account?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Register Account
          </Link>
        </p>
      </div>
    </div>
  );
}
