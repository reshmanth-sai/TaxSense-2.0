import React, { useState, useRef } from 'react';
import { motion, useMotionValueEvent, MotionValue, useScroll, useSpring } from 'motion/react';
import { Upload, Sparkles, TrendingUp, CheckCircle2, LucideIcon } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';

interface StepItem {
  step: string;
  title: string;
  desc: string;
  trigger: number;
  icon: LucideIcon;
}

const stepsData: StepItem[] = [
  {
    step: "01",
    title: "Upload Document",
    desc: "Drag and drop your Form 16 PDF securely. Everything processes inside a transient local memory workspace.",
    trigger: 0,
    icon: Upload
  },
  {
    step: "02",
    title: "AI Extraction",
    desc: "Gemini automatically reads and verifies salary components, standard deductions, and tax computed numbers.",
    trigger: 0.33,
    icon: Sparkles
  },
  {
    step: "03",
    title: "Recommendations",
    desc: "Compare old vs new tax regime liability. Adjust values using interactive sliders to claim missed exemptions.",
    trigger: 0.66,
    icon: TrendingUp
  },
  {
    step: "04",
    title: "File Return",
    desc: "Check and audit final figures. Download your customized filing report and submit with single-tap accuracy.",
    trigger: 0.98,
    icon: CheckCircle2
  }
];

interface JourneyStepNodeProps {
  item: StepItem;
  idx: number;
  progress: MotionValue<number>;
}

const JourneyStepNode: React.FC<JourneyStepNodeProps> = ({ item, idx, progress }) => {
  const [isStepActive, setIsStepActive] = useState(progress.get() >= item.trigger);

  useMotionValueEvent(progress, "change", (latest) => {
    const nextActive = latest >= item.trigger;
    if (nextActive !== isStepActive) {
      setIsStepActive(nextActive);
    }
  });

  return (
    <div className="relative group">
      {/* Visual vertical connector pin descending into card top */}
      <div className={`absolute left-1/2 -translate-x-1/2 -top-[52px] w-[2px] h-[52px] hidden sm:block pointer-events-none z-0 transition-colors duration-300 ${
        isStepActive ? 'bg-emerald-500 dark:bg-[#16E27A]' : 'bg-slate-200 dark:bg-white/10'
      }`} />
      
      {/* Visual horizontal connector line linking vertical node to card left edge on mobile */}
      <div className={`absolute left-[-24px] top-[44px] w-[24px] h-[2px] block sm:hidden pointer-events-none z-0 transition-colors duration-300 ${
        isStepActive ? 'bg-emerald-500 dark:bg-[#16E27A]' : 'bg-slate-200 dark:bg-white/10'
      }`} />

      {/* Connection Node: Refined ◉ design */}
      <div className="absolute left-[-36px] top-[32px] sm:left-1/2 sm:-translate-x-1/2 sm:-top-[62px] z-20">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative ${
          isStepActive 
            ? 'scale-110 shadow-[0_0_12px_rgba(22,226,122,0.4)]' 
            : 'group-hover:scale-105'
        }`}>
          {/* Outer Glow Ring */}
          <div className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
            isStepActive ? 'border-[#16E27A]/60 scale-100' : 'border-slate-300/30 dark:border-white/10 scale-90 group-hover:border-[#16E27A]/40'
          }`} />
          {/* Inner Thin Ring */}
          <div className={`w-3.5 h-3.5 rounded-full border bg-white dark:bg-[#050607] flex items-center justify-center transition-all duration-300 ${
            isStepActive ? 'border-[#16E27A]' : 'border-slate-400 dark:border-white/20'
          }`}>
            {/* Filled Center Dot */}
            <div className={`w-1.5 h-1.5 rounded-full bg-[#16E27A] transition-all duration-300 ${
              isStepActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-70'
            }`} />
          </div>
        </div>
      </div>

      <PremiumCard
        className={`p-8 text-center relative transition-colors duration-300 z-15 ${
          isStepActive 
            ? 'border-emerald-500/30 dark:border-[#16E27A]/20 bg-white/90 dark:bg-white/[0.04] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_0_40px_rgba(22,226,122,0.08)] scale-[1.01]' 
            : 'border-slate-200/50 dark:border-white/[0.04] bg-white/30 dark:bg-white/[0.01] backdrop-blur-sm opacity-60'
        } hover:shadow-[0_24px_56px_rgba(22,226,122,0.06)] dark:hover:shadow-[0_0_40px_rgba(22,226,122,0.08)]`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.25, ease: "easeOut" } }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col items-center space-y-5 relative">
          {/* Top center border connection socket (notch) */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-4.5 h-[3px] rounded-b-full transition-all duration-300 z-20 ${
            isStepActive 
              ? 'bg-[#16E27A] shadow-[0_1px_8px_rgba(22,226,122,0.6)]' 
              : 'bg-slate-300 dark:bg-white/10 group-hover:bg-[#16E27A]/50'
          }`} />

          {/* Soft glowing radial halo spotlight behind icon */}
          <div className={`absolute top-1 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-emerald-500/[0.12] dark:bg-[#16E27A]/[0.08] blur-[8px] pointer-events-none transition-all duration-500 ${
            isStepActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-50'
          }`} />

          {/* Centered, refined Icon container */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 z-10 ${
            isStepActive 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500 dark:text-[#16E27A]' 
              : 'bg-slate-50/50 dark:bg-white/5 border-slate-200/50 dark:border-white/[0.04] text-slate-400 dark:text-slate-500'
          }`}>
            <item.icon className="w-4.5 h-4.5 transition-transform duration-300 group-hover:rotate-[5deg]" />
          </div>

          {/* Title & Description inline spacing */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500">
                {item.step}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {item.title}
              </h3>
            </div>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal max-w-[220px]">
              {item.desc}
            </p>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
};

export const JourneySection: React.FC = React.memo(() => {
  const journeyRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: journeyScrollProgress } = useScroll({
    target: journeyRef,
    offset: ["start end", "end end"]
  });

  const journeyLineScaleX = useSpring(journeyScrollProgress, { stiffness: 80, damping: 25, restDelta: 0.001 });

  return (
    <section ref={journeyRef} id="journey" className="relative py-32 md:py-36 px-6 max-w-6xl mx-auto space-y-20 z-10 overflow-hidden bg-transparent">
      <div className="absolute top-[180px] left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-500/[0.045] dark:bg-blue-500/[0.03] blur-[100px] rounded-full pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center relative z-10"
      >
        <span className="text-[10px] text-slate-500 dark:text-[#16E27A] font-mono font-bold uppercase tracking-[0.25em] mb-6 block">Simplifying Taxes</span>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-3">
          The 4-Step Journey
        </h2>
        <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-sans mt-3">
          We broke down tax complexity into a structured, elegant process that you control entirely.
        </p>
      </motion.div>

      <div className="relative pl-12 sm:pl-0 sm:pt-20 grid grid-cols-1 sm:grid-cols-4 gap-12 sm:gap-8 z-10">
        {/* Desktop: Horizontal connector tracks */}
        <div className="absolute top-[28px] left-[12.5%] right-[12.5%] h-[2.5px] bg-slate-200 dark:bg-white/10 hidden sm:block z-0 pointer-events-none" />
        <motion.div
          style={{ scaleX: journeyLineScaleX }}
          className="absolute top-[28px] left-[12.5%] right-[12.5%] h-[2.5px] bg-emerald-500 dark:bg-[#16E27A] origin-left hidden sm:block z-10 pointer-events-none shadow-[0_0_8px_rgba(16,185,129,0.3)] dark:shadow-[0_0_8px_rgba(22,226,122,0.4)]"
        />

        {/* Mobile: Vertical connector tracks */}
        <div className="absolute left-[24px] top-6 bottom-6 w-[2.5px] bg-slate-200 dark:bg-white/10 block sm:hidden z-0 pointer-events-none" />
        <motion.div
          style={{ scaleY: journeyLineScaleX }}
          className="absolute left-[24px] top-6 bottom-6 w-[2.5px] bg-emerald-500 dark:bg-[#16E27A] origin-top block sm:hidden z-10 pointer-events-none shadow-[0_0_8px_rgba(16,185,129,0.3)] dark:shadow-[0_0_8px_rgba(22,226,122,0.4)]"
        />

        {stepsData.map((item, idx) => (
          <JourneyStepNode
            key={idx}
            item={item}
            idx={idx}
            progress={journeyScrollProgress}
          />
        ))}
      </div>
    </section>
  );
});
JourneySection.displayName = "JourneySection";
