import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useScroll, useSpring, useTransform, motion, AnimatePresence, HTMLMotionProps } from 'motion/react';
import { 
  FileText, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Shield, 
  Eye, 
  Cpu, 
  ArrowUpRight, 
  ChevronDown, 
  Globe,
  Database,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useTaxStore } from '../store/useTaxStore';

interface LandingPageProps {
  onStart: () => void;
}

// 60 FPS lightweight spring-interpolated counter component
interface AnimatedCounterProps {
  value: number;
  prefix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, prefix = "" }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 400; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const ease = progress * (2 - progress); // EaseOutQuad
      const current = Math.round(start + (end - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString('en-IN')}</span>;
};

// Reusable Railway-style cursor-aware card component with Vercel conic border beams
interface PremiumCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

const PremiumCard: React.FC<PremiumCardProps> = ({ children, className = '', ...props }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Safely extract paddings to prevent inner content layout issues
  const classes = className.split(' ');
  const paddingClass = classes.find(c => c.startsWith('p-')) || 'p-6';
  const otherClasses = classes.filter(c => !c.startsWith('p-')).join(' ');

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (props.onMouseEnter) props.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        if (props.onMouseLeave) props.onMouseLeave(e);
      }}
      className={`relative p-[1.5px] rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.65)] ${otherClasses}`}
      {...props}
    >
      {/* Conic glowing border beam (Vercel style, 3.5s duration) */}
      <div 
        className={`absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent,rgba(22,226,122,0.15),transparent_50%)] animate-border-beam pointer-events-none transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} 
      />

      {/* Surface wrapper with solid dark background mask to prevent background bleed */}
      <div className={`relative w-full h-full bg-[#0B0F19] bg-gradient-to-br from-white/[0.025] to-white/[0.005] border border-white/[0.05] border-t-white/[0.12] rounded-2xl backdrop-blur-[12px] ${paddingClass}`}>
        
        {/* Subtle diagonal gloss reflection sheet */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.005] to-white/[0.015] pointer-events-none" />

        {/* Subtle radial cursor follow glow */}
        <div 
          style={{
            background: `radial-gradient(150px circle at ${coords.x}px ${coords.y}px, rgba(22, 226, 122, 0.035), transparent 80%)`,
          }}
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />
        {children}
      </div>
    </motion.div>
  );
};

export default function LandingPage({ onStart }: LandingPageProps) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeShowcase, setActiveShowcase] = useState<'extraction' | 'regime' | 'optimization' | null>(null);

  // Scroll Rail Navigation Data & State
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const sections = [
    { id: 'hero', label: 'Hero' },
    { id: 'journey', label: 'Tax Journey' },
    { id: 'interactive-showcase', label: 'Dashboard Showcase' },
    { id: 'comparison', label: 'Regime Comparison' },
    { id: 'copilot', label: 'AI Copilot' },
    { id: 'security', label: 'Security' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQ' },
    { id: 'get-started', label: 'Get Started' }
  ];

  // Hero target refs for scroll & cursor perspective
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroCoords, setHeroCoords] = useState({ x: 0, y: 0 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8; // Capped displacement (max 4% translation)
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    setHeroCoords({ x, y });
  };

  // Journey target ref for scroll-linked connecting line
  const journeyRef = useRef<HTMLDivElement>(null);
  const [journeyProgress, setJourneyProgress] = useState(0);

  // Interactive allowance slider in Hero Mockup
  const [sliderDeduction, setSliderDeduction] = useState(0);
  const [mockRegime, setMockRegime] = useState('OLD');
  const [mockBadge, setMockBadge] = useState('Sandbox Active');

  // Dynamic values derived from allowance slider
  const computedSavings = useMemo(() => 18240 + Math.round(sliderDeduction * 0.3), [sliderDeduction]);
  const computedProgress = useMemo(() => Math.min(100, 72 + Math.round((sliderDeduction / 25000) * 28)), [sliderDeduction]);

  // AI Copilot Interactive Query Simulator
  const promptResponses = [
    {
      q: "What is Section 80D?",
      a: "Section 80D allows a deduction of up to **₹25,000** for medical insurance premiums paid for yourself, spouse, and dependent children. You can claim an additional **₹25,000** (or ₹50,000 if senior citizen) for parents' premiums."
    },
    {
      q: "Is standard deduction automatic?",
      a: "Yes. For FY 2025-26 (AY 2026-27), a standard deduction of **₹75,000** under the New Tax Regime (and **₹50,000** under the Old Tax Regime) is applied automatically to all salaried individuals."
    },
    {
      q: "Saves under New Regime?",
      a: "You save **₹18,240** based on your gross salary of ₹8,50,000. Under the New Regime, tax brackets are wider and rates are lower, resulting in a ₹36,360 tax liability compared to ₹54,600."
    }
  ];

  const [copilotQuery, setCopilotQuery] = useState("How much tax do I save under the New Regime?");
  const [copilotResponse, setCopilotResponse] = useState(
    "You save **₹18,240** by filing under the New Regime. This is because under the New Regime, standard deductions of ₹75,000 apply automatically, and your ₹8,50,000 gross salary is taxed under lower rate bands, resulting in a liability of ₹36,360 compared to ₹54,600 under the Old Regime."
  );
  const [isTyping, setIsTyping] = useState(false);

  const handleTriggerPrompt = (idx: number) => {
    if (isTyping) return;
    playClickSound();
    const prompt = promptResponses[idx];
    setCopilotQuery(prompt.q);
    setIsTyping(true);
    setCopilotResponse("");
    
    let currentText = "";
    const targetText = prompt.a;
    let charIndex = 0;
    
    const interval = setInterval(() => {
      if (charIndex < targetText.length) {
        currentText = targetText.substring(0, charIndex + 2);
        setCopilotResponse(currentText);
        charIndex += 2;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15);
  };

  // Scroll Progress Trackers
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Hero scroll-linked target tracking
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const mockupScale = useTransform(heroScrollProgress, [0, 1], [0.98, 1.02]);
  const mockupRotateX = useTransform(heroScrollProgress, [0, 1], [4, 0]);

  // Navbar dynamic scroll transparency state
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Journey scroll-linked connecting line tracker
  const { scrollYProgress: journeyScrollProgress } = useScroll({
    target: journeyRef,
    offset: ["start end", "end end"]
  });
  const journeyLineScaleX = useSpring(journeyScrollProgress, { stiffness: 80, damping: 25, restDelta: 0.001 });

  // Monitor journeyScrollProgress changes to activate step indicators
  useEffect(() => {
    return journeyScrollProgress.onChange((val) => {
      setJourneyProgress(val);
    });
  }, [journeyScrollProgress]);

  // Web Audio UI click synthesizer
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.06);
      
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Audio play block:', e);
    }
  };

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

  // Track scroll activities
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  const handleStartWorkspace = () => {
    playClickSound();
    onStart();
  };

  const handleScrollTo = (id: string) => {
    playClickSound();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeIndex = sections.findIndex(s => s.id === activeSection);
  const activeStepText = activeIndex >= 0 ? `${activeIndex + 1} / ${sections.length}` : `1 / ${sections.length}`;

  // Cinematic Scroll System: background opacity triggers
  const greenOpacity = activeSection === 'hero' ? 0.8 : activeSection === 'journey' ? 0.35 : activeSection === 'get-started' ? 1.0 : 0;
  const blueOpacity = activeSection === 'copilot' ? 0.85 : 0;
  const graphiteOpacity = (activeSection === 'interactive-showcase' || activeSection === 'comparison' || activeSection === 'testimonials' || activeSection === 'faq') ? 0.75 : 0.25;
  const securityOpacity = activeSection === 'security' ? 0.45 : 0;

  const faqs = [
    {
      q: "Is my financial data safe with TaxSense?",
      a: "Yes. TaxSense uses local-first processing. If you use Guest Mode, your uploaded Form 16 documents are parsed in memory, encrypted locally, and are never saved on any database. For authenticated users, data is encrypted end-to-end and stored in your private secure vault."
    },
    {
      q: "Do I need to sign up to use the tool?",
      a: "No. You can click 'Start Guest Session' and experience the complete Form 16 extraction, regime optimization comparison, and AI chat assistant instantly without providing a name or email."
    },
    {
      q: "How accurate is the AI tax parser?",
      a: "Extremely accurate. Powered by the latest Gemini model context engines, it extracts all standard structural fields (Salary under Section 17(1), standard deductions, Chapter VI-A deductions, and TDS under Section 192) and cross-verifies sums mathematically."
    },
    {
      q: "Can I download my finalized ITR details?",
      a: "Yes. You can export a beautifully formatted PDF return guide or a clean raw JSON payload of the extracted tax parameters at any stage of the workflow."
    }
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-[#F6F7F8] font-sans antialiased selection:bg-[#16E27A] selection:text-[#050607] overflow-x-hidden relative">
      
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
      `}</style>

      {/* Viewport Edge Vignette for cinematic layout depth */}
      <div className="pointer-events-none fixed inset-0 z-40 shadow-[inset_0_0_100px_rgba(0,0,0,0.85)]" />

      {/* Blueprint Grid Background Overlay (~1% opacity, 100px grid size, static to prevent scroll repaint) */}
      <div 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.007) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.007) 1px, transparent 1px)', 
          backgroundSize: '100px 100px'
        }} 
        className="absolute inset-0 z-0 pointer-events-none" 
      />

      {/* Engineering Dot Matrix Grid Overlay (24px spacing, 1% opacity) */}
      <div 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1.2px, transparent 0)', 
          backgroundSize: '24px 24px',
        }} 
        className="absolute inset-0 z-0 pointer-events-none opacity-20" 
      />

      {/* LEFT SCROLL JOURNEY RAIL (Desktop only) */}
      <div className="fixed left-12 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4 select-none">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          {activeStepText}
        </span>
        
        <div className="h-[280px] w-[2px] bg-gradient-to-b from-white/[0.02] via-white/[0.06] to-white/[0.02] relative flex flex-col justify-between items-center py-2">
          {/* Dynamic Fill line with vertical gradient and lower opacity */}
          <motion.div 
            style={{ scaleY }} 
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#16E27A]/75 to-[#16E27A] origin-top h-full w-full opacity-60" 
          />
          
          {sections.map((s, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            
            return (
              <div 
                key={s.id}
                onMouseEnter={() => setHoveredDot(s.id)}
                onMouseLeave={() => setHoveredDot(null)}
                onClick={() => handleScrollTo(s.id)}
                className="relative flex items-center justify-center w-6 h-6 cursor-pointer"
              >
                <motion.div 
                  className={`rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'w-2.5 h-2.5 bg-[#16E27A] shadow-[0_0_8px_rgba(22,226,122,0.6)] border border-slate-950 z-20' 
                      : isCompleted 
                        ? 'w-2 h-2 bg-[#16E27A] z-20' 
                        : 'w-2 h-2 bg-slate-755 hover:bg-slate-500 z-20'
                  }`}
                  animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
                  transition={isActive ? { repeat: Infinity, duration: 3.5, ease: "easeInOut" } : {}}
                />

                {/* Pulsing outer ring with soft outer glow for active dot */}
                {isActive && (
                  <motion.span 
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    className="absolute w-5 h-5 rounded-full border border-[#16E27A]/30 pointer-events-none" 
                  />
                )}

                <AnimatePresence>
                  {hoveredDot === s.id && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute left-8 px-2.5 py-1 bg-[#0E131B] border border-white/[0.06] text-white text-[9px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap shadow-xl"
                    >
                      {s.label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        
        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
          Filing Journey
        </span>
      </div>

      {/* 2% Opacity Film Grain Overlay */}
      <div className="cinematic-noise pointer-events-none fixed inset-0 z-50 opacity-[0.02] mix-blend-overlay" />

      {/* Cinematic Scroll System: cross-fading light channels (Looping slowly over 80-100s) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* CHANNEL 1: GREEN GLOWS (Hero / Journey / Final CTA) */}
        <motion.div
          animate={{ opacity: greenOpacity }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
        >
          <motion.div 
            animate={{
              x: [0, 60, -40, 0],
              y: [0, -80, 50, 0],
              scale: [1, 1.15, 0.9, 1]
            }}
            transition={{ duration: 90, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: 'radial-gradient(circle, rgba(22, 226, 122, 0.07) 0%, transparent 70%)' }}
            className="absolute top-[25%] left-[45%] w-[850px] h-[450px]" 
          />
          <motion.div 
            animate={{
              x: [0, -50, 40, 0],
              y: [0, 60, -60, 0],
              scale: [1, 0.9, 1.1, 1]
            }}
            transition={{ duration: 80, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: 'radial-gradient(ellipse at center, rgba(22, 226, 122, 0.03) 0%, rgba(5, 150, 105, 0.01) 50%, transparent 80%)' }}
            className="absolute -top-[12%] left-[8%] w-[900px] h-[650px]" 
          />
          <motion.div 
            animate={{
              x: [0, 40, -30, 0],
              y: [0, -50, 30, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ duration: 95, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: 'radial-gradient(ellipse at center, rgba(5, 150, 105, 0.04) 0%, rgba(22, 226, 122, 0.01) 45%, transparent 75%)' }}
            className="absolute top-[40%] -right-[15%] w-[950px] h-[750px]" 
          />
        </motion.div>

        {/* CHANNEL 2: COOL BLUE GLOWS (Copilot context) */}
        <motion.div
          animate={{ opacity: blueOpacity }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
        >
          <motion.div 
            animate={{
              x: [0, -30, 50, 0],
              y: [0, 60, -40, 0],
              scale: [1, 1.1, 0.9, 1]
            }}
            transition={{ duration: 85, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)' }}
            className="absolute top-[35%] left-[30%] w-[900px] h-[500px]" 
          />
          <motion.div 
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -50, 30, 0],
              scale: [1, 0.95, 1.05, 1]
            }}
            transition={{ duration: 80, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: 'radial-gradient(ellipse at center, rgba(29, 78, 216, 0.04) 0%, transparent 70%)' }}
            className="absolute top-[50%] right-[10%] w-[850px] h-[600px]" 
          />
        </motion.div>

        {/* CHANNEL 3: GRAPHITE / SURFACE MONOCHROME GLOWS (Showcase / Comparison) */}
        <motion.div
          animate={{ opacity: graphiteOpacity }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
        >
          <motion.div 
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0]
            }}
            transition={{ duration: 100, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 0.015) 0%, transparent 70%)' }}
            className="absolute top-[20%] left-[20%] w-[700px] h-[500px]" 
          />
          <motion.div 
            style={{ background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.01) 0%, transparent 60%)' }}
            className="absolute top-[60%] right-[25%] w-[800px] h-[550px]" 
          />
        </motion.div>

        {/* CHANNEL 4: SECURITY DEEP CALM VEIL */}
        <motion.div
          animate={{ opacity: securityOpacity }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 bg-[#050607]/45 pointer-events-none z-[1]"
        />
      </div>

      {/* HEADER NAVBAR (Dynamic transparency and blur based on scroll offset) */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className={`sticky top-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between border-b transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#020202]/75 border-white/[0.06] backdrop-blur-xl shadow-lg shadow-black/20' 
            : 'bg-[#020202]/30 border-white/[0.03] backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#16E27A] flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-[#16E27A]/15">
            <svg className="w-4.5 h-4.5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="13" x2="15" y2="13"></line>
              <line x1="9" y1="17" x2="13" y2="17"></line>
            </svg>
          </div>
          <span className="text-sm font-black tracking-wider uppercase text-white select-none">
            Tax<span className="text-[#16E27A]">Sense</span>
          </span>
          {/* Animated network operational latency badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-[8px] font-bold text-emerald-400 uppercase tracking-widest ml-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
            </span>
            <span>24ms API</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleStartWorkspace}
            className="px-4 py-1.5 bg-[#16E27A] hover:bg-[#5BEAA5] text-[#050607] font-black text-xs rounded-full transition-all cursor-pointer shadow-md shadow-[#16E27A]/10 active:scale-95 border border-transparent"
          >
            Get started
          </button>
        </div>
      </motion.header>

      {/* SECTION 1: HERO */}
      <section 
        ref={heroRef} 
        id="hero" 
        onMouseMove={handleHeroMouseMove}
        className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-36 max-w-5xl mx-auto z-10"
      >
        {/* Floating Ambient Particles Layer (12 drifting elements) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(12)].map((_, i) => {
            const delay = i * 1.5;
            const size = (i % 3) + 2.5; // 2.5px to 4.5px
            const left = (i * 9.1) % 100;
            const duration = 12 + (i % 5) * 2;
            return (
              <div
                key={i}
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: i % 2 === 0 ? '#16E27A' : '#3B82F6',
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  bottom: '20px',
                }}
                className="absolute rounded-full animate-drift opacity-0"
              />
            );
          })}
        </div>

        {/* Soft dynamic cursor-following background spotlight behind the mockup container */}
        <motion.div 
          style={{
            x: heroCoords.x,
            y: heroCoords.y,
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,226,122,0.045)_0%,transparent_60%)] pointer-events-none z-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 z-10"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16E27A]/10 border border-[#16E27A]/25 text-[#16E27A] text-[10px] font-bold tracking-wider uppercase"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI-Driven Filing for AY 2026-27</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.05] text-white">
            <div className="overflow-hidden inline-block py-1">
              <motion.span 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                File your taxes
              </motion.span>
            </div>
            <br />
            <div className="overflow-hidden inline-block py-1">
              <motion.span 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-[#16E27A] via-[#5BEAA5] to-blue-400"
              >
                with absolute confidence.
              </motion.span>
            </div>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm sm:text-base text-[#8A96A8] max-w-xl mx-auto leading-relaxed"
          >
            Upload your Form 16 PDF. Our secure AI parses your profile, checks for claims you missed, and generates a verified tax return guide in minutes.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={handleStartWorkspace}
              className="relative overflow-hidden w-full sm:w-auto px-7 py-3.5 bg-[#16E27A] hover:bg-[#5BEAA5] text-[#050607] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#16E27A]/15 hover:shadow-[0_0_25px_rgba(22,226,122,0.35)] active:scale-97 flex items-center justify-center gap-2 group border border-transparent"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span>Start Sandbox Workspace</span>
              <ArrowRight className="w-4 h-4 text-[#050607]" />
            </button>
            <a
              href="#interactive-showcase"
              onClick={playClickSound}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] text-white border border-white/[0.05] hover:border-white/[0.1] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>See Demo Mockup</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </motion.div>
        </motion.div>

        {/* HERO MOCKUP (OLED Style Dashboard Preview with reflections and bezel depth highlights) */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ 
            opacity: 1, 
            y: [0, -2, 0],
            scale: 1 
          }}
          style={{
            scale: mockupScale,
            rotateX: mockupRotateX,
            transformPerspective: 1200
          }}
          transition={{ 
            opacity: { duration: 1.0, delay: 0.8, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
          className="mt-20 w-full max-w-4xl border border-white/[0.05] bg-[#0E131B]/80 backdrop-blur-md rounded-3xl p-3 md:p-4 shadow-[0_24px_80px_rgba(0,0,0,0.65)] relative group z-10"
        >
          {/* Reflective glass sweep reflection layer (sweeps every 30s) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.03] rounded-3xl pointer-events-none z-20" />
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 6, repeat: Infinity, repeatDelay: 24, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12 pointer-events-none z-20"
          />

          <div className="absolute inset-0 bg-gradient-to-tr from-[#16E27A]/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="w-full bg-[#050607] border border-white/[0.05] rounded-2xl overflow-hidden aspect-[16/9] flex flex-col relative">
            {/* CRT/OLED subpixel and scanlines overlay (3% opacity) */}
            <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />
            <div className="h-8 border-b border-white/[0.04] bg-[#050607] px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
              </div>
              <span className="text-[9px] font-mono text-slate-500 tracking-wider">taxsense.in/sandbox</span>
              <span className="w-10" />
            </div>
            
            <div className="flex-1 p-4 grid grid-cols-3 gap-4 text-left text-xs bg-gradient-to-b from-[#0E131B]/40 to-[#050607]">
              <div className="col-span-2 space-y-4">
                <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#16E27A] uppercase tracking-widest">ITR Ingestion Engine</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#16E27A]/10 text-[#16E27A] border border-[#16E27A]/20 transition-all font-bold">
                      {mockBadge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">Form 16 parsed successfully</h4>
                  <p className="text-[10px] text-slate-400">
                    Gross Salary of ₹8,50,000, Section 80C deductions of ₹1,50,000, and TDS of ₹15,000 verified.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Old Regime Tax</span>
                    <span className="font-mono text-slate-350 font-bold">₹54,600</span>
                  </div>
                  <div className="p-3 bg-white/[0.01] border border-[#16E27A]/15 rounded-xl text-center relative overflow-hidden">
                    <span className="text-[9px] text-[#16E27A] font-bold uppercase tracking-wider block mb-1">New Regime Tax</span>
                    <span className="font-mono text-[#16E27A] font-bold">₹36,360</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl flex flex-col justify-between">
                {/* Interactive Allowance Slider block */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">AI Optimizer</span>
                  <div className="p-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-[9px] text-blue-300">
                      <span>Sec 80D premium:</span>
                      <span className="font-mono font-bold">₹{sliderDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="25000" 
                      step="1000"
                      value={sliderDeduction}
                      onChange={(e) => {
                        playClickSound();
                        setSliderDeduction(Number(e.target.value));
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#16E27A]"
                    />
                    <div className="text-[7.5px] text-slate-550 leading-tight">
                      Slide to claim medical premiums.
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="p-2 border border-white/[0.04] rounded-lg flex items-center justify-between text-[10px]">
                    <span className="text-slate-505">Savings:</span>
                    <span className="font-mono text-[#16E27A] font-bold">
                      <AnimatedCounter value={computedSavings} prefix="₹" />
                    </span>
                  </div>
                  
                  {/* Dynamic Allowance Progress indicator */}
                  <div className="p-2 border border-white/[0.04] rounded-lg flex items-center gap-2 text-[10px]">
                    <div className="relative w-4 h-4 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" />
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#16E27A" strokeWidth="4.5" strokeDasharray={`${computedProgress}, 100`} />
                      </svg>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">Deduction: {computedProgress}%</span>
                  </div>

                  <div className="p-2 bg-[#16E27A]/10 border border-[#16E27A]/25 rounded-lg text-center text-[10px] text-[#16E27A] font-black">
                    Recommended: {mockRegime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: TRUST STRIP */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        className="border-y border-white/[0.04] bg-[#0E131B]/30 py-8 px-6 md:px-12"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="flex flex-col items-center space-y-1.5">
            <Lock className="w-4 h-4 text-[#16E27A] mb-1" />
            <span className="text-[11px] font-bold text-slate-100">Bank-level Encryption</span>
            <span className="text-[9px] text-slate-505">AES-256 local keys</span>
          </div>
          <div className="flex flex-col items-center space-y-1.5">
            <Cpu className="w-4 h-4 text-[#16E27A] mb-1" />
            <span className="text-[11px] font-bold text-slate-100">Secure AI Processing</span>
            <span className="text-[9px] text-slate-505">Private API calls</span>
          </div>
          <div className="flex flex-col items-center space-y-1.5">
            <Database className="w-4 h-4 text-[#16E27A] mb-1" />
            <span className="text-[11px] font-bold text-slate-100">Local-first Sandbox</span>
            <span className="text-[9px] text-slate-505">Runs in client memory</span>
          </div>
          <div className="flex flex-col items-center space-y-1.5">
            <Eye className="w-4 h-4 text-[#16E27A] mb-1" />
            <span className="text-[11px] font-bold text-slate-100">Privacy First</span>
            <span className="text-[9px] text-slate-505">No telemetry log sync</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col items-center space-y-1.5">
            <Globe className="w-4 h-4 text-[#16E27A] mb-1" />
            <span className="text-[11px] font-bold text-slate-100">Built for India</span>
            <span className="text-[9px] text-slate-505">Income Tax Act ready</span>
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: HOW IT WORKS (Connected to continuous scroll progress line) */}
      <section ref={journeyRef} id="journey" className="py-44 px-6 max-w-6xl mx-auto space-y-20">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-3"
        >
          <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Simplifying Taxes</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">The 4-Step Journey</h2>
          <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
            We broke down tax complexity into a structured, elegant process that you control entirely.
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-8">
          
          {/* Subtle line background track */}
          <div className="absolute top-10 left-[12%] right-[12%] h-[1.5px] bg-white/[0.04] hidden sm:block z-0 pointer-events-none" />

          {/* Continuous filling line linked directly to target container scroll */}
          <motion.div 
            style={{ scaleX: journeyLineScaleX }} 
            className="absolute top-10 left-[12%] right-[12%] h-[1.5px] bg-[#16E27A] origin-left hidden sm:block z-10 pointer-events-none" 
          />

          {[
            {
              step: "01",
              title: "Upload Document",
              desc: "Drag and drop your Form 16 PDF securely. Everything processes inside a transient local memory workspace.",
              trigger: 0
            },
            {
              step: "02",
              title: "AI Extraction",
              desc: "Gemini automatically reads and verifies salary components, standard deductions, and tax computed numbers.",
              trigger: 0.25
            },
            {
              step: "03",
              title: "Recommendations",
              desc: "Compare old vs new tax regime liability. Adjust values using interactive sliders to claim missed exemptions.",
              trigger: 0.55
            },
            {
              step: "04",
              title: "File Return",
              desc: "Check and audit final figures. Download your customized filing report and submit with single-tap accuracy.",
              trigger: 0.85
            }
          ].map((item, idx) => {
            const isStepActive = journeyProgress >= item.trigger;
            
            return (
              <PremiumCard
                key={idx}
                className={`p-6 space-y-4 text-left relative transition-all duration-350 z-15 ${
                  isStepActive ? 'border-[#16E27A]/35 bg-[#0E131B] -translate-y-1 shadow-[0_12px_45px_rgba(22,226,122,0.05)]' : 'border-white/[0.04]'
                }`}
                style={{
                  opacity: 0,
                  transform: 'translateY(30px)'
                }}
                whileInView={{
                  opacity: 1,
                  transform: 'translateY(0px)'
                }}
                viewport={{ once: true, margin: "-80px" }}
              >
                {/* Visual node indicator */}
                <div className="absolute -top-3.5 left-6 w-3 h-3 rounded-full bg-[#050607] border border-white/[0.1] flex items-center justify-center hidden sm:flex">
                  <motion.div 
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isStepActive ? 'bg-[#16E27A]' : 'bg-slate-700'}`}
                  />
                </div>

                <span className="text-2xl font-black font-mono text-[#16E27A]/20 block">{item.step}</span>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-[11px] text-[#8A96A8] leading-relaxed">{item.desc}</p>
              </PremiumCard>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: INTERACTIVE PRODUCT SHOWCASE */}
      <section id="interactive-showcase" className="py-44 border-y border-white/[0.04] bg-[#0E131B]/10 px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-3"
          >
            <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Product Interface</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Interactive Showcase</h2>
            <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
              Hover over cards on the left to highlight dynamic analysis segments inside the dashboard mockup.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-2 space-y-4">
              <PremiumCard
                onMouseEnter={() => setActiveShowcase('extraction')}
                onMouseLeave={() => setActiveShowcase(null)}
                className={`p-6 border transition-all duration-300 text-left cursor-pointer ${
                  activeShowcase === 'extraction' 
                    ? 'border-[#16E27A]/30 bg-[#0E131B] shadow-lg shadow-[#16E27A]/5' 
                    : 'border-white/[0.04] bg-[#0E131B]/40 hover:border-white/[0.08]'
                }`}
              >
                <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-wider block mb-1">Component 01</span>
                <h3 className="text-base font-bold text-white">AI Extraction Details</h3>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Real-time parsed employer metadata displaying primary entity details, ITR-1 suitability, and base salary.
                </p>
              </PremiumCard>

              <PremiumCard
                onMouseEnter={() => setActiveShowcase('regime')}
                onMouseLeave={() => setActiveShowcase(null)}
                className={`p-6 border transition-all duration-300 text-left cursor-pointer ${
                  activeShowcase === 'regime' 
                    ? 'border-blue-500/30 bg-[#0E131B] shadow-lg shadow-blue-500/5' 
                    : 'border-white/[0.04] bg-[#0E131B]/40 hover:border-white/[0.08]'
                }`}
              >
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-1">Component 02</span>
                <h3 className="text-base font-bold text-white">Regime Comparison</h3>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Dynamically evaluates the optimal path, showing saving projections between New and Old regimes.
                </p>
              </PremiumCard>

              <PremiumCard
                onMouseEnter={() => setActiveShowcase('optimization')}
                onMouseLeave={() => setActiveShowcase(null)}
                className={`p-6 border transition-all duration-300 text-left cursor-pointer ${
                  activeShowcase === 'optimization' 
                    ? 'border-amber-500/30 bg-[#0E131B] shadow-lg shadow-amber-500/5' 
                    : 'border-white/[0.04] bg-[#0E131B]/40 hover:border-white/[0.08]'
                }`}
              >
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block mb-1">Component 03</span>
                <h3 className="text-base font-bold text-white">Smart Optimization</h3>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Circular optimization percentage mapping standard allowances (80C, 80D, HRA) to underutilized opportunities.
                </p>
              </PremiumCard>
            </div>

            <div className={`lg:col-span-3 p-5 bg-[#0E131B]/60 border rounded-3xl relative overflow-hidden aspect-[4/3] flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.55)] transition-all duration-500 ${
              activeShowcase === 'extraction' ? 'border-[#16E27A]/25 shadow-[#16E27A]/3' : 
              activeShowcase === 'regime' ? 'border-blue-500/25 shadow-blue-500/3' : 
              activeShowcase === 'optimization' ? 'border-amber-500/25 shadow-amber-500/3' : 'border-white/[0.04]'
            }`}>
              {/* Bezel bezel depth layer reflections */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.025] pointer-events-none z-20" />
              
              <div className="h-6 border-b border-white/[0.04] flex items-center justify-between shrink-0 mb-4 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500/30" />
                  <span className="w-2 h-2 rounded-full bg-yellow-500/30" />
                  <span className="w-2 h-2 rounded-full bg-green-500/30" />
                </div>
                <span className="text-[8px] font-mono text-slate-500 tracking-wider">taxsense.in/interactive-showcase</span>
                <span className="w-8" />
              </div>

              <div className="flex-1 grid grid-cols-3 gap-4 text-left">
                <div className={`col-span-2 p-4 bg-[#050607]/80 border rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                  activeShowcase === 'extraction' 
                    ? 'border-[#16E27A] shadow-md shadow-[#16E27A]/5 scale-[1.01] bg-[#0E131B]/80' 
                    : activeShowcase === null ? 'border-white/[0.04]' : 'border-white/[0.02] opacity-30'
                }`}>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-[#16E27A] uppercase tracking-widest block">ITR Ingest</span>
                    <h4 className="text-xs font-bold text-white">Google India Pvt Ltd</h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed">
                      Parsed Section 17(1) salary details successfully. Suitability: ITR-1.
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.04] font-mono text-[9px]">
                    <div className="flex justify-between"><span className="text-slate-500">Gross Salary:</span><span className="text-slate-300">₹8,50,000</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">TDS Claim:</span><span className="text-[#16E27A]">₹15,000</span></div>
                  </div>
                </div>

                <div className="col-span-1 space-y-4 flex flex-col justify-between">
                  <div className={`p-4 bg-[#050607]/80 border rounded-2xl transition-all duration-300 flex-1 flex flex-col justify-between ${
                    activeShowcase === 'regime' 
                      ? 'border-blue-500 shadow-md shadow-blue-500/5 scale-[1.01] bg-[#0E131B]/80' 
                      : activeShowcase === null ? 'border-white/[0.04]' : 'border-white/[0.02] opacity-30'
                  }`}>
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-blue-450 uppercase tracking-widest block">Regime Savings</span>
                      <h4 className="text-xs font-bold text-white">New Optimal</h4>
                    </div>
                    <div className="space-y-1 text-[9px] font-mono">
                      <div className="flex justify-between"><span className="text-slate-500">Old:</span><span className="text-slate-400">₹54,600</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">New:</span><span className="text-blue-405">₹36,360</span></div>
                      <div className="pt-1.5 border-t border-white/[0.04] flex justify-between font-bold"><span className="text-white">Saves:</span><span className="text-blue-405">₹18,240</span></div>
                    </div>
                  </div>

                  <div className={`p-4 bg-[#050607]/80 border rounded-2xl transition-all duration-300 flex-1 flex flex-col justify-between ${
                    activeShowcase === 'optimization' 
                      ? 'border-amber-500 shadow-md shadow-amber-500/5 scale-[1.01] bg-[#0E131B]/80' 
                      : activeShowcase === null ? 'border-white/[0.04]' : 'border-white/[0.02] opacity-30'
                  }`}>
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest block">Smart Claims</span>
                      <h4 className="text-xs font-bold text-white">Health Score</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" />
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeDasharray="72, 100" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white">72%</div>
                      </div>
                      <span className="text-[9px] text-slate-450 leading-tight">₹1.5L of ₹2L claimed.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: WHY TAXSENSE */}
      <section id="comparison" className="py-44 px-6 max-w-5xl mx-auto space-y-20">
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-3"
        >
          <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Filing Comparison</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Standard vs TaxSense</h2>
          <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
            Traditional filing is tedious, confusing, and error-prone. TaxSense makes it simple, transparent, and fast.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PremiumCard 
            className="p-8 bg-white/[0.01] border border-white/[0.03] space-y-6 text-left opacity-70"
            style={{
              opacity: 0,
              transform: 'translateY(15px)'
            }}
            whileInView={{
              opacity: 0.7,
              transform: 'translateY(0px)'
            }}
            viewport={{ once: true }}
          >
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Traditional Filing
            </h3>
            
            <div className="space-y-4">
              <div className="border-b border-white/[0.04] pb-3 space-y-1">
                <span className="text-slate-200 font-semibold block text-xs">Hours of manual paperwork</span>
                <span className="text-[11px] text-slate-505">Cross-referencing spreadsheets and form sections manually.</span>
              </div>
              <div className="border-b border-white/[0.04] pb-3 space-y-1">
                <span className="text-slate-200 font-semibold block text-xs">Complex calculations</span>
                <span className="text-[11px] text-slate-505">Manual computations for HRA exemption limits and Section 80C.</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-200 font-semibold block text-xs">Opaque regimes</span>
                <span className="text-[11px] text-slate-505">Selecting tax regimes blindly without seeing computed differences.</span>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard 
            className="p-8 bg-[#0E131B] border border-[#16E27A]/15 space-y-6 text-left shadow-lg shadow-[#16E27A]/3 relative overflow-hidden"
            style={{
              opacity: 0,
              transform: 'translateY(15px)'
            }}
            whileInView={{
              opacity: 1,
              transform: 'translateY(0px)'
            }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 bg-[#16E27A]/10 text-[#16E27A] px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded-bl-xl border-l border-b border-[#16E27A]/20">
              Modern
            </div>
            
            <h3 className="text-base font-bold text-[#16E27A] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#16E27A]" />
              Filing with TaxSense
            </h3>
            
            <div className="space-y-4">
              <div className="border-b border-white/[0.04] pb-3 space-y-1">
                <span className="text-white font-bold block text-xs">Minutes with Secure AI</span>
                <span className="text-[11px] text-slate-400">PDF upload instantly initializes your draft worksheet.</span>
              </div>
              <div className="border-b border-white/[0.04] pb-3 space-y-1">
                <span className="text-white font-bold block text-xs">AI Verified Calculations</span>
                <span className="text-[11px] text-slate-400">Mathematical validation ensures perfect accuracy.</span>
              </div>
              <div className="space-y-1">
                <span className="text-white font-bold block text-xs">Guided Regime Optimizations</span>
                <span className="text-[11px] text-slate-400">Simulate regime differences dynamically to pay the lowest tax.</span>
              </div>
            </div>
          </PremiumCard>
        </div>
      </section>

      {/* SECTION 6: AI COPILOT SHOWCASE (Interactive prompt simulator) */}
      <section id="copilot" className="py-44 border-y border-white/[0.04] bg-[#0E131B]/10 px-6">
        <div className="max-w-4xl mx-auto space-y-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-3"
          >
            <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Conversational Assistant</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">AI Copilot Showcase</h2>
            <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
              Click preset prompt pills to ask the AI assistant tax optimization queries.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
            {promptResponses.map((p, idx) => (
              <button
                key={idx}
                disabled={isTyping}
                onClick={() => handleTriggerPrompt(idx)}
                className="px-3.5 py-1.5 bg-white/[0.02] hover:bg-[#16E27A]/10 border border-white/[0.04] hover:border-[#16E27A]/25 rounded-full text-slate-300 hover:text-[#16E27A] transition-all text-[10px] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {p.q}
              </button>
            ))}
          </div>

          <PremiumCard className="p-6 bg-[#0E131B] border border-white/[0.05] rounded-3xl space-y-6 text-left max-w-xl mx-auto">
            {/* User Turn */}
            <div className="flex gap-3 items-start flex-row-reverse">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                U
              </div>
              <div className="flex flex-col items-end max-w-[85%]">
                <div className="px-4 py-2.5 rounded-2xl bg-blue-600/90 text-white rounded-tr-none text-xs font-medium">
                  {copilotQuery}
                </div>
              </div>
            </div>

            {/* AI Turn */}
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-[#16E27A]/10 border border-[#16E27A]/25 text-[#16E27A] text-[10px] font-bold flex items-center justify-center shrink-0">
                AI
              </div>
              <div className="flex flex-col items-start max-w-[85%] space-y-2">
                <div className="px-4 py-2.5 rounded-2xl bg-[#050607] border border-white/[0.06] text-slate-300 rounded-tl-none text-xs leading-relaxed min-h-[50px]">
                  {copilotResponse}
                  {isTyping && (
                    <span className="inline-block w-1.5 h-3 bg-[#16E27A] ml-1 animate-pulse" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] bg-[#16E27A]/10 text-[#16E27A] border border-[#16E27A]/20 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                    Confidence: 99.8%
                  </span>
                  <span className="text-[8px] text-slate-500 font-bold">Verified against FY 2025-26 rules</span>
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      </section>

      {/* SECTION 7: SECURITY */}
      <section id="security" className="py-44 px-6 max-w-5xl mx-auto space-y-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3"
        >
          <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Privacy & Security</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Security Highlights</h2>
          <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
            Your financial data is private. We implement rigorous security parameters to ensure your data stays yours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <PremiumCard 
            className="p-6 space-y-3 text-left"
            style={{
              opacity: 0,
              transform: 'translateY(15px)'
            }}
            whileInView={{
              opacity: 1,
              transform: 'translateY(0px)'
            }}
            viewport={{ once: true }}
          >
            <Shield className="w-5 h-5 text-[#16E27A]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Encrypted Documents</h3>
            <p className="text-[11px] text-slate-455 leading-relaxed">
              All uploaded Form 16 documents are encrypted client-side using industry-standard AES-256 local keys.
            </p>
          </PremiumCard>
          
          <PremiumCard 
            className="p-6 space-y-3 text-left"
            style={{
              opacity: 0,
              transform: 'translateY(15px)'
            }}
            whileInView={{
              opacity: 1,
              transform: 'translateY(0px)'
            }}
            viewport={{ once: true }}
          >
            <Eye className="w-5 h-5 text-[#16E27A]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Private Local Processing</h3>
            <p className="text-[11px] text-slate-455 leading-relaxed">
              Your session is parsed locally in-memory, making guest workspaces entirely transient and secure.
            </p>
          </PremiumCard>
          
          <PremiumCard 
            className="p-6 space-y-3 text-left"
            style={{
              opacity: 0,
              transform: 'translateY(15px)'
            }}
            whileInView={{
              opacity: 1,
              transform: 'translateY(0px)'
            }}
            viewport={{ once: true }}
          >
            <Lock className="w-5 h-5 text-[#16E27A]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sandbox Isolation</h3>
            <p className="text-[11px] text-slate-455 leading-relaxed">
              Calculations run in an isolated client sandbox environment preventing unauthorized network telemetry leaks.
            </p>
          </PremiumCard>
        </div>
      </section>

      {/* SECTION 8: TESTIMONIALS */}
      <section id="testimonials" className="py-44 border-y border-white/[0.04] bg-[#0E131B]/10 px-6">
        <div className="max-w-5xl mx-auto space-y-20">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-3"
          >
            <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">User Stories</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Loved by Taxpayers</h2>
            <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
              Read how Indian salaried professionals file their returns confidently with TaxSense.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4">
            {[
              {
                text: "\"Uploading my Form 16 took less than 10 seconds. The AI parsed everything perfectly and recommended the New Regime, saving me ₹18,240.\"",
                initials: "MK",
                name: "Mohit Kumar",
                role: "Software Engineer, Bangalore",
                offsetY: "sm:translate-y-0"
              },
              {
                text: "\"TaxSense sandbox mode let me compare regimes and claims safely without registering first. Frictionless, fast, and secure.\"",
                initials: "AS",
                name: "Anjali Sharma",
                role: "Product Manager, Mumbai",
                offsetY: "sm:translate-y-4"
              },
              {
                text: "\"The AI Copilot answered my specific questions about Section 80D with confidence and backed the calculations with actual math. Unbelievably good.\"",
                initials: "RV",
                name: "Rohan Verma",
                role: "UX Researcher, Delhi",
                offsetY: "sm:-translate-y-2"
              }
            ].map((test, index) => (
              <PremiumCard 
                key={index}
                className={`p-6 space-y-4 text-left flex flex-col justify-between ${test.offsetY}`}
                style={{
                  opacity: 0,
                  transform: 'translateY(25px)'
                }}
                whileInView={{
                  opacity: 1,
                  transform: 'translateY(0px)'
                }}
                viewport={{ once: true }}
              >
                <p className="text-[11px] text-slate-300 leading-relaxed italic font-medium">
                  {test.text}
                </p>
                <div className="flex items-center gap-2.5 pt-2 border-t border-white/[0.04]">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-[9px] font-bold flex items-center justify-center">
                    {test.initials}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-white block leading-none">{test.name}</span>
                    <span className="text-[8px] text-slate-500">{test.role}</span>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: FAQ */}
      <section id="faq" className="py-44 px-6 max-w-3xl mx-auto space-y-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3"
        >
          <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Common Questions</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Frequently Asked FAQ</h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = faqOpen === index;
            return (
              <PremiumCard
                key={index}
                onClick={() => setFaqOpen(isOpen ? null : index)}
                className={`p-6 border transition-all duration-300 text-left cursor-pointer ${
                  isOpen ? 'border-[#16E27A]/30 bg-[#0E131B]' : 'border-white/[0.04] bg-[#0E131B]/40 hover:border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between text-slate-100 hover:text-white font-bold text-xs uppercase tracking-wider">
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#16E27A]' : ''}`} />
                </div>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, height: 'auto', filter: "blur(0px)" }}
                      exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden mt-3 text-[11px] text-[#8A96A8] leading-relaxed border-t border-white/[0.04] pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </PremiumCard>
            );
          })}
        </div>
      </section>

      {/* SECTION 10: FINAL CTA */}
      <section id="get-started" className="relative py-52 px-6 border-t border-white/[0.04] text-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0.3, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1.15 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#16E27A]/5 blur-[120px] rounded-full pointer-events-none" 
        />
        
        <div className="max-w-2xl mx-auto space-y-8 relative z-10">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
              Ready to file <br />
              <span className="text-[#16E27A]">with absolute confidence?</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#8A96A8] leading-relaxed max-w-sm mx-auto">
              Start a temporary guest session instantly or configure a Google account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={handleStartWorkspace}
              className="relative overflow-hidden w-full sm:w-auto px-8 py-3.5 bg-[#16E27A] hover:bg-[#5BEAA5] text-[#050607] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#16E27A]/15 hover:shadow-[0_0_25px_rgba(22,226,122,0.3)] active:scale-97 flex items-center justify-center gap-2 group border border-transparent"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span>Get started instantly</span>
              <ArrowRight className="w-4 h-4 text-[#050607]" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER ROW */}
      <footer className="border-t border-white/[0.04] bg-[#050607] pt-16 pb-12 px-6 md:px-12 text-left text-xs text-slate-550 transition-all duration-300">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/[0.04]">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Product</h4>
            <ul className="space-y-2 text-[11px] text-slate-500 font-semibold">
              <li><a href="#hero" className="hover:text-white transition-colors">Sandbox Workspace</a></li>
              <li><a href="#interactive-showcase" className="hover:text-white transition-colors">OCR Form 16 Parser</a></li>
              <li><a href="#copilot" className="hover:text-white transition-colors">AI Copilot Chat</a></li>
              <li><a href="#comparison" className="hover:text-white transition-colors">Regime Optimizations</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Security</h4>
            <ul className="space-y-2 text-[11px] text-slate-500 font-semibold">
              <li><span className="text-slate-655">AES-256 Vault Encryption</span></li>
              <li><span className="text-slate-655">Local-First Processing</span></li>
              <li><span className="text-slate-655">Private API Isolation</span></li>
              <li><span className="text-slate-655">OWASP Compliance Standards</span></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Developers</h4>
            <ul className="space-y-2 text-[11px] text-slate-500 font-semibold">
              <li><span className="text-slate-655">API Documentation</span></li>
              <li><span className="text-slate-655">GitHub Open Ingest</span></li>
              <li><span className="text-slate-655">Vercel Serverless Status</span></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Company</h4>
            <ul className="space-y-2 text-[11px] text-slate-500 font-semibold">
              <li><span className="text-slate-655">About TaxSense</span></li>
              <li><span className="text-slate-655">Privacy & Data Policy</span></li>
              <li><span className="text-slate-655">Terms of Service</span></li>
              <li><span className="text-[#16E27A] bg-[#16E27A]/10 px-1.5 py-0.5 rounded text-[9px] font-bold">Public Beta</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 flex flex-col sm:flex-row sm:justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
          <div>
            TaxSense <span className="text-slate-850 font-normal">•</span> Built for Indian taxpayers <span className="text-slate-850 font-normal">•</span> FY 2025-26
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-2 text-slate-555">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16E27A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16E27A]"></span>
              </span>
              <ShieldCheck className="w-4 h-4 text-[#16E27A]" />
              100% Secure & Private
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
