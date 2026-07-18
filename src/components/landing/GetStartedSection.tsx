import React from 'react';
import { ArrowRight } from 'lucide-react';
import { RollingText } from './helpers/RollingText';

interface GetStartedSectionProps {
  onStart: () => void;
}

export const GetStartedSection: React.FC<GetStartedSectionProps> = React.memo(({ onStart }) => {
  return (
    <section id="get-started" className="relative z-10 py-32 md:py-36 px-6 text-center overflow-hidden bg-transparent border-t border-slate-200/50 dark:border-white/[0.02]">
      <style>{`
        @keyframes cta-drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.2; }
          80% { opacity: 0.2; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        .animate-cta-drift { animation: cta-drift 18s infinite linear; }
      `}</style>

      <div className="max-w-3xl mx-auto p-12 bg-white/40 dark:bg-slate-900/35 border border-slate-200/50 dark:border-white/[0.04] rounded-[24px] backdrop-blur-md relative overflow-hidden shadow-2xl space-y-8 z-10">
        {/* Animated tiny floating particles inside the card */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                left: `${(i * 20) % 100}%`,
                width: `${(i % 2) + 2}px`,
                height: `${(i % 2) + 2}px`,
                backgroundColor: i % 2 === 0 ? '#60A5FA' : '#16E27A',
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${15 + (i % 2) * 5}s`,
                bottom: '5%',
              }}
              className="absolute rounded-full animate-cta-drift opacity-0"
            />
          ))}
        </div>

        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Ready to save more tax? <br />
            <span className="text-blue-600 dark:text-[#16E27A]">Start your assessment in under 60 seconds.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 leading-relaxed max-w-md mx-auto font-sans">
            Calculate your optimal regime, claim missed exemptions, and file your tax returns with absolute precision.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 relative z-10">
          <button
            onClick={onStart}
            className="group relative overflow-hidden w-full sm:w-auto px-8 py-[18px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:bg-[#16E27A] dark:text-[#050607] font-bold text-xs uppercase tracking-wider rounded-[14px] transition-all duration-300 cursor-pointer shadow-lg shadow-blue-500/15 dark:shadow-[#16E27A]/10 hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] dark:hover:shadow-[0_0_30px_rgba(22,226,122,0.3)] active:scale-97 hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-transparent"
          >
            <RollingText text="Calculate My Tax Savings" />
            <ArrowRight className="w-4 h-4 text-white dark:text-[#050607]" />
          </button>
        </div>
      </div>
    </section>
  );
});
GetStartedSection.displayName = "GetStartedSection";
