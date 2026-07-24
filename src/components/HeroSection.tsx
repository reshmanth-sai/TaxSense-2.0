import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, animate } from 'motion/react';
import {
  FileText, Sparkles, ArrowRight, RotateCcw, ArrowUpRight,
  Check, ShieldCheck, Cpu, MousePointer2, Info, CheckCircle2, Lock, Upload
} from 'lucide-react';
import { audioPool } from '../utils/audioPool';
import { ProductVideoPlayer } from './landing/ProductVideoPlayer';


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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:bg-[#10B981]/10 dark:border-[#10B981]/25 dark:text-[#34D399] text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Tax Ingestion Platform • FY 2025–26 (AY 2026–27)</span>
        </div>

        {/* Enforced Typography Hierarchy (72px -> 18px -> 13px baseline) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-extrabold tracking-tight text-slate-900 font-sans dark:text-white leading-[1.05]">
          Compare both tax regimes instantly. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 dark:from-[#34D399] dark:via-emerald-400 dark:to-blue-400">File with 100% confidence.</span>
        </h1>
        <p className="text-[16px] md:text-[18px] leading-[1.6] text-slate-650 dark:text-slate-350 max-w-[660px] mx-auto font-medium">
          Upload your Form 16 in seconds. Our local-first AI engine compares Old vs New regimes, identifies missed 80C & 80D deductions, and calculates your maximum tax refund.
        </p>

        <div className="pt-4 flex flex-col items-center justify-center gap-5">
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={onStart}
              className="group relative overflow-hidden px-8 py-[18px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[13px] uppercase tracking-wider rounded-[14px] transition-all duration-300 shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.4)] active:scale-[0.97] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
            >
              <RollingText text="Compare My Tax Regime" />
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={onStart}
                className="group relative overflow-hidden px-7 py-[18px] bg-white/70 hover:bg-white text-slate-800 border border-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-white dark:border-white/10 font-bold text-[13px] uppercase tracking-wider rounded-[14px] transition-all flex items-center gap-1.5 shadow-sm dark:shadow-none backdrop-blur-md cursor-pointer"
              >
                <RollingText text="Try Live Demo" />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>
              <button
                onClick={resetTimeline}
                className="px-5 py-[18px] bg-white/70 hover:bg-white text-slate-600 border border-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-slate-400 dark:border-white/10 rounded-[14px] transition-all flex items-center justify-center shadow-sm dark:shadow-none backdrop-blur-md cursor-pointer"
                title="Replay Interactive Workflow"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Trust Signals & Social Proof */}
          <div className="pt-2 flex flex-col items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <span>Trusted by 15,000+ Indian Taxpayers</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] font-mono text-slate-600 dark:text-slate-400 tracking-wider">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> ⚡ 58s Avg. Time</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 💰 ₹18,400 Avg. Savings</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 🔒 AES-256 Encrypted</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 🛡️ Zero Login Required</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* REDESIGNED PRODUCT VIDEO PLAYER SHOWCASE */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="mt-10 w-full relative z-10"
      >
        <ProductVideoPlayer onStartFiling={onStart} />
      </motion.div>
    </div>
  );
}

