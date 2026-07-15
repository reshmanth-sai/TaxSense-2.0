import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  FileText, Sparkles, ArrowRight, RotateCcw, Volume2, VolumeX, ArrowUpRight,
  Check, ShieldCheck, Cpu, MousePointer2, Info, CheckCircle2, Lock
} from 'lucide-react';

// ----------------------------------------------------------------------
// PHYSICS & CONSTRAINTS (V5 Master Spec)
// ----------------------------------------------------------------------
const SPRING_HEAVY = { type: 'spring' as const, stiffness: 200, damping: 25 };
const SPRING_GENTLE = { type: 'spring' as const, stiffness: 120, damping: 20 };

// Helper to ease values smoothly matching global timeline duration
const getEasedVal = (elapsed: number, duration: number, maxVal: number) => {
  if (elapsed < 0) return 0;
  const progress = Math.min(elapsed / duration, 1);
  const ease = progress * (2 - progress); // Ease out quad
  return Math.floor(ease * maxVal);
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

  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Continuous Timeline State (0 to 16000ms for V5)
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Audio helper
  const playBeep = (freq = 600, type: OscillatorType = 'sine', duration = 0.08, volume = 0.02) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (freq === 600) osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + duration);
      else if (freq === 400) osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play block:', e);
    }
  };

  // Master Timeline Driver
  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrame: number;

    const playTimeline = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      
      if (elapsed <= 16000) {
        setTime(elapsed);
        animationFrame = window.requestAnimationFrame(playTimeline);
      } else {
        // Auto-loop
        startTimestamp = null;
        setTime(0);
        animationFrame = window.requestAnimationFrame(playTimeline);
      }
    };

    if (isPlaying && !prefersReducedMotion) {
      animationFrame = window.requestAnimationFrame(playTimeline);
    } else if (prefersReducedMotion) {
      setTime(16000);
    }

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isPlaying, prefersReducedMotion]);

  // SCENE TIMING BOOLEANS (V5 16.0s Extended Timeline)
  // 0.0s - 1.0s: Idle
  // 1.0s - 3.0s: Upload Card
  const showUploadCard = time >= 500;
  const isDraggingPDF = time > 1000 && time < 1500;
  const pdfLands = time >= 1500;
  const isUploading = time >= 1500 && time < 2500;
  const isUploadComplete = time >= 2500;
  
  // 3.5s - 6.5s: AI Extraction
  const showAIExtraction = time >= 3500;
  
  // 6.5s - 11.5s: Dashboard Comparison Assemble
  const showDashboard = time >= 6500;
  const showSalaryCard = time >= 6500;
  const showDeductionsCard = time >= 8000;
  const showComparisonBlock = time >= 9500;

  // Connection Line Growth Animations
  const leftLineProgress = Math.max(0, Math.min((time - 7500) / 500, 1));
  const rightLineProgress = Math.max(0, Math.min((time - 9000) / 500, 1));
  const showLines = time >= 7500;
  
  // 11.5s: Keynote Climax Payoff
  const isFinalPayoff = time >= 11500;
  
  // 15.5s: Click & Zoom
  const isZoomingForward = time >= 15500;

  // Upload Progress Interpolator
  const uploadProgress = Math.min(Math.max((time - 1500) / (2500 - 1500), 0), 1);
  const uploadPercent = Math.floor(uploadProgress * (2 - uploadProgress) * 100);

  // AI Task Sequencer (Start at 3.5s, 600ms per task duration)
  const aiTasks = useMemo(() => [
    { id: 1, label: "Form 16 structure", start: 3800, done: 4400 },
    { id: 2, label: "Employer & Deductions", start: 4500, done: 5100 },
    { id: 3, label: "Regime Optimization", start: 5200, done: 5800 }
  ], []);

  // Play sound on task completion
  useEffect(() => {
    aiTasks.forEach(t => {
      if (Math.abs(time - t.done) < 30) playBeep(700 + t.id * 20, 'sine', 0.04, 0.012);
    });
    if (Math.abs(time - 1500) < 30) playBeep(400, 'sine', 0.1, 0.05); // Drop thump
    if (Math.abs(time - 2500) < 30) playBeep(800, 'sine', 0.1, 0.05); // Verified
    if (Math.abs(time - 15300) < 30) playBeep(600, 'sine', 0.05, 0.05); // Click
  }, [time, aiTasks]);

  // Dynamic AI Text state function
  const getTaskStatus = (t: { start: number, done: number, label: string }) => {
    if (time < t.start) return null;
    if (time >= t.done) return `✓ Verified ${t.label}`;
    const progress = (time - t.start) / (t.done - t.start);
    return progress < 0.5 ? `Reading...` : `Scanning...`;
  };

  // IMPERFECT CURSOR PHYSICS (V5 16.0s Timeline Mapping)
  let cursorX = "120%";
  let cursorY = "120%";
  let cursorOpacity = 0;
  let cursorClicking = false;

  if (time > 800 && time <= 1300) {
    // Bring cursor in to grab PDF (Overshoot slightly)
    cursorOpacity = 1; cursorX = "72%"; cursorY = "58%";
  } else if (time > 1300 && time <= 1500) {
    // Correct and drag to dropzone
    cursorOpacity = 1; cursorX = "50%"; cursorY = "50%";
  } else if (time > 1500 && time <= 2500) {
    // Drift away slightly
    cursorOpacity = 1; cursorX = "53%"; cursorY = "56%";
  } else if (time > 2500 && time < 14800) {
    // Hide during AI, Dashboard build & explanation
    cursorOpacity = 0; cursorX = "80%"; cursorY = "80%";
  } else if (time >= 14800 && time < 15200) {
    // Bring back for CTA magnetism
    cursorOpacity = 1; cursorX = "50%"; cursorY = "76%";
  } else if (time >= 15200 && time < 15300) {
    // Hover CTA target
    cursorOpacity = 1; cursorX = "50%"; cursorY = "79%";
  } else if (time >= 15300 && time < 15500) {
    // Click!
    cursorOpacity = 1; cursorX = "50%"; cursorY = "79%"; cursorClicking = true;
  } else if (time >= 15500) {
    // Drift away during zoom reset
    cursorOpacity = 1; cursorX = "55%"; cursorY = "84%";
  }

  // Typewriter Explanation Effect (Starts at 13.4s, finishes around 15.0s)
  const typewriterText = "Switching to the New Regime reduces your tax by ₹18,240 based on your verified income and deductions.";
  const typewriterProgress = Math.max(0, Math.min((time - 13400) / 1600, 1));
  const typewriterLength = Math.floor(typewriterProgress * typewriterText.length);
  const displayedExplanation = typewriterText.substring(0, typewriterLength);

  // CTA button hover magnetism state
  const isCursorHoveringCTA = time >= 15000 && time < 15500;
  let btnScale = 1;
  let btnY = 0;
  let btnGlow = "shadow-[0_4px_12px_rgba(0,0,0,0.3)]";
  if (isCursorHoveringCTA) {
    if (time >= 15300) {
      // Compress click
      btnScale = 0.95;
      btnY = 0;
    } else {
      // Magnetism hover lift
      btnScale = 1.02;
      btnY = -3;
      btnGlow = "shadow-[0_0_20px_rgba(16,185,129,0.45)]";
    }
  }

  // Active step helper for semantic timeline indicator
  const isStepActive = (step: string) => {
    if (step === 'Upload') return time >= 0 && time < 3500;
    if (step === 'Extract') return time >= 3500 && time < 6500;
    if (step === 'Compare') return time >= 6500 && time < 11500;
    return time >= 11500; // Ready
  };

  // Motion Blur Class for major morphs
  const isMorphing = (time > 3000 && time < 3500) || (time > 6000 && time < 6500);

  return (
    <div 
      ref={heroRef}
      className="w-full relative flex flex-col items-center justify-between text-center px-4 pt-20 pb-12 overflow-hidden z-10 min-h-[90vh]"
    >
      <style>{`
        @keyframes drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.15; }
          80% { opacity: 0.15; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        .animate-drift { animation: drift 20s infinite linear; }

        @keyframes browser-breathe {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2px) scale(1.002); }
        }
        .animate-browser-breathe { animation: browser-breathe 9s infinite ease-in-out; }

        @keyframes glass-sweep {
          0%, 80% { transform: translate(-50%, -50%) rotate(30deg); opacity: 0; }
          90% { opacity: 0.8; }
          100% { transform: translate(250%, 250%) rotate(30deg); opacity: 0; }
        }
        .animate-glass-sweep { animation: glass-sweep 18s infinite cubic-bezier(0.16, 1, 0.3, 1); }
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
      </div>

      {/* Hero Copy (V5 Master Spec) */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_GENTLE}
        className="space-y-6 z-10 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 text-[#34D399] text-[10px] font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Tax Ingestion Platform AY 2026-27</span>
        </div>
        
        {/* Enforced Typography Hierarchy */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black tracking-tight text-white leading-[1.1]">
          Know your best tax regime <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34D399] to-blue-400">before you file.</span>
        </h1>
        <p className="text-[16px] md:text-[18px] leading-[1.5] text-slate-400 max-w-xl mx-auto font-medium">
          Upload your Form 16. Leave with the best filing strategy. Our secure AI parses your profile and finds every tax saving before you submit.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="px-7 py-4 bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-bold text-[13px] uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <span>Start Sandbox Workspace</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
          <div className="flex gap-2">
            <button className="px-6 py-4 bg-white/[0.02] hover:bg-white/[0.05] text-white border border-slate-800 font-bold text-[13px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5">
              <span>Explore Platform</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setTime(0);
                setTimeout(() => setIsPlaying(true), 600);
              }}
              className="px-4 py-4 bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 border border-slate-800 rounded-xl transition-all flex items-center justify-center"
              title="Replay Story"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* THE BROWSER STAGE */}
      <motion.div
        animate={{ 
          scale: isZoomingForward ? 1.3 : 1, 
          opacity: isZoomingForward ? 0 : 1,
          filter: isMorphing ? 'blur(4px)' : 'blur(0px)'
        }}
        transition={{ duration: isZoomingForward ? 0.5 : 0.3 }}
        className="mt-16 w-full max-w-[800px] border border-white/[0.06] bg-[#0c101a]/85 backdrop-blur-[16px] rounded-[24px] p-2 relative z-10 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)] animate-browser-breathe"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none z-20">
          <div className="w-1/2 h-[200%] bg-gradient-to-r from-transparent via-white/[0.015] to-transparent absolute animate-glass-sweep" />
        </div>

        {/* Title Bar with macOS Glass Depth & Highlights */}
        <div 
          className="h-10 px-5 flex items-center justify-between rounded-t-[22px] border-b border-white/[0.04] bg-slate-900/40 backdrop-blur-md"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/20" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-500/20" />
            <span className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/20" />
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 tracking-wider">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> taxsense.in/sandbox
            </div>
            <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-4 select-none">
              {['Upload', 'Extract', 'Compare', 'Ready'].map((step) => {
                const active = isStepActive(step);
                return (
                  <span 
                    key={step} 
                    className={`flex items-center gap-1 transition-all duration-300 ${
                      active ? 'text-[#34D399] font-extrabold filter drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]' : ''
                    }`}
                  >
                    ● {step}
                    {active && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]"></span>
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="w-12 text-[9px] font-mono text-slate-600 text-right">
            {(time / 1000).toFixed(1)}s
          </div> 
        </div>

        {/* BROWSER CONTENT WINDOW */}
        <div className="w-full bg-[#030712] rounded-b-[22px] min-h-[450px] relative overflow-hidden flex items-center justify-center font-sans p-8">
          
          {/* Keynote Desaturation Glow backdrop element */}
          <div className="absolute inset-0 bg-[#10B981]/[0.015] blur-3xl pointer-events-none z-0" />

          {/* APPLE KEYNOTE AGGRESIVE BLUR & DESATURATION LAYER */}
          <motion.div 
            animate={{ 
              opacity: isFinalPayoff ? 1 : 0, 
              backdropFilter: isFinalPayoff ? 'blur(20px) grayscale(40%) brightness(0.4)' : 'blur(0px) grayscale(0%) brightness(1)'
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
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -40 }}
                transition={SPRING_HEAVY}
                className="w-[340px] bg-slate-900/10 border border-slate-700/50 rounded-[20px] p-8 flex flex-col items-center text-center relative overflow-hidden group"
                style={{ borderStyle: isUploadComplete ? 'solid' : 'dashed' }}
              >
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/[0.02] transition-colors duration-500" />

                {isDraggingPDF && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 1.2, y: 50, rotate: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="absolute z-20 pointer-events-none drop-shadow-2xl"
                  >
                    <div className="w-16 h-20 bg-white rounded-lg shadow-lg border border-slate-200 flex flex-col items-center justify-center">
                      <FileText className="w-8 h-8 text-red-500" />
                      <span className="text-[7px] text-slate-800 font-bold mt-1">PDF</span>
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  animate={{ scale: pdfLands ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 relative z-10 ${
                    isUploadComplete ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
                  } border shadow-inner`}
                >
                  {isUploadComplete ? (
                    <Check className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <FileText className="w-7 h-7 text-slate-400" />
                  )}
                </motion.div>
                
                <h4 className="text-[15px] font-bold text-white mb-2 relative z-10">
                  {isUploadComplete ? 'Document Secured' : 'Drag Form 16 Here'}
                </h4>

                {!isUploading && !isUploadComplete && (
                  <p className="text-[12px] text-slate-500 relative z-10">Secure AES-256 Client Processing</p>
                )}

                {isUploading && (
                  <div className="w-full mt-4 space-y-2 relative z-10">
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                      <span>Form16.pdf</span>
                      <span className="text-emerald-400 font-bold">{uploadPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 relative" style={{ width: `${uploadPercent}%` }}>
                        <ShimmerLine active={true} />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCENE 2: AI EXTRACTION (3.5s - 6.5s) */}
          <AnimatePresence>
            {showAIExtraction && !showDashboard && (
              <motion.div
                layoutId="morph-container"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={SPRING_HEAVY}
                className="w-[460px] bg-slate-905/40 border border-slate-800/85 backdrop-blur-xl rounded-[20px] p-6 shadow-2xl relative overflow-hidden"
              >
                <motion.div 
                  initial={{ top: "-10%" }} animate={{ top: "110%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none z-10"
                />

                <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-400" />
                    <span className="text-[13px] font-bold text-white uppercase tracking-wider">AI Extraction</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] font-bold tracking-wide uppercase w-[95px]">
                    Analyzing<AnimatedEllipsis />
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  {aiTasks.map((task) => {
                    const statusText = getTaskStatus(task);
                    if (!statusText) return null;
                    const isDone = time >= task.done;

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-[12px] relative overflow-hidden transition-colors duration-300 ${
                          isDone ? 'bg-emerald-500/[0.03] border-emerald-500/20 text-emerald-100' : 'bg-blue-500/[0.02] border-blue-500/20 text-blue-100'
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

          {/* SCENE 3: DASHBOARD STRUCTURE (6.5s - 15.5s) */}
          <AnimatePresence>
            {showDashboard && !isZoomingForward && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 p-8 flex flex-col justify-between max-w-[620px] mx-auto w-full z-10 h-full"
              >
                
                {/* SVG SEQUENTIAL CONNECTION LINES */}
                {showLines && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                    {/* Line from Income (Salary) to Comparison */}
                    <motion.path 
                      style={{ pathLength: leftLineProgress }}
                      d="M 120,110 L 120,190 L 250,190 L 250,225" 
                      stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="3 3"
                    />
                    {leftLineProgress >= 1 && (
                      <motion.circle
                        initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                        r="3.5" fill="#34D399" style={{ offsetPath: "path('M 120,110 L 120,190 L 250,190 L 250,225')" }}
                        className="drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]"
                      />
                    )}
                    {/* Line from Deductions to Comparison */}
                    <motion.path 
                      style={{ pathLength: rightLineProgress }}
                      d="M 500,110 L 500,190 L 370,190 L 370,225" 
                      stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="3 3"
                    />
                    {rightLineProgress >= 1 && (
                      <motion.circle
                        initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                        r="3.5" fill="#34D399" style={{ offsetPath: "path('M 500,110 L 500,190 L 370,190 L 370,225')" }}
                        className="drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]"
                      />
                    )}
                  </svg>
                )}

                {/* 32px whitespace container */}
                <div className="flex flex-col gap-8 w-full mt-4">
                  
                  {/* Cards Row */}
                  <div className="grid grid-cols-2 gap-8 relative z-10 w-full">
                    
                    {/* 1. Salary Card (Entry 6.5s) */}
                    {showSalaryCard && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }} 
                        animate={{ opacity: 1, y: 0 }}
                        transition={SPRING_GENTLE}
                        className="bg-slate-905/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden"
                      >
                        <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 tracking-wider">Detected Income</div>
                        <div className="text-[13.5px] font-bold text-white mb-3">Google India Pvt Ltd</div>
                        <div className="text-lg font-mono font-bold text-white">
                          ₹{getEasedVal(time - 6500, 1000, 850000).toLocaleString('en-IN')}
                        </div>

                        {/* Verified Ring Pulse (7.5s) */}
                        {time >= 7500 && time < 8300 && (
                          <motion.div
                            initial={{ scale: 0.6, opacity: 1 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full border border-emerald-500/50 pointer-events-none z-10"
                          />
                        )}
                      </motion.div>
                    )}

                    {/* 2. Deductions Card (Entry 8.0s) */}
                    {showDeductionsCard && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }} 
                        animate={{ opacity: 1, y: 0 }}
                        transition={SPRING_GENTLE}
                        className="bg-slate-905/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden"
                      >
                        <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 tracking-wider">Verified Deductions</div>
                        <div className="text-[13.5px] font-bold text-white mb-3">Sec 80C + Standard</div>
                        <div className="text-lg font-mono font-bold text-emerald-400">
                          ₹{getEasedVal(time - 8000, 1000, 225000).toLocaleString('en-IN')}
                        </div>

                        {/* Verified Ring Pulse (9.0s) */}
                        {time >= 9000 && time < 9800 && (
                          <motion.div
                            initial={{ scale: 0.6, opacity: 1 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full border border-emerald-500/50 pointer-events-none z-10"
                          />
                        )}
                      </motion.div>
                    )}

                  </div>

                  {/* 3. Regime Comparison (Entry 9.5s) */}
                  {showComparisonBlock && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={SPRING_GENTLE}
                      className="bg-slate-905/40 border border-slate-800 rounded-2xl p-5 grid grid-cols-2 gap-6 shadow-2xl relative overflow-hidden mx-auto w-[380px]"
                    >
                      {/* Sweep Highlight */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#10B981]/5 to-transparent pointer-events-none animate-glass-sweep" style={{ animationDuration: '4s' }} />

                      <div className="text-center relative z-10 border-r border-white/[0.04]">
                        <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 tracking-wider">Old Regime</div>
                        <div className="text-xl font-mono font-bold text-slate-400 line-through decoration-red-500/40 decoration-1">
                          {time >= 9500 && time < 10200 ? (
                            <span className="text-[10px] text-slate-500">calculating...</span>
                          ) : (
                            `₹${getEasedVal(time - 10200, 700, 54600).toLocaleString('en-IN')}`
                          )}
                        </div>
                      </div>
                      <div className="text-center relative z-10">
                        <div className="text-[10px] text-emerald-500 font-mono uppercase mb-1 tracking-wider">New Regime</div>
                        <div className="text-xl font-mono font-bold text-emerald-400">
                          {time >= 10200 && time < 11000 ? (
                            <span className="text-[10px] text-emerald-500">calculating...</span>
                          ) : (
                            `₹${getEasedVal(time - 11000, 700, 36360).toLocaleString('en-IN')}`
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* AI Graph lines / Subtle Waves at bottom (Recommendation 5) */}
                <div className="absolute bottom-0 left-0 right-0 h-32 opacity-[0.05] pointer-events-none z-0">
                  <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                    <path 
                      d="M0,60 Q150,90 300,30 T450,80 T600,50 L600,120 L0,120 Z" 
                      fill="url(#ai-graph-grad)" 
                      stroke="#10B981" 
                      strokeWidth="1.5"
                    />
                    <defs>
                      <linearGradient id="ai-graph-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* SCENE 4: FINAL HERO KEYNOTE PAYOFF (Appears at 11.5s) */}
          <AnimatePresence>
            {isFinalPayoff && !isZoomingForward && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: [0.94, 1.01, 1.0], y: -8 }}
                transition={{ duration: 0.85, ...SPRING_HEAVY }}
                className="absolute z-30 w-[420px] bg-slate-900 border border-emerald-500/30 rounded-[24px] p-8 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.95)] flex flex-col items-center text-center overflow-hidden"
              >
                {/* 15% ambient green lighting Behind Card */}
                <div className="absolute inset-0 bg-[#10B981]/[0.05] rounded-[24px] blur-2xl -z-10" />

                {/* Single Success Circle Ring Expansion (11.5s) */}
                {time >= 11500 && time < 12700 && (
                  <motion.div
                    initial={{ scale: 0.4, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute w-24 h-24 rounded-full border border-emerald-500/35 pointer-events-none z-10 top-[40px]"
                  />
                )}

                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6.5 h-6.5 text-emerald-400 animate-pulse" />
                </div>
                
                <h3 className="text-[17px] font-bold text-white mb-0.5">Analysis Complete</h3>
                
                {/* Replaced generic Confidence badge with detailed Trust checks */}
                <div className="text-[9.5px] font-semibold text-slate-500 tracking-wider uppercase mb-6 cursor-default">
                  Verified using 126 Tax Rules ✦ 47 Validation Checks ✦ 100% Form16 Coverage
                </div>

                <div className="w-full bg-slate-950 rounded-2xl p-5 border border-slate-800/80 mb-5 relative">
                  <div className="text-[10px] text-emerald-500 font-mono uppercase mb-2 tracking-widest">Estimated Savings</div>
                  <div className="text-[40px] font-black text-white font-mono leading-none tracking-tight">
                    ₹{getEasedVal(time - 11700, 1000, 18240).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Believable Specific Checklist text */}
                <div className="w-full space-y-2.5 text-left text-[11.5px] font-medium text-slate-350 mb-6">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> Form 16 verified</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> ₹2,25,000 deductions identified</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> New Regime saves ₹18,240</div>
                </div>

                {/* Typewriter AI Explanation */}
                <div className="w-full h-8 text-center text-[10.5px] leading-relaxed text-slate-400 font-medium mb-6 select-none font-sans px-1">
                  {displayedExplanation}
                </div>

                {/* CTA Magnetism properties */}
                <motion.button
                  animate={{ scale: btnScale, y: btnY }}
                  transition={SPRING_HEAVY}
                  className={`w-full py-4 bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-bold text-[12.5px] uppercase tracking-wider rounded-xl transition-all duration-300 relative overflow-hidden group border border-[#10B981]/20 flex flex-col items-center justify-center ${btnGlow}`}
                >
                  <span className="relative z-10">Start Filing Securely</span>
                  <span className="relative z-10 text-[8.5px] opacity-75 font-mono font-medium tracking-normal mt-0.5 uppercase">
                    Ready in under 60 seconds
                  </span>
                  {cursorClicking && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0.6 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-white/50 rounded-xl origin-center"
                    />
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SIMULATED LIVING CURSOR */}
          {!prefersReducedMotion && (
            <motion.div
              animate={{ left: cursorX, top: cursorY, opacity: cursorOpacity, scale: cursorClicking ? 0.9 : 1 }}
              transition={{ type: 'spring', stiffness: 140, damping: 24, opacity: { duration: 0.3 } }}
              className="absolute z-50 pointer-events-none w-7 h-7 flex items-center justify-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              style={{ x: '-20%', y: '-10%' }}
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
