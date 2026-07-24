import React, { useState, useEffect, useRef } from 'react';
import { useScroll, useSpring, useTransform, motion, AnimatePresence, useInView, useMotionValue, useReducedMotion } from 'motion/react';
import { ShieldCheck, Sun, Moon } from 'lucide-react';
import { useSidebarStore } from './sidebar/useSidebarStore';
import HeroSection from './HeroSection';
import { RollingText } from './landing/helpers/RollingText';
import {
  JourneySection,
  InteractiveShowcaseSection,
  ComparisonSection,
  CopilotSection,
  SecuritySection,
  TestimonialsSection,
  FAQSection,
  GetStartedSection,
  DeadlineBanner,
  Navbar,
  TippingPointVisualizer,
  RefundFinderWidget
} from './landing';

import { CTCEfficiencyScorecard } from './dashboard/CTCEfficiencyScorecard';

interface LandingPageProps {
  onStart: () => void;
}

const LazySection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isIntersecting = useInView(ref, {
    once: true,
    margin: "300px"
  });

  return (
    <div ref={ref} className="w-full">
      {isIntersecting ? children : <div className="h-[250px] bg-transparent opacity-0" />}
    </div>
  );
};

const getNodeColorRGB = (idx: number): [number, number, number] => {
  if (idx <= 5) {
    const ratio = idx / 5;
    const r = Math.round(59 + (16 - 59) * ratio);
    const g = Math.round(130 + (185 - 130) * ratio);
    const b = Math.round(246 + (129 - 246) * ratio);
    return [r, g, b];
  } else {
    const ratio = Math.min(1, (idx - 5) / 6);
    const r = Math.round(16 + (22 - 16) * ratio);
    const g = Math.round(185 + (226 - 185) * ratio);
    const b = Math.round(129 + (122 - 129) * ratio);
    return [r, g, b];
  }
};


export default function LandingPage({ onStart }: LandingPageProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [soundEnabled] = useState(true);

  // Scroll Rail Navigation Data & State
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);
  
  const prefersReducedMotion = useReducedMotion();
  const [isPillHovered, setIsPillHovered] = useState(false);
  const [showMobileLabel, setShowMobileLabel] = useState(false);
  const mobileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerMobileLabel = () => {
    setShowMobileLabel(true);
    if (mobileTimeoutRef.current) clearTimeout(mobileTimeoutRef.current);
    mobileTimeoutRef.current = setTimeout(() => {
      setShowMobileLabel(false);
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (mobileTimeoutRef.current) clearTimeout(mobileTimeoutRef.current);
    };
  }, []);

  const theme = useSidebarStore((state) => state.theme);
  const setTheme = useSidebarStore((state) => state.setTheme);

  const sections = [
    { id: 'hero', label: 'Hero' },
    { id: 'comparison', label: 'Regime Comparison' },
    { id: 'tipping-point', label: 'Tipping Point' },
    { id: 'interactive-showcase', label: 'Tax Calculator' },
    { id: 'refund-finder', label: 'Refund Finder' },
    { id: 'ctc-scorecard', label: 'Flexi Basket' },
    { id: 'journey', label: 'How It Works' },
    { id: 'copilot', label: 'AI Copilot' },
    { id: 'security', label: 'Security' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQ' },
    { id: 'get-started', label: 'Get Started' }
  ];

  // Section-Based Progress trackers
  const maxSectionIndex = sections.length - 1;
  const activeSectionIndexMV = useMotionValue(0);
  const scaleY = useSpring(activeSectionIndexMV, { stiffness: 280, damping: 28, mass: 0.5, restDelta: 0.0001 });
  const transformY = useTransform(scaleY, [0, maxSectionIndex], ["0%", "100%"]);
  const progressGlowY = useTransform(scaleY, [0, maxSectionIndex], [14, 256]);



  // Navbar dynamic scroll transparency state
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Footer sheet overlap slide-in scroll tracker
  const footerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: footerScrollProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });
  const footerY = useTransform(footerScrollProgress, [0, 1], [80, 0]);

  // Track active section via IntersectionObserver (60 FPS, no reflows)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, {
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0.05
    });

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleStartWorkspace = () => {
    onStart();
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeIndex = sections.findIndex(s => s.id === activeSection);
  const activeStepText = activeIndex >= 0 ? `${activeIndex + 1} / ${sections.length}` : `1 / ${sections.length}`;

  useEffect(() => {
    if (activeIndex >= 0) {
      activeSectionIndexMV.set(activeIndex);
    }
  }, [activeIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-50 text-slate-900 dark:bg-[#020202] dark:from-transparent dark:via-transparent dark:to-transparent dark:text-[#F6F7F8] font-sans antialiased selection:bg-sky-200 selection:text-slate-900 dark:selection:bg-[#16E27A] dark:selection:text-[#050607] overflow-x-hidden relative">



      {/* Inline styles for border beams & background drift keyframe animations */}
      <style>{`
        @keyframes border-beam {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-border-beam {
          animation: border-beam 4s linear infinite;
        }
        @keyframes drift-particle {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          15% { opacity: 0.25; }
          85% { opacity: 0.25; }
          100% { transform: translateY(-120px) translateX(15px); opacity: 0; }
        }
        .animate-drift {
          animation: drift-particle 15s infinite ease-in-out;
        }

        @keyframes grid-drift {
          0%, 100% { background-position: 0 0; }
          50% { background-position: 0 4px; }
        }
        .animate-grid-drift {
          animation: grid-drift 12s infinite ease-in-out;
        }
      `}</style>

      {/* Viewport Edge Vignette for cinematic layout depth */}
      <div className="pointer-events-none fixed inset-0 z-40 shadow-[inset_0_0_100px_rgba(255,255,255,0.85)] dark:shadow-[inset_0_0_100px_rgba(0,0,0,0.85)]" />

      {/* Blueprint Grid Background Overlay (~1% opacity, 100px grid size) */}
      <div
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}
        className="absolute inset-0 z-0 pointer-events-none dark:hidden opacity-70"
      />
      <div
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.007) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.007) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}
        className="absolute inset-0 z-0 pointer-events-none hidden dark:block opacity-70"
      />

      {/* Engineering Dot Matrix Grid Overlay (24px spacing, 1% opacity) */}
      <div
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1.2px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:hidden"
      />
      <div
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1.2px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        className="absolute inset-0 z-0 pointer-events-none opacity-20 hidden dark:block"
      />

      {/* LEFT SCROLL RAIL (Desktop only) */}
      <motion.div
        onMouseEnter={() => setIsPillHovered(true)}
        onMouseLeave={() => setIsPillHovered(false)}
        onFocus={() => setIsPillHovered(true)}
        onBlur={() => setIsPillHovered(false)}
        onTouchStart={triggerMobileLabel}
        onClick={triggerMobileLabel}
        animate={{ opacity: 1.0 }}
        transition={{ duration: 0.4 }}
        whileHover={{
          scale: prefersReducedMotion ? 1.0 : 1.015,
          borderColor: "rgba(148, 163, 184, 0.35)",
          boxShadow: theme === 'dark' 
            ? "0 20px 56px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05)" 
            : "0 20px 48px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.4)"
        }}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-6 select-none w-12 pt-8 pb-6 bg-gradient-to-b from-white/60 to-white/35 dark:from-slate-950/25 dark:to-slate-950/10 border border-slate-200/40 dark:border-white/[0.03] border-t-white/20 dark:border-t-white/10 backdrop-blur-[18px] rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.55)] transition-all duration-300"
      >
        {/* Typographically Optimized Counter */}
        <div className="flex items-baseline justify-center gap-0.5 font-mono">
          <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100 leading-none">
            {activeIndex + 1}
          </span>
          <span className="text-[9.5px] text-slate-400 dark:text-slate-600 font-semibold leading-none px-[0.5px]">
            /
          </span>
          <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium leading-none">
            {sections.length}
          </span>
        </div>

        {/* Integrated Vertical Track and Dots */}
        <div className="h-[270px] w-5 relative flex flex-col justify-between items-center py-1">
          {/* Track Line Background (Bounded exactly between Dot 1 center and Dot 9 center) */}
          <div className="absolute top-[14px] bottom-[14px] w-[2px] bg-slate-100 dark:bg-white/[0.04] overflow-hidden rounded-full left-1/2 -translate-x-1/2">
            {/* Static full-height gradient line */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500 via-[#10B981] to-[#16E27A]" />
            
            {/* Dynamic Cover overlay that translates down to reveal the gradient track */}
            <motion.div
              style={{ y: transformY }}
              className="absolute inset-0 bg-slate-100 dark:bg-[#050607] origin-bottom"
            />
          </div>

          {/* Glowing active point following the progress indicator */}
          <motion.div
            style={{ 
              y: progressGlowY, 
              x: "-50%",
              backgroundColor: `rgb(${getNodeColorRGB(activeIndex)[0]}, ${getNodeColorRGB(activeIndex)[1]}, ${getNodeColorRGB(activeIndex)[2]})`,
              boxShadow: `0 0 10px rgba(${getNodeColorRGB(activeIndex)[0]}, ${getNodeColorRGB(activeIndex)[1]}, ${getNodeColorRGB(activeIndex)[2]}, 0.8)`
            }}
            className="absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full blur-[2px] pointer-events-none z-30 animate-pulse"
          />

          {sections.map((s, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            const [r, g, b] = getNodeColorRGB(idx);
            const rgbStr = `rgb(${r}, ${g}, ${b})`;
            const rgbaGlowStr = `rgba(${r}, ${g}, ${b}, 0.4)`;
            const rgbaGlowStrongStr = `rgba(${r}, ${g}, ${b}, 0.7)`;

            return (
              <div
                key={s.id}
                tabIndex={0}
                onMouseEnter={() => setHoveredDot(s.id)}
                onMouseLeave={() => setHoveredDot(null)}
                onFocus={() => setHoveredDot(s.id)}
                onBlur={() => setHoveredDot(null)}
                onClick={() => handleScrollTo(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleScrollTo(s.id);
                  }
                }}
                className="relative flex items-center justify-center w-5 h-5 cursor-pointer z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16E27A] rounded-full"
              >
                {isActive ? (
                  <motion.div
                    animate={prefersReducedMotion ? {} : {
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        `0 0 8px ${rgbaGlowStr}`,
                        `0 0 16px ${rgbaGlowStrongStr}`,
                        `0 0 8px ${rgbaGlowStr}`
                      ]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.8,
                      ease: "easeInOut"
                    }}
                    style={{ backgroundColor: rgbStr }}
                    className="w-2.5 h-2.5 rounded-full border border-white dark:border-[#050607] z-20"
                  />
                ) : isCompleted ? (
                  <div 
                    style={{ 
                      backgroundColor: rgbStr,
                      boxShadow: `0 0 8px ${rgbaGlowStr}`
                    }}
                    className="w-2 h-2 rounded-full z-20 transition-all duration-300" 
                  />
                ) : (
                  <div className="w-2 h-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 rounded-full z-20 opacity-40 transition-all duration-300" />
                )}

                {/* Pulsing outer ring with soft outer glow for active dot */}
                {isActive && (
                  <motion.span
                    layoutId="activeDotRing"
                    style={{ borderColor: rgbStr }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}

                    className="absolute w-4.5 h-4.5 rounded-full border opacity-50 pointer-events-none"
                  />
                )}

                <AnimatePresence>
                  {hoveredDot === s.id && (
                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-10 px-3 py-1.5 bg-slate-900/90 dark:bg-[#0E131B]/95 backdrop-blur-md border border-slate-700/30 dark:border-white/[0.08] text-white text-[9px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap shadow-xl pointer-events-none"
                    >
                      {s.label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Continuous rotated side label */}
        <AnimatePresence>
          {(isPillHovered || showMobileLabel) && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: "15%", rotate: -90 }}
              animate={prefersReducedMotion ? { opacity: 0.75 } : { opacity: 0.75, y: "-50%", rotate: -90 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: "15%", rotate: -90 }}
              whileHover={{ opacity: 1.0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-10 top-1/2 origin-center text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] select-none pointer-events-none whitespace-nowrap"
            >
              Journey
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2% Opacity Film Grain Overlay */}
      <div className="cinematic-noise pointer-events-none fixed inset-0 z-50 opacity-[0.02] mix-blend-overlay" />

      {/* Cinematic Continuous Background Canvas: Large, overlapping, low-opacity glowing auroras */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Glow 1: Top Hero (Blue Glow) */}
        <motion.div
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%)' }}
          className="absolute top-[3%] left-[10%] w-[1400px] h-[750px] blur-[80px]"
        />

        {/* Glow 2: Middle - Journey / Showcase (Blue & Green Mix) */}
        <motion.div
          animate={{
            x: [0, -15, 20, 0],
            y: [0, 15, -15, 0],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.04) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 75%)' }}
          className="absolute top-[28%] right-[5%] w-[1600px] h-[850px] blur-[100px]"
        />

        {/* Glow 3: Lower - AI Copilot / Comparison (Purple & Green Mix) */}
        <motion.div
          animate={{
            x: [0, 15, -20, 0],
            y: [0, -15, 20, 0],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.04) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 75%)' }}
          className="absolute top-[58%] left-[5%] w-[1500px] h-[800px] blur-[90px]"
        />

        {/* Glow 4: Bottom - Final CTA (Strong Green Glow) */}
        <motion.div
          animate={{
            scale: [1, 1.03, 1],
            opacity: [0.85, 1, 0.85]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.07) 0%, transparent 70%)' }}
          className="absolute top-[82%] left-1/2 -translate-x-1/2 w-[1800px] h-[900px] blur-[110px]"
        />
      </div>

      {/* TOP DEADLINE BANNER */}
      <DeadlineBanner onStart={handleStartWorkspace} />

      {/* HEADER NAVBAR (Enterprise Glass Navbar) */}
      <Navbar onStart={handleStartWorkspace} activeSection={activeSection} />


      {/* SECTION 1: HERO */}
      <div id="hero" className="w-full">
        <HeroSection onStart={handleStartWorkspace} />
      </div>

      {/* SECTION 2: WHY TAXSENSE / COMPARISON */}
      <div id="comparison" className="w-full">
        <LazySection>
          <ComparisonSection />
        </LazySection>
      </div>

      {/* SECTION 3: TIPPING POINT VISUALIZER (NEW) */}
      <div id="tipping-point" className="w-full">
        <LazySection>
          <TippingPointVisualizer />
        </LazySection>
      </div>

      {/* SECTION 4: INTERACTIVE CALCULATOR SHOWCASE */}
      <div id="interactive-showcase" className="w-full">
        <LazySection>
          <InteractiveShowcaseSection />
        </LazySection>
      </div>

      {/* SECTION 5: UNCLAIMED REFUND FINDER (NEW) */}
      <div id="refund-finder" className="w-full">
        <LazySection>
          <RefundFinderWidget onStart={handleStartWorkspace} />
        </LazySection>
      </div>

      {/* SECTION 6: CTC FLEXI BASKET SCORECARD (NEW) */}
      <div id="ctc-scorecard" className="w-full">
        <LazySection>
          <CTCEfficiencyScorecard />
        </LazySection>
      </div>

      {/* SECTION 7: 4-STEP JOURNEY */}
      <div id="journey" className="w-full">
        <LazySection>
          <JourneySection />
        </LazySection>
      </div>

      {/* SECTION 8: MULTILINGUAL AI COPILOT SHOWCASE */}
      <div id="copilot" className="w-full">
        <LazySection>
          <CopilotSection soundEnabled={soundEnabled} />
        </LazySection>
      </div>

      {/* SECTION 9: SECURITY */}
      <div id="security" className="w-full">
        <LazySection>
          <SecuritySection />
        </LazySection>
      </div>

      {/* SECTION 10: TESTIMONIALS */}
      <div id="testimonials" className="w-full">
        <LazySection>
          <TestimonialsSection />
        </LazySection>
      </div>

      {/* SECTION 11: FAQ */}
      <div id="faq" className="w-full">
        <LazySection>
          <FAQSection />
        </LazySection>
      </div>

      {/* SECTION 12: FINAL CTA */}
      <div id="get-started" className="w-full">
        <LazySection>
          <GetStartedSection onStart={handleStartWorkspace} />
        </LazySection>
      </div>

      {/* FOOTER ROW */}
      <div ref={footerRef} className="relative z-20 w-full overflow-hidden bg-transparent">
        {/* REDESIGNED COMPACT ENTERPRISE FOOTER */}
        <motion.footer
          ref={footerRef}
          style={{ y: footerY }}
          className="w-full border-t border-slate-200/80 dark:border-white/[0.06] bg-slate-100/90 dark:bg-[#060A12] text-slate-800 dark:text-slate-100 py-10 px-6 md:px-12 text-left text-xs transition-all duration-300 relative z-10"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* TIER 1: MAIN COMPACT FOOTER GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-slate-200/80 dark:border-white/[0.06]">
              {/* BRAND COLUMN (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#0B1730] dark:bg-gradient-to-br dark:from-blue-600/30 dark:to-emerald-500/30 border border-[#0B1730]/20 dark:border-blue-400/40 text-emerald-400 flex items-center justify-center font-bold shadow-sm">
                    <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
                      <line x1="9" y1="9" x2="15" y2="9"></line>
                      <line x1="9" y1="13" x2="15" y2="13"></line>
                      <line x1="9" y1="17" x2="13" y2="17"></line>
                    </svg>
                  </div>
                  <span className="text-sm font-extrabold tracking-tight text-[#0B1730] dark:text-white">
                    TAXSENSE
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed font-sans font-medium">
                  AI-First tax optimization & Form 16 automation platform. Client-side memory for 100% private filing.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Operational • Local Sandbox Active</span>
                </div>
              </div>

              {/* 3 LINK DIRECTORY COLUMNS (7 cols) */}
              <div className="lg:col-span-7 grid grid-cols-3 gap-6 font-sans text-xs">
                {/* Column 1: Product */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Product</h4>
                  <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <li><button onClick={() => handleScrollTo('comparison')} className="hover:text-[#0B1730] dark:hover:text-white transition-colors">Regime Optimizer</button></li>
                    <li><button onClick={() => handleScrollTo('interactive-showcase')} className="hover:text-[#0B1730] dark:hover:text-white transition-colors">OCR Form 16 Parser</button></li>
                    <li><button onClick={() => handleScrollTo('copilot')} className="hover:text-[#0B1730] dark:hover:text-white transition-colors">AI Copilot Chat</button></li>
                    <li><button onClick={() => handleScrollTo('refund-finder')} className="hover:text-[#0B1730] dark:hover:text-white transition-colors">Deduction Vault</button></li>
                  </ul>
                </div>

                {/* Column 2: Resources */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resources</h4>
                  <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <li><button onClick={() => handleScrollTo('comparison')} className="hover:text-[#0B1730] dark:hover:text-white transition-colors">Tax Slabs 2025-26</button></li>
                    <li><button onClick={() => handleScrollTo('interactive-showcase')} className="hover:text-[#0B1730] dark:hover:text-white transition-colors">AY 2026-27 Guide</button></li>
                    <li><button onClick={() => handleScrollTo('security')} className="hover:text-[#0B1730] dark:hover:text-white transition-colors">Security Specs</button></li>
                  </ul>
                </div>

                {/* Column 3: Legal & Trust */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Legal & Trust</h4>
                  <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <li><button onClick={() => handleScrollTo('security')} className="hover:text-[#0B1730] dark:hover:text-white transition-colors">Privacy Policy</button></li>
                    <li><button onClick={() => handleScrollTo('security')} className="hover:text-[#0B1730] dark:hover:text-white transition-colors">Terms of Service</button></li>
                    <li><button onClick={() => handleScrollTo('security')} className="hover:text-[#0B1730] dark:hover:text-white transition-colors">Trust Center</button></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* TIER 2: BOTTOM COPYRIGHT & ENCRYPTION BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-mono text-slate-500 dark:text-slate-400 select-none">
              <div>
                © {new Date().getFullYear()} TAXSENSE • Built for Indian Taxpayers • FY 2025–26 (AY 2026–27)
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>AES-256 Client Encryption • 100% Private Local Memory</span>
              </div>
            </div>

          </div>
        </motion.footer>
      </div>
    </div>
  );
}
