'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Video,
  Mic,
  Monitor,
  AlertOctagon,
  MessageSquare,
  Send,
  Loader2,
  X,
  CheckCircle,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { useSocket } from '../../../hooks/useSocket';
import { interviewService, chatService, fraudService, reportService } from '../../../services/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InterviewRoomPage({ params }: PageProps) {
  const router = useRouter();
  const { id: interviewId } = use(params);
  const { user } = useStore();

  // Socket
  const { isConnected, sendMessage, subscribeToEvent } = useSocket(interviewId);

  // States
  const [interview, setInterview] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(true);
  const [logsOpen, setLogsOpen] = useState(true);

  // Biometrics setup
  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [screenGranted, setScreenGranted] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);

  // Dynamic mesh simulations
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Recruiter Dashboard Real-time timeline alerts
  const [fraudTimeline, setFraudTimeline] = useState<any[]>([]);
  const [sessionFraudScore, setSessionFraudScore] = useState(0);

  // AI report details
  const [compiledReport, setCompiledReport] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadChamberDetails();
  }, [user]);

  const loadChamberDetails = async () => {
    try {
      // Find session access key
      const recruiterRes = await interviewService.getRecruiter();
      const list = recruiterRes.interviews || [];
      const match = list.find((i: any) => i._id === interviewId);
      if (match) {
        const joinRes = await interviewService.join(match.accessKey);
        setInterview(joinRes.interview);
      } else {
        const candRes = await interviewService.getCandidate();
        const candList = candRes.interviews || [];
        const candMatch = candList.find((i: any) => i._id === interviewId);
        if (candMatch) {
          const joinRes = await interviewService.join(candMatch.accessKey);
          setInterview(joinRes.interview);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error('Failed to locate chamber metadata:', err);
      router.push('/dashboard');
    }
  };

  // Socket triggers
  useEffect(() => {
    if (!isConnected) return;

    // Load Chat history
    chatService.getHistory(interviewId).then((res) => {
      if (res.success) setMessages(res.messages);
    });

    // Load previously logged events if recruiter
    if (user?.role === 'recruiter' || user?.role === 'admin') {
      fraudService.getEvents(interviewId).then((res) => {
        if (res.success) {
          setFraudTimeline(res.events);
          // Set simple count fallback
          setSessionFraudScore(Math.min(100, res.events.length * 10));
        }
      });
    }

    // Subscriptions
    const unsubMessage = subscribeToEvent('receiveMessage', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    const unsubAlert = subscribeToEvent('fraudAlert', (alertData: any) => {
      setFraudTimeline((prev) => [alertData, ...prev]);
      setSessionFraudScore(alertData.updatedFraudScore);
    });

    return () => {
      unsubMessage();
      unsubAlert();
    };
  }, [isConnected, interviewId]);

  // Request Camera & Mic
  const startBiometrics = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraGranted(true);
      setMicGranted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      simulateLandmarks();
    } catch (err) {
      alert('Camera and microphone authorization required.');
    }
  };

  // Request Screen sharing
  const startScreenShare = async () => {
    try {
      await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenGranted(true);
    } catch (err) {
      alert('Screen recording authorization is required to continue screening.');
    }
  };

  // Request Fullscreen
  const toggleFullscreen = () => {
    const element = document.documentElement;
    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => {
        setFullscreenActive(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setFullscreenActive(false);
      });
    }
  };

  // Track page blurs & tab switching for candidates
  useEffect(() => {
    if (user?.role !== 'candidate' || !interview) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logCheatingEvent('tab_blur', 'high', 'Candidate tab blur / focus lost.');
      }
    };

    const handleBlur = () => {
      logCheatingEvent('tab_blur', 'medium', 'Candidate browser window blurred.');
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheatingEvent('copy_paste_attempt', 'low', 'Copy-paste attempt denied.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [interview]);

  const logCheatingEvent = async (type: string, severity: 'low' | 'medium' | 'high', details: string) => {
    try {
      await fraudService.logEvent({
        interviewId,
        type,
        severity,
        confidence: 0.95,
        details,
      });
    } catch (err) {
      console.error('Error logging cheating event:', err);
    }
  };

  // Send messaging text
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(interviewId, inputMessage);
    setInputMessage('');
  };

  // Final AI compile
  const handleEndAndCompileReport = async () => {
    setGeneratingReport(true);
    try {
      await interviewService.end(interviewId);
      const res = await reportService.getReport(interviewId);
      if (res.success) {
        setCompiledReport(res.report);
      }
    } catch (err) {
      console.error('Failed compiling reports:', err);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Simulate face landmark mesh overlays on canvas
  const simulateLandmarks = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Simulating eye gaze vector & facial points
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1;

      // Draw random landmarks
      for (let i = 0; i < 15; i++) {
        const x = 50 + Math.random() * 200;
        const y = 50 + Math.random() * 140;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
      }

      // Pupil circles simulation
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(95, 80, 5, 0, 2 * Math.PI);
      ctx.arc(155, 80, 5, 0, 2 * Math.PI);
      ctx.stroke();

      // Eye mesh bounding box
      ctx.strokeStyle = '#ec4899';
      ctx.strokeRect(70, 65, 115, 35);

      requestAnimationFrame(draw);
    };

    draw();
  };

  if (!interview) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col cyber-grid relative">
      {/* Dynamic Header */}
      <header className="glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-500" />
          <span className="text-sm font-bold tracking-tight text-zinc-300">
            {interview.title} - Sockets Online Check
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'candidate' && (
            <button
              onClick={toggleFullscreen}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                fullscreenActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {fullscreenActive ? 'Fullscreen Active' : 'Enter Fullscreen'}
            </button>
          )}

          {(user?.role === 'recruiter' || user?.role === 'admin') && (
            <button
              onClick={handleEndAndCompileReport}
              disabled={generatingReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-lg"
            >
              {generatingReport ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <FileText className="h-3.5 w-3.5" /> Complete Screening & Grade
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Layout Workspace */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden max-w-[1920px] w-full mx-auto p-6 gap-6 z-10">
        {/* Core Camera and biometrics overlay */}
        <section className="flex-grow lg:w-3/5 flex flex-col gap-6">
          <div className="glass-card rounded-xl p-6 relative overflow-hidden flex-grow flex flex-col justify-between min-h-[400px]">
            {/* Simulation overlay indices */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <span className="flex items-center gap-1 bg-zinc-950/80 border border-white/10 rounded px-2.5 py-1 text-[10px] font-mono text-zinc-300">
                <Video className="h-3 w-3 text-indigo-400" />
                CAM: {cameraGranted ? 'OK' : 'OFF'}
              </span>
              <span className="flex items-center gap-1 bg-zinc-950/80 border border-white/10 rounded px-2.5 py-1 text-[10px] font-mono text-zinc-300">
                <Mic className="h-3 w-3 text-cyan-400" />
                MIC: {micGranted ? 'OK' : 'OFF'}
              </span>
              <span className="flex items-center gap-1 bg-zinc-950/80 border border-white/10 rounded px-2.5 py-1 text-[10px] font-mono text-zinc-300">
                <Monitor className="h-3 w-3 text-purple-400" />
                SCREEN: {screenGranted ? 'SHARING' : 'OFF'}
              </span>
            </div>

            {/* Simulated Eye Track Canvas & Camera Container */}
            <div className="relative flex-grow flex items-center justify-center bg-zinc-900/60 rounded-lg overflow-hidden border border-white/5 mt-8">
              {cameraGranted ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover rounded-lg scale-x-[-1]"
                  />
                  {/* Landmark Canvas mesh */}
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={240}
                    className="absolute z-10 pointer-events-none scale-x-[-1]"
                  />
                  <div className="absolute bottom-4 right-4 z-20 bg-indigo-600/90 text-[10px] font-bold px-2 py-0.5 rounded text-white flex items-center gap-1">
                    <Sparkles className="h-3 w-3 animate-spin" /> Local Eye Mesh Tracking
                  </div>
                </>
              ) : (
                <div className="text-center p-6 flex flex-col items-center gap-4">
                  <AlertOctagon className="h-12 w-12 text-zinc-600" />
                  <div>
                    <h4 className="text-sm font-bold">Biometric Authorization Required</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                      Please authorize camera, microphone, and screen access to begin candidate evaluations.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={startBiometrics}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold"
                    >
                      Grant Camera & Mic
                    </button>
                    {user?.role === 'candidate' && (
                      <button
                        onClick={startScreenShare}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-semibold"
                      >
                        Share Screen
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI generated report popup panel */}
          {compiledReport && (
            <div className="glass-card rounded-xl p-6 border border-emerald-500/30 bg-emerald-950/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-5 w-5" /> Completed AI Fraud Screening Assessment
                </h3>
                <button onClick={() => setCompiledReport(null)} className="p-1 rounded hover:bg-white/5">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-4">
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5 text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">Fraud Index Score</span>
                  <span className="text-3xl font-extrabold text-indigo-400">{compiledReport.fraudScore}%</span>
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5 text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">Confidence Rating</span>
                  <span className="text-3xl font-extrabold text-cyan-400">{compiledReport.confidenceScore}%</span>
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5 text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">Integrity Grading</span>
                  <span
                    className={`text-base font-bold block mt-1 py-1 rounded ${
                      compiledReport.integrityIndex === 'high_trust'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : compiledReport.integrityIndex === 'suspicious'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-red-400 bg-red-500/10'
                    }`}
                  >
                    {compiledReport.integrityIndex.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase">Behavioral Agent Summary</h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{compiledReport.behavioralSummary}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase">Hiring Recommendations</h4>
                  <ul className="list-disc pl-4 space-y-1.5 mt-2">
                    {compiledReport.recruiterRecommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-xs text-zinc-300">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Sockets Chat sidebar and Anomaly timelines */}
        <section className="lg:w-2/5 flex flex-col gap-6">
          {/* Sockets timeline logs (If recruiter) */}
          {(user?.role === 'recruiter' || user?.role === 'admin') && logsOpen && (
            <div className="glass-card rounded-xl p-6 flex flex-col max-h-[350px] relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-300">Live AI Event Monitor</h3>
                  <p className="text-[10px] text-zinc-500">Real-time biometrics feeds and blur logs.</p>
                </div>
                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/25 rounded text-[10px] font-mono text-red-400 font-bold">
                  Fraud Index: {sessionFraudScore}%
                </span>
              </div>

              <div className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar">
                {fraudTimeline.length === 0 ? (
                  <div className="text-center py-10 text-xs text-zinc-500">No flags reported yet.</div>
                ) : (
                  fraudTimeline.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-900/60 border border-white/5 rounded-lg text-xs flex justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-red-400 flex items-center gap-1 uppercase text-[9px] tracking-widest">
                          <AlertOctagon className="h-3 w-3" /> {item.type.replace('_', ' ')}
                        </span>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">{item.details}</p>
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Sockets Chat sidebar panel */}
          {chatOpen && (
            <div className="glass-card rounded-xl p-6 flex flex-col flex-grow min-h-[300px]">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-1 text-zinc-300">
                <MessageSquare className="h-4 w-4 text-indigo-400" /> Sockets Room Chat Channel
              </h3>

              {/* Chat Feed */}
              <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2 scrollbar text-xs max-h-[350px]">
                {messages.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-[10px]">Chamber chat initiated. Send private logs.</div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col gap-1 max-w-[80%] ${
                        msg.senderId._id === user?.id ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <span className="text-[9px] text-zinc-500">
                        {msg.senderId.name} ({msg.senderId.role})
                      </span>
                      <div
                        className={`p-3 rounded-lg leading-relaxed ${
                          msg.senderId._id === user?.id
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-zinc-900 text-zinc-300 rounded-tl-none border border-white/5'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
                <input
                  type="text"
                  required
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Send confidential logs..."
                  className="flex-grow bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
