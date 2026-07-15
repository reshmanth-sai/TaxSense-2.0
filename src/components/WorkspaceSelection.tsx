import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  ShieldCheck, Lock, Cloud, FolderOpen, MessageSquare, ArrowRight, Check, AlertCircle, Zap, Eraser
} from 'lucide-react';

interface WorkspaceSelectionProps {
  googleGsiState: 'loading' | 'ready' | 'success' | 'failed';
  isAuthenticating: boolean;
  onLaunchSandbox: () => void;
  onGoogleSignIn: () => void;
  onBackToHome: () => void;
}

// Global Spring Settings matching V2 specifications
const SPRING_CONFIG = { type: 'spring' as const, stiffness: 220, damping: 24, mass: 0.8 };

export default function WorkspaceSelection({
  googleGsiState,
  isAuthenticating,
  onLaunchSandbox,
  onGoogleSignIn,
  onBackToHome
}: WorkspaceSelectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);

  // Mouse spotlight coordinates
  const [modalCoords, setModalCoords] = useState({ x: 0, y: 0 });
  const [modalHovered, setModalHovered] = useState(false);
  const [sandboxCoords, setSandboxCoords] = useState({ x: 0, y: 0 });
  const [sandboxHovered, setSandboxHovered] = useState(false);
  const [secureCoords, setSecureCoords] = useState({ x: 0, y: 0 });
  const [secureHovered, setSecureHovered] = useState(false);

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

  // Handle modal-wide spotlight tracking
  const handleModalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    setModalCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Handle Sandbox card mouse tracking
  const handleSandboxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSandboxCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Handle Secure Workspace card mouse tracking
  const handleSecureMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSecureCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="relative z-10 flex-1 flex flex-col min-h-screen bg-transparent overflow-hidden justify-center items-center py-20 px-4 md:px-8">
      
      {/* Vanilla CSS Keyframes inside local tag to guarantee isolated animations */}
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
      `}</style>

      {/* Edge Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.95)]" />

      {/* Background Radial Blue Glow (AI theme) */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-ai-accent/[0.015] blur-[120px] transition-opacity duration-1000" />
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
                backgroundColor: i % 2 === 0 ? 'var(--color-ai-accent)' : 'var(--color-neutral-info)',
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${22 + (i % 3) * 4}s`,
              }}
              className="absolute rounded-full animate-dust-drift opacity-0"
            />
          ))}
        </div>
      )}

      {/* Floating Entrance Navbar */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_CONFIG}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] z-50 flex items-center justify-between px-6 py-3 bg-[#0E131B]/40 border border-white/[0.04] rounded-full backdrop-blur-md shadow-lg shadow-black/20"
      >
        <div 
          onClick={onBackToHome}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          role="button"
          tabIndex={0}
          aria-label="Back to landing page"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBackToHome(); }}
        >
          <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-100 font-bold text-xs">
            T
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-white">TaxSense</span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.015] border border-white/[0.04]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ai-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ai-accent"></span>
          </span>
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Public Beta Active</span>
        </div>
      </motion.div>

      {/* Main Glass Modal */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING_CONFIG}
        onMouseMove={handleModalMouseMove}
        onMouseEnter={() => setModalHovered(true)}
        onMouseLeave={() => setModalHovered(false)}
        className={`max-w-[800px] w-full relative z-10 p-[1px] rounded-[28px] overflow-hidden transition-all duration-300 ${
          prefersReducedMotion ? '' : 'animate-modal-breathe'
        }`}
        style={{
          boxShadow: '0 30px 100px -15px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.05)'
        }}
      >
        {/* Subtle Conic Glow Border using neutral highlight */}
        <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.02),transparent_50%)]" />

        {/* Diagonal reflection sweep */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 overflow-hidden rounded-[28px] pointer-events-none z-20">
            <div className="w-[120%] h-[300%] bg-gradient-to-r from-transparent via-white/[0.015] to-transparent absolute animate-glass-sweep-diag" />
          </div>
        )}

        {/* Modal content surface wrapper */}
        <div className="relative w-full h-full rounded-[28px] p-8 md:p-12 overflow-hidden bg-slate-950/75 backdrop-blur-[12px] border border-white/[0.06] flex flex-col items-center">
          
          {/* Spotlight highlight */}
          {modalHovered && (
            <div 
              style={{
                background: `radial-gradient(350px circle at ${modalCoords.x}px ${modalCoords.y}px, rgba(255, 255, 255, 0.01), transparent 85%)`
              }}
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            />
          )}

          {/* Secure Shield emblem with micro-interaction (Moved to Neutral Info colors) */}
          <div className="relative mb-6 flex items-center justify-center">
            {/* Rotating outer ring */}
            <div className="absolute w-20 h-20 rounded-full border border-dashed border-slate-700/30 animate-spin pointer-events-none" style={{ animationDuration: '30s' }} />
            
            {/* Pulsing ring animation */}
            <AnimatePresence>
              {shieldActive && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  className="absolute w-14 h-14 rounded-full border border-slate-400/20 pointer-events-none"
                />
              )}
            </AnimatePresence>
            
            {/* Main Badge Container */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-white/[0.02] border border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative z-10 ${
              shieldActive ? 'animate-shadow-pulse-neutral' : ''
            }`}>
              <ShieldCheck className="w-6.5 h-6.5 text-slate-300 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]" aria-hidden="true" />
            </div>
          </div>

          {/* Heading and subtext */}
          <div className="text-center space-y-3 mb-10 max-w-lg relative z-10">
            <h2 className="text-3xl md:text-[36px] font-bold tracking-tight text-white leading-none">
              Start Your TaxSense Workspace
            </h2>
            <p className="text-[15px] text-slate-400 leading-relaxed max-w-md mx-auto font-medium">
              Continue instantly in a private local sandbox, or securely sync your workspace across devices.
            </p>
          </div>

          {/* Workspace Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full relative z-10 items-stretch">
            
            {/* SANDBOX CARD (Left) */}
            <div
              onMouseMove={handleSandboxMouseMove}
              onMouseEnter={() => setSandboxHovered(true)}
              onMouseLeave={() => setSandboxHovered(false)}
              onClick={onLaunchSandbox}
              role="button"
              tabIndex={0}
              aria-label="Launch Instantly in local sandbox. Best for Quick Try."
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLaunchSandbox(); }}
              className="p-8 rounded-[24px] flex flex-col justify-between text-left cursor-pointer transition-all duration-300 select-none relative overflow-hidden group"
              style={{
                background: sandboxHovered ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.008)',
                border: sandboxHovered ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.04)',
                transform: sandboxHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0px) scale(1)',
                boxShadow: sandboxHovered ? '0 12px 35px rgba(0,0,0,0.5)' : '0 8px 30px rgba(0,0,0,0.4)',
              }}
            >
              {/* Local Spotlight */}
              {sandboxHovered && (
                <div 
                  style={{
                    background: `radial-gradient(150px circle at ${sandboxCoords.x}px ${sandboxCoords.y}px, rgba(255, 255, 255, 0.03), transparent 85%)`
                  }}
                  className="absolute inset-0 pointer-events-none"
                />
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Best for Quick Try</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">Try Instantly</h3>
                  <p className="text-[13.5px] text-slate-400 leading-normal">
                    Start immediately without creating an account.
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 pt-1">
                  <div className="flex gap-3 text-left">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3.5 h-3.5 text-neutral-info group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-[12px] font-bold text-slate-200">Instant Sandbox</h4>
                      <p className="text-[10px] text-slate-400">Temporary isolated workspace</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-left">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <Lock className="w-3.5 h-3.5 text-neutral-info group-hover:rotate-12 transition-transform duration-300" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-[12px] font-bold text-slate-200">Local Processing</h4>
                      <p className="text-[10px] text-slate-400">Your documents never leave your device</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-left">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <Eraser className="w-3.5 h-3.5 text-neutral-info group-hover:translate-y-[-1.5px] transition-transform duration-300" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-[12px] font-bold text-slate-200">Auto Cleanup</h4>
                      <p className="text-[10px] text-slate-400">Session automatically expires</p>
                    </div>
                  </div>

                  {/* Warning: Session Persistence tradeoff moved inside the card */}
                  <div className="flex gap-3 text-left pt-2 border-t border-white/[0.02]">
                    <div className="w-7 h-7 rounded-lg bg-red-950/20 border border-red-900/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-[12px] font-bold text-red-300">Session Not Saved</h4>
                      <p className="text-[10px] text-slate-400">Data is lost on browser close</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Outline CTA (Option A) */}
              <div className="mt-8 flex flex-col items-center w-full">
                <button
                  type="button"
                  className="w-full h-11 rounded-xl text-[12px] tracking-wide font-bold cursor-pointer flex items-center justify-between px-5 transition-all duration-200 border border-primary-action text-primary-action bg-transparent hover:bg-primary-action/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-action focus-visible:outline-none group-active:scale-[0.96]"
                >
                  <span className="w-3.5" />
                  <span>Launch Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <span className="text-[10px] text-slate-400 font-mono mt-2.5">Ready in under 3 seconds.</span>
              </div>
            </div>

            {/* SECURE WORKSPACE CARD (Right) */}
            <div
              onMouseMove={handleSecureMouseMove}
              onMouseEnter={() => setSecureHovered(true)}
              onMouseLeave={() => setSecureHovered(false)}
              onClick={onGoogleSignIn}
              role="button"
              tabIndex={0}
              aria-label="Continue with Google cloud sync workspace. Recommended choice. Best for Long-Term."
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onGoogleSignIn(); }}
              className="p-8 rounded-[24px] flex flex-col justify-between text-left cursor-pointer transition-all duration-300 select-none relative overflow-hidden group"
              style={{
                background: secureHovered ? 'rgba(16, 185, 129, 0.025)' : 'rgba(16, 185, 129, 0.008)',
                border: '1px solid rgba(16, 185, 129, 0.25)', // Keep recommended border standing out
                transform: secureHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0px) scale(1)',
                boxShadow: secureHovered ? '0 12px 35px rgba(0,0,0,0.5), 0 0 25px rgba(16,185,129,0.15)' : '0 8px 30px rgba(0,0,0,0.4), 0 0 15px rgba(16,185,129,0.08)',
              }}
            >
              {/* Dynamic Recommended Badge (Moved to Blue AI Accent Theme) */}
              <div 
                className="absolute top-3 right-3 bg-ai-accent/10 border border-ai-accent/35 text-blue-300 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-ai-accent ${badgeActive ? 'opacity-100' : 'opacity-0'}`}></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ai-accent"></span>
                </span>
                <span>Recommended</span>
              </div>

              {/* Local Spotlight */}
              {secureHovered && (
                <div 
                  style={{
                    background: `radial-gradient(150px circle at ${secureCoords.x}px ${secureCoords.y}px, rgba(59, 130, 246, 0.035), transparent 85%)`
                  }}
                  className="absolute inset-0 pointer-events-none"
                />
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold block">Best for Long-Term</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">Continue Securely</h3>
                  <p className="text-[13.5px] text-slate-400 leading-normal">
                    Securely sync your workspace across devices.
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 pt-1">
                  <div className="flex gap-3 text-left">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <Cloud className="w-3.5 h-3.5 text-neutral-info group-hover:translate-y-[-1.5px] transition-transform duration-300" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-[12px] font-bold text-slate-200">Cloud Sync</h4>
                      <p className="text-[10px] text-slate-400">Access your workspace from any device</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-left">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-3.5 h-3.5 text-neutral-info group-hover:scale-105 transition-transform duration-300" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-[12px] font-bold text-slate-200">Secure Vault</h4>
                      <p className="text-[10px] text-slate-400">AES-256 encrypted storage</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-left">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-3.5 h-3.5 text-ai-accent group-hover:translate-y-[-1px] transition-all duration-300" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-[12px] font-bold text-slate-200">AI History</h4>
                      <p className="text-[10px] text-slate-400">Continue previous AI conversations</p>
                      {/* Surfaced Trust Signal under AI History bullet */}
                      <span className="text-[10px] text-ai-accent block font-medium mt-0.5">Never used for AI training.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solid Green Primary CTA (Option A) */}
              <div className="mt-8 flex flex-col items-center w-full">
                <button
                  type="button"
                  disabled={googleGsiState === 'loading' || googleGsiState === 'success'}
                  className={`w-full h-11 rounded-xl text-[12px] tracking-wide font-bold cursor-pointer flex items-center justify-between px-5 transition-all duration-200 select-none group-active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-primary-action focus-visible:outline-none ${
                    googleGsiState === 'success'
                      ? 'bg-[#10B981]/10 border-[#10B981]/25 text-[#34D399] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                      : googleGsiState === 'loading'
                      ? 'text-slate-500 cursor-wait bg-slate-900 border border-slate-800'
                      : 'bg-primary-action hover:bg-primary-action/90 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  }`}
                >
                  {googleGsiState === 'loading' ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="32" strokeDashoffset="8" />
                      </svg>
                      <span className="mx-auto text-[11px] font-bold">Signing you in...</span>
                      <span className="w-3.5 h-3.5" />
                    </>
                  ) : googleGsiState === 'success' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="mx-auto text-[11px] font-bold">Signed In Successfully</span>
                      <span className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      {/* Official Google G Logo */}
                      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span className="text-[12px] font-bold">Continue with Google</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
                <span className="text-[10px] text-slate-400 font-mono mt-2.5">Sync takes about 10 seconds.</span>
              </div>
            </div>

          </div>

          {/* Spacer Divider */}
          <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[1px] bg-[#10B981]/15 blur-[1.5px]" />
          </div>

          {/* Minimal Comparison Table - Reduced to non-redundant rows */}
          <div className="w-full overflow-x-auto select-none relative z-10 mb-8 max-w-2xl">
            <table className="w-full text-[11px] font-sans text-slate-400 border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="py-2 text-left font-bold text-slate-300">Workspace Feature</th>
                  <th className="py-2 text-center font-bold text-slate-300">Sandbox</th>
                  <th className="py-2 text-center font-bold text-slate-300">Secure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                <tr className="font-medium text-slate-300">
                  <td className="py-3 text-left">Continue Later (Session Saved)</td>
                  <td className="py-3 text-center text-error-indicator">❌</td>
                  <td className="py-3 text-center text-success-indicator font-bold">✅</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sequential Trust Footer Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 my-4 relative z-10">
            <div className="px-3.5 py-1.5 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white/[0.015] border border-white/[0.04] transition-all duration-300 hover:shadow-[0_0_12px_rgba(255,255,255,0.03)] hover:text-white">
              <span aria-hidden="true">🔒</span> AES-256 Encryption
            </div>
            <div className="px-3.5 py-1.5 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white/[0.015] border border-white/[0.04] transition-all duration-300 hover:shadow-[0_0_12px_rgba(255,255,255,0.03)] hover:text-white">
              <span aria-hidden="true">🛡</span> ISO 27001 Certified
            </div>
            <div className="px-3.5 py-1.5 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white/[0.015] border border-white/[0.04] transition-all duration-300 hover:shadow-[0_0_12px_rgba(255,255,255,0.03)] hover:text-white">
              <span aria-hidden="true">⚡</span> Local AI Processing
            </div>
            <div className="px-3.5 py-1.5 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white/[0.015] border border-white/[0.04] transition-all duration-300 hover:shadow-[0_0_12px_rgba(255,255,255,0.03)] hover:text-white">
              <span aria-hidden="true">☁</span> Secure Cloud Sync
            </div>
          </div>

          {/* Reassuring Privacy Statement Footer (Upgraded opacity/color to meet WCAG AA) */}
          <div className="text-[11px] text-slate-400 font-medium text-center max-w-sm mt-4 select-none relative z-10 leading-relaxed">
            Your tax documents are encrypted, processed securely, and never used to train AI models.
          </div>

        </div>
      </motion.div>
    </div>
  );
}
