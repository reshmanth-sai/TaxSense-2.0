import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ShieldCheck, Lock, Info, Clock, Terminal } from 'lucide-react';
import { CollapseButton } from './CollapseButton';

interface SidebarHeaderProps {
  isExpanded: boolean;
  authMode: 'GOOGLE' | 'PAN' | 'GUEST';
  sessionTimeLeft: number;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  isExpanded,
  authMode,
  sessionTimeLeft
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  // Status mapping
  const statusLabel = authMode === 'GUEST' ? 'Local Sandbox' : 'Secure Session';
  const connectionType = authMode === 'GUEST' ? 'Local Sandbox' : 'Secure Cloud Vault';

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} remaining`;
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`py-5 border-b border-white/[0.04] flex items-center relative select-none z-50 ${
        isExpanded ? 'px-4 justify-between flex-row' : 'px-0 justify-center flex-col gap-3.5'
      }`}
    >
      {/* Brand logo & Info Trigger */}
      <div className={`flex items-center ${isExpanded ? 'gap-3 overflow-hidden min-w-0 flex-1 relative' : 'justify-center w-full'}`}>
        {isExpanded ? (
          <div className="flex items-center gap-3 min-w-0 flex-1 relative">
            {/* Brand Logo [T] */}
            <div className="w-[30px] h-[30px] bg-[#10B981] rounded-lg text-slate-950 font-bold shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-transform duration-300 hover:scale-105">
              <span className="text-[15px] font-black tracking-tighter text-slate-950 font-sans">T</span>
            </div>
            
            {/* Text details */}
            <div className="flex flex-col min-w-0 text-left font-sans">
              <span className="font-semibold text-[15px] text-slate-200 leading-tight">
                TaxSense
              </span>
              <span className="text-[11px] text-slate-400 font-medium leading-none mt-1">
                AI Tax Workspace
              </span>
              
              {/* Workspace Live Status Badge (Cleaned to prevent truncation) */}
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-450 font-semibold tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>{statusLabel}</span>
              </div>
            </div>

            {/* Hover Popover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute top-full left-0 mt-3 w-56 bg-slate-950/95 border border-white/[0.08] backdrop-blur-[16px] rounded-2xl p-4 shadow-2xl z-50 text-left"
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2.5">
                      <div className="w-6 h-6 bg-[#10B981]/10 rounded border border-[#10B981]/20 flex items-center justify-center">
                        <Terminal className="w-3.5 h-3.5 text-[#10B981]" />
                      </div>
                      <div>
                        <div className="text-[11.5px] font-bold text-slate-100">TaxSense Sandbox</div>
                        <div className="text-[9px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Workspace Config</div>
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-2.5 text-[11px] font-sans">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> Security</span>
                        <span className="text-slate-200 font-bold">Encrypted</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-500" /> Connection</span>
                        <span className="text-slate-200 font-bold truncate max-w-[100px] text-right">{connectionType}</span>
                      </div>
                      {authMode === 'GUEST' && (
                        <div className="flex justify-between items-center text-slate-400">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> Session</span>
                          <span className="text-amber-400 font-mono font-bold">{formatSessionTime(sessionTimeLeft)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-slate-400 border-t border-white/[0.04] pt-2 mt-1">
                        <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-slate-500" /> Version</span>
                        <span className="text-slate-350 font-mono">Sandbox v2.0</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Collapsed Logo view */
          <div className="relative group/logo w-full flex justify-center py-1">
            <div className="w-[30px] h-[30px] bg-[#10B981] rounded-lg text-slate-950 font-bold shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer">
              <span className="text-[15px] font-black tracking-tighter text-slate-950 font-sans">T</span>
            </div>
            
            {/* Tooltip for collapsed view */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 border border-white/[0.08] backdrop-blur-md text-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-2xl opacity-0 scale-95 group-hover/logo:opacity-100 group-hover/logo:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
              TaxSense Workspace ({statusLabel})
            </div>
          </div>
        )}
      </div>

      {/* Circular, hover-glowing, detached Collapse button */}
      {isExpanded && (
        <div className="pl-1 relative z-25">
          <CollapseButton />
        </div>
      )}
    </div>
  );
};
