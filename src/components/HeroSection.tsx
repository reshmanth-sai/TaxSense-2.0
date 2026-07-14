import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Check,
  ShieldCheck,
  Cpu,
  MousePointer2,
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';

// ----------------------------------------------------------------------
// SPRING PHYSICS CONFIGURATION (Master Spec constraint)
// ----------------------------------------------------------------------
const SPRING_HEAVY = { type: 'spring' as const, stiffness: 200, damping: 25 };
const SPRING_GENTLE = { type: 'spring' as const, stiffness: 120, damping: 20 };

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  duration?: number; // in ms
  delayMs?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, prefix = "", duration = 1200, delayMs = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let timeoutId: NodeJS.Timeout;

    const startValue = prevValueRef.current;
    if (startValue === value) {
      setDisplayValue(value);
      return;
    }

    const startAnimation = () => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease Out Quad
        const easeProgress = progress * (2 - progress);
        const current = Math.floor(startValue + (value - startValue) * easeProgress);
        
        setDisplayValue(current);
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          prevValueRef.current = value;
        }
      };
      window.requestAnimationFrame(step);
    };

    if (delayMs > 0) {
      timeoutId = setTimeout(startAnimation, delayMs);
    } else {
      startAnimation();
    }

    return () => clearTimeout(timeoutId);
  }, [value, duration, delayMs]);

  return <span>{prefix}{displayValue.toLocaleString('en-IN')}</span>;
};

// Shimmer highlight effect for active processing
const ShimmerLine: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <motion.div 
      initial={{ x: '-100%' }}
      animate={{ x: '200%' }}
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
  return <span className="inline-block w-4">{dots}</span>;
};

// ----------------------------------------------------------------------
// MAIN HERO COMPONENT
// ----------------------------------------------------------------------

interface HeroSectionProps {
  onStart: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const browserRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Playback Control
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Continuous Timeline State (0 to 18000ms)
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
      if (!startTimestamp) {
        startTimestamp = timestamp;
      }
      const elapsed = timestamp - startTimestamp;
      
      // Stop at 18000 (Idle state)
      if (elapsed <= 18000) {
        setTime(elapsed);
        animationFrame = window.requestAnimationFrame(playTimeline);
      } else {
        setTime(18000);
      }
    };

    if (isPlaying && !prefersReducedMotion) {
      animationFrame = window.requestAnimationFrame(playTimeline);
    } else if (prefersReducedMotion) {
      // Skip animation entirely
      setTime(18000);
    }

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isPlaying, prefersReducedMotion]);

  // Handle immediate replay
  const handleReplay = () => {
    setIsPlaying(false);
    setTime(0);
    // Force a small tick delay to reset states smoothly before restarting
    setTimeout(() => {
      setIsPlaying(true);
      playBeep(550, 'sine', 0.1, 0.02);
    }, 600); // 600ms wait before restart (Master spec)
  };

  // ----------------------------------------------------------------------
  // SCENE TIMING BOOLEANS
  // ----------------------------------------------------------------------
  const showUploadCard = time >= 500;
  const isDraggingPDF = time > 1200 && time < 2300;
  const isUploading = time >= 2300 && time < 4000;
  const isUploadComplete = time >= 4000;
  
  const showAIExtraction = time >= 5000;
  const showDashboard = time >= 9000;
  const isFinalPayoff = time >= 15000;

  // Upload Progress Interpolator
  const uploadProgress = Math.min(Math.max((time - 2300) / (4000 - 2300), 0), 1);
  // Ease out progress
  const easedUpload = uploadProgress * (2 - uploadProgress);
  const uploadPercent = Math.floor(easedUpload * 100);

  // AI Task Sequencer (Start at 5.5s, 120ms gap per task, 600ms processing)
  const aiTasks = useMemo(() => [
    { id: 1, label: "Form 16 structure", start: 5500, done: 6100 },
    { id: 2, label: "Employer details", start: 6220, done: 6820 },
    { id: 3, label: "Section 80C claims", start: 6940, done: 7540 },
    { id: 4, label: "Regimes Comparison", start: 7660, done: 8260 }
  ], []);

  // Play sound on task completion
  useEffect(() => {
    aiTasks.forEach(t => {
      if (Math.abs(time - t.done) < 30) {
        playBeep(700 + t.id * 20, 'sine', 0.04, 0.012);
      }
    });
  }, [time, aiTasks]);

  // ----------------------------------------------------------------------
  // CURSOR SIMULATION PHYSICS
  // ----------------------------------------------------------------------
  let cursorX = "120%";
  let cursorY = "120%";
  let cursorOpacity = 0;
  let cursorClicking = false;

  if (time > 1000 && time <= 2000) {
    // Bring cursor in to grab PDF
    cursorOpacity = 1;
    cursorX = "70%";
    cursorY = "60%";
  } else if (time > 2000 && time <= 2500) {
    // Drag towards center drop zone
    cursorOpacity = 1;
    cursorX = "50%";
    cursorY = "50%";
  } else if (time > 2500 && time <= 3500) {
    // Release and drift down slowly while waiting
    cursorOpacity = 1;
    cursorX = "52%";
    cursorY = "55%";
  } else if (time > 3500 && time < 14000) {
    // Hide cursor during AI and dashboard build
    cursorOpacity = 0;
    cursorX = "80%";
    cursorY = "80%";
  } else if (time >= 14000 && time < 15500) {
    // Bring back for CTA hover
    cursorOpacity = 1;
    cursorX = "50%";
    cursorY = "70%"; // Below CTA
  } else if (time >= 15500 && time < 16500) {
    // Move up to hover CTA
    cursorOpacity = 1;
    cursorX = "50%";
    cursorY = "73%"; // Center on CTA (roughly)
  } else if (time >= 16500 && time < 16700) {
    // Click!
    cursorOpacity = 1;
    cursorX = "50%";
    cursorY = "73%";
    cursorClicking = true;
  } else if (time >= 16700) {
    // Drift away
    cursorOpacity = 1;
    cursorX = "55%";
    cursorY = "80%";
  }

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
        .animate-drift { animation: drift 15s infinite ease-in-out; }

        @keyframes browser-breathe {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.003); }
        }
        .animate-browser-breathe {
          animation: browser-breathe 8s infinite ease-in-out;
        }

        @keyframes glass-sweep {
          0%, 80% { transform: translate(-50%, -50%) rotate(30deg); opacity: 0; }
          90% { opacity: 1; }
          100% { transform: translate(250%, 250%) rotate(30deg); opacity: 0; }
        }
        .animate-glass-sweep { animation: glass-sweep 15s infinite cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
      
      {/* Strict Ambient Background (Max 12 particles, 4% aurora) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              left: `${(i * 15) % 100}%`,
              width: `${(i % 2) + 2}px`,
              height: `${(i % 2) + 2}px`,
              backgroundColor: i % 2 === 0 ? '#60A5FA' : '#34D399',
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${12 + (i % 3) * 2}s`,
              bottom: '10%',
            }}
            className="absolute rounded-full animate-drift opacity-0"
          />
        ))}
        {/* Subtle Aurora */}
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#2563EB]/4 to-transparent blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#10B981]/4 to-transparent blur-[100px]" />
      </div>

      {/* Hero Content */}
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
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
          File your taxes <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34D399] to-blue-400">with absolute confidence.</span>
        </h1>
        <p className="text-[14px] md:text-[15px] leading-[1.5] text-slate-400 max-w-xl mx-auto">
          Upload your Form 16 PDF. Our secure AI parses your profile, checks for claims you missed, and generates a verified tax return guide in minutes.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="px-7 py-3.5 bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <span>Start Sandbox Workspace</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
          <div className="flex gap-2">
            <button className="px-6 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] text-white border border-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5">
              <span>Explore Platform</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={handleReplay}
              className="px-3.5 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl transition-all flex items-center justify-center cursor-pointer"
              title="Replay Story"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playBeep(700, 'sine', 0.05, 0.02);
              }}
              className={`px-3.5 py-3.5 border rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                soundEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-white/[0.02] text-slate-500 border-slate-800 hover:border-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Browser Window - The Stage */}
      <motion.div
        ref={browserRef}
        className="mt-16 w-full max-w-3xl border border-white/[0.06] bg-[#0c101a]/85 backdrop-blur-[16px] rounded-[24px] p-2 relative z-10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.6)] animate-browser-breathe"
        style={{ transformPerspective: 1200, rotateX: prefersReducedMotion ? 0 : 2 }} // 2deg perspective tilt
      >
        <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none">
          <div className="w-1/2 h-[200%] bg-gradient-to-r from-transparent via-white/[0.015] to-transparent absolute animate-glass-sweep" />
        </div>

        {/* Title Bar */}
        <div className="h-9 border-b border-white/[0.04] bg-slate-900/50 backdrop-blur-md px-4 flex items-center justify-between rounded-t-[22px]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40 border border-yellow-500/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/40 border border-green-500/20" />
          </div>
          <div className="text-[9px] font-mono text-slate-500 tracking-wider flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> taxsense.in/sandbox
          </div>
          <div className="w-10 text-[8px] font-mono text-slate-600">
            {time > 0 ? (time / 1000).toFixed(1) + 's' : ''}
          </div> 
        </div>

        {/* Browser Content Area */}
        <div className="w-full bg-[#030712] rounded-b-[22px] h-[450px] relative overflow-hidden flex items-center justify-center font-sans text-xs p-8">
          
          {/* SCENE 1: UPLOAD (0.5s - 4.9s) */}
          <AnimatePresence>
            {showUploadCard && !showAIExtraction && (
              <motion.div
                layoutId="upload-container"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0.4, scale: 0.95, y: -40 }} // Scene 1 Exit Rule
                transition={SPRING_HEAVY}
                className="w-[320px] bg-slate-900/10 border border-slate-800 rounded-[20px] p-8 flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* Simulated Dragged PDF */}
                {isDraggingPDF && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 1.1, y: 50, rotate: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                    className="absolute z-20 pointer-events-none drop-shadow-xl"
                  >
                    <div className="w-16 h-20 bg-white rounded-lg shadow border border-slate-200 flex flex-col items-center justify-center">
                      <FileText className="w-8 h-8 text-red-500" />
                      <span className="text-[6px] text-slate-600 font-bold mt-1">PDF</span>
                    </div>
                  </motion.div>
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-500 ${
                  isUploadComplete ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
                } border shadow-inner`}>
                  {isUploadComplete ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_HEAVY}>
                      <Check className="w-6 h-6 text-emerald-400" />
                    </motion.div>
                  ) : (
                    <FileText className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                
                <h4 className="text-sm font-bold text-white mb-2">
                  {isUploadComplete ? 'Document Verified' : 'Drag Form 16 Here'}
                </h4>

                {!isUploading && !isUploadComplete && (
                  <p className="text-[11px] text-slate-500">Secure AES-256 Client Processing</p>
                )}

                {isUploading && (
                  <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>Form16.pdf</span>
                      <span className="text-emerald-400">{uploadPercent}%</span>
                    </div>
                    <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 relative"
                        style={{ width: `${uploadPercent}%` }}
                      >
                        <ShimmerLine active={true} />
                      </div>
                    </div>
                  </div>
                )}

                {isUploadComplete && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className="flex flex-col items-center mt-2 space-y-1 text-[10px] text-emerald-400/80 font-mono"
                  >
                    <span>✓ Encrypted Locally</span>
                    <span>Ready for AI Analysis</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCENE 2: AI EXTRACTION (5.0s - 8.9s) */}
          <AnimatePresence>
            {showAIExtraction && !showDashboard && (
              <motion.div
                layoutId="ai-extraction"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }} // Collapse & expand out
                transition={SPRING_HEAVY}
                className="w-[420px] bg-slate-905/40 border border-slate-800/85 backdrop-blur-md rounded-[20px] p-6 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">AI Extraction</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[9px] font-bold tracking-wide uppercase w-[88px]">
                    Analyzing<AnimatedEllipsis />
                  </div>
                </div>

                <div className="space-y-3">
                  {aiTasks.map((task) => {
                    const isStarted = time >= task.start;
                    const isDone = time >= task.done;
                    if (!isStarted) return null;

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-3 rounded-lg border text-[11px] relative overflow-hidden transition-colors ${
                          isDone 
                            ? 'bg-emerald-500/[0.02] border-emerald-500/20 text-slate-300' 
                            : 'bg-blue-500/[0.02] border-blue-500/20 text-white'
                        }`}
                      >
                        <span className="font-mono">{isDone ? `✓ Verified ${task.label}` : `Reading ${task.label}...`}</span>
                        {!isDone && <ShimmerLine active={true} />}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCENE 3: DASHBOARD STRUCTURE (9.0s onwards) */}
          <AnimatePresence>
            {showDashboard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: isFinalPayoff ? 0.4 : 1, // Final payoff constraint: dim to 40%
                  filter: isFinalPayoff ? 'blur(8px)' : 'blur(0px)', // Final payoff constraint: Max blur 8px
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 p-8 flex flex-col gap-8 max-w-xl mx-auto w-full overflow-hidden"
              >
                {/* 1. Salary Card (Entry 9.0s) */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.0, ...SPRING_GENTLE }}
                  className="bg-slate-905/40 border border-slate-800 rounded-2xl p-5 flex justify-between items-center shadow-lg"
                >
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 tracking-wider">Detected Income</div>
                    <div className="text-sm font-bold text-white">Google India Private Ltd</div>
                  </div>
                  <div className="text-lg font-mono font-bold text-white">
                    ₹8,50,000
                  </div>
                </motion.div>

                {/* 2. Deductions Card (Entry 9.4s) */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, ...SPRING_GENTLE }}
                  className="bg-slate-905/40 border border-slate-800 rounded-2xl p-5 flex justify-between items-center shadow-lg"
                >
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 tracking-wider">Verified Deductions</div>
                    <div className="text-sm font-bold text-white">Sec 80C + Standard Deduction</div>
                  </div>
                  <div className="text-lg font-mono font-bold text-emerald-400">
                    ₹2,25,000
                  </div>
                </motion.div>

                {/* 3. Regime Comparison (Entry 9.8s) */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, ...SPRING_GENTLE }}
                  className="bg-slate-905/40 border border-slate-800 rounded-2xl p-5 grid grid-cols-2 gap-4 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-pulse opacity-50" />
                  
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 tracking-wider">Old Regime Tax</div>
                    <div className="text-base font-mono font-bold text-slate-300">
                      <AnimatedCounter value={54600} prefix="₹" delayMs={1000} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-500 font-mono uppercase mb-1 tracking-wider">New Regime Tax</div>
                    <div className="text-base font-mono font-bold text-emerald-400">
                      <AnimatedCounter value={36360} prefix="₹" delayMs={1000} />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCENE 4: FINAL HERO PAYOFF CARD (Appears at 15.0s) */}
          <AnimatePresence>
            {isFinalPayoff && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: -8 }} // Lifts 8px
                transition={SPRING_HEAVY}
                className="absolute z-30 w-[380px] bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col items-center text-center"
              >
                {/* Soft ambient backlighting */}
                <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl blur-xl -z-10" />

                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                
                <h3 className="text-base font-bold text-white mb-1">Analysis Complete</h3>
                <div className="text-xs text-slate-400 mb-6 flex items-center gap-1 group relative cursor-default">
                  Very High Confidence 
                  <Info className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-[10px] rounded text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Verified using 126 current AY tax rules.
                  </span>
                </div>

                <div className="w-full bg-slate-950 rounded-xl p-4 border border-slate-800 mb-6 relative overflow-hidden">
                   <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: [0, 1, 0] }} 
                    transition={{ delay: 0.5, duration: 1.5, times: [0, 0.5, 1] }} // Pulse ONCE
                    className="absolute inset-0 bg-emerald-500/10" 
                  />
                  <div className="text-[10px] text-emerald-500 font-mono uppercase mb-2 tracking-widest relative z-10">Estimated Savings</div>
                  <div className="text-4xl font-black text-white font-mono relative z-10">
                    <AnimatedCounter value={18240} prefix="₹" duration={1500} delayMs={500} />
                  </div>
                </div>

                <div className="w-full space-y-2 text-left text-[11px] font-mono text-slate-300 mb-6">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Documents Verified</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Deductions Optimized</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Regimes Compared</div>
                </div>

                <motion.button
                  animate={cursorClicking ? { scale: 0.95 } : { scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg relative overflow-hidden"
                >
                  <span className="relative z-10">Start Filing →</span>
                  {cursorClicking && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0.5 }} 
                      animate={{ scale: 2, opacity: 0 }} 
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-white/50 rounded-xl"
                    />
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SIMULATED LIVING CURSOR */}
          {!prefersReducedMotion && (
            <motion.div
              animate={{ 
                left: cursorX, 
                top: cursorY, 
                opacity: cursorOpacity,
                scale: cursorClicking ? 0.9 : 1
              }}
              transition={{ 
                type: 'spring', stiffness: 150, damping: 25, // Hardware feel
                opacity: { duration: 0.3 }
              }}
              className="absolute z-50 pointer-events-none w-6 h-6 flex items-center justify-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              style={{ x: '-20%', y: '-10%' }}
            >
              <MousePointer2 className="w-5 h-5 text-white fill-black stroke-[1.5]" />
              {cursorClicking && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.4 }}
                  className="absolute inset-0 rounded-full border border-white/50" 
                />
              )}
            </motion.div>
          )}

        </div>
      </motion.div>

    </div>
  );
}
