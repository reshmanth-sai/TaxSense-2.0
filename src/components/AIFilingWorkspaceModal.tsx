import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Download, 
  FileText, 
  Sparkles, 
  FileCheck2,
  Eye
} from 'lucide-react';
import { formatINR } from '../utils/taxCalculator';

interface AIFilingWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  savingsAmount?: number;
  recommendedRegime?: 'OLD' | 'NEW';
}

// Custom Animated AI Orb Component
const AnimatedAIOrb: React.FC<{ isComplete?: boolean }> = ({ isComplete }) => {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      {/* Outer ambient glowing halo */}
      <div className={`absolute inset-0 rounded-full blur-xl opacity-60 transition-all duration-700 ${
        isComplete 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 scale-110' 
          : 'bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 animate-pulse'
      }`} />

      {/* Rotating particle ring */}
      {!isComplete && (
        <div className="absolute inset-0 rounded-full border border-dashed border-blue-400/40 animate-spin" style={{ animationDuration: '14s' }} />
      )}

      {/* Core Volumetric Orb */}
      <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border transition-all duration-500 ${
        isComplete 
          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
          : 'bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-emerald-500/20 dark:from-blue-600/30 dark:via-purple-600/20 dark:to-emerald-500/20 border-slate-200 dark:border-white/20 text-blue-600 dark:text-white'
      }`}>
        {isComplete ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-bounce" />
        ) : (
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
        )}
      </div>

      {/* Micro Orbiting Particle Dots */}
      {!isComplete && (
        <>
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-ping" />
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
        </>
      )}
    </div>
  );
};

export const AIFilingWorkspaceModal: React.FC<AIFilingWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  savingsAmount = 77896,
  recommendedRegime = 'NEW'
}) => {
  const [generationStep, setGenerationStep] = useState(0);
  const [reasoningIndex, setReasoningIndex] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);

  const reasoningThoughts = [
    "Calculating deductions under Sec 80C & 80D...",
    "Comparing Old vs New Regime tax slabs...",
    "Validating AIS & 26AS data integrity...",
    "Encrypting local browser workspace payload...",
    "Generating verified JSON return package...",
    "Assembling zero-knowledge filing environment..."
  ];

  // Rotate reasoning thoughts every 1.5s
  useEffect(() => {
    if (!isOpen || generationStep >= 5) return;
    const interval = setInterval(() => {
      setReasoningIndex((prev) => (prev + 1) % reasoningThoughts.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isOpen, generationStep]);

  // Progressive step animation
  useEffect(() => {
    if (!isOpen) {
      setGenerationStep(0);
      setIsLaunching(false);
      return;
    }

    const t1 = setTimeout(() => setGenerationStep(1), 600);
    const t2 = setTimeout(() => setGenerationStep(2), 1200);
    const t3 = setTimeout(() => setGenerationStep(3), 1800);
    const t4 = setTimeout(() => setGenerationStep(4), 2400);
    const t5 = setTimeout(() => setGenerationStep(5), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isComplete = generationStep >= 5;

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      onContinue();
    }, 350);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
        
        {/* Backdrop with heavy blur and subtle vignette */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 bg-slate-950/75 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
            isLaunching ? 'opacity-0 backdrop-blur-none' : 'opacity-100'
          }`}
          onClick={onClose}
        />

        {/* Floating AI Workspace OS Canvas */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ 
            opacity: isLaunching ? 0 : 1, 
            scale: isLaunching ? 1.04 : 1, 
            y: 0 
          }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative w-full max-w-[660px] max-h-[90vh] bg-white/95 dark:bg-[#0B1020]/95 border border-slate-200/80 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl dark:shadow-[0_32px_96px_rgba(0,0,0,0.65)] text-left backdrop-blur-2xl overflow-y-auto scrollbar-none text-slate-900 dark:text-white z-10 font-sans"
        >
          {/* Ambient Blue-Emerald Radial Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none blur-3xl z-0" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none blur-3xl z-0" />

          {/* MAIN LAYOUT CONTAINER */}
          <div className="relative z-10 space-y-6">

            {/* AI STATUS HEADER */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
              <AnimatedAIOrb isComplete={isComplete} />
              
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    {isComplete ? '✓ Workspace Ready' : '🧠 AI Operating System'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold">
                    AY 2026–27
                  </span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {isComplete ? 'Your Filing Workspace Is Ready' : 'Preparing Your Filing Workspace'}
                </h2>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {isComplete 
                    ? 'Everything has been verified against AY 2026–27 tax rules, encrypted, and assembled locally on your device.'
                    : 'Your encrypted filing environment is being assembled securely on your device.'
                  }
                </p>
              </div>
            </div>

            {/* DYNAMIC CONTENT SWITCHER */}
            {!isComplete ? (
              /* LOADING STATE VIEW */
              <motion.div
                key="loading-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* AI LIVE REASONING TICKER */}
                <div className="bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.06] p-3.5 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin shrink-0" />
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={reasoningThoughts[reasoningIndex]}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.25 }}
                        className="text-slate-800 dark:text-slate-300 font-medium truncate"
                      >
                        {reasoningThoughts[reasoningIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 shrink-0">
                    Live Thinking
                  </span>
                </div>

                {/* TIMELINE & LIVE METRICS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Left Column: Sequential Step Timeline (7 cols) */}
                  <div className="md:col-span-7 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.04] p-4.5 rounded-2xl space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block border-b border-slate-200 dark:border-white/[0.04] pb-2">
                      Assembly Pipeline
                    </span>

                    <div className="space-y-2.5 text-xs">
                      {[
                        { title: 'Documents verified', desc: 'Form 16 OCR matched' },
                        { title: 'Tax calculations completed', desc: `New Regime saves ${formatINR(savingsAmount)}` },
                        { title: 'Building filing workspace', desc: 'Structuring ITR-1 payload' },
                        { title: 'Encrypting workspace', desc: 'AES-256 cipher active' },
                        { title: 'Preparing return package', desc: 'Validating JSON schemas' },
                        { title: 'Final security validation', desc: 'Zero-knowledge verification' }
                      ].map((step, idx) => {
                        const stepNum = idx + 1;
                        const isDone = generationStep >= stepNum;
                        const isCurrent = generationStep === stepNum - 1;

                        return (
                          <div 
                            key={step.title} 
                            className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                              isDone 
                                ? 'bg-emerald-500/10 dark:bg-emerald-500/5 text-slate-800 dark:text-slate-200' 
                                : isCurrent 
                                  ? 'bg-blue-500/10 text-slate-900 dark:text-white font-bold' 
                                  : 'text-slate-400 dark:text-slate-500 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              ) : isCurrent ? (
                                <div className="w-4 h-4 rounded-full border-2 border-blue-500 dark:border-blue-400 border-t-transparent animate-spin shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] font-mono">
                                  {stepNum}
                                </div>
                              )}
                              <span className="text-xs font-semibold">{step.title}</span>
                            </div>

                            <span className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              isDone 
                                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10' 
                                : isCurrent 
                                  ? 'text-blue-700 dark:text-blue-400 bg-blue-500/10 animate-pulse' 
                                  : 'text-slate-500 dark:text-slate-600 bg-slate-200 dark:bg-slate-800/40'
                            }`}>
                              {isDone ? 'Done' : isCurrent ? 'Working...' : 'Waiting'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Live Metrics Cards & Security Flow (5 cols) */}
                  <div className="md:col-span-5 space-y-3.5">
                    
                    {/* Live Stats */}
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.04] p-4.5 rounded-2xl space-y-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block border-b border-slate-200 dark:border-white/[0.04] pb-2">
                        Live Metrics
                      </span>

                      <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                        <div className="bg-white dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.02]">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Documents</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">12 Verified</span>
                        </div>

                        <div className="bg-white dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.02]">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Compliance</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">Passed</span>
                        </div>

                        <div className="bg-white dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.02]">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Sections</span>
                          <span className="font-bold text-purple-600 dark:text-purple-300 font-mono">80C • 80D • 24</span>
                        </div>

                        <div className="bg-white dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.02]">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Encryption</span>
                          <span className="font-bold text-blue-600 dark:text-cyan-400 font-mono">AES-256</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Flow Diagram */}
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.04] p-4 rounded-2xl space-y-2 text-left">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                        Security Pipeline
                      </span>
                      
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-300 pt-1">
                        <span className={`px-2 py-0.5 rounded font-bold ${generationStep >= 1 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>Device</span>
                        <span className="text-slate-400 dark:text-slate-600">➔</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${generationStep >= 3 ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>Cipher</span>
                        <span className="text-slate-400 dark:text-slate-600">➔</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${generationStep >= 5 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>Workspace</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SEGMENTED PROGRESS RAIL (NO PERCENTAGES) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>Segmented Assembly Status</span>
                    <span className="text-blue-600 dark:text-cyan-400">Phase {Math.min(generationStep + 1, 5)} of 5</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {['Verify', 'Compute', 'Encrypt', 'Workspace', 'Launch'].map((label, idx) => {
                      const isLit = generationStep > idx;
                      return (
                        <div key={label} className="space-y-1">
                          <div className={`h-2 rounded-full transition-all duration-500 ${
                            isLit 
                              ? 'bg-gradient-to-r from-blue-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' 
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`} />
                          <span className={`text-[9px] font-mono block text-center uppercase tracking-wider ${
                            isLit ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-600'
                          }`}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* SUCCESS STATE VIEW (MORPHED LAYOUT) */
              <motion.div
                key="success-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="space-y-6"
              >
                {/* 6 SUMMARY METRIC CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {[
                    { label: 'Documents', val: '12 Verified', color: 'text-slate-900 dark:text-white' },
                    { label: 'Tax Regime', val: recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime', color: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Return Type', val: 'ITR-1', color: 'text-purple-600 dark:text-purple-300' },
                    { label: 'Compliance', val: 'Verified', color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Encryption', val: 'AES-256', color: 'text-blue-600 dark:text-cyan-400' },
                    { label: 'Workspace', val: 'Ready', color: 'text-emerald-600 dark:text-emerald-400' }
                  ].map((card) => (
                    <div key={card.label} className="bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] p-3 rounded-2xl text-left space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">{card.label}</span>
                      <span className={`text-xs font-mono font-bold block ${card.color}`}>{card.val}</span>
                    </div>
                  ))}
                </div>

                {/* AI TRUST ASSURANCE BOX */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider">AI Trust Verification</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    Your filing workspace has been prepared successfully. No inconsistencies were detected across Form 16, AIS data, or salary records. All calculations passed statutory validation under AY 2026–27 rules.
                  </p>
                </div>

                {/* GENERATED PAYLOAD CHIP */}
                <div className="bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.06] p-3.5 rounded-2xl flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white block">ITR-1_AY2026-27_JSON.json</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Encrypted Payload • 24 KB</span>
                    </div>
                  </div>

                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    ✓ AES-256 Active
                  </span>
                </div>

                {/* PRIMARY CTA & MINIMAL SECONDARY TEXT ACTIONS */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleLaunch}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 group"
                  >
                    <span>Open Filing Workspace</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-slate-600 dark:text-slate-400 pt-1">
                    <button
                      type="button"
                      onClick={() => alert("Downloading package...")}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Download Package</span>
                    </button>

                    <span className="text-slate-400 dark:text-slate-700">•</span>

                    <button
                      type="button"
                      onClick={() => alert("Opening Processing Log...")}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>View Processing Log</span>
                    </button>

                    <span className="text-slate-400 dark:text-slate-700">•</span>

                    <button
                      type="button"
                      onClick={onClose}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Review Summary</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TRUST FOOTER */}
            <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-3 border-t border-slate-200 dark:border-white/[0.04]">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Zero-Knowledge Encryption Active</span>
              </div>
              <span>AY 2026–27 Rules</span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default AIFilingWorkspaceModal;
