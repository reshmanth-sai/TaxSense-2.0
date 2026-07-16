import React from 'react';
import { ChevronLeft, Pin } from 'lucide-react';
import { useSidebarStore } from './useSidebarStore';

export const CollapseButton: React.FC = () => {
  const sidebarBehavior = useSidebarStore((state) => state.sidebarBehavior);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const setSidebarBehavior = useSidebarStore((state) => state.setSidebarBehavior);

  const isPinned = sidebarBehavior === 'pinned';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPinned) {
      setSidebarBehavior('pinned');
    } else {
      toggleCollapsed();
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isPinned ? "Collapse Sidebar" : "Pin Sidebar"}
      title={isPinned ? "Collapse Sidebar" : "Pin Sidebar"}
      className="w-7 h-7 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white rounded-full border border-slate-200 dark:border-white/[0.08] shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-1 focus:ring-blue-500/50 shrink-0 select-none"
    >
      {isPinned ? (
        <ChevronLeft className="w-3.5 h-3.5" />
      ) : (
        <Pin className="w-3 h-3 text-blue-400 rotate-45" />
      )}
    </button>
  );
};
