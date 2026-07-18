import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, animate } from 'motion/react';
import {
  FileText, Sparkles, ArrowRight, RotateCcw, Volume2, VolumeX, ArrowUpRight,
  Check, ShieldCheck, Cpu, MousePointer2, Info, CheckCircle2, Lock, Upload
} from 'lucide-react';
import { audioPool } from '../utils/audioPool';

// ----------------------------------------------------------------------
// PHYSICS & CONSTRAINTS (V4 Master Spec)
// ----------------------------------------------------------------------
const SPRING_HEAVY = { type: 'spring' as const, stiffness: 200, damping: 25 };
const SPRING_GENTLE = { type: 'spring' as const, stiffness: 120, damping: 20 };

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

const RollingText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <span className="relative overflow-hidden inline-flex">
      <span className="inline-flex">
        {text.split("").map((c, i) => (
          <span
            key={i}
            className="relative inline-block transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:-translate-y-full"
            style={{ transitionDelay: `${i * 12}ms` }}
          >
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
      </span>
      <span className="absolute inset-0 inline-flex">
        {text.split("").map((c, i) => (
          <span
            key={i}
            className="relative inline-block transition-transform duration-500 ease-[0.16,1,0.3,1] translate-y-full group-hover:translate-y-0"
            style={{ transitionDelay: `${i * 12}ms` }}
          >
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
      </span>
    </span>
  );
};

// Physical Rolling Counter (Tesla / Apple Wallet style)
const RollingCounter = ({ value, prefix = "", delayMs = 0 }: { value: number, prefix?: string, delayMs?: number }) => {
  const formattedTarget = value.toLocaleString('en-IN');
  const initialStr = delayMs === 0 ? formattedTarget : formattedTarget.replace(/\d/g, '0');
  const [targetStr, setTargetStr] = useState(initialStr);

  useEffect(() => {
    if (delayMs > 0) {
      const t = setTimeout(() => {
        setTargetStr(formattedTarget);
      }, delayMs);
      return () => clearTimeout(t);
    }
  }, [formattedTarget, delayMs]);

  return (
    <div className="inline-flex items-center font-mono">
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {targetStr.split('').map((char, i) => {
        if (isNaN(Number(char))) {
          return <span key={`char-${i}`} className="inline-block">{char}</span>;
        }
        return (
          <div key={`digit-${i}`} className="relative inline-flex flex-col overflow-hidden h-[1.1em] justify-start align-top">
            <motion.div
              initial={{ y: "0%" }}
              animate={{ y: `-${Number(char) * 10}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 15, delay: i * 0.05 }}
              className="flex flex-col"
            >
              {/* Digits 0-9 */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <span key={num} className="h-[1.1em] flex items-center justify-center leading-none">
                  {num}
                </span>
              ))}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

// Shimmer highlight effect for active processing
const ShimmerLine: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <motion.div
      initial={{ x: '-100%' }} animate={{ x: '200%' }}
      transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
    />
  );
};

// Continuous animated ellipsis for "Analyzing..."
const AnimatedEllipsis = () => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return <span className="inline-block w-4 text-left">{dots}</span>;
};

// ----------------------------------------------------------------------
// MAIN HERO COMPONENT
// ----------------------------------------------------------------------

interface HeroSectionProps { onStart: () => void; }

export default function HeroSection({ onStart }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  const [soundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isInView, setIsInView] = useState(true);

  // Throttled / Decoupled Timeline State
  const [timelineState, setTimelineState] = useState({
    showUploadCard: false,
    isDraggingPDF: false,
    pdfLands: false,
    isUploading: false,
    isUploadComplete: false,
    showAIExtraction: false,
    showDashboard: false,
    showLines: false,
    isFinalPayoff: false,
    isZoomingForward: false,
    showSavingsCounters: false,
    isMorphing: false,
    activeStep: 0,
    task1Done: false,
    task2Done: false,
    task3Done: false,
    task1Status: null as string | null,
    task2Status: null as string | null,
    task3Status: null as string | null
  });

  const [isPlaying, setIsPlaying] = useState(true);

  // Framer Motion continuous values
  const tickerTimeMV = useMotionValue(0);
  const tickerTimeString = useTransform(tickerTimeMV, (t) => `${(t / 1000).toFixed(1)}s`);

  const uploadProgressMV = useMotionValue(0);
  const uploadPercentString = useTransform(uploadProgressMV, (p) => `${Math.floor(p * (2 - p) * 100)}%`);

  const cursorXMV = useMotionValue("120%");
  const cursorYMV = useMotionValue("120%");
  const cursorOpacityMV = useMotionValue(0);
  const cursorScaleMV = useMotionValue(1);

  // Target values to avoid double triggering animation calls
  const targetCursorXRef = useRef("120%");
  const targetCursorYRef = useRef("120%");
  const targetCursorOpacityRef = useRef(0);
  const targetCursorClickingRef = useRef(false);
  const lastAudioCheckRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // IntersectionObserver to pause timeline ticker off-screen
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsInView(entry.isIntersecting);
      });
    }, {
      threshold: 0.05
    });

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const resetTimeline = () => {
    setIsPlaying(false);
    setTimelineState({
      showUploadCard: false,
      isDraggingPDF: false,
      pdfLands: false,
      isUploading: false,
      isUploadComplete: false,
      showAIExtraction: false,
      showDashboard: false,
      showLines: false,
      isFinalPayoff: false,
      isZoomingForward: false,
      showSavingsCounters: false,
      isMorphing: false,
      activeStep: 0,
      task1Done: false,
      task2Done: false,
      task3Done: false,
      task1Status: null as string | null,
      task2Status: null as string | null,
      task3Status: null as string | null
    });
    tickerTimeMV.set(0);
    uploadProgressMV.set(0);
    cursorXMV.set("120%");
    cursorYMV.set("120%");
    cursorOpacityMV.set(0);
    cursorScaleMV.set(1);
    targetCursorXRef.current = "120%";
    targetCursorYRef.current = "120%";
    targetCursorOpacityRef.current = 0;
    targetCursorClickingRef.current = false;
    lastAudioCheckRef.current = 0;
    setTimeout(() => setIsPlaying(true), 600);
  };

  // Master Timeline Driver
  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrame: number;

    const playTimeline = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const currentElapsed = elapsed % 18000;

      // Update ticking MotionValue out-of-band
      tickerTimeMV.set(currentElapsed);

      // Upload progress updates
      const uploadProgress = Math.min(Math.max((currentElapsed - 1500) / 1000, 0), 1);
      uploadProgressMV.set(uploadProgress);

      // Throttled sound triggers using the recycled AudioPool
      const lastCheck = lastAudioCheckRef.current;
      const playBeepPool = (freq: number, type: OscillatorType, dur: number, vol: number) => {
        if (soundEnabled) {
          audioPool.playBeep(freq, type, dur, vol);
        }
      };

      const checkSoundTrigger = (threshold: number, freq: number, type: OscillatorType, dur: number, vol: number) => {
        if (lastCheck > currentElapsed) {
          if (lastCheck <= threshold || currentElapsed >= threshold) {
            playBeepPool(freq, type, dur, vol);
          }
        } else {
          if (lastCheck < threshold && currentElapsed >= threshold) {
            playBeepPool(freq, type, dur, vol);
          }
        }
      };

      checkSoundTrigger(1500, 400, 'sine', 0.1, 0.05);
      checkSoundTrigger(2500, 800, 'sine', 0.1, 0.05);
      checkSoundTrigger(4400, 720, 'sine', 0.04, 0.012);
      checkSoundTrigger(5100, 740, 'sine', 0.04, 0.012);
      checkSoundTrigger(5800, 760, 'sine', 0.04, 0.012);
      checkSoundTrigger(17000, 600, 'sine', 0.05, 0.05);

      lastAudioCheckRef.current = currentElapsed;

      // Ingest AI task status texts
      const getTaskStatusLocal = (start: number, done: number, label: string) => {
        if (currentElapsed < start) return null;
        if (currentElapsed >= done) return `✓ Verified ${label}`;
        const prog = (currentElapsed - start) / (done - start);
        return prog < 0.5 ? `Reading...` : `Scanning...`;
      };

      const task1Status = getTaskStatusLocal(3800, 4400, "Form 16 structure");
      const task2Status = getTaskStatusLocal(4500, 5100, "Employer & Deductions");
      const task3Status = getTaskStatusLocal(5200, 5800, "Regime Optimization");

      // Cursor movement sequencer
      let cursorX = "120%";
      let cursorY = "120%";
      let cursorOpacity = 0;
      let cursorClicking = false;

      if (currentElapsed > 800 && currentElapsed <= 1300) {
        cursorOpacity = 1; cursorX = "72%"; cursorY = "58%";
      } else if (currentElapsed > 1300 && currentElapsed <= 1500) {
        cursorOpacity = 1; cursorX = "50%"; cursorY = "50%";
      } else if (currentElapsed > 1500 && currentElapsed <= 2500) {
        cursorOpacity = 1; cursorX = "53%"; cursorY = "56%";
      } else if (currentElapsed > 2500 && currentElapsed < 15500) {
        cursorOpacity = 0; cursorX = "80%"; cursorY = "80%";
      } else if (currentElapsed >= 15500 && currentElapsed < 16500) {
        cursorOpacity = 1; cursorX = "50%"; cursorY = "72%";
      } else if (currentElapsed >= 16500 && currentElapsed < 17000) {
        cursorOpacity = 1; cursorX = "50%"; cursorY = "75%";
      } else if (currentElapsed >= 17000 && currentElapsed < 17200) {
        cursorOpacity = 1; cursorX = "50%"; cursorY = "75%"; cursorClicking = true;
      } else if (currentElapsed >= 17200) {
        cursorOpacity = 1; cursorX = "55%"; cursorY = "80%";
      }

      // Smoothly animate cursor MotionValues outside of the React render loop
      if (targetCursorXRef.current !== cursorX) {
        targetCursorXRef.current = cursorX;
        animate(cursorXMV, cursorX, { type: 'spring', stiffness: 140, damping: 24 });
      }
      if (targetCursorYRef.current !== cursorY) {
        targetCursorYRef.current = cursorY;
        animate(cursorYMV, cursorY, { type: 'spring', stiffness: 140, damping: 24 });
      }
      if (targetCursorOpacityRef.current !== cursorOpacity) {
        targetCursorOpacityRef.current = cursorOpacity;
        animate(cursorOpacityMV, cursorOpacity, { duration: 0.3 });
      }
      if (targetCursorClickingRef.current !== cursorClicking) {
        targetCursorClickingRef.current = cursorClicking;
        animate(cursorScaleMV, cursorClicking ? 0.9 : 1, { duration: 0.15 });
      }

      // Threshold check triggers for React state updates
      const nextShowUploadCard = currentElapsed >= 500;
      const nextIsDraggingPDF = currentElapsed > 1000 && currentElapsed < 1500;
      const nextPdfLands = currentElapsed >= 1500;
      const nextIsUploading = currentElapsed >= 1500 && currentElapsed < 2500;
      const nextIsUploadComplete = currentElapsed >= 2500;
      const nextShowAIExtraction = currentElapsed >= 3500;
      const nextShowDashboard = currentElapsed >= 6500;
      const nextShowLines = currentElapsed >= 7800;
      const nextShowSavingsCounters = currentElapsed >= 8000;
      const nextIsFinalPayoff = currentElapsed >= 11500;
      const nextIsZoomingForward = currentElapsed >= 17200;

      const nextActiveStep = currentElapsed >= 11500 ? 3 : currentElapsed >= 6500 ? 2 : currentElapsed >= 3500 ? 1 : 0;

      const task1Done = currentElapsed >= 4400;
      const task2Done = currentElapsed >= 5100;
      const task3Done = currentElapsed >= 5800;

      const nextIsMorphing = (currentElapsed > 3000 && currentElapsed < 3500) || (currentElapsed > 6000 && currentElapsed < 6500);

      // Update react state ONLY if a threshold is crossed (approx 15 renders per 18s loop!)
      setTimelineState(prev => {
        if (
          prev.showUploadCard === nextShowUploadCard &&
          prev.isDraggingPDF === nextIsDraggingPDF &&
          prev.pdfLands === nextPdfLands &&
          prev.isUploading === nextIsUploading &&
          prev.isUploadComplete === nextIsUploadComplete &&
          prev.showAIExtraction === nextShowAIExtraction &&
          prev.showDashboard === nextShowDashboard &&
          prev.showLines === nextShowLines &&
          prev.showSavingsCounters === nextShowSavingsCounters &&
          prev.isFinalPayoff === nextIsFinalPayoff &&
          prev.isZoomingForward === nextIsZoomingForward &&
          prev.isMorphing === nextIsMorphing &&
          prev.activeStep === nextActiveStep &&
          prev.task1Done === task1Done &&
          prev.task2Done === task2Done &&
          prev.task3Done === task3Done &&
          prev.task1Status === task1Status &&
          prev.task2Status === task2Status &&
          prev.task3Status === task3Status
        ) {
          return prev;
        }

        return {
          showUploadCard: nextShowUploadCard,
          isDraggingPDF: nextIsDraggingPDF,
          pdfLands: nextPdfLands,
          isUploading: nextIsUploading,
          isUploadComplete: nextIsUploadComplete,
          showAIExtraction: nextShowAIExtraction,
          showDashboard: nextShowDashboard,
          showLines: nextShowLines,
          showSavingsCounters: nextShowSavingsCounters,
          isFinalPayoff: nextIsFinalPayoff,
          isZoomingForward: nextIsZoomingForward,
          isMorphing: nextIsMorphing,
          activeStep: nextActiveStep,
          task1Done,
          task2Done,
          task3Done,
          task1Status,
          task2Status,
          task3Status
        };
      });

      animationFrame = window.requestAnimationFrame(playTimeline);
    };

    if (isPlaying && isInView && !prefersReducedMotion) {
      animationFrame = window.requestAnimationFrame(playTimeline);
    } else if (prefersReducedMotion) {
      setTimelineState(prev => ({
        ...prev,
        showUploadCard: true,
        isUploadComplete: true,
        showAIExtraction: true,
        showDashboard: true,
        showLines: true,
        showSavingsCounters: true,
        isFinalPayoff: true,
        task1Done: true,
        task2Done: true,
        task3Done: true
      }));
    }

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isPlaying, isInView, soundEnabled, prefersReducedMotion]);

  const {
    showUploadCard,
    isDraggingPDF,
    pdfLands,
    isUploading,
    isUploadComplete,
    showAIExtraction,
    showDashboard,
    showLines,
    isFinalPayoff,
    isZoomingForward,
    isMorphing
  } = timelineState;

  const aiTasks = useMemo(() => [
    { id: 1, label: "Form 16 structure", start: 3800, done: 4400 },
    { id: 2, label: "Employer & Deductions", start: 4500, done: 5100 },
    { id: 3, label: "Regime Optimization", start: 5200, done: 5800 }
  ], []);

  const cursorClicking = targetCursorClickingRef.current;

  return (
    <div
      ref={heroRef}
      className="w-full relative flex flex-col items-center justify-between text-center px-4 pt-32 pb-12 overflow-hidden z-10 min-h-[90vh]"
    >
      <style>{`
        @keyframes drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.15; }
          80% { opacity: 0.15; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        .animate-drift { animation: drift 20s infinite linear; } /* 0.5px/s dust */

        @keyframes browser-breathe {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3px) scale(1.002); }
        }
        .animate-browser-breathe { animation: browser-breathe 8s infinite ease-in-out; }

        @keyframes glass-sweep {
          0%, 80% { transform: translate(-50%, -50%) rotate(30deg); opacity: 0; }
          90% { opacity: 1; }
          100% { transform: translate(250%, 250%) rotate(30deg); opacity: 0; }
        }
        .animate-glass-sweep { animation: glass-sweep 20s infinite cubic-bezier(0.16, 1, 0.3, 1); }

        @keyframes dashed-spin {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -20; }
        }
      `}</style>

      {/* 0.5px/s Dust Particles (Max 12) & 4% Aurora */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              left: `${(i * 15) % 100}%`,
              width: `${(i % 2) + 2}px`,
              height: `${(i % 2) + 2}px`,
              backgroundColor: i % 2 === 0 ? '#60A5FA' : '#34D399',
              animationDelay: `${i * 2}s`,
              animationDuration: `${20 + (i % 3) * 5}s`,
              bottom: '5%',
            }}
            className="absolute rounded-full animate-drift opacity-0"
          />
        ))}
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#2563EB]/4 to-transparent blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#10B981]/4 to-transparent blur-[100px]" />
        {/* Soft aurora glow directly behind browser stage */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-emerald-500/[0.02] dark:bg-[#16E27A]/[0.015] blur-[120px] pointer-events-none" />
      </div>

      {/* Hero Copy (V4 Master Spec) */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_GENTLE}
        className="space-y-6 z-10 max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-600 dark:bg-[#10B981]/10 dark:border-[#10B981]/25 dark:text-[#34D399] text-[10px] font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Tax Ingestion Platform AY 2026-27</span>
        </div>

        {/* Enforced Typography Hierarchy (72px -> 18px -> 13px baseline) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-bold tracking-tight text-slate-900 font-sans dark:text-white leading-[1.05]">
          Know your best tax regime <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-400 dark:from-[#34D399] dark:to-blue-400">before you file.</span>
        </h1>
        <p className="text-[16px] md:text-[18px] leading-[1.6] text-slate-650/90 dark:text-slate-400/80 max-w-[620px] mx-auto font-medium">
          Upload your Form 16. Leave with the best filing strategy. Our secure AI parses your profile and finds every tax saving before you submit.
        </p>

        <div className="pt-4 flex flex-col items-center justify-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="group relative overflow-hidden px-8 py-[18px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[13px] uppercase tracking-wider rounded-[14px] transition-all duration-300 shadow-[0_4px_14px_rgba(37,99,235,0.18)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] active:scale-[0.97] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RollingText text="Calculate My Tax Savings" />
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
            <div className="flex gap-2">
              <button className="group relative overflow-hidden px-8 py-[18px] bg-white/60 hover:bg-white text-slate-800 border border-slate-200/50 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] dark:text-white dark:border-slate-800 font-bold text-[13px] uppercase tracking-wider rounded-[14px] transition-all flex items-center gap-1.5 shadow-sm dark:shadow-none backdrop-blur-md cursor-pointer">
                <RollingText text="Explore Platform" />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>
              <button
                onClick={resetTimeline}
                className="px-5 py-[18px] bg-white/60 hover:bg-white text-slate-600 border border-slate-200/50 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] dark:text-slate-400 dark:border-slate-800 rounded-[14px] transition-all flex items-center justify-center shadow-sm dark:shadow-none backdrop-blur-md cursor-pointer"
                title="Replay Story"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-slate-500 dark:text-slate-400 tracking-wider">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> NO ACCOUNT REQUIRED</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 100% FREE CALCULATOR</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> PRIVACY FIRST</span>
          </div>
        </div>
      </motion.div>      {/* THE BROWSER STAGE - Scaled up to max-w-[1080px] with tighter gap */}
      <motion.div
        animate={{
          scale: isZoomingForward ? 1.3 : (mounted ? 1 : 0.96),
          opacity: isZoomingForward ? 0 : (mounted ? 1 : 0),
          filter: isMorphing ? 'blur(4px)' : 'blur(0px)'
        }}
        initial={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 w-full max-w-[1080px] border border-slate-200 dark:border-white/[0.06] bg-white/70 dark:bg-[#0c101a]/95 backdrop-blur-[24px] rounded-[20px] p-2 relative z-10 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)] animate-browser-breathe"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[20px] pointer-events-none z-20">
          <div className="w-1/2 h-[200%] bg-gradient-to-r from-transparent via-white/40 dark:via-white/[0.015] to-transparent absolute animate-glass-sweep" />
        </div>

        {/* Title Bar with Semantic Timeline */}
        <div className="h-10 border-b border-slate-200 dark:border-white/[0.04] bg-white dark:bg-[#0E131B]/90 backdrop-blur-md px-5 flex items-center justify-between rounded-t-[22px]">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/20" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-500/20" />
            <span className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/20" />
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 dark:text-slate-400 tracking-wider">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> taxsense.in/sandbox
            </div>
            <div className="hidden sm:flex items-center gap-3 border-l border-slate-300 dark:border-white/10 pl-4">
            <span className={timelineState.activeStep === 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>● Upload</span>
              <span className={timelineState.activeStep === 1 ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>● Extract</span>
              <span className={timelineState.activeStep === 2 ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>● Compare</span>
              <span className={timelineState.activeStep === 3 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>● Ready</span>
            </div>
          </div>
          <div className="w-12 text-[9px] font-mono text-slate-500 dark:text-slate-600 text-right">
            <motion.span>{tickerTimeString}</motion.span>
          </div>
        </div>

        {/* BROWSER CONTENT WINDOW with increased height */}
        <div className="w-full bg-slate-50/90 dark:bg-[#030712] rounded-b-[22px] min-h-[510px] relative overflow-hidden flex items-center justify-center font-sans p-8 border-t border-slate-200 dark:border-transparent">

          {/* APPLE KEYNOTE DESATURATION LAYER */}
          <motion.div
            animate={{
              opacity: isFinalPayoff ? 1 : 0,
              backdropFilter: isFinalPayoff ? 'blur(12px) grayscale(100%) brightness(0.4)' : 'blur(0px) grayscale(0%) brightness(1)'
            }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-20 pointer-events-none"
          />

          {/* SCENE 1: UPLOAD (0.5s - 3.0s) */}
          <AnimatePresence>
            {showUploadCard && !showAIExtraction && (
              <motion.div
                layoutId="morph-container"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  scale: isDraggingPDF ? 1.04 : 1, 
                  y: 0,
                  boxShadow: isDraggingPDF 
                    ? '0 20px 50px rgba(16,185,129,0.12), inset 0 1px 1px rgba(255,255,255,0.06)' 
                    : '0 8px 32px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.04)'
                }}
                exit={{ opacity: 0, scale: 0.95, y: -40 }} // Exit morph
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`w-[340px] bg-white dark:bg-[#0E131B] backdrop-blur-md rounded-[20px] p-8 flex flex-col items-center text-center relative overflow-hidden group border transition-colors duration-300 ${
                  isUploadComplete 
                    ? 'border-slate-300 dark:border-slate-700 border-solid' 
                    : (isDraggingPDF ? 'border-emerald-500/50 dark:border-[#16E27A]/50 bg-emerald-500/[0.02]' : 'border-slate-200 dark:border-white/[0.06]')
                }`}
              >
                {/* Marching Ants Dashed Border Animation */}
                {!isUploadComplete && (
                  <motion.svg 
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full pointer-events-none rounded-[20px]"
                  >
                    <rect
                      x="1.5" y="1.5"
                      width="calc(100% - 3px)"
                      height="calc(100% - 3px)"
                      rx="18" ry="18"
                      fill="none"
                      stroke={isDraggingPDF ? "#10B981" : "rgba(59,130,246,0.3)"}
                      className={isDraggingPDF ? "" : "dark:stroke-emerald-500/35"}
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                      style={{
                        animation: 'dashed-spin 1.2s linear infinite',
                      }}
                    />
                  </motion.svg>
                )}

                {/* Dotted Hover Glow */}
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/[0.02] transition-colors duration-500" />

                {/* PDF Drag Simulate */}
                {isDraggingPDF && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.2, y: 50, rotate: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="absolute z-20 pointer-events-none drop-shadow-2xl"
                  >
                    <div className="w-16 h-20 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                      <FileText className="w-8 h-8 text-red-500 animate-bounce" />
                      <span className="text-[7px] text-slate-800 dark:text-slate-200 font-bold mt-1">PDF</span>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  animate={{ 
                    scale: pdfLands ? 1.05 : 1,
                    y: isUploadComplete ? 0 : [0, -3, 0]
                  }}
                  transition={{ 
                    y: isUploadComplete ? {} : { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                    scale: { type: "spring", stiffness: 300, damping: 10 }
                  }}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 relative z-10 ${isUploadComplete ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    } border shadow-inner`}
                >
                  {isUploadComplete ? (
                    <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Upload className="w-7 h-7 text-slate-400" />
                  )}
                </motion.div>

                <h4 className="text-[15px] font-bold text-slate-900 dark:text-white mb-2 relative z-10">
                  {isUploadComplete ? 'Document Secured' : (isDraggingPDF ? 'Drop your Form 16' : 'Drag Form 16 Here')}
                </h4>

                {!isUploading && !isUploadComplete && (
                  <div className="space-y-1 relative z-10 text-[11px] text-slate-500 dark:text-slate-400">
                    <p>Supported: Form 16, AIS, 26AS</p>
                    <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400/80">Secure Local Sandbox</p>
                  </div>
                )}

                {isUploading && (
                  <div className="w-full mt-4 space-y-2 relative z-10">
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-655 dark:text-slate-400">
                      <span>Form16.pdf</span>
                      <motion.span className="text-emerald-600 dark:text-emerald-400 font-bold">{uploadPercentString}</motion.span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                      <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 relative" style={{ width: uploadPercentString }}>
                        <ShimmerLine active={true} />
                      </motion.div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAIExtraction && !showDashboard && (
              <motion.div
                layoutId="morph-container"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={SPRING_HEAVY}
                className="w-[460px] bg-white dark:bg-[#0E131B] border border-slate-250 dark:border-white/[0.06] backdrop-blur-xl rounded-[20px] p-6 shadow-2xl relative overflow-hidden"
              >
                {/* Laser Scanning Line */}
                <motion.div
                  initial={{ top: "-10%" }} animate={{ top: "110%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none z-10"
                />

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.04] pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Extraction</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold tracking-wide uppercase w-[95px]">
                    Analyzing<AnimatedEllipsis />
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  {aiTasks.map((task) => {
                    const isDone = task.id === 1 ? timelineState.task1Done : task.id === 2 ? timelineState.task2Done : timelineState.task3Done;
                    const statusText = task.id === 1 ? timelineState.task1Status : task.id === 2 ? timelineState.task2Status : timelineState.task3Status;
                    if (!statusText) return null;

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-[12px] relative overflow-hidden transition-colors duration-300 ${isDone 
                            ? 'bg-white/20 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200' 
                            : 'bg-blue-50/40 dark:bg-blue-500/[0.02] border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-100'
                          }`}
                      >
                        <span className="font-mono">{statusText}</span>
                        {!isDone && <ShimmerLine active={true} />}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCENE 3: DASHBOARD STRUCTURE (6.5s - 13.5s) */}
          <AnimatePresence>
            {showDashboard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 p-8 flex flex-col gap-8 max-w-[600px] mx-auto w-full z-10"
              >
                {/* SVG CONNECTION LINES */}
                {showLines && (
                  <svg viewBox="0 0 600 350" className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden sm:block" style={{ overflow: 'visible' }}>
                    {/* Line from Income to Comparison */}
                    <motion.path
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.3 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      d="M 160,140 L 160,162 L 200,162 L 200,180"
                      stroke="#10B981" strokeWidth="2" fill="none" strokeDasharray="4 4"
                    />
                    <motion.circle
                      initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      r="4" fill="#34D399" style={{ offsetPath: "path('M 160,140 L 160,162 L 200,162 L 200,180')" }}
                      className="drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    />
                    {/* Line from Deductions to Comparison */}
                    <motion.path
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.3 }}
                      transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                      d="M 440,140 L 440,162 L 400,162 L 400,180"
                      stroke="#10B981" strokeWidth="2" fill="none" strokeDasharray="4 4"
                    />
                    <motion.circle
                      initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.2 }}
                      r="4" fill="#34D399" style={{ offsetPath: "path('M 440,140 L 440,162 L 400,162 L 400,180')" }}
                      className="drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    />
                  </svg>
                )}

                <div className="grid grid-cols-2 gap-6 relative z-10 w-full">
                  {/* 1. Salary Card (Entry 6.5s) */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.0, ...SPRING_GENTLE }}
                    className="bg-white dark:bg-[#0E131B] border border-slate-250 dark:border-white/[0.06] rounded-2xl p-6 shadow-xl"
                  >
                    <div className="text-[11px] text-slate-555 dark:text-slate-400 font-mono uppercase mb-2 tracking-wider">Detected Income</div>
                    <div className="text-[15px] font-bold text-slate-900 dark:text-white mb-4">Google India Pvt Ltd</div>
                    <div className="text-xl font-mono font-bold text-slate-900 dark:text-white">₹8,50,000</div>
                  </motion.div>

                  {/* 2. Deductions Card (Entry 6.75s) */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, ...SPRING_GENTLE }}
                    className="bg-white dark:bg-[#0E131B] border border-slate-250 dark:border-white/[0.06] rounded-2xl p-6 shadow-xl"
                  >
                    <div className="text-[11px] text-slate-555 dark:text-slate-400 font-mono uppercase mb-2 tracking-wider">Verified Deductions</div>
                    <div className="text-[15px] font-bold text-slate-900 dark:text-white mb-4">Sec 80C + Standard</div>
                    <div className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-450">₹2,25,000</div>
                  </motion.div>
                </div>

                {/* 3. Regime Comparison (Entry 7.0s) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, ...SPRING_GENTLE }}
                  className="bg-white dark:bg-[#0E131B] border border-slate-250 dark:border-white/[0.06] rounded-2xl p-6 grid grid-cols-2 gap-6 shadow-2xl relative overflow-hidden mx-auto w-[400px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-pulse opacity-50" />

                  <div className="text-center relative z-10">
                    <div className="text-[11px] text-slate-555 dark:text-slate-400 font-mono uppercase mb-2 tracking-wider">Old Regime</div>
                    <div className="text-2xl font-mono font-bold text-slate-500 dark:text-slate-400 line-through decoration-red-500/50 decoration-2">
                      {timelineState.showSavingsCounters ? <RollingCounter value={54600} prefix="₹" delayMs={0} /> : "₹00,000"}
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/5 border border-emerald-200/50 dark:border-emerald-500/10 rounded-2xl flex-1 shadow-sm text-center">
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-500 font-mono uppercase mb-2 tracking-widest font-bold">New Regime Tax</div>
                    <div className="text-xl sm:text-2xl font-black text-[#10B981] dark:text-[#16E27A] font-mono leading-none tracking-tight">
                      {timelineState.showSavingsCounters ? <RollingCounter value={36360} prefix="₹" delayMs={400} /> : "₹00,000"}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCENE 4: FINAL HERO KEYNOTE PAYOFF (Appears at 11.5s) */}
          <AnimatePresence>
            {isFinalPayoff && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: -10 }} // Lift 10px
                transition={SPRING_HEAVY}
                className="absolute z-30 w-[420px] bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-[24px] p-10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.9)] flex flex-col items-center text-center animate-browser-breathe"
              >
                {/* 12% single pulse glow */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: [0, 0.12, 0] }}
                  transition={{ duration: 1.5, times: [0, 0.3, 1] }}
                  className="absolute inset-0 bg-emerald-500 rounded-[24px] blur-2xl -z-10"
                />

                <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5">
                  <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Analysis Complete</h3>
                <div className="text-[13px] text-slate-500 dark:text-slate-400 mb-8 flex items-center gap-1.5 cursor-default">
                  Very High Confidence
                  <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-350 transition-colors" />
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 mb-8">
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-500 font-mono uppercase mb-3 tracking-widest font-bold">Estimated Savings</div>
                  <div className="text-[42px] font-black text-slate-900 dark:text-white font-mono leading-none tracking-tight">
                    <RollingCounter value={18240} prefix="+" delayMs={200} />
                  </div>
                </div>

                <div className="w-full space-y-3 text-left text-[12px] font-mono text-slate-600 dark:text-slate-300 mb-8">
                  <div className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Documents Verified</div>
                  <div className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Deductions Optimized</div>
                  <div className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Regimes Compared</div>
                </div>

                <motion.button
                  animate={cursorClicking ? { scale: 0.94 } : { scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="group w-full py-4 bg-primary-action hover:bg-primary-action/90 text-white font-bold text-[13px] uppercase tracking-wider rounded-full transition-colors shadow-lg relative overflow-hidden flex items-center justify-center gap-1"
                >
                  <RollingText text="Start Filing" />
                  <span className="relative z-10">→</span>
                  {cursorClicking && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-white/60 rounded-full origin-center"
                    />
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SIMULATED LIVING CURSOR */}
          {!prefersReducedMotion && (
            <motion.div
              style={{
                left: cursorXMV,
                top: cursorYMV,
                opacity: cursorOpacityMV,
                scale: cursorScaleMV,
                x: '-20%',
                y: '-10%'
              }}
              className="absolute z-50 pointer-events-none w-7 h-7 flex items-center justify-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
            >
              <MousePointer2 className="w-6 h-6 text-white fill-black stroke-[1.5]" />
              {cursorClicking && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 1 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 0.4 }}
                  className="absolute inset-0 rounded-full border-2 border-white/40"
                />
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
