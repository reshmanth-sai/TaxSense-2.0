import React, { useState, useRef, useEffect } from 'react';
import { Calculator, ChevronDown, Check, Plus } from 'lucide-react';
import { useSidebarStore } from './useSidebarStore';
import { CollapseButton } from './CollapseButton';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarHeaderProps {
  isExpanded: boolean;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isExpanded }) => {
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const setWorkspace = useSidebarStore((state) => state.setWorkspace);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const workspaces = [
    { id: 'TaxSense', name: 'TaxSense', sub: 'Production Workspace' },
    { id: 'Sandbox-Personal', name: 'Sandbox-Personal', sub: 'Testing Environment' }
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`h-[60px] border-b border-slate-200/50 dark:border-white/[0.04] flex items-center relative transition-all duration-200 select-none ${
      isExpanded ? 'px-4 justify-between flex-row' : 'px-0 justify-center flex-col'
    }`}>
      {/* Brand logo & Workspace Switcher */}
      <div
        ref={dropdownRef}
        className={`flex items-center ${isExpanded ? 'gap-2 overflow-hidden min-w-0 flex-1 relative' : 'justify-center w-full'}`}
      >
        <div className="relative group/logo w-full flex items-center justify-center">
          {/* Clickable Switcher trigger */}
          <button
            onClick={() => isExpanded && setIsDropdownOpen(!isDropdownOpen)}
            disabled={!isExpanded}
            className={`flex items-center transition-all duration-180 text-left group focus:outline-none ${
              isExpanded 
                ? 'w-full gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 cursor-pointer' 
                : 'w-9 h-9 mx-auto justify-center rounded-xl cursor-default'
            }`}
          >
            {/* Theme responsive logo calculator box */}
            <div className={`bg-gradient-to-br from-emerald-400 to-blue-600 rounded-xl font-bold shrink-0 flex items-center justify-center shadow-md shadow-emerald-500/15 transition-transform duration-200 group-hover:scale-105 active:scale-95 ${
              isExpanded ? 'w-7 h-7' : 'w-9 h-9'
            }`}>
              <Calculator className={`${isExpanded ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'} text-white`} />
            </div>

            {isExpanded && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, width: 'auto' }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0 flex items-center overflow-hidden"
              >
                <div className="flex flex-col min-w-0 text-left">
                  <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight leading-tight">
                    TaxSense
                  </span>
                  <span className="text-[8.5px] text-slate-500 dark:text-slate-400 font-extrabold tracking-widest uppercase leading-none mt-0.5 font-mono">
                    WORKSPACE
                  </span>
                </div>
              </motion.div>
            )}
          </button>

          {/* Tooltip for collapsed logo */}
          {!isExpanded && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-white/90 dark:bg-slate-950/90 border border-slate-205 dark:border-white/[0.08] backdrop-blur-xl text-slate-900 dark:text-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-2xl opacity-0 scale-95 group-hover/logo:opacity-100 group-hover/logo:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
              {activeWorkspace}
            </div>
          )}

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isExpanded && isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="absolute top-full left-0 mt-2 w-52 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-2xl py-1.5 z-50 text-left backdrop-blur-xl"
              >
                <div className="px-3 py-1.5 border-b border-slate-200/50 dark:border-white/[0.04] text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Switch Workspace
                </div>
                <div className="py-1 space-y-0.5">
                  {workspaces.map((ws) => {
                    const isSelected = ws.id === activeWorkspace;
                    return (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setWorkspace(ws.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors duration-155 cursor-pointer ${isSelected
                            ? 'bg-blue-600/10 text-blue-600 dark:text-white font-semibold'
                            : 'text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-205'
                          }`}
                      >
                        <div className="flex flex-col text-left min-w-0">
                          <span className="truncate">{ws.name}</span>
                          <span className="text-[8px] text-slate-500 truncate mt-0.5">{ws.sub}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-slate-200/50 dark:border-white/[0.04] mt-1 pt-1">
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[10.5px] text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-205 transition-colors duration-150 cursor-pointer text-left"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Create new Workspace</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse/Minimize trigger */}
      {isExpanded && <CollapseButton />}
    </div>
  );
};
