import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <motion.button
      onClick={handleClick}
      aria-label={isPinned ? "Collapse Sidebar" : "Pin Sidebar"}
      title={isPinned ? "Collapse Sidebar" : "Pin Sidebar"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-7 h-7 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-full border border-white/[0.08] shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#10B981]/50 shrink-0 select-none"
    >
      <motion.div
        animate={{ rotate: isPinned ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="flex items-center justify-center"
      >
        <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
      </motion.div>
    </motion.button>
  );
};
