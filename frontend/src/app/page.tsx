'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Eye, Video, Brain, Activity, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function LandingPage() {
  const user = useStore((state) => state.user);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white cyber-grid">
      {/* Glistening Cyber Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[150px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-indigo-500" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            IntelliHire Shield
          </span>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm text-zinc-400 font-medium">
          <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
          <a href="#dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</a>
          <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-indigo-400 transition-colors">FAQ</a>
        </nav>
        <div className="flex gap-4 items-center">
          {user ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/20"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/20"
              >
                Register Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 md:px-12 flex flex-col items-center text-center max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            variants={itemVariants}
            className="px-3 py-1 text-xs font-semibold rounded-full border border-indigo-500/25 bg-indigo-500/5 text-indigo-400 flex items-center gap-2"
          >
            <Activity className="h-3 w-3 animate-pulse" />
            Integrity First SaaS Platform
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight"
          >
            Uncompromising AI
            <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Interview Integrity
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-zinc-400 max-w-3xl mt-4 leading-relaxed"
          >
            Deploy adaptive spatial-temporal fraud models to flag cheating in real-time. Enforced browser locks, gaze trackers, secondary voice recognizers, and intelligent AI agents combined into one patent-ready recruiting solution.
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-4 mt-8 flex-col sm:flex-row">
            <Link
              href="/register"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 font-semibold hover:bg-indigo-500 transition-all hover:scale-105"
            >
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 transition-all font-semibold"
            >
              Explore Innovation Models
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Real-time Showcase Grid */}
      <section id="features" className="px-6 py-20 md:px-12 max-w-6xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight">Enterprise Anomaly Detection</h2>
          <p className="text-zinc-400 mt-2">Active biometric markers capturing and filtering fraudulent behaviors instantly.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-cyan-500/5 blur-xl"></div>
            <Eye className="h-10 w-10 text-cyan-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Smart Eye Gaze Tracker</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Monitors visual spatial-temporal patterns. Yaw, pitch, and rotational vectors catch secondary screen lookups and constant eye shifting.
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl"></div>
            <Video className="h-10 w-10 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Multi-Face & Identity Verifier</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              WASM-driven client filters verify presence integrity. Instantly reports empty camera viewports or unauthorized secondary faces.
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-purple-500/5 blur-xl"></div>
            <Brain className="h-10 w-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-bold text-white">AI Agent Decision Framework</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Six synchronized monitoring and risk scoring agents score anomalies in sliding windows to prevent false positives and produce custom PDFs.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 md:px-12 max-w-6xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight">Flexible SaaS Pricing Plans</h2>
          <p className="text-zinc-400 mt-2">Transparent pricing to scale your talent acquisition efforts with top-tier AI protection.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card rounded-xl p-8 border border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Basic Starter</h3>
              <p className="text-xs text-zinc-400 mt-1">Perfect for startup screenings</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold">$29</span>
                <span className="text-sm text-zinc-400"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Up to 20 candidates/mo</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Base tab/focus tracking</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Standard Email Support</li>
              </ul>
            </div>
            <Link href="/register" className="w-full text-center mt-8 py-2 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 rounded-lg text-sm font-semibold transition-colors">
              Get Started
            </Link>
          </div>

          <div className="glass-card rounded-xl p-8 border border-indigo-500/40 relative overflow-hidden flex flex-col justify-between shadow-indigo-500/10 shadow-xl">
            <div className="absolute top-0 right-0 bg-indigo-600 text-[10px] px-3 py-1 font-bold rounded-bl-lg text-white">POPULAR</div>
            <div>
              <h3 className="text-lg font-bold text-white">Recruiter Pro</h3>
              <p className="text-xs text-zinc-400 mt-1">For active mid-sized organizations</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold">$89</span>
                <span className="text-sm text-zinc-400"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Up to 100 candidates/mo</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Full Gaze, Face & Audio AI</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> AI-generated report export</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Real-time dashboard sockets</li>
              </ul>
            </div>
            <Link href="/register" className="w-full text-center mt-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg hover:shadow-indigo-500/20">
              Get Started Pro
            </Link>
          </div>

          <div className="glass-card rounded-xl p-8 border border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Enterprise Guard</h3>
              <p className="text-xs text-zinc-400 mt-1">High volume automated screening</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold">$249</span>
                <span className="text-sm text-zinc-400"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Unlimited screenings</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Custom API integration</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Dedicated agent custom thresholds</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> SLA & 24/7 dedicated engineer</li>
              </ul>
            </div>
            <Link href="/register" className="w-full text-center mt-8 py-2 border border-white/10 hover:bg-white/5 text-white rounded-lg text-sm font-semibold transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-6 py-20 md:px-12 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-6">
          <div className="glass-card rounded-lg p-5">
            <h4 className="font-bold flex items-center gap-2 text-indigo-300"><HelpCircle className="h-4 w-4" /> How does gaze tracking function?</h4>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              We leverage client-side face landmarks inside a high-speed WASM container to track face pitch and pupil center placements. It runs locally in the browser to maintain ultra low latency without lagging video frames.
            </p>
          </div>
          <div className="glass-card rounded-lg p-5">
            <h4 className="font-bold flex items-center gap-2 text-indigo-300"><HelpCircle className="h-4 w-4" /> Does this support secondary monitor flags?</h4>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              Yes, our system logs browser blur ticks and checks the display configuration metrics upon beginning full-screen enforcement. Continuous focus updates are sent over Socket.IO immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-500 px-6">
        <p>&copy; {new Date().getFullYear()} IntelliHire Shield Inc. All rights reserved. Made by advanced principal AI software architects.</p>
      </footer>
    </div>
  );
}
