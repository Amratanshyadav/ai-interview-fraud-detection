'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, User, Loader2, ArrowLeft, Briefcase, GraduationCap } from 'lucide-react';
import { authService } from '../../services/api';
import { useStore } from '../../store/useStore';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'recruiter' | 'candidate'>('recruiter');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.register({ name, email, password, role });
      if (res.success) {
        setUser(res.user, res.accessToken);
        router.push('/dashboard');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 px-6 cyber-grid">
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-cyan-600/10 blur-[100px]"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/10 relative z-10 shadow-2xl">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="h-3 w-3" /> Back to Home
        </Link>

        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-indigo-400">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Create Screening Account</h2>
          <p className="text-xs text-zinc-400">Protect talent workflows with real-time detection agents.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/35 text-red-400 text-xs font-semibold rounded-lg mb-4 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`py-3 rounded-lg border text-xs font-bold tracking-wider flex flex-col items-center gap-1 cursor-pointer transition-all ${
                role === 'recruiter'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-white/5 bg-zinc-900/40 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
              }`}
            >
              <Briefcase className="h-4 w-4" /> Recruiter
            </button>
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`py-3 rounded-lg border text-xs font-bold tracking-wider flex flex-col items-center gap-1 cursor-pointer transition-all ${
                role === 'candidate'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-white/5 bg-zinc-900/40 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Candidate
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full bg-zinc-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@company.com"
                className="w-full bg-zinc-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Secure Password</label>
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register Screening Account'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
