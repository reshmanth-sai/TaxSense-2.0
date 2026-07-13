import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useSidebarStore } from './useSidebarStore';

export const CollapseButton: React.FC = () => {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleCollapsed();
      }}
      aria-expanded={!isCollapsed}
      aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      className="w-7 h-7 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full border border-white/[0.08] shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-1 focus:ring-blue-500/50 shrink-0 select-none"
    >
      <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${isCollapsed ? 'rotate-180' : ''}`} />
    </button>
  );
};
