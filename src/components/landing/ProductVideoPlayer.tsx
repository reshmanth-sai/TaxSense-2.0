import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Sparkles, Check, Cpu, Lock, ArrowRight, ShieldCheck, CheckCircle2, Sliders, X, FileCheck, ScanLine, Activity, Award
} from 'lucide-react';
import { audioPool } from '../../utils/audioPool';

const SPRING_HEAVY = { type: 'spring' as const, stiffness: 220, damping: 24 };
const SPRING_BOUNCE = { type: 'spring' as const, stiffness: 350, damping: 20 };

// Rolling Counter for financial values (900ms roll)
const RollingCounter = ({ value, prefix = "", delayMs = 0 }: { value: number; prefix?: string; delayMs?: number }) => {
  const formattedTarget = value.toLocaleString('en-IN');
  const [targetStr, setTargetStr] = useState(delayMs === 0 ? formattedTarget : formattedTarget.replace(/\d/g, '0'));

  useEffect(() => {
    if (delayMs > 0) {
      const t = setTimeout(() => setTargetStr(formattedTarget), delayMs);
      return () => clearTimeout(t);
    } else {
      setTargetStr(formattedTarget);
    }
  }, [formattedTarget, delayMs]);

  return (
    <span className="inline-flex items-center font-mono">
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {targetStr.split('').map((char, i) => {
        if (isNaN(Number(char))) {
          return <span key={`c-${i}`} className="inline-block">{char}</span>;
        }
        return (
          <div key={`d-${i}`} className="relative inline-flex flex-col overflow-hidden h-[1.1em] justify-start align-top">
            <motion.div
              initial={{ y: "0%" }}
              animate={{ y: `-${Number(char) * 10}%` }}
              transition={{ type: 'spring', stiffness: 130, damping: 16, delay: i * 0.04 }}
              className="flex flex-col"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <span key={num} className="h-[1.1em] flex items-center justify-center leading-none">
                  {num}
                </span>
              ))}
            </motion.div>
          </div>
        );
      })}
    </span>
  );
};

// Simulated Animated Cursor Pointer with Attached Dragging File
const CursorPointer = ({ 
  x, 
  y, 
  isClicked, 
  isDraggingFile 
}: { 
  x: string; 
  y: string; 
  isClicked: boolean; 
  isDraggingFile?: boolean;
}) => (
  <motion.div
    animate={{ left: x, top: y }}
    transition={{ type: 'spring', stiffness: 110, damping: 18 }}
    className="absolute z-50 pointer-events-none -translate-x-1.5 -translate-y-1.5"
  >
    {/* Dragged Form 16 PDF Badge attached to cursor */}
    <AnimatePresence>
      {isDraggingFile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.3, y: 20 }}
          transition={{ duration: 0.2 }}
          className="absolute -top-14 -left-10 bg-slate-900/95 dark:bg-slate-950/95 border border-blue-500/40 rounded-2xl p-2.5 shadow-[0_12px_32px_rgba(59,130,246,0.35)] backdrop-blur-xl flex items-center gap-2 text-white select-none pointer-events-none z-50 transform -rotate-6"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shrink-0">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div className="text-left font-mono">
            <div className="text-[10px] font-bold text-blue-300 leading-tight">Form16_FY26.pdf</div>
            <div className="text-[8px] text-slate-400 font-semibold">1.4 MB • Dragging...</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Click Ripple Halo */}
    <AnimatePresence>
      {isClicked && (
        <motion.div
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale: 2.4, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute -top-3.5 -left-3.5 w-11 h-11 rounded-full bg-blue-500/40 border border-blue-400 pointer-events-none"
        />
      )}
    </AnimatePresence>

    {/* Hand / Arrow Cursor SVG */}
    <motion.div
      animate={{ scale: isClicked ? 0.82 : 1 }}
      transition={{ duration: 0.12 }}
      className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5.5 2L16.5 13H11L15 21L12.5 22L8.5 14L4 18.5V2Z"
          fill="black"
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  </motion.div>
);

// Real-Time AI Reasoning Ticker Bar Component
const AIReasoningTicker = ({ activeStep, currentTimeMs }: { activeStep: number; currentTimeMs: number }) => {
  const reasoningTexts = [
    // Phase 0
    currentTimeMs < 1800 
      ? "Reading Form 16 PDF Structure..."
      : currentTimeMs < 2300 
      ? "Validating AES-256 local sandbox encryption..."
      : "Form 16 verified • Zero permanent storage",
    // Phase 1
    currentTimeMs < 5000 
      ? "Parsing Section 17(1) Gross Salary (₹14,50,000)..."
      : currentTimeMs < 6200
      ? "Parsing Section 10(13A) HRA Exemption (₹1,20,000)..."
      : "Cross-referencing Form 26AS TDS records • OCR Accuracy: 99.8%",
    // Phase 2
    currentTimeMs < 9200
      ? "Evaluating 47 Indian tax rules against AY 2026-27 slabs..."
      : "Simulating Old vs New Regime • Recommendation Confidence: 98%",
    // Phase 3
    currentTimeMs < 13600
      ? "Auditing AIS/TIS data for unclaimed deductions..."
      : "Detected unclaimed Medical Sec 80D • Verified Optimization +₹7,800",
    // Phase 4
    "Filing Workspace Built • All calculations & compliance verified"
  ];

  return (
    <div className="w-full bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-white/[0.04] px-5 py-2 flex items-center justify-between font-mono text-[10px] select-none backdrop-blur-md">
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold truncate">
        <Sparkles className="w-3.5 h-3.5 animate-spin animate-duration-3000 shrink-0 text-purple-600 dark:text-purple-400" />
        <span className="uppercase tracking-widest text-[9px] text-slate-500 font-extrabold shrink-0">AI REASONING:</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={reasoningTexts[activeStep]}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-slate-800 dark:text-slate-200 truncate font-semibold"
          >
            {reasoningTexts[activeStep]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-[9.5px] font-extrabold shrink-0">
        <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          ✓ CONFIDENCE 98%
        </span>
      </div>
    </div>
  );
};

interface ProductVideoPlayerProps {
  onStartFiling?: () => void;
  className?: string;
}

export const ProductVideoPlayer: React.FC<ProductVideoPlayerProps> = ({ onStartFiling, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interactive Sandbox Mode toggle
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [customSalary, setCustomSalary] = useState(1450000);
  const [claim80C, setClaim80C] = useState(true);
  const [claim80D, setClaim80D] = useState(true);
  const [claimNPS, setClaimNPS] = useState(true);

  // Timeline (Total 18,000 ms)
  const TOTAL_DURATION = 18000;
  const [currentTimeMs, setCurrentTimeMs] = useState(0);

  // Visibility detection
  const [isInView, setIsInView] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setIsInView(e.isIntersecting));
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Story Loop Animation (Auto-advance time)
  useEffect(() => {
    if (interactiveMode) return;

    let animationFrame: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (isInView) {
        setCurrentTimeMs((prev) => {
          const next = prev + delta;
          if (next >= TOTAL_DURATION) return 0;
          return next;
        });
      }

      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, interactiveMode]);

  // Active Story Phase (0 to 4)
  const activeStep = useMemo(() => {
    if (currentTimeMs < 3500) return 0; // 01 Upload Form 16 Drag-and-Drop
    if (currentTimeMs < 7500) return 1; // 02 AI Extraction Stream
    if (currentTimeMs < 12000) return 2; // 03 Dual Regime Benchmark
    if (currentTimeMs < 15000) return 3; // 04 AI Optimization Check
    return 4; // 05 Payoff / Filing Ready
  }, [currentTimeMs]);

  // Simulated Cursor Position, Dragging File, & Click Trigger State
  const cursorState = useMemo(() => {
    // Phase 0: Dragging Form 16 File from bottom right into central dropzone
    if (currentTimeMs < 3500) {
      if (currentTimeMs < 500) {
        return { x: '82%', y: '85%', isClicked: false, isDraggingFile: false };
      } else if (currentTimeMs < 1800) {
        const progress = (currentTimeMs - 500) / 1300;
        const startX = 82; const endX = 50;
        const startY = 85; const endY = 55;
        const curX = startX + (endX - startX) * progress;
        const curY = startY + (endY - startY) * progress;
        return { x: `${curX}%`, y: `${curY}%`, isClicked: false, isDraggingFile: true };
      } else if (currentTimeMs < 2200) {
        return { x: '50%', y: '55%', isClicked: true, isDraggingFile: false };
      } else {
        return { x: '50%', y: '55%', isClicked: false, isDraggingFile: false };
      }
    }
    // Phase 1: AI Parameter Extraction
    else if (currentTimeMs < 7500) {
      if (currentTimeMs < 5000) {
        return { x: '32%', y: '42%', isClicked: false, isDraggingFile: false };
      } else if (currentTimeMs < 6200) {
        return { x: '68%', y: '42%', isClicked: false, isDraggingFile: false };
      } else {
        return { x: '32%', y: '68%', isClicked: false, isDraggingFile: false };
      }
    }
    // Phase 2: Dual Tax Regime Benchmark
    else if (currentTimeMs < 12000) {
      if (currentTimeMs < 8500) {
        return { x: '25%', y: '80%', isClicked: false, isDraggingFile: false };
      } else if (currentTimeMs < 9800) {
        return { x: '68%', y: '38%', isClicked: currentTimeMs >= 9200 && currentTimeMs < 9500, isDraggingFile: false };
      } else {
        return { x: '50%', y: '75%', isClicked: false, isDraggingFile: false };
      }
    }
    // Phase 3: Optimization Checkbox
    else if (currentTimeMs < 15000) {
      if (currentTimeMs < 13200) {
        return { x: '82%', y: '45%', isClicked: false, isDraggingFile: false };
      } else if (currentTimeMs < 14400) {
        return { x: '72%', y: '60%', isClicked: currentTimeMs >= 13600 && currentTimeMs < 13900, isDraggingFile: false };
      } else {
        return { x: '72%', y: '60%', isClicked: false, isDraggingFile: false };
      }
    }
    // Phase 4: Final Filing Ready CTA Click
    else {
      if (currentTimeMs < 16200) {
        return { x: '50%', y: '78%', isClicked: false, isDraggingFile: false };
      } else if (currentTimeMs < 17200) {
        return { x: '50%', y: '78%', isClicked: currentTimeMs >= 16400 && currentTimeMs < 16700, isDraggingFile: false };
      } else {
        return { x: '50%', y: '78%', isClicked: false, isDraggingFile: false };
      }
    }
  }, [currentTimeMs]);

  // Audio Bleeps on Phase Transitions
  const lastStepRef = useRef(activeStep);
  useEffect(() => {
    if (lastStepRef.current !== activeStep) {
      lastStepRef.current = activeStep;
      audioPool.playBeep(activeStep === 4 ? 850 : 650, 'sine', 0.06, 0.02);
    }
  }, [activeStep]);

  // Calculate live sandbox savings
  const calculateSandboxSavings = () => {
    let oldTaxable = Math.max(0, customSalary - 75000);
    if (claim80C) oldTaxable = Math.max(0, oldTaxable - 150000);
    if (claim80D) oldTaxable = Math.max(0, oldTaxable - 25000);
    if (claimNPS) oldTaxable = Math.max(0, oldTaxable - 50000);

    let oldTax = 0;
    if (oldTaxable > 250000) oldTax += Math.min(250000, oldTaxable - 250000) * 0.05;
    if (oldTaxable > 500000) oldTax += Math.min(500000, oldTaxable - 500000) * 0.20;
    if (oldTaxable > 1000000) oldTax += (oldTaxable - 1000000) * 0.30;
    oldTax = Math.round(oldTax * 1.04);

    let newTaxable = Math.max(0, customSalary - 75000);
    let newTax = 0;
    if (newTaxable > 1200000) {
      if (newTaxable > 400000) newTax += Math.min(400000, newTaxable - 400000) * 0.05;
      if (newTaxable > 800000) newTax += Math.min(400000, newTaxable - 800000) * 0.10;
      if (newTaxable > 1200000) newTax += Math.min(400000, newTaxable - 1200000) * 0.15;
      if (newTaxable > 1600000) newTax += Math.min(400000, newTaxable - 1600000) * 0.20;
      if (newTaxable > 2000000) newTax += (newTaxable - 2000000) * 0.30;
      newTax = Math.round(newTax * 1.04);
    }

    return { oldTax, newTax, savings: Math.max(0, oldTax - newTax) };
  };

  const sandboxResults = calculateSandboxSavings();

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-[1080px] mx-auto relative transition-all duration-500 font-sans ${className}`}
    >
      {/* SOFT AMBIENT DYNAMIC GRADIENT GLOW BEHIND THE CANVAS */}
      <div className={`absolute -inset-2 rounded-[36px] blur-3xl opacity-70 pointer-events-none z-0 transition-all duration-700 ${
        activeStep === 0 ? 'bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-blue-600/15' :
        activeStep === 1 ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-teal-500/15' :
        activeStep === 2 ? 'bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-blue-500/15' :
        activeStep === 3 ? 'bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-pink-500/15' :
        'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-blue-500/20'
      }`} />

      {/* CLEAN ELEGANT DUAL-THEME BROWSER FRAME */}
      <div className="relative w-full rounded-[28px] border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-slate-950/90 text-slate-900 dark:text-white shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col z-10">
        
        {/* TOP MAC BROWSER TITLE BAR */}
        <div className="h-11 px-5 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-3 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> taxsense.in / demo
            </span>
          </div>

          {/* Minimal Step Indicator Tabs */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono">
            {[
              { id: 0, label: "Upload" },
              { id: 1, label: "Extraction" },
              { id: 2, label: "Regime Compare" },
              { id: 3, label: "AI Audit" },
              { id: 4, label: "Payoff" }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentTimeMs(s.id * 3600);
                  if (interactiveMode) setInteractiveMode(false);
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeStep === s.id && !interactiveMode
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {activeStep > s.id && <span className="text-emerald-500 text-[10px]">✓</span>}
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-extrabold">
              AY 2026-27
            </span>
          </div>
        </div>

        {/* AI REASONING STREAM TICKER */}
        {!interactiveMode && (
          <AIReasoningTicker activeStep={activeStep} currentTimeMs={currentTimeMs} />
        )}

        {/* APPLICATION WORKSPACE CANVAS */}
        <div className="relative w-full min-h-[460px] sm:min-h-[500px] bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center p-6 sm:p-10 overflow-hidden">
          
          {/* SIMULATED ANIMATED CURSOR POINTER (WITH DRAGGABLE DOCUMENT BADGE) */}
          {!interactiveMode && (
            <CursorPointer
              x={cursorState.x}
              y={cursorState.y}
              isClicked={cursorState.isClicked}
              isDraggingFile={cursorState.isDraggingFile}
            />
          )}

          {/* SANDBOX OVERLAY TOGGLE BUTTON */}
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={() => setInteractiveMode(!interactiveMode)}
              className={`px-3.5 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                interactiveMode
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{interactiveMode ? "Live Sandbox Active" : "Try Live Calculator"}</span>
            </button>
          </div>

          {/* INTERACTIVE SANDBOX CALCULATOR VIEW */}
          {interactiveMode ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">Live Tax Calculator Sandbox</span>
                </div>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                  AY 2026-27 Slabs
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-slate-300 mb-2">
                    <span>Gross Annual CTC Income</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{customSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="600000"
                    max="3000000"
                    step="50000"
                    value={customSalary}
                    onChange={(e) => setCustomSalary(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-500/40">
                    <input
                      type="checkbox"
                      checked={claim80C}
                      onChange={(e) => setClaim80C(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold">Sec 80C (₹1.5L)</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-500/40">
                    <input
                      type="checkbox"
                      checked={claim80D}
                      onChange={(e) => setClaim80D(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold">Sec 80D (₹25k)</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-500/40">
                    <input
                      type="checkbox"
                      checked={claimNPS}
                      onChange={(e) => setClaimNPS(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold">NPS 80CCD (₹50k)</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase font-bold">Optimal Tax Regime</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {sandboxResults.newTax <= sandboxResults.oldTax ? "New Tax Regime" : "Old Tax Regime"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold">Calculated Tax Savings</div>
                  <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ₹{sandboxResults.savings.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* AUTONOMOUS SCENE FLOW */
            <div className="relative w-full z-20 flex justify-center">
              <AnimatePresence mode="wait">
                
                {/* SCENE 0: INGESTION WITH DRAG & DROP ANIMATION (0s - 3.5s) */}
                {activeStep === 0 && (
                  <motion.div
                    key="scene-0"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={SPRING_HEAVY}
                    className={`w-full max-w-xl rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden backdrop-blur-xl transition-all duration-300 ${
                      currentTimeMs >= 1800 && currentTimeMs < 2200
                        ? 'bg-blue-500/10 border-2 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.25)] scale-[1.01]'
                        : 'bg-white/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    {/* Laser Scan Line Sweep during file drop */}
                    {currentTimeMs >= 1800 && currentTimeMs < 2300 && (
                      <motion.div
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 0.5, ease: 'linear' }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_#3b82f6] pointer-events-none z-30"
                      />
                    )}

                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 text-blue-600 dark:text-blue-400 shadow-inner relative">
                      {currentTimeMs >= 2200 ? (
                        <motion.div
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={SPRING_BOUNCE}
                        >
                          <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </motion.div>
                      ) : (
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {currentTimeMs >= 2200
                        ? 'Form 16 Verified & Parsed'
                        : currentTimeMs >= 1800
                        ? 'Parsing Form 16 Structure...'
                        : 'Drag & Drop Form 16 PDF'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 max-w-sm font-medium leading-relaxed">
                      {currentTimeMs >= 2200 
                        ? 'Form 16 successfully verified. No inconsistencies detected.'
                        : 'Supports PDF, JPG and PNG • Client-side AES-256 local sandbox encryption.'}
                    </p>

                    <div
                      className={`h-11 px-8 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                        currentTimeMs >= 2200
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                      }`}
                    >
                      {currentTimeMs >= 2200 ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Document Verified</span>
                        </>
                      ) : (
                        <>
                          <span>Drop Form 16 Here</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* SCENE 1: EXTRACTION WITH LASER SCANNING BEAM (3.5s - 7.5s) */}
                {activeStep === 1 && (
                  <motion.div
                    key="scene-1"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={SPRING_HEAVY}
                    className="w-full max-w-2xl bg-white/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-left backdrop-blur-xl relative overflow-hidden"
                  >
                    {/* Continuous Laser Scanning Beam Sweep */}
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none z-30 opacity-70"
                    />

                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-2.5">
                        <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Optical Extraction Stream</span>
                      </div>
                      <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30 font-bold">
                        99.8% OCR ACCURACY
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all shadow-xs"
                      >
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Gross Salary (Sec 17(1))</div>
                        <div className="text-base font-bold text-slate-900 dark:text-white">
                          <RollingCounter value={1450000} prefix="₹" />
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all shadow-xs"
                      >
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">HRA Exemption (Sec 10(13A))</div>
                        <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          <RollingCounter value={120000} prefix="₹" />
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all shadow-xs"
                      >
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">PF & Investments (Sec 80C)</div>
                        <div className="text-base font-bold text-slate-900 dark:text-white">
                          <RollingCounter value={150000} prefix="₹" />
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all shadow-xs"
                      >
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">TDS Deducted (Form 26AS)</div>
                        <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                          <RollingCounter value={194350} prefix="₹" />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* SCENE 2: DUAL REGIME BENCHMARK WITH DEDUCTION BREAKDOWN (7.5s - 12.0s) */}
                {activeStep === 2 && (
                  <motion.div
                    key="scene-2"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={SPRING_HEAVY}
                    className="w-full max-w-2xl bg-white/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <span className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">Dual Tax Regime Benchmark</span>
                      </div>
                      <span className="text-xs font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 font-bold">
                        98% CONFIDENCE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Old Tax Regime</div>
                        <div className="text-2xl font-black font-mono text-slate-400 line-through">₹1,63,800</div>
                        <div className="text-[10px] text-slate-500 font-medium pt-1">Old Deductions: 80C + 80D + HRA</div>
                      </div>

                      <motion.div 
                        animate={{ scale: currentTimeMs >= 9200 ? 1.03 : 1 }}
                        transition={SPRING_BOUNCE}
                        className={`p-6 rounded-2xl text-center space-y-1 transition-all ${
                          currentTimeMs >= 9200
                            ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/30'
                            : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold">New Tax Regime</div>
                        <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                          {currentTimeMs >= 9200 ? <RollingCounter value={145600} prefix="₹" /> : '₹1,45,600'}
                        </div>
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider pt-1">
                          RECOMMENDED REGIME
                        </div>
                      </motion.div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-blue-500/20 flex items-center justify-between shadow-xs">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">Optimization Delta</span>
                      <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                        +₹18,200 Net Tax Saved
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* SCENE 3: AI OPTIMIZATION CHECK (12.0s - 15.0s) */}
                {activeStep === 3 && (
                  <motion.div
                    key="scene-3"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={SPRING_HEAVY}
                    className="w-full max-w-xl bg-white/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left backdrop-blur-xl relative"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin animate-duration-3000" />
                        <span className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Tax Optimization Suite</span>
                      </div>
                      <span className="text-xs font-mono text-purple-700 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 font-bold">
                        DEDUCTION AUDIT
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Section 80C Standard Limit</span>
                        </div>
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-bold">₹1,50,000 Claimed</span>
                      </div>

                      {/* Floating Checkbox Action Card with AIS Reason */}
                      <motion.div 
                        animate={{ scale: currentTimeMs >= 13600 ? 1.02 : 1 }}
                        transition={SPRING_BOUNCE}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          currentTimeMs >= 13600
                            ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            currentTimeMs >= 13600 ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-400'
                          }`}>
                            {currentTimeMs >= 13600 && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">Medical Insurance Sec 80D</span>
                            <span className="text-[10px] text-purple-600 dark:text-purple-300 font-semibold">Premium detected in AIS records • 98% Confidence</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">+₹7,800 Saved</span>
                      </motion.div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-purple-500/30 flex items-center justify-between shadow-xs">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">Total Verified Savings</span>
                      <span className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
                        {currentTimeMs >= 13600 ? <RollingCounter value={51480} prefix="₹" /> : '₹18,200'}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* SCENE 4: PAYOFF / FILING READY (15.0s - 18.0s) */}
                {activeStep === 4 && (
                  <motion.div
                    key="scene-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={SPRING_HEAVY}
                    className="w-full max-w-2xl bg-white/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden"
                  >
                    {/* Emerald Bloom Halo */}
                    <div className="absolute inset-0 bg-radial-at-c from-emerald-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

                    <motion.div 
                      initial={{ scale: 0.5, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={SPRING_BOUNCE}
                      className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)] relative z-10"
                    >
                      <Check className="w-8 h-8" />
                    </motion.div>

                    <div className="space-y-2 relative z-10">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Your Filing Workspace is Ready</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium leading-relaxed">
                        All calculations, compliance checks and encryption have been completed successfully.
                      </p>
                    </div>

                    {/* Verification Badges Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-md text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 relative z-10">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                        ✓ Docs Verified
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                        ✓ New Regime
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-emerald-600 dark:text-emerald-400">
                        ₹51,480 Saved
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                        ✓ AES-256
                      </div>
                    </div>

                    <button
                      onClick={onStartFiling}
                      className="h-12 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer relative z-10"
                    >
                      <span>Open Filing Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
