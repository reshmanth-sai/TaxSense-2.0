import React from 'react';
import { motion } from 'motion/react';
import { PremiumCard } from './helpers/PremiumCard';

export const ComparisonSection: React.FC = React.memo(() => {
  return (
    <section id="comparison" className="py-32 md:py-36 px-6 max-w-5xl mx-auto space-y-20">
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-3"
      >
        <span className="text-[10px] text-slate-500 dark:text-[#16E27A] font-mono font-bold uppercase tracking-widest">Filing Comparison</span>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
          Standard vs TaxSense
        </h2>
        <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Traditional filing is tedious, confusing, and error-prone. TaxSense makes it simple, transparent, and accurate.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Traditional Card */}
        <PremiumCard
          className="p-8 bg-slate-100/30 dark:bg-white/[0.005] border border-slate-200/50 dark:border-white/[0.02] space-y-6 text-left opacity-70"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 0.7, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="text-base font-bold text-red-500 flex items-center gap-2">
            <span className="text-xl">❌</span> Traditional Filing
          </h3>

          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-white/[0.04] pb-3 space-y-1.5 flex gap-3">
              <span className="text-red-500/80 font-bold shrink-0 mt-0.5">✕</span>
              <div>
                <span className="text-slate-800 dark:text-slate-200 font-semibold block text-xs">Hours of manual paperwork</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed">Cross-referencing spreadsheets and form sections manually.</span>
              </div>
            </div>
            <div className="border-b border-slate-200 dark:border-white/[0.04] pb-3 space-y-1.5 flex gap-3">
              <span className="text-red-500/80 font-bold shrink-0 mt-0.5">✕</span>
              <div>
                <span className="text-slate-800 dark:text-slate-200 font-semibold block text-xs">Complex calculations</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-455 leading-relaxed">Manual computations for HRA exemption limits and Section 80C.</span>
              </div>
            </div>
            <div className="space-y-1.5 flex gap-3">
              <span className="text-red-500/80 font-bold shrink-0 mt-0.5">✕</span>
              <div>
                <span className="text-slate-800 dark:text-slate-200 font-semibold block text-xs">Opaque regimes</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-455 leading-relaxed">Selecting tax regimes blindly without seeing computed differences.</span>
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* TaxSense Card */}
        <PremiumCard
          className="p-8 bg-white dark:bg-[#0E131B] border border-slate-250 dark:border-slate-800 space-y-6 text-left shadow-lg shadow-black/[0.02] dark:shadow-white/[0.01] relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute top-0 right-0 bg-emerald-100 dark:bg-[#10B981]/15 text-emerald-800 dark:text-[#16E27A] px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded-bl-xl border-l border-b border-emerald-250 dark:border-[#10B981]/25">
            Modern
          </div>

          <h3 className="text-base font-bold text-emerald-600 dark:text-[#16E27A] flex items-center gap-2">
            <span className="text-xl">✓</span> TaxSense Filing
          </h3>

          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-white/[0.04] pb-3 space-y-1.5 flex gap-3">
              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
              <div>
                <span className="text-slate-900 dark:text-white font-bold block text-xs">Minutes with Secure AI</span>
                <span className="text-[11px] text-slate-655 dark:text-slate-400 leading-relaxed">PDF upload instantly initializes your draft worksheet.</span>
              </div>
            </div>
            <div className="border-b border-slate-200 dark:border-white/[0.04] pb-3 space-y-1.5 flex gap-3">
              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
              <div>
                <span className="text-slate-900 dark:text-white font-bold block text-xs">AI Verified Calculations</span>
                <span className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed">Mathematical validation ensures perfect accuracy.</span>
              </div>
            </div>
            <div className="space-y-1.5 flex gap-3">
              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
              <div>
                <span className="text-slate-900 dark:text-white font-bold block text-xs">Guided Regime Optimizations</span>
                <span className="text-[11px] text-slate-655 dark:text-slate-400 leading-relaxed">Simulate regime differences dynamically to pay the lowest tax.</span>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>
    </section>
  );
});
ComparisonSection.displayName = "ComparisonSection";
