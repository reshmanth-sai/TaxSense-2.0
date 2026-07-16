import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Award,
  ListTodo,
  FileUp,
  BrainCircuit,
  History,
  Settings,
  AlertCircle,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useSidebarStore, SidebarTheme } from './useSidebarStore';
import { SidebarHeader } from './SidebarHeader';
import { SidebarItem } from './SidebarItem';
import { UserProfile } from './UserProfile';
import { SearchModal } from './SearchModal';

interface SidebarProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  taxCalculationResult: { savings: number; recommendedRegime: string };
  taxData: { grossSalary: number; tdsDeducted: number; deduction80C: number; deduction80D: number; hraExemption: number; section24b: number };
  ingestionState: string;
  backgroundStatusMessage: string;
  backgroundProgress: number;
  authMode: 'GOOGLE' | 'PAN' | 'GUEST';
  sessionTimeLeft: number;
  user: any;
  incomeProfile: any;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  onLogout: () => void;
  onGoogleSignIn: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeStep,
  setActiveStep,
  taxCalculationResult,
  taxData,
  ingestionState,
  backgroundStatusMessage,
  backgroundProgress,
  authMode,
  sessionTimeLeft,
  user,
  incomeProfile,
  isSettingsOpen,
  setIsSettingsOpen,
  onLogout,
  onGoogleSignIn
}) => {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const sidebarBehavior = useSidebarStore((state) => state.sidebarBehavior);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const theme = useSidebarStore((state) => state.theme);
  const setTheme = useSidebarStore((state) => state.setTheme);

  // Debounced hover state
  const [isHoverActive, setIsHoverActive] = useState(false);
  const enterTimer = useRef<NodeJS.Timeout | null>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Reset hover state when behavior changes
  useEffect(() => {
    setIsHoverActive(false);
    if (enterTimer.current) clearTimeout(enterTimer.current);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, [sidebarBehavior]);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (enterTimer.current) clearTimeout(enterTimer.current);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    if (sidebarBehavior !== 'auto_hover') return;

    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }

    if (!isHoverActive && !enterTimer.current) {
      enterTimer.current = setTimeout(() => {
        setIsHoverActive(true);
        enterTimer.current = null;
      }, 200); // 150-250 ms delay
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    if (sidebarBehavior !== 'auto_hover') return;

    if (enterTimer.current) {
      clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }

    if (isHoverActive && !leaveTimer.current) {
      leaveTimer.current = setTimeout(() => {
        setIsHoverActive(false);
        leaveTimer.current = null;
      }, 400); // 300-500 ms delay
    }
  };

  // Responsive layout tracking
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCollapsed(true);
      } else if (width < 1024) {
        setCollapsed(true);
      } else {
        // Desktop uses the persisted behavior setting
        if (sidebarBehavior === 'pinned') {
          setCollapsed(false);
        } else {
          setCollapsed(true);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setCollapsed, sidebarBehavior]);

  // Global key listener for Ctrl+B and Esc
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapsed();
      }

      if (e.key === 'Escape' && window.innerWidth < 768 && !isCollapsed) {
        e.preventDefault();
        setCollapsed(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [isCollapsed, toggleCollapsed, setCollapsed]);

  // Menu Keyboard navigation (Up/Down arrow key focus)
  const handleNavKeyDown = (e: React.KeyboardEvent) => {
    const active = document.activeElement;
    if (!active) return;

    const container = active.closest('.sidebar-nav-container');
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll('button, [tabIndex="0"]')
    ) as HTMLElement[];

    if (items.length === 0) return;
    const index = items.indexOf(active as HTMLElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % items.length;
      items[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + items.length) % items.length;
      items[prevIndex]?.focus();
    }
  };

  // Visual expansion state (Unifies manual collapse/expand with hover expansion)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isExpandedVisual = isMobile
    ? !isCollapsed
    : (sidebarBehavior === 'pinned' || (sidebarBehavior === 'auto_hover' && isHoverActive));

  return (
    <>
      {/* Spacer to reserve layout space on desktop and prevent layout shifts on hover */}
      {!isMobile && (
        <motion.div
          className="hidden md:block shrink-0"
          animate={{ width: sidebarBehavior === 'pinned' ? 228 : 68 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        />
      )}

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobile && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCollapsed(true)}
            className="fixed inset-0 bg-[#060A10]/70 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Collapsible Sidebar Panel */}
      <motion.aside
        initial={false}
        animate={{
          width: isExpandedVisual ? 216 : 56,
          // Slide completely off-screen on mobile when collapsed
          x: isMobile && isCollapsed ? -216 : 0
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="bg-white/8 dark:bg-slate-950/10 border border-slate-200/15 dark:border-white/[0.015] backdrop-blur-xl flex flex-col justify-between shrink-0 z-40 fixed top-3 bottom-3 left-3 h-[calc(100vh-24px)] rounded-3xl overflow-hidden font-sans shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        {/* Top Scrollable Navigation Section */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header & Logo Section */}
          <SidebarHeader isExpanded={isExpandedVisual} />

          {/* Collapsible Groups & Navigation */}
          <div 
            onKeyDown={handleNavKeyDown} 
            className={`flex-1 ${isExpandedVisual ? 'overflow-y-auto' : 'overflow-hidden'} overflow-x-hidden p-2.5 space-y-4 sidebar-nav-container scrollbar-none`}
          >
            <nav aria-label="Primary navigation" className="space-y-1">
              <motion.span
                initial={false}
                animate={{ opacity: isExpandedVisual ? 1 : 0, height: isExpandedVisual ? 'auto' : 0 }}
                transition={{ duration: 0.15 }}
                className="block px-3 pb-1 text-[8.5px] font-bold uppercase tracking-[0.16em] text-slate-500/75 overflow-hidden whitespace-nowrap"
              >
                Workspace
              </motion.span>
              <SidebarItem
                label="Dashboard"
                icon={LayoutDashboard}
                isActive={activeStep === 11}
                isExpanded={isExpandedVisual}
                onClick={() => setActiveStep(11)}
                isPrimary={true}
              />
              <SidebarItem
                label="Optimize"
                icon={Award}
                isActive={activeStep === 5}
                isExpanded={isExpandedVisual}
                savings={taxCalculationResult.savings}
                onClick={() => setActiveStep(5)}
                isPrimary={true}
              />
              <SidebarItem
                label="Tax Return"
                icon={ListTodo}
                isActive={activeStep === 6}
                isExpanded={isExpandedVisual}
                onClick={() => setActiveStep(6)}
                isPrimary={true}
              />
            </nav>

            <div className="mx-2 h-px bg-slate-200 dark:bg-white/[0.045]" />

            <nav aria-label="Tools" className="space-y-1">
              <motion.span
                initial={false}
                animate={{ opacity: isExpandedVisual ? 1 : 0, height: isExpandedVisual ? 'auto' : 0 }}
                transition={{ duration: 0.15 }}
                className="block px-3 pb-1 text-[8.5px] font-bold uppercase tracking-[0.16em] text-slate-500/75 overflow-hidden whitespace-nowrap"
              >
                Tools
              </motion.span>
              <SidebarItem
                label="Document Vault"
                icon={FileUp}
                isActive={activeStep === 3}
                isExpanded={isExpandedVisual}
                completed={taxData.grossSalary !== 850000 || taxData.tdsDeducted !== 15000}
                onClick={() => setActiveStep(3)}
              />
              <SidebarItem
                label="AI Analysis"
                icon={BrainCircuit}
                isActive={activeStep === 4}
                isExpanded={isExpandedVisual}
                badge="Gemini"
                onClick={() => setActiveStep(4)}
              />
              <SidebarItem
                label="History & Archive"
                icon={History}
                isActive={activeStep === 10}
                isExpanded={isExpandedVisual}
                onClick={() => setActiveStep(10)}
              />
            </nav>
          </div>
        </div>

        {/* Bottom Panel (Fixed in place, never cut off) */}
        <div className="p-2.5 space-y-2.5 bg-transparent shrink-0">
          {/* Guest Session Status Widget */}
          {authMode === 'GUEST' && (
            isCollapsed && !isExpandedVisual ? (
              <div className="relative group/guest-item flex justify-center py-1">
                <button
                  onClick={onGoogleSignIn}
                  className="w-8 h-8 flex items-center justify-center bg-slate-100/30 dark:bg-white/[0.01] border border-slate-200 dark:border-white/[0.03] hover:bg-slate-200/40 dark:hover:bg-white/[0.05] rounded-xl text-slate-550 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                >
                  <AlertCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] backdrop-blur-md text-slate-900 dark:text-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-2xl opacity-0 scale-95 group-hover/guest-item:opacity-100 group-hover/guest-item:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                  Guest Session - Click to Sign In
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-205 dark:border-white/[0.04] bg-slate-100/30 dark:bg-white/[0.015] px-2.5 py-2.5 text-left">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[8.5px] font-bold text-slate-500 dark:text-slate-400/80 uppercase tracking-widest leading-none">
                    Guest Session
                  </div>
                  <div className="mt-1 text-[9px] text-slate-600 dark:text-slate-505/80 font-semibold leading-none">
                    Expires in <span className="font-mono text-slate-700 dark:text-slate-400 font-bold">{Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
                <button
                  onClick={onGoogleSignIn}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-lg text-[8px] uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
                >
                  Sign In
                </button>
              </div>
            )
          )}

          {/* System settings and theme switcher group */}
          <div className="space-y-1">
            {/* Collapsed Group title */}
            <motion.span
              initial={false}
              animate={{ opacity: isExpandedVisual ? 1 : 0, height: isExpandedVisual ? 'auto' : 0 }}
              transition={{ duration: 0.15 }}
              className="text-[8.5px] text-slate-500 dark:text-slate-550 font-bold uppercase tracking-[0.15em] block px-3 mb-1.5 select-none overflow-hidden whitespace-nowrap"
            >
              System
            </motion.span>

            {/* Settings Trigger Item */}
            <SidebarItem
              label="Settings & Sandbox"
              icon={Settings}
              isActive={isSettingsOpen}
              isExpanded={isExpandedVisual}
              onClick={() => setIsSettingsOpen(true)}
              showFavoriteOption={false}
            />

            {/* Dynamic Inline Theme Switcher */}
            <motion.div
              initial={false}
              animate={{ opacity: isExpandedVisual ? 1 : 0, height: isExpandedVisual ? 'auto' : 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2.5 mt-1.5 bg-slate-100/30 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/[0.015] rounded-xl text-[10px] text-slate-650 dark:text-slate-450 select-none">
                <span className="font-semibold">Interface Theme</span>
                <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-905/40 p-0.5 border border-slate-300/50 dark:border-white/[0.03] rounded-lg">
                  {(['light', 'dark', 'system'] as SidebarTheme[]).map((t) => {
                    const isSelected = theme === t;
                    const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Laptop;
                    return (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        title={`Select ${t} theme`}
                        className={`p-1 rounded cursor-pointer transition-all duration-155 focus:outline-none ${isSelected
                            ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/15'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
                          }`}
                      >
                        <Icon className="w-3 h-3" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-250 dark:bg-white/[0.015] mx-0.5" />

          {/* User profile section */}
          <UserProfile
            isExpanded={isExpandedVisual}
            user={user}
            incomeProfile={incomeProfile}
            authMode={authMode}
            onLogout={onLogout}
          />
        </div>
      </motion.aside>

      {/* Ctrl+K Search Overlay Modal */}
      <SearchModal
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setIsSettingsOpen={setIsSettingsOpen}
      />
    </>
  );
};
