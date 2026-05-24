'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Plus,
  Video,
  User,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { interviewService, authService } from '../../services/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logoutStore } = useStore();

  const [interviews, setInterviews] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('30');
  const [joinKey, setJoinKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadInterviews();
  }, [user]);

  const loadInterviews = async () => {
    try {
      if (user?.role === 'recruiter' || user?.role === 'admin') {
        const res = await interviewService.getRecruiter();
        if (res.success) setInterviews(res.interviews);
      } else {
        const res = await interviewService.getCandidate();
        if (res.success) setInterviews(res.interviews);
      }
    } catch (err) {
      console.error('Failed to load session logs:', err);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await interviewService.create({
        title,
        candidateEmail,
        scheduledAt,
        duration: parseInt(duration),
      });
      if (res.success) {
        setShowModal(false);
        setTitle('');
        setCandidateEmail('');
        setScheduledAt('');
        loadInterviews();
      }
    } catch (err) {
      console.error('Error creating interview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinKey) return;
    try {
      const res = await interviewService.join(joinKey);
      if (res.success) {
        router.push(`/interview/${res.interview._id}`);
      }
    } catch (err) {
      alert('Invalid room access key.');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logoutStore();
      router.push('/');
    } catch (err) {
      logoutStore();
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col cyber-grid relative">
      {/* Top Navbar */}
      <header className="glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-500" />
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            IntelliHire Control Center
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <User className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-300">
              {user?.name} ({user?.role})
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-zinc-900 border border-white/5 hover:border-red-500/30 hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-10 md:px-12 grid lg:grid-cols-4 gap-8 z-10">
        {/* Sidebar Info Panels */}
        <section className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-indigo-500/10 blur-xl"></div>
            <Sparkles className="h-5 w-5 text-indigo-400 mb-2" />
            <h3 className="text-sm font-bold">Collaborative AI Agents</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Monitoring and Risk scoring models run sliding weights dynamically to classify biometrics.
            </p>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h4 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-4">Quick Statistics</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 flex items-center gap-1"><Users className="h-3 w-3" /> Total Screened</span>
                <span className="text-sm font-bold">{interviews.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Finished</span>
                <span className="text-sm font-bold text-emerald-400">
                  {interviews.filter((i) => i.status === 'completed').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> Pending Tests</span>
                <span className="text-sm font-bold text-amber-400">
                  {interviews.filter((i) => i.status === 'scheduled').length}
                </span>
              </div>
            </div>
          </div>

          {/* Join Session Key Input */}
          <div className="glass-card rounded-xl p-6 border border-indigo-500/25 bg-indigo-500/5">
            <h3 className="text-sm font-bold flex items-center gap-1 text-indigo-300">
              <Video className="h-4 w-4" /> Enter Room Key
            </h3>
            <form onSubmit={handleJoinSession} className="mt-4 space-y-2">
              <input
                type="text"
                required
                value={joinKey}
                onChange={(e) => setJoinKey(e.target.value.toUpperCase())}
                placeholder="E.G. 5F8D2A"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-center tracking-widest font-bold"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                Join Interview Chamber
              </button>
            </form>
          </div>
        </section>

        {/* Dynamic Interactive Sessions Panels */}
        <section className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Active Evaluation Records</h2>
              <p className="text-xs text-zinc-400 mt-1">Manage scheduled code tests and download compiled fraud analysis timelines.</p>
            </div>
            {(user?.role === 'recruiter' || user?.role === 'admin') && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Schedule Session
              </button>
            )}
          </div>

          {/* Sessions Listing Container */}
          <div className="space-y-4">
            {interviews.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
                <Video className="h-10 w-10 text-zinc-600" />
                <span className="text-sm">No scheduled screening sessions logged.</span>
              </div>
            ) : (
              interviews.map((interview) => (
                <div
                  key={interview._id}
                  className="glass-card rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold tracking-tight">{interview.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          interview.status === 'completed'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : interview.status === 'ongoing'
                            ? 'bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 animate-pulse'
                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        }`}
                      >
                        {interview.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(interview.scheduledAt).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {interview.duration} Mins
                      </span>
                      <span className="flex items-center gap-1 text-indigo-400 font-bold">
                        Access Key: {interview.accessKey}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {interview.status !== 'completed' ? (
                      <button
                        onClick={() => router.push(`/interview/${interview._id}`)}
                        className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Enter Room <ChevronRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const res = await interviewService.join(interview.accessKey);
                              if (res.success) router.push(`/interview/${res.interview._id}`);
                            } catch (err) {
                              alert('Failed to connect to chamber.');
                            }
                          }}
                          className="px-3 py-2 bg-zinc-900 border border-white/5 rounded-lg text-xs hover:border-indigo-500 transition-colors"
                        >
                          View Sockets Logs
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-md glass-panel rounded-xl p-8 border border-white/10 relative shadow-2xl">
            <h3 className="text-lg font-bold tracking-tight mb-4">Schedule Screening Session</h3>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">Interview Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Senior Staff Architect Test"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">Candidate Email Address</label>
                <input
                  type="email"
                  required
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="candidate@work.com"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">Duration (Mins)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/5 text-xs font-semibold hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold hover:bg-indigo-500 transition-colors"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
