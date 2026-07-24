import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { RollingText } from './helpers/RollingText';

interface GetStartedSectionProps {
  onStart: () => void;
}

export const GetStartedSection: React.FC<GetStartedSectionProps> = React.memo(({ onStart }) => {
  return (
    <section id="get-started" className="relative z-10 py-24 md:py-28 px-6 text-center overflow-hidden bg-transparent border-t border-slate-200/60 dark:border-white/[0.04]">
      <div className="max-w-4xl mx-auto p-10 sm:p-14 bg-gradient-to-b from-white to-slate-50 dark:from-[#0E131B] dark:to-[#050607] border border-slate-200 dark:border-white/[0.08] rounded-3xl relative overflow-hidden shadow-2xl space-y-8 z-10">
        {/* Soft Ambient Radial Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-transparent blur-[90px] pointer-events-none z-0" />

        <div className="space-y-4 relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#16E27A] text-[10px] font-bold font-mono uppercase tracking-widest mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Free Calculator</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Ready to save more tax? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-emerald-400 dark:to-blue-400">
              Start your free comparison in 58 seconds.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 leading-relaxed max-w-md mx-auto font-sans">
            Calculate your optimal regime, claim missed exemptions, and file your return with complete peace of mind.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-2 relative z-10">
          <button
            onClick={onStart}
            className="group relative overflow-hidden px-9 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all duration-300 cursor-pointer shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 active:scale-97 hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-blue-400/30"
          >
            <RollingText text="Calculate My Tax Savings" />
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-2">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Free Individual Tool</span>
            <span>•</span>
            <span>No Credit Card Required</span>
            <span>•</span>
            <span>Zero Account Setup</span>
          </div>
        </div>
      </div>
    </section>
  );
});
GetStartedSection.displayName = "GetStartedSection";
