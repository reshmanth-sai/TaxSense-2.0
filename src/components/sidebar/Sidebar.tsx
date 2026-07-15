import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  LayoutDashboard, 
  Award, 
  ListTodo, 
  FileUp, 
  BrainCircuit, 
  History, 
  Settings, 
  Cpu, 
  CheckCircle, 
  AlertCircle, 
  Sun, 
  Moon, 
  Laptop
} from 'lucide-react';
import { useSidebarStore, SidebarTheme } from './useSidebarStore';
import { SidebarHeader } from './SidebarHeader';
import { SidebarItem } from './SidebarItem';
import { SidebarGroup } from './SidebarGroup';
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
  onLogout
}) => {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const sidebarBehavior = useSidebarStore((state) => state.sidebarBehavior);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const theme = useSidebarStore((state) => state.theme);
  const setTheme = useSidebarStore((state) => state.setTheme);
  const prefersReducedMotion = useReducedMotion();

  // Debounced hover state for auto_hover behavior
  const [isHoverActive, setIsHoverActive] = useState(false);
  const enterTimer = useRef<NodeJS.Timeout | null>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsHoverActive(false);
    if (enterTimer.current) clearTimeout(enterTimer.current);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, [sidebarBehavior]);

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
      }, 150);
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
      }, 350);
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

  // V2 Simplified Workflow Navigation Config (Concise Labels)
  interface NavConfigItem {
    step: number;
    icon: React.ComponentType<any>;
    isPrimary?: boolean;
    savings?: number;
    completed?: boolean;
    badge?: string;
  }

  const navigationConfig: Record<string, NavConfigItem> = {
    'Dashboard': { step: 11, icon: LayoutDashboard, isPrimary: true },
    'Optimizer': { step: 5, icon: Award, isPrimary: true, savings: taxCalculationResult.savings },
    'Return': { step: 6, icon: ListTodo, isPrimary: true },
    'Vault': { step: 3, icon: FileUp, completed: taxData.grossSalary !== 850000 || taxData.tdsDeducted !== 15000 },
    'AI Chat': { step: 4, icon: BrainCircuit, badge: 'Gemini' },
    'History': { step: 10, icon: History }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isExpandedVisual = isMobile 
    ? !isCollapsed 
    : (sidebarBehavior === 'pinned' || (sidebarBehavior === 'auto_hover' && isHoverActive));

  // Dynamic progress calculation based on workspace data and steps
  const getFilingProgress = () => {
    let percent = 20;
    let stepNum = 1;
    let label = "Upload Form 16";
    
    const docUploaded = taxData.grossSalary !== 850000 || taxData.tdsDeducted !== 15000;
    if (docUploaded) {
      percent = 40;
      stepNum = 2;
      label = "Running AI Analysis";
    }
    
    if (activeStep === 4) {
      percent = 60;
      stepNum = 3;
      label = "Checking for claims";
    } else if (activeStep === 5) {
      percent = 80;
      stepNum = 4;
      label = "Ready to generate return";
    } else if (activeStep === 6) {
      percent = 100;
      stepNum = 5;
      label = "Tax filing finalized";
    } else if (activeStep === 10 || activeStep === 11) {
      if (docUploaded) {
        percent = 100;
        stepNum = 5;
        label = "Tax filing finalized";
      }
    }
    
    return { percent, stepNum, label };
  };

  const { percent: progressPercent, stepNum: progressStepNum, label: progressLabel } = getFilingProgress();

  return (
    <>
      {/* Dynamic layout spacer - updated from 216px to 200px (V2 spec) */}
      {!isMobile && (
        <div 
          className="hidden md:block shrink-0 transition-all duration-300 ease-out" 
          style={{ width: sidebarBehavior === 'pinned' ? 200 : 56 }} 
        />
      )}

      {/* Mobile backdrop */}
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

      {/* Collapsible Sidebar panel - updated width from 216px to 200px (V2 spec) */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isExpandedVisual ? 200 : 56,
          x: isMobile && isCollapsed ? -200 : 0
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ 
          background: 'linear-gradient(180deg, rgba(16, 23, 34, 0.98) 0%, rgba(11, 17, 26, 0.99) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
        className="border-r border-white/[0.04] flex flex-col justify-between shrink-0 z-40 fixed inset-y-0 left-0 h-screen overflow-y-auto overflow-x-hidden font-sans relative"
      >
        {/* Subtle radial green lighting near workspace header */}
        {isExpandedVisual && (
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#10B981]/[0.015] to-transparent pointer-events-none z-0" />
        )}

        <div className="flex flex-col z-10 w-full">
          {/* Header & Logo Section */}
          <SidebarHeader 
            isExpanded={isExpandedVisual} 
            authMode={authMode}
            sessionTimeLeft={sessionTimeLeft}
          />

          {/* Simple Navigation List */}
          <div 
            onKeyDown={handleNavKeyDown}
            className="p-3 space-y-5 sidebar-nav-container"
          >
            {/* 1. WORKSPACE Category */}
            <SidebarGroup title="Workspace" isExpanded={isExpandedVisual}>
              <SidebarItem
                label="Dashboard"
                icon={LayoutDashboard}
                isActive={activeStep === 11}
                isExpanded={isExpandedVisual}
                onClick={() => setActiveStep(11)}
                isPrimary={true}
              />
              <SidebarItem
                label="Optimizer"
                icon={Award}
                isActive={activeStep === 5}
                isExpanded={isExpandedVisual}
                savings={taxCalculationResult.savings}
                onClick={() => setActiveStep(5)}
                isPrimary={true}
              />
              <SidebarItem
                label="Return"
                icon={ListTodo}
                isActive={activeStep === 6}
                isExpanded={isExpandedVisual}
                onClick={() => setActiveStep(6)}
                isPrimary={true}
              />
            </SidebarGroup>

            {/* Subtle Divider */}
            {isExpandedVisual && <div className="h-px bg-white/[0.03] mx-3" />}

            {/* 2. DOCUMENTS Category */}
            <SidebarGroup title="Documents" isExpanded={isExpandedVisual}>
              <SidebarItem
                label="Vault"
                icon={FileUp}
                isActive={activeStep === 3}
                isExpanded={isExpandedVisual}
                completed={taxData.grossSalary !== 850000 || taxData.tdsDeducted !== 15000}
                onClick={() => setActiveStep(3)}
              />
              <SidebarItem
                label="AI Chat"
                icon={BrainCircuit}
                isActive={activeStep === 4}
                isExpanded={isExpandedVisual}
                badge="Gemini"
                onClick={() => setActiveStep(4)}
              />
              <SidebarItem
                label="History"
                icon={History}
                isActive={activeStep === 10}
                isExpanded={isExpandedVisual}
                onClick={() => setActiveStep(10)}
              />
            </SidebarGroup>

            {/* Subtle Divider */}
            {isExpandedVisual && <div className="h-px bg-white/[0.03] mx-3" />}

            {/* 3. ACCOUNT Category */}
            <SidebarGroup title="Account" isExpanded={isExpandedVisual}>
              <SidebarItem
                label="Settings"
                icon={Settings}
                isActive={isSettingsOpen}
                isExpanded={isExpandedVisual}
                onClick={() => setIsSettingsOpen(true)}
                showFavoriteOption={false}
              />
            </SidebarGroup>

            {/* 4. Workflow Filing Progress widget (V2 replacement for Recent) */}
            {isExpandedVisual && (
              <div className="pt-2 select-none font-sans text-left space-y-2">
                <span className="text-[9px] text-slate-500/60 font-bold uppercase tracking-[0.15em] block px-3">
                  Filing Progress
                </span>
                <div className="mx-2 p-3 bg-white/[0.01] border border-white/[0.03] rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-sm">
                  <div className="absolute inset-0 bg-emerald-500/[0.005] pointer-events-none" />
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold leading-none z-10">
                    <span>{progressPercent}% Done</span>
                    <span>{progressStepNum} / 5 Steps</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden w-full z-10 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      className="h-full bg-[#10B981] rounded-full"
                    />
                  </div>
                  <div className="text-[9.5px] text-slate-550 font-semibold leading-tight z-10">
                    {progressLabel}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Sidebar Footer Section */}
        <div className="p-3 border-t border-white/[0.04] space-y-3.5 z-10 bg-transparent w-full">
          {/* AI Ingestion progress bar (rendered compact or full) */}
          {ingestionState !== 'IDLE' && (
            <div 
              title={`${backgroundStatusMessage} (${backgroundProgress}%)`}
              className={`p-3 bg-white/[0.01] border border-white/[0.015] rounded-xl transition-all ${
                isExpandedVisual ? 'space-y-2' : 'flex justify-center items-center'
              }`}
            >
              {!isExpandedVisual ? (
                <div className="relative">
                  {ingestionState === 'COMPLETED' ? (
                    <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 text-[#10B981] animate-spin" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#10B981] rounded-full animate-ping" />
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-left w-full">
                  <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-emerald-500/80">
                    <span className="flex items-center gap-1.5 font-sans">
                      {ingestionState === 'COMPLETED' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
                      ) : (
                        <Cpu className="w-3.5 h-3.5 text-[#10B981] animate-spin" /> 
                      )}
                      Form 16 Verified
                    </span>
                    <span className="font-mono text-emerald-450/90">{ingestionState === 'COMPLETED' ? '100%' : `${backgroundProgress}%`}</span>
                  </div>
                  <div className="h-[2px] w-full bg-slate-955/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#10B981]/50 rounded-full transition-all duration-300" 
                      style={{ width: `${ingestionState === 'COMPLETED' ? 100 : backgroundProgress}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Redesigned Premium Glass Guest Session Card (V2 outline/glassmorphic) */}
          {authMode === 'GUEST' && (
            !isExpandedVisual ? (
              <div className="relative group/guest-item w-full flex justify-center py-1 select-none">
                <button
                  onClick={() => setActiveStep(2)}
                  className="w-8 h-8 flex items-center justify-center bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.05] rounded-xl text-slate-400 hover:text-slate-205 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#10B981]/50"
                >
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 border border-white/[0.08] backdrop-blur-md text-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-2xl opacity-0 scale-95 group-hover/guest-item:opacity-100 group-hover/guest-item:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                  Guest Session - Click to Sign In
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/[0.01] border border-white/[0.04] shadow-[0_4px_15px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.02)] rounded-2xl flex flex-col gap-3 text-left relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/[0.005] pointer-events-none" />
                <div className="space-y-1.5 z-10 font-sans">
                  <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    Guest Session
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-medium leading-tight">
                    Private Local Workspace
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium leading-none pt-0.5">
                    Expires in <span className="font-mono text-slate-400 font-bold">{Math.floor(sessionTimeLeft / 60)} minutes</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveStep(2)}
                  className="w-full py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/20 font-bold rounded-lg text-[9px] uppercase tracking-wider cursor-pointer transition-all duration-150 text-center z-10 active:scale-[0.97]"
                >
                  Sign In
                </button>
              </div>
            )
          )}

          {/* V2 Compact Segmented Theme Switcher (Animate active bg via layoutId) */}
          {isExpandedVisual && (
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-slate-400 select-none font-sans mt-2">
              <span className="font-medium text-slate-500">Theme</span>
              <div className="flex items-center gap-0.5 bg-slate-950 border border-white/[0.04] p-0.5 rounded-full relative">
                {(['light', 'dark', 'system'] as SidebarTheme[]).map((t) => {
                  const isSelected = theme === t;
                  const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Laptop;
                  return (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      title={`Select ${t} theme`}
                      className={`w-6 h-6 rounded-full cursor-pointer flex items-center justify-center transition-all duration-150 focus:outline-none relative z-10 ${
                        isSelected ? 'text-[#10B981]' : 'text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {isSelected && (
                        <motion.div 
                          layoutId="theme-active-bg"
                          className="absolute inset-0 bg-white/10 rounded-full border border-white/5 -z-10" 
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-white/[0.015] mx-2" />

          {/* User profile footer */}
          <UserProfile
            isExpanded={isExpandedVisual}
            user={user}
            incomeProfile={incomeProfile}
            authMode={authMode}
            onLogout={onLogout}
            setActiveStep={setActiveStep}
          />
        </div>
      </motion.aside>

      {/* Ctrl+K Search Overlay */}
      <SearchModal 
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setIsSettingsOpen={setIsSettingsOpen}
      />
    </>
  );
};
