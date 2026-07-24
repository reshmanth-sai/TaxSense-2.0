import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, ArrowRight } from 'lucide-react';

interface DeadlineBannerProps {
  onStart: () => void;
}

export const DeadlineBanner: React.FC<DeadlineBannerProps> = ({ onStart }) => {
  // Target deadline: July 31st for AY 2026-27
  const [timeLeft, setTimeLeft] = useState({ days: 8, hours: 14, minutes: 59, seconds: 7 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white/70 dark:bg-[#080D1A]/80 border-b border-slate-200/60 dark:border-white/[0.06] py-2 px-4 text-slate-700 dark:text-slate-300 text-[11px] font-sans select-none relative z-50 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3">
        {/* Left message group */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5 shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>AY 2026–27 ITR Filing Window Open</span>
          </span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>
          <span className="hidden md:inline text-slate-600 dark:text-slate-400 truncate">
            Avoid <strong className="text-slate-900 dark:text-slate-200 font-semibold">₹5,000 Sec 234F</strong> late filing penalties.
          </span>
        </div>

        {/* Right countdown & CTA group */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-sans text-slate-600 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline text-slate-500 font-medium">Deadline:</span>
            <span className="font-mono bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold text-[11px]">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </div>

          <button
            onClick={onStart}
            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md border border-amber-400/30 hover:scale-[1.02] active:scale-95"
          >
            <span>FILE NOW</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
