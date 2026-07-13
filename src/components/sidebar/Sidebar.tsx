import React, { useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Laptop,
  Star,
  Clock
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
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const setSearchOpen = useSidebarStore((state) => state.setSearchOpen);
  const favorites = useSidebarStore((state) => state.favorites);
  const recentlyVisited = useSidebarStore((state) => state.recentlyVisited);
  const theme = useSidebarStore((state) => state.theme);
  const setTheme = useSidebarStore((state) => state.setTheme);

  // Responsive layout tracking
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        // Mobile starts collapsed
        setCollapsed(true);
      } else if (width < 1024) {
        // Tablet default collapsed
        setCollapsed(true);
      } else {
        // Desktop default expanded
        setCollapsed(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setCollapsed]);

  // Global key listener for Ctrl+B (toggle collapse) and Esc
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

  // Map label to matching step values and icons
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
    'Optimize': { step: 5, icon: Award, isPrimary: true, savings: taxCalculationResult.savings },
    'Tax Return': { step: 6, icon: ListTodo, isPrimary: true },
    'Document Vault': { step: 3, icon: FileUp, completed: taxData.grossSalary !== 850000 || taxData.tdsDeducted !== 15000 },
    'AI Analysis': { step: 4, icon: BrainCircuit, badge: 'Gemini' },
    'History & Archive': { step: 10, icon: History }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {!isCollapsed && (
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
          width: isCollapsed ? 56 : 216,
          // Slide completely off-screen on mobile when collapsed
          x: (typeof window !== 'undefined' && window.innerWidth < 768) && isCollapsed ? -216 : 0
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        style={{ background: 'linear-gradient(to bottom, #101722, #0B111A)' }}
        className="border-r border-white/[0.04] backdrop-blur-md flex flex-col justify-between shrink-0 z-40 fixed inset-y-0 left-0 md:relative h-screen overflow-y-auto overflow-x-hidden font-sans"
      >
        <div className="flex flex-col">
          {/* Header & Logo Section */}
          <SidebarHeader isExpanded={!isCollapsed} />

          {/* Collapsible Groups & Navigation */}
          <div 
            onKeyDown={handleNavKeyDown}
            className="p-3 space-y-3.5 sidebar-nav-container"
          >
            {/* 1. FAVORITES Section (Dynamic) */}
            {favorites.length > 0 && !isCollapsed && (
              <SidebarGroup title="Favorites" isExpanded={true}>
                {favorites.map((favLabel) => {
                  const config = navigationConfig[favLabel as keyof typeof navigationConfig];
                  if (!config) return null;
                  return (
                    <SidebarItem
                      key={`fav-${favLabel}`}
                      label={favLabel}
                      icon={config.icon}
                      isActive={activeStep === config.step}
                      isExpanded={true}
                      onClick={() => setActiveStep(config.step)}
                      savings={config.savings}
                      completed={config.completed}
                      badge={config.badge}
                      isPrimary={config.isPrimary}
                      showFavoriteOption={true}
                    />
                  );
                })}
              </SidebarGroup>
            )}

            {/* 2. MAIN Section */}
            <SidebarGroup title="Main" isExpanded={!isCollapsed}>
              <SidebarItem
                label="Dashboard"
                icon={LayoutDashboard}
                isActive={activeStep === 11}
                isExpanded={!isCollapsed}
                onClick={() => setActiveStep(11)}
                isPrimary={true}
              />
              <SidebarItem
                label="Optimize"
                icon={Award}
                isActive={activeStep === 5}
                isExpanded={!isCollapsed}
                savings={taxCalculationResult.savings}
                onClick={() => setActiveStep(5)}
                isPrimary={true}
              />
              <SidebarItem
                label="Tax Return"
                icon={ListTodo}
                isActive={activeStep === 6}
                isExpanded={!isCollapsed}
                onClick={() => setActiveStep(6)}
                isPrimary={true}
              />
            </SidebarGroup>

            {/* Divider */}
            <div className="h-px bg-white/[0.015] mx-2" />

            {/* 3. TOOLS Section */}
            <SidebarGroup title="Tools" isExpanded={!isCollapsed}>
              <SidebarItem
                label="Document Vault"
                icon={FileUp}
                isActive={activeStep === 3}
                isExpanded={!isCollapsed}
                completed={taxData.grossSalary !== 850000 || taxData.tdsDeducted !== 15000}
                onClick={() => setActiveStep(3)}
              />
              <SidebarItem
                label="AI Analysis"
                icon={BrainCircuit}
                isActive={activeStep === 4}
                isExpanded={!isCollapsed}
                badge="Gemini"
                onClick={() => setActiveStep(4)}
              />
              <SidebarItem
                label="History & Archive"
                icon={History}
                isActive={activeStep === 10}
                isExpanded={!isCollapsed}
                onClick={() => setActiveStep(10)}
              />
            </SidebarGroup>

            {/* 4. RECENT VISITED Section (Dynamic) */}
            {recentlyVisited.length > 0 && !isCollapsed && (
              <SidebarGroup title="Recent" isExpanded={true}>
                {recentlyVisited.map((recentLabel) => {
                  const config = navigationConfig[recentLabel as keyof typeof navigationConfig];
                  if (!config) return null;
                  // Don't duplicate if active or pinned
                  if (activeStep === config.step || favorites.includes(recentLabel)) return null;
                  
                  return (
                    <SidebarItem
                      key={`recent-${recentLabel}`}
                      label={recentLabel}
                      icon={config.icon}
                      isActive={false}
                      isExpanded={true}
                      onClick={() => setActiveStep(config.step)}
                      savings={config.savings}
                      completed={config.completed}
                      badge={config.badge}
                      showFavoriteOption={false}
                    />
                  );
                })}
              </SidebarGroup>
            )}
          </div>
        </div>

        {/* Sidebar Footer Section */}
        <div className="p-3 border-t border-white/[0.04] space-y-3.5">
          {/* AI Ingestion progress card */}
          {ingestionState !== 'IDLE' && (
            <div 
              title={`${backgroundStatusMessage} (${backgroundProgress}%)`}
              className={`p-3 bg-white/[0.01] border border-white/[0.015] rounded-xl transition-all ${
                !isCollapsed ? 'space-y-2' : 'flex justify-center items-center'
              }`}
            >
              {isCollapsed ? (
                <div className="relative">
                  {ingestionState === 'COMPLETED' ? (
                    <CheckCircle className="w-4 h-4 text-[#16E27A]" />
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 text-[#16E27A] animate-spin" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#16E27A] rounded-full animate-ping" />
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-left w-full">
                  <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-emerald-500/80">
                    <span className="flex items-center gap-1.5">
                      {ingestionState === 'COMPLETED' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500/80 animate-pulse" />
                      ) : (
                        <Cpu className="w-3.5 h-3.5 text-emerald-450 animate-pulse" /> 
                      )}
                      Form 16 Verified
                    </span>
                    <span className="font-mono text-emerald-450/90">{ingestionState === 'COMPLETED' ? '100%' : `${backgroundProgress}%`}</span>
                  </div>
                  <div className="h-[2px] w-full bg-slate-950/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500/40 rounded-full transition-all duration-300" 
                      style={{ width: `${ingestionState === 'COMPLETED' ? 100 : backgroundProgress}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guest Sandbox details */}
          {authMode === 'GUEST' && (
            isCollapsed ? (
              <div className="relative group/guest-item w-full flex justify-center py-1 select-none">
                <button
                  onClick={() => {
                    (window as any)._migrationRedirectStep = activeStep;
                    setActiveStep(2);
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.05] rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                >
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 border border-white/[0.08] backdrop-blur-md text-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-2xl opacity-0 scale-95 group-hover/guest-item:opacity-100 group-hover/guest-item:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                  Guest Session - Click to Sign In
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white/[0.01] border border-white/[0.015] shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)] rounded-xl space-y-2.5 text-left relative overflow-hidden flex flex-col">
                <div className="space-y-1">
                  <div className="text-[8.5px] font-bold text-slate-400/80 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                    Guest Session
                  </div>
                  <div className="text-[8.5px] text-slate-500/80 font-semibold leading-normal">
                    Temporary workspace
                  </div>
                  <div className="text-[8.5px] text-slate-500/60 font-semibold leading-none pt-0.5">
                    Expires in <span className="font-mono text-slate-400 font-bold">{Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    (window as any)._migrationRedirectStep = activeStep;
                    setActiveStep(2);
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-lg text-[8.5px] uppercase tracking-wider cursor-pointer transition-colors shadow-sm self-start"
                >
                  Sign In
                </button>
              </div>
            )
          )}

          {/* System settings and theme switcher group */}
          <div className="space-y-1">
            {/* Collapsed Group title */}
            {!isCollapsed && (
              <span className="text-[8.5px] text-slate-500/70 font-bold uppercase tracking-[0.15em] block px-3 mb-1.5 select-none">
                System
              </span>
            )}

            {/* Settings Trigger Item */}
            <SidebarItem
              label="Settings & Sandbox"
              icon={Settings}
              isActive={isSettingsOpen}
              isExpanded={!isCollapsed}
              onClick={() => setIsSettingsOpen(true)}
              showFavoriteOption={false}
            />

            {/* Dynamic Inline Theme Switcher */}
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 py-2.5 mt-1.5 bg-white/[0.01] border border-white/[0.015] rounded-xl text-[10px] text-slate-400 select-none">
                <span className="font-semibold">Interface Theme</span>
                <div className="flex items-center gap-1 bg-slate-950/40 p-0.5 border border-white/[0.03] rounded-lg">
                  {(['light', 'dark', 'system'] as SidebarTheme[]).map((t) => {
                    const isSelected = theme === t;
                    const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Laptop;
                    return (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        title={`Select ${t} theme`}
                        className={`p-1 rounded cursor-pointer transition-all duration-150 focus:outline-none ${
                          isSelected 
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/15' 
                            : 'text-slate-500 hover:text-slate-350'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.015] mx-2" />

          {/* User profile section */}
          <UserProfile
            isExpanded={!isCollapsed}
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
