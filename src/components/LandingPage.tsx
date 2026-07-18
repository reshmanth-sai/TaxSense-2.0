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
  GetStartedSection
} from './landing';

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
  if (idx <= 4) {
    const ratio = idx / 4;
    const r = Math.round(59 + (16 - 59) * ratio);
    const g = Math.round(130 + (185 - 130) * ratio);
    const b = Math.round(246 + (129 - 246) * ratio);
    return [r, g, b];
  } else {
    const ratio = (idx - 4) / 4;
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
    { id: 'journey', label: 'How It Works' },
    { id: 'interactive-showcase', label: 'Dashboard Showcase' },
    { id: 'comparison', label: 'Regime Comparison' },
    { id: 'copilot', label: 'AI Copilot' },
    { id: 'security', label: 'Security' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQ' },
    { id: 'get-started', label: 'Get Started' }
  ];

  // Section-Based Progress trackers
  const activeSectionIndexMV = useMotionValue(0);
  const scaleY = useSpring(activeSectionIndexMV, { stiffness: 120, damping: 20, restDelta: 0.001 });
  const transformY = useTransform(scaleY, [0, 8], ["0%", "100%"]);
  const progressGlowY = useTransform(scaleY, [0, 8], [4, 266]);

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

      {/* Scroll progress bar at the very top of the page */}
      <motion.div
        style={{ scaleX: scaleY }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-blue-600 dark:bg-[#16E27A] origin-left z-[100] shadow-[0_0_8px_rgba(37,99,235,0.4)] dark:shadow-[0_0_8px_rgba(22,226,122,0.6)] pointer-events-none"
      />

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
        className="absolute inset-0 z-0 pointer-events-none dark:hidden animate-grid-drift"
      />
      <div
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.007) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.007) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}
        className="absolute inset-0 z-0 pointer-events-none hidden dark:block animate-grid-drift"
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
        className="absolute inset-0 z-0 pointer-events-none opacity-20 hidden dark:block animate-grid-drift"
      />

      {/* LEFT SCROLL RAIL (Desktop only) */}
      <motion.div
        onMouseEnter={() => setIsPillHovered(true)}
        onMouseLeave={() => setIsPillHovered(false)}
        onFocus={() => setIsPillHovered(true)}
        onBlur={() => setIsPillHovered(false)}
        onTouchStart={triggerMobileLabel}
        onClick={triggerMobileLabel}
        animate={{ opacity: activeSection === 'journey' ? 0.15 : 1.0 }}
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
          {/* Track Line Background */}
          <div className="absolute top-0 bottom-0 w-[2px] bg-slate-100 dark:bg-white/[0.04] overflow-hidden rounded-full left-1/2 -translate-x-1/2">
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
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
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

      {/* HEADER NAVBAR (Floating Pill) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 flex justify-center pointer-events-none">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto w-full flex items-center justify-between px-6 ${isScrolled ? 'py-2' : 'py-3.5'} rounded-full transition-all duration-300 border ${isScrolled
              ? 'bg-white/60 border-white/60 dark:bg-[#050607]/80 dark:border-white/[0.04] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-none'
              : 'bg-white/30 border-white/40 dark:bg-white/[0.02] dark:border-white/[0.02] backdrop-blur-[18px]'
            }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-bold shadow-lg shadow-white/5">
              <svg className="w-4.5 h-4.5 text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="15" y2="13"></line>
                <line x1="9" y1="17" x2="13" y2="17"></line>
              </svg>
            </div>
            <span className="text-sm font-black tracking-wider uppercase text-slate-900 dark:text-white select-none">
              Tax<span className="text-slate-600 dark:text-slate-400">Sense</span>
            </span>
            {/* Animated network operational latency badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.04] backdrop-blur-[18px] text-[8.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2">
              <span className="relative flex h-1 w-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
              </span>
              <span>24ms API</span>
            </div>
          </div>

          {/* Center menu links */}
          <div className="hidden md:flex items-center gap-6 text-[11px] font-mono tracking-wider uppercase text-slate-550 dark:text-slate-300">
            {[
              { id: 'journey', label: 'How It Works' },
              { id: 'interactive-showcase', label: 'Features' },
              { id: 'security', label: 'Security' },
              { id: 'faq', label: 'FAQ' }
            ].map((link) => {
              const isLinkActive = activeSection === link.id;
              return (
                <div
                  key={link.id}
                  className="relative py-1 cursor-pointer"
                  onMouseEnter={() => setHoveredLink(link.id)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <button 
                    onClick={() => handleScrollTo(link.id)} 
                    className={`transition-colors duration-200 cursor-pointer ${
                      isLinkActive ? 'text-slate-900 dark:text-white font-bold' : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {link.label}
                  </button>
                  {hoveredLink === link.id && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-900 dark:bg-[#16E27A]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {isLinkActive && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500 dark:bg-[#16E27A] shadow-[0_0_4px_rgba(22,226,122,0.8)]" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono tracking-wider uppercase text-slate-555 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              GitHub
            </a>
            
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-250 cursor-pointer rounded-full transition-all"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button
              onClick={handleStartWorkspace}
              className="group relative overflow-hidden px-5 py-2 bg-slate-950 text-white dark:bg-[#16E27A] dark:text-[#050607] font-bold text-xs rounded-[14px] transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-md dark:shadow-[#16E27A]/10 hover:shadow-[0_0_15px_rgba(37,99,235,0.25)] dark:hover:shadow-[0_0_15px_rgba(22,226,122,0.3)] active:scale-95 border border-slate-800 dark:border-transparent"
            >
              <RollingText text="Calculate Savings" />
            </button>
          </div>
        </motion.header>
      </div>

      {/* SECTION 1: HERO */}
      <div id="hero" className="w-full">
        <HeroSection onStart={handleStartWorkspace} />
      </div>

      {/* SECTION 3: HOW IT WORKS */}
      <div id="journey" className="w-full">
        <LazySection>
          <JourneySection />
        </LazySection>
      </div>

      {/* SECTION 4: INTERACTIVE SHOWCASE */}
      <div id="interactive-showcase" className="w-full">
        <LazySection>
          <InteractiveShowcaseSection />
        </LazySection>
      </div>

      {/* SECTION 5: WHY TAXSENSE */}
      <div id="comparison" className="w-full">
        <LazySection>
          <ComparisonSection />
        </LazySection>
      </div>

      {/* SECTION 6: AI COPILOT SHOWCASE */}
      <div id="copilot" className="w-full">
        <LazySection>
          <CopilotSection soundEnabled={soundEnabled} />
        </LazySection>
      </div>

      {/* SECTION 7: SECURITY */}
      <div id="security" className="w-full">
        <LazySection>
          <SecuritySection />
        </LazySection>
      </div>

      {/* SECTION 8: TESTIMONIALS */}
      <div id="testimonials" className="w-full">
        <LazySection>
          <TestimonialsSection />
        </LazySection>
      </div>

      {/* SECTION 9: FAQ */}
      <div id="faq" className="w-full">
        <LazySection>
          <FAQSection />
        </LazySection>
      </div>

      {/* SECTION 10: FINAL CTA */}
      <div id="get-started" className="w-full">
        <LazySection>
          <GetStartedSection onStart={handleStartWorkspace} />
        </LazySection>
      </div>

      {/* FOOTER ROW */}
      <div ref={footerRef} className="relative z-20 w-full overflow-hidden bg-transparent">
        <motion.footer
          style={{ y: footerY }}
          className="rounded-t-[48px] dark:rounded-none border-t border-slate-200/50 dark:border-white/[0.04] bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 text-slate-800 dark:bg-none dark:bg-[#020202] dark:text-slate-100 pt-24 pb-12 px-6 md:px-12 text-left text-xs transition-all duration-300 shadow-[0_-15px_40px_rgba(0,0,0,0.02)] dark:shadow-none -mt-12 relative z-10"
        >
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-200 dark:border-white/[0.04]">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-350">Product</h4>
              <ul className="space-y-2 text-[11px] text-slate-700 dark:text-slate-400 font-semibold">
                <li><a href="#hero" className="hover:translate-x-1 hover:text-blue-600 dark:hover:text-[#16E27A] transition-all duration-200 inline-block">Sandbox Workspace</a></li>
                <li><a href="#interactive-showcase" className="hover:translate-x-1 hover:text-blue-600 dark:hover:text-[#16E27A] transition-all duration-200 inline-block">OCR Form 16 Parser</a></li>
                <li><a href="#copilot" className="hover:translate-x-1 hover:text-blue-600 dark:hover:text-[#16E27A] transition-all duration-200 inline-block">AI Copilot Chat</a></li>
                <li><a href="#comparison" className="hover:translate-x-1 hover:text-blue-600 dark:hover:text-[#16E27A] transition-all duration-200 inline-block">Regime Optimizations</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-355">Resources</h4>
              <ul className="space-y-2 text-[11px] text-slate-700 dark:text-slate-400 font-semibold font-sans">
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">Tax Guides</span></li>
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">Deductions Calculator</span></li>
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">Income Tax Slabs</span></li>
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">API Documentation</span></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-355">Company</h4>
              <ul className="space-y-2 text-[11px] text-slate-700 dark:text-slate-400 font-semibold font-sans">
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">About Us</span></li>
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">Careers</span></li>
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">Partners</span></li>
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">Security Sandbox</span></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-355">Legal</h4>
              <ul className="space-y-2 text-[11px] text-slate-700 dark:text-slate-400 font-semibold font-sans">
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">Privacy Policy</span></li>
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">Terms of Service</span></li>
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">Security Disclaimers</span></li>
                <li><span className="text-slate-600 dark:text-slate-400 hover:translate-x-1 hover:text-slate-800 dark:hover:text-white transition-all duration-200 inline-block cursor-pointer">Trust Center</span></li>
              </ul>
            </div>
          </div>

          <div className="max-w-6xl mx-auto pt-8 flex flex-col sm:flex-row sm:justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
            <div>
              © {new Date().getFullYear()} TaxSense <span className="text-slate-300 dark:text-slate-800 font-normal mx-1.5">•</span> Built with ❤️ in India for taxpayers <span className="text-slate-300 dark:text-slate-800 font-normal mx-1.5">•</span> FY {new Date().getFullYear() === 2026 ? "2025-26" : "2026-27"}
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/10 rounded-full text-[9px] font-extrabold tracking-wider shadow-[0_2px_8px_rgba(16,185,129,0.02)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>100% Secure & Private</span>
              </span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
