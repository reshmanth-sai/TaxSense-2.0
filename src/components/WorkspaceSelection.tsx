import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  ShieldCheck, Lock, Cloud, FolderOpen, MessageSquare, ArrowRight, Check, Zap, Timer, Info
} from 'lucide-react';
import { useSidebarStore } from './sidebar/useSidebarStore';

interface WorkspaceSelectionProps {
  googleGsiState: 'loading' | 'ready' | 'success' | 'failed';
  isAuthenticating: boolean;
  onLaunchSandbox: () => void;
  onGoogleSignIn: () => void;
  onBackToHome: () => void;
}

// Global Spring Settings matching V2 specifications
const SPRING_CONFIG = { type: 'spring' as const, stiffness: 220, damping: 24, mass: 0.8 };

const COMPARISON_ROWS = [
  {
    feature: "Continue Later (Session Saved)",
    sandbox: false,
    secure: true,
  }
];

interface Feature {
  icon: React.ComponentType<any>;
  iconClass?: string;
  title: string;
  description: string;
  subtext?: string;
  isWarning?: boolean;
  isDividerTop?: boolean;
}

interface FeatureItemProps {
  feature: Feature;
}

// Reusable FeatureItem Component for clean architecture
function FeatureItem({ feature }: FeatureItemProps) {
  const Icon = feature.icon;
  const isWarning = feature.isWarning;
  const isAiHistory = feature.title === 'AI History';

  return (
    <div 
      className={`flex gap-3 text-left ${
        feature.isDividerTop ? 'pt-3 border-t border-slate-200/50 dark:border-white/[0.04]' : ''
      }`}
    >
      <div 
        className={`w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 ${
          isWarning 
            ? 'bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/20' 
            : 'bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]'
        }`}
      >
        <Icon 
          className={`w-3.5 h-3.5 ${
            isWarning 
              ? 'text-red-500 dark:text-[#ff7a7a]' 
              : isAiHistory
              ? 'text-violet-600 dark:text-[#8B5CF6]'
              : 'text-slate-500 dark:text-slate-400'
          } ${feature.iconClass || ''}`} 
          aria-hidden="true" 
        />
      </div>
      <div className="space-y-0.5">
        <h4 
          className={`text-[12px] font-bold ${
            isWarning ? 'text-red-650 dark:text-[#ff7a7a]' : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {feature.title}
        </h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">{feature.description}</p>
        {feature.subtext && (
          <span 
            className="text-[10px] block font-medium mt-0.5 text-violet-500 dark:text-[#9e9eff]" 
          >
            {feature.subtext}
          </span>
        )}
      </div>
    </div>
  );
}

const SANDBOX_FEATURES: Feature[] = [
  {
    icon: Zap,
    iconClass: 'group-hover:scale-110 transition-transform duration-300',
    title: 'Instant Sandbox',
    description: 'Temporary isolated workspace',
  },
  {
    icon: Lock,
    iconClass: 'group-hover:rotate-12 transition-transform duration-300',
    title: 'Local Processing',
    description: 'Your documents never leave your device',
  },
  {
    icon: Timer,
    iconClass: 'group-hover:scale-110 transition-transform duration-300',
    title: 'Auto Cleanup',
    description: 'Session automatically expires',
  },
  {
    icon: Info, // Changed to neutral info icon to reduce user anxiety
    title: 'Session Not Saved',
    description: 'Data is lost on browser close',
    isWarning: true,
    isDividerTop: true,
  }
];

const SECURE_FEATURES: Feature[] = [
  {
    icon: Cloud,
    iconClass: 'group-hover:translate-y-[-1.5px] transition-transform duration-300',
    title: 'Cloud Sync',
    description: 'Access your workspace from any device',
  },
  {
    icon: FolderOpen,
    iconClass: 'group-hover:scale-105 transition-transform duration-300',
    title: 'Secure Vault',
    description: 'AES-256 encrypted storage',
  },
  {
    icon: MessageSquare,
    iconClass: 'group-hover:translate-y-[-1px] transition-all duration-300',
    title: 'AI History',
    description: 'Continue previous AI conversations',
    subtext: 'Never used for AI training.', // Lightened purple text
  }
];

export default function WorkspaceSelection({
  googleGsiState,
  isAuthenticating,
  onLaunchSandbox,
  onGoogleSignIn,
  onBackToHome
}: WorkspaceSelectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const theme = useSidebarStore((state) => state.theme);

  // Shield pulsing and Recommended badge rings timed cycles
  const [shieldActive, setShieldActive] = useState(false);
  const [badgeActive, setBadgeActive] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    // Shield pulse every 10 seconds
    const shieldInterval = setInterval(() => {
      setShieldActive(true);
      setTimeout(() => setShieldActive(false), 2000);
    }, 10000);

    // Recommended badge pulse every 8 seconds
    const badgeInterval = setInterval(() => {
      setBadgeActive(true);
      setTimeout(() => setBadgeActive(false), 2000);
    }, 8000);

    return () => {
      clearInterval(shieldInterval);
      clearInterval(badgeInterval);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="relative z-10 flex-1 flex flex-col min-h-screen bg-transparent overflow-hidden justify-center items-center py-20 px-4 md:px-8">
      
      {/* Vanilla CSS Keyframes and Class overrides inside local tag to guarantee isolated animations and GPU rendering */}
      <style>{`
        @keyframes dust-drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.15; }
          85% { opacity: 0.15; }
          100% { transform: translateY(-120px) translateX(30px); opacity: 0; }
        }
        .animate-dust-drift {
          animation: dust-drift 24s infinite linear;
        }
        
        @keyframes glass-sweep-diag {
          0%, 85% { transform: translate(-100%, -100%) rotate(35deg); opacity: 0; }
          90% { opacity: 0.12; }
          100% { transform: translate(200%, 200%) rotate(35deg); opacity: 0; }
        }
        .animate-glass-sweep-diag {
          animation: glass-sweep-diag 20s infinite cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modal-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.002); }
        }
        .animate-modal-breathe {
          animation: modal-breathe 9s infinite ease-in-out;
        }

        @keyframes shadow-pulse-neutral {
          0%, 100% { box-shadow: 0 0 0px rgba(255, 255, 255, 0); }
          50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.1); }
        }
        .animate-shadow-pulse-neutral {
          animation: shadow-pulse-neutral 2s ease-out;
        }

        /* Responsive light/dark styled classes */
        .glass-card-sandbox {
          background: rgba(15, 23, 42, 0.015);
          border: 1px solid rgba(15, 23, 42, 0.08);
          transform: translateY(0px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dark .glass-card-sandbox {
          background: rgba(255, 255, 255, 0.008);
          border: 1px solid rgba(255, 255, 255, 0.04);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }
        .glass-card-sandbox:hover {
          background: radial-gradient(80% 120% at 50% 0%, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0) 100%), rgba(15, 23, 42, 0.02);
          border: 1px solid rgba(15, 23, 42, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.05);
        }
        .dark .glass-card-sandbox:hover {
          background: radial-gradient(80% 120% at 50% 0%, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%), rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5);
        }
        
        .glass-card-secure {
          background: rgba(37, 99, 235, 0.015);
          border: 1px solid rgba(37, 99, 235, 0.15);
          transform: translateY(0px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03), 0 0 15px rgba(37, 99, 235, 0.03);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dark .glass-card-secure {
          background: rgba(37, 99, 235, 0.008);
          border: 1px solid rgba(37, 99, 235, 0.15);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(37, 99, 235, 0.08);
        }
        .glass-card-secure:hover {
          background: radial-gradient(80% 120% at 50% 0%, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 100%), rgba(37, 99, 235, 0.025);
          border: 1px solid rgba(37, 99, 235, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.06), 0 0 15px rgba(37,99,235,0.12), 0 0 50px rgba(37,99,235,0.05);
        }
        .dark .glass-card-secure:hover {
          background: radial-gradient(80% 120% at 50% 0%, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 100%), rgba(37, 99, 235, 0.025);
          border: 1px solid rgba(37, 99, 235, 0.25);
          box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 15px rgba(37,99,235,0.25), 0 0 50px rgba(37,99,235,0.1);
        }
      `}</style>

      {/* Edge Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(255,255,255,0.85)] dark:shadow-[inset_0_0_100px_rgba(0,0,0,0.95)]" />

      {/* Background Radial Purple Glow (AI theme) */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-ai-brand/[0.015] blur-[120px] transition-opacity duration-1000" />
      </div>

      {/* Floating Particles (Dust Ecosystem - Neutral & Blue theme colors) */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                left: `${(i * 11) % 100}%`,
                bottom: `${(i * 7) % 50}%`,
                width: `${(i % 2) + 2}px`,
                height: `${(i % 2) + 2}px`,
                backgroundColor: i % 2 === 0 ? 'var(--color-ai-brand)' : 'var(--color-neutral-info)',
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${22 + (i % 3) * 4}s`,
              }}
              className="absolute rounded-full animate-dust-drift opacity-0"
            />
          ))}
        </div>
      )}

      {/* Floating Entrance Navbar with blur bug fix and border bottom */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_CONFIG}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] z-50 flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-[12px] shadow-lg shadow-black/5 dark:shadow-black/20 bg-white/40 dark:bg-slate-950/75 border border-slate-200/50 dark:border-white/[0.04] border-b-slate-300/60 dark:border-b-white/[0.05]"
      >
        <div 
          onClick={onBackToHome}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-all relative -top-[3px] focus-visible:ring-2 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none rounded-[6px]"
          role="button"
          tabIndex={0}
          aria-label="Back to landing page"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBackToHome(); }}
        >
          <div className="w-6 h-6 rounded-[6px] bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-100 font-bold text-xs">
            T
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-white">TaxSense</span>
        </div>
        <div className="flex items-center justify-center gap-2 px-2.5 py-1 rounded-[8px] bg-slate-100/50 dark:bg-white/[0.015] border border-slate-200 dark:border-white/[0.04]">
          <span className="relative flex h-1.5 w-1.5 my-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
          </span>
          <span className="text-[9px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider leading-none">Public Beta Active</span>
        </div>
      </motion.div>

      {/* Premium Aesthetic: Volumetric Radial Gradient behind the cards */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none rounded-full blur-[100px] z-0" 
        style={{
          background: theme === 'light'
            ? 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, rgba(16, 185, 129, 0.01) 50%, rgba(255, 255, 255, 0) 70%)'
            : 'radial-gradient(circle, rgba(37, 99, 235, 0.10) 0%, rgba(16, 185, 129, 0.03) 50%, rgba(0, 0, 0, 0) 70%)',
        }}
      />

      {/* Main Glass Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING_CONFIG}
        className={`max-w-[800px] w-full relative z-10 p-[1px] rounded-[28px] overflow-hidden transition-all duration-300 ${
          prefersReducedMotion ? '' : 'animate-modal-breathe'
        }`}
        style={{
          boxShadow: theme === 'light'
            ? '0 30px 100px -15px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.8)'
            : '0 30px 100px -15px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.05)'
        }}
      >
        {/* Subtle Conic Glow Border using neutral highlight */}
        <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent,rgba(0,0,0,0.02),transparent_50%)] dark:bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.02),transparent_50%)]" />

        {/* Diagonal reflection sweep */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 overflow-hidden rounded-[28px] pointer-events-none z-20">
            <div className="w-[120%] h-[300%] bg-gradient-to-r from-transparent via-white/10 dark:via-white/[0.015] to-transparent absolute animate-glass-sweep-diag" />
          </div>
        )}

        {/* Modal content surface wrapper */}
        <div className="relative w-full h-full rounded-[28px] px-8 md:px-12 pb-8 md:pb-12 pt-5 md:pt-6 overflow-hidden bg-white/60 dark:bg-slate-950/75 backdrop-blur-[12px] border border-slate-200/50 dark:border-white/[0.06] flex flex-col items-center">
          
          {/* Secure Shield emblem with micro-interaction (Moved to Neutral Info colors) */}
          <div className="relative mb-6 flex items-center justify-center">
            {/* Rotating outer ring */}
            <div className="absolute w-20 h-20 rounded-full border border-dashed border-slate-300/30 dark:border-slate-700/30 animate-spin pointer-events-none" style={{ animationDuration: '30s' }} />
            
            {/* Pulsing ring animation */}
            <AnimatePresence>
              {shieldActive && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  className="absolute w-14 h-14 rounded-full border border-slate-450/20 dark:border-slate-400/20 pointer-events-none"
                />
              )}
            </AnimatePresence>
            
            {/* Main Badge Container */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative z-10 ${
              shieldActive ? 'animate-shadow-pulse-neutral' : ''
            }`}>
              <ShieldCheck className="w-6.5 h-6.5 text-slate-700 dark:text-slate-300 filter drop-shadow-[0_0_6px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]" aria-hidden="true" />
            </div>
          </div>

          {/* Heading and subtext */}
          <div className="text-center space-y-3 mb-10 max-w-lg relative z-10">
            <h1 
              style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
              className="font-bold tracking-tight text-slate-900 dark:text-white leading-tight"
            >
              Your Private AI Tax Assistant.
            </h1>
            <h2 className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto font-medium">
              Analyze documents locally with zero tracking, or sync securely across devices.
            </h2>
          </div>

          {/* Workspace Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full relative z-10 items-stretch">
            
            {/* SANDBOX CARD (Try Instantly - Stack bottom on mobile, left on desktop) */}
            <div
              onClick={onLaunchSandbox}
              role="button"
              tabIndex={0}
              aria-label="Launch Instantly in local sandbox. Best for Quick Try."
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLaunchSandbox(); }}
              className="p-8 rounded-[24px] flex flex-col justify-between text-left cursor-pointer select-none relative overflow-hidden group h-full order-2 md:order-1 focus-visible:ring-2 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none glass-card-sandbox"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold block">Best for Quick Try</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Try Instantly</h3>
                  <p className="text-[13.5px] text-slate-600 dark:text-slate-400 leading-normal">
                    Test the AI instantly in a secure, temporary session.
                  </p>
                </div>

                {/* Features (Mapped via FeatureItem) */}
                <div className="space-y-4 pt-1">
                  {SANDBOX_FEATURES.map((feature, idx) => (
                    <FeatureItem key={idx} feature={feature} />
                  ))}
                </div>
              </div>

              {/* Demoted Ghost Sandbox Button */}
              <div className="mt-8 flex flex-col items-center w-full">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunchSandbox();
                  }}
                  className="w-full h-11 rounded-xl text-[12px] tracking-wide font-bold cursor-pointer flex items-center justify-center transition-all duration-200 bg-transparent hover:bg-slate-900/5 dark:hover:bg-white/[0.05] text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none relative border border-slate-200 dark:border-slate-800"
                >
                  <span>Launch Sandbox</span>
                  <div className="absolute right-5 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-850 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all translate-y-[1px]" />
                  </div>
                </button>
                <span className="text-[10px] font-mono mt-2.5 text-slate-500 dark:text-[#a1a1aa]">Ready in under 3 seconds.</span>
              </div>
            </div>

            {/* SECURE WORKSPACE CARD (Continue Securely - Stack top on mobile, right on desktop) */}
            <div
              onClick={onGoogleSignIn}
              role="button"
              tabIndex={0}
              aria-label="Continue with Google cloud sync workspace. Recommended choice. Best for Long-Term."
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onGoogleSignIn(); }}
              className="p-8 rounded-[24px] flex flex-col justify-between text-left cursor-pointer select-none relative overflow-hidden group h-full order-1 md:order-2 focus-visible:ring-2 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none glass-card-secure"
            >
              {/* Dynamic Recommended Badge with 10% Opacity of Google CTA Blue */}
              <div 
                className="absolute top-3 right-3 border border-[#2563EB]/20 text-[#2563EB] px-3 py-1 rounded-[8px] text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                }}
              >
                <span className="relative flex h-1.5 w-1.5 my-auto">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] ${badgeActive ? 'opacity-100' : 'opacity-0'}`}></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2563EB]"></span>
                </span>
                <span>Recommended</span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold block">Best for Long-Term</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Continue Securely</h3>
                  <p className="text-[13.5px] text-slate-650 dark:text-slate-400 leading-normal">
                    Securely sync your workspace across devices.
                  </p>
                </div>

                {/* Features (Mapped via FeatureItem) */}
                <div className="space-y-4 pt-1">
                  {SECURE_FEATURES.map((feature, idx) => (
                    <FeatureItem key={idx} feature={feature} />
                  ))}
                </div>
              </div>

              {/* Solid Green Primary CTA (Optically Centered text with absolute positions) */}
              <div className="mt-8 flex flex-col items-center w-full">
                <button
                  type="button"
                  disabled={googleGsiState === 'loading' || googleGsiState === 'success'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onGoogleSignIn();
                  }}
                  className={`w-full h-11 rounded-xl text-[12px] tracking-wide font-bold cursor-pointer flex items-center justify-center transition-all duration-200 select-none group-active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none relative ${
                    googleGsiState === 'success'
                      ? 'bg-emerald-50 dark:bg-[#10B981]/10 border border-emerald-250 dark:border-[#10B981]/25 text-emerald-700 dark:text-[#34D399] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                      : googleGsiState === 'loading'
                      ? 'text-slate-500 cursor-wait bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                      : 'bg-primary-action hover:bg-primary-action/90 text-white shadow-[0_0_20px_rgba(37,99,235,0.15)] dark:shadow-[0_0_20px_rgba(37,99,235,0.25)]'
                  }`}
                >
                  {googleGsiState === 'loading' ? (
                    <>
                      <div className="absolute left-5 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 animate-spin text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="32" strokeDashoffset="8" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold">Signing you in...</span>
                    </>
                  ) : googleGsiState === 'success' ? (
                    <>
                      <div className="absolute left-5 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-[11px] font-bold">Signed In Successfully</span>
                    </>
                  ) : (
                    <>
                      {/* Official Google G Logo (Absolute Left) */}
                      <div className="absolute left-5 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                      <span className="text-[12px] font-bold">Continue with Google</span>
                      {/* Arrow Icon (Absolute Right) */}
                      <div className="absolute right-5 flex items-center justify-center">
                        <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform translate-y-[1px]" />
                      </div>
                    </>
                  )}
                </button>
                <span className="text-[10px] font-mono mt-2.5 text-slate-505 dark:text-[#a1a1aa]">Sync takes about 10 seconds.</span>
              </div>
            </div>

          </div>

          {/* Spacer Divider (Reduced margin by 50%) */}
          <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 dark:via-white/[0.08] to-transparent my-5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[1px] bg-emerald-500/15 dark:bg-[#10B981]/15 blur-[1.5px]" />
          </div>

          {/* Comparison Table / Callout Rendering */}
          {COMPARISON_ROWS.length >= 3 ? (
            <div className="w-full overflow-x-auto select-none relative z-10 mb-4 max-w-2xl">
              <table className="w-full text-[11px] font-sans text-slate-500 dark:text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/[0.04]">
                    <th className="py-2 text-left font-bold text-slate-700 dark:text-slate-300">Workspace Feature</th>
                    <th className="py-2 text-center font-bold text-slate-700 dark:text-slate-300">Sandbox</th>
                    <th className="py-2 text-center font-bold text-slate-700 dark:text-slate-300">Secure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02]">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr key={idx} className="font-medium text-slate-800 dark:text-slate-300">
                      <td className="py-3 text-left">{row.feature}</td>
                      <td className="py-3 text-center text-error-indicator">{row.sandbox ? '✅' : '❌'}</td>
                      <td className="py-3 text-center text-success-indicator font-bold">{row.secure ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-[8px] bg-slate-100/50 dark:bg-white/[0.015] border border-slate-200 dark:border-white/[0.04] text-[11px] text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-4 relative z-10 select-none">
              <Info className="w-3.5 h-3.5 text-primary-action flex-shrink-0" aria-hidden="true" />
              <span>Only Continue Securely saves your session — pick up where you left off on any device.</span>
            </div>
          )}

          {/* Sequential Trust Footer Badges (Clean Lockups without borders/backgrounds, wrapped to 2x2 on mobile) */}
          <div className="grid grid-cols-2 gap-4 md:flex md:flex-row md:flex-wrap items-center justify-center gap-y-3 gap-x-6 my-4 relative z-10 justify-items-center">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span aria-hidden="true">🔒</span> AES-256 Encryption
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span aria-hidden="true">🛡</span> ISO 27001 Certified
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span aria-hidden="true">⚡</span> Local AI Processing
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span aria-hidden="true">☁</span> Secure Cloud Sync
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
