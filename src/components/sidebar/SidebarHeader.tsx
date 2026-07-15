import React, { useState, useRef, useEffect } from 'react';
import { Calculator, ChevronDown, Check, Plus, Briefcase } from 'lucide-react';
import { useSidebarStore } from './useSidebarStore';
import { CollapseButton } from './CollapseButton';

interface SidebarHeaderProps {
  isExpanded: boolean;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isExpanded }) => {
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const setWorkspace = useSidebarStore((state) => state.setWorkspace);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const workspaces = [
    { id: 'TaxSense-2.0', name: 'TaxSense-2.0', sub: 'Production' },
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
    <div className={`py-4 border-b border-white/[0.04] flex items-center relative transition-all duration-200 select-none ${
      isExpanded ? 'px-4 justify-between flex-row' : 'py-5 px-0 justify-center flex-col gap-2.5'
    }`}>
      {/* Brand logo & Workspace Switcher */}
      <div 
        ref={dropdownRef}
        className={`flex items-center ${isExpanded ? 'gap-2 overflow-hidden min-w-0 flex-1 relative' : 'justify-center w-full'}`}
      >
        {isExpanded ? (
          <div className="relative flex-1 min-w-0">
            {/* Clickable Switcher trigger */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 hover:bg-white/5 px-2 py-1.5 rounded-xl transition-all duration-180 w-full text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-6.5 h-6.5 bg-emerald-600 rounded-lg text-slate-950 font-bold shrink-0 flex items-center justify-center shadow-md shadow-emerald-500/10">
                <Calculator className="h-3.5 w-3.5 text-slate-950" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-[11px] text-slate-200 group-hover:text-white transition-colors truncate leading-tight">
                  {activeWorkspace}
                </span>
                <span className="text-[8px] text-slate-500 font-medium tracking-wider uppercase leading-none mt-0.5">
                  WORKSPACE
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-350 transition-colors shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-slate-900 border border-white/[0.08] rounded-xl shadow-2xl py-1.5 z-50 text-left backdrop-blur-md">
                <div className="px-3 py-1.5 border-b border-white/[0.04] text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
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
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors duration-150 cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-600/10 text-white font-semibold' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex flex-col text-left min-w-0">
                          <span className="truncate">{ws.name}</span>
                          <span className="text-[8px] text-slate-500 truncate mt-0.5">{ws.sub}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-white/[0.04] mt-1 pt-1">
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[10.5px] text-slate-450 hover:bg-white/5 hover:text-slate-200 transition-colors duration-150 cursor-pointer text-left"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Create new Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Collapsed logo displaying tooltip */
          <div className="relative group/logo w-full flex justify-center py-1">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg text-slate-950 font-bold shrink-0 flex items-center justify-center shadow-md shadow-emerald-500/10 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer">
              <Calculator className="h-4.5 w-4.5 text-slate-950" />
            </div>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 border border-white/[0.08] backdrop-blur-md text-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-2xl opacity-0 scale-95 group-hover/logo:opacity-100 group-hover/logo:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
              {activeWorkspace}
            </div>
          </div>
        )}
      </div>

      {/* Collapse/Minimize trigger */}
      {isExpanded && <CollapseButton />}
    </div>
  );
};
