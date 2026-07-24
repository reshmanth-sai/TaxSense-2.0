import React from 'react';
import { motion } from 'motion/react';
import { Check, X, ShieldCheck, Zap, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';

export const ComparisonSection: React.FC = React.memo(() => {
  return (
    <section id="comparison" className="py-24 md:py-28 px-6 max-w-5xl mx-auto space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#16E27A] text-[10px] font-bold font-mono uppercase tracking-widest mx-auto">
          <Sparkles className="w-3 h-3" />
          <span>Filing Comparison</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          Standard vs TaxSense
        </h2>
        <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-sans">
          Traditional tax filing is slow, manual, and leaves money on the table. TaxSense makes it instant, transparent, and accurate.
        </p>
      </motion.div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-white/60 dark:bg-[#0E131B]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl text-center backdrop-blur-md shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block">Time Required</span>
          <div className="text-xs sm:text-base font-bold text-slate-900 dark:text-white font-mono">
            <span className="text-red-500 line-through mr-1 opacity-70">3+ Hours</span>
            <span className="text-emerald-600 dark:text-[#16E27A]">58s</span>
          </div>
        </div>
        <div className="space-y-1 border-x border-slate-200 dark:border-white/[0.06]">
          <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block">Regime Analysis</span>
          <div className="text-xs sm:text-base font-bold text-slate-900 dark:text-white font-mono">
            <span className="text-red-500 line-through mr-1 opacity-70">Manual Guesswork</span>
            <span className="text-emerald-600 dark:text-[#16E27A]">100% Simulated</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block">Average Savings</span>
          <div className="text-xs sm:text-base font-bold text-slate-900 dark:text-white font-mono">
            <span className="text-red-500 line-through mr-1 opacity-70">₹0</span>
            <span className="text-emerald-600 dark:text-[#16E27A]">₹18,400</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Traditional Card */}
        <PremiumCard
          className="p-8 bg-slate-100/50 dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] space-y-6 text-left relative overflow-hidden group"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.04]">
            <h3 className="text-base font-bold text-red-500 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-sm">✕</span>
              Traditional Filing
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Legacy</span>
          </div>

          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-200 dark:border-white/[0.04] space-y-1 flex gap-3">
              <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
              <div>
                <span className="text-slate-900 dark:text-slate-200 font-bold block text-xs">Hours of Manual Spreadsheet Work</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">Cross-referencing Form 16, AIS, and 26AS line-by-line across multiple browser windows.</span>
              </div>
            </div>
            <div className="pb-3 border-b border-slate-200 dark:border-white/[0.04] space-y-1 flex gap-3">
              <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
              <div>
                <span className="text-slate-900 dark:text-slate-200 font-bold block text-xs">Blind Regime Selection</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">Picking Old or New regime based on guesswork without seeing computed rupee differences.</span>
              </div>
            </div>
            <div className="pb-3 border-b border-slate-200 dark:border-white/[0.04] space-y-1 flex gap-3">
              <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
              <div>
                <span className="text-slate-900 dark:text-slate-200 font-bold block text-xs">Missed Section 80 Deductions</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">Overlooking NPS 80CCD(1B), preventive health checkups, or HRA rent calculation caps.</span>
              </div>
            </div>
            <div className="space-y-1 flex gap-3">
              <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
              <div>
                <span className="text-slate-900 dark:text-slate-200 font-bold block text-xs">Zero AI Verification</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">No automated audit checks to catch arithmetic errors or income mismatch notices.</span>
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* TaxSense Card */}
        <PremiumCard
          className="p-8 bg-white dark:bg-[#0E131B] border-2 border-emerald-500/40 dark:border-[#16E27A]/30 space-y-6 text-left shadow-xl shadow-emerald-500/5 relative overflow-hidden group"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute top-0 right-0 bg-emerald-500 text-white dark:bg-[#16E27A] dark:text-[#050607] px-3.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-bl-xl shadow-md">
            Recommended
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.06]">
            <h3 className="text-base font-bold text-emerald-600 dark:text-[#16E27A] flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-[#16E27A] text-sm">✓</span>
              TaxSense AI Filing
            </h3>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-[#16E27A] font-bold uppercase tracking-wider">58 Seconds</span>
          </div>

          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-200 dark:border-white/[0.06] space-y-1 flex gap-3">
              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
              <div>
                <span className="text-slate-900 dark:text-white font-bold block text-xs">Instant Form 16 PDF Auto-Parsing</span>
                <span className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed">Extracts salary Section 17(1), standard deductions, and TDS automatically in under 2 seconds.</span>
              </div>
            </div>
            <div className="pb-3 border-b border-slate-200 dark:border-white/[0.06] space-y-1 flex gap-3">
              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
              <div>
                <span className="text-slate-900 dark:text-white font-bold block text-xs">Live Side-by-Side Regime Simulation</span>
                <span className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed">Displays exact rupee-by-rupee tax liability comparison between Old and New tax slabs.</span>
              </div>
            </div>
            <div className="pb-3 border-b border-slate-200 dark:border-white/[0.06] space-y-1 flex gap-3">
              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
              <div>
                <span className="text-slate-900 dark:text-white font-bold block text-xs">AI Smart Deduction Finder</span>
                <span className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed">Scans for missed 80C, 80D, HRA, and NPS allowances to maximize your net refund.</span>
              </div>
            </div>
            <div className="space-y-1 flex gap-3">
              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
              <div>
                <span className="text-slate-900 dark:text-white font-bold block text-xs">100% Tax Department Compliance</span>
                <span className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed">Built according to latest FY 2025-26 IT rules with instant audit validation.</span>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>
    </section>
  );
});
ComparisonSection.displayName = "ComparisonSection";
