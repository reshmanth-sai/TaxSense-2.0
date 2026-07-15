import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useSidebarStore } from './useSidebarStore';

interface SidebarGroupProps {
  title: string;
  isExpanded: boolean;
  children: React.ReactNode;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({ title, isExpanded, children }) => {
  const collapsedGroups = useSidebarStore((state) => state.collapsedGroups);
  const toggleGroup = useSidebarStore((state) => state.toggleGroup);

  const isCollapsed = collapsedGroups[title] || false;
  const isOpen = !isCollapsed;

  if (!isExpanded) {
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <div className="space-y-1">
      {/* Category Toggle Row */}
      <button
        onClick={() => toggleGroup(title)}
        className="w-full flex items-center justify-between px-3 mt-2.5 mb-1.5 text-[8.5px] text-slate-500 hover:text-slate-350 font-bold uppercase tracking-[0.15em] select-none cursor-pointer focus:outline-none group/group-btn"
      >
        <span>{title}</span>
        <ChevronRight className={`w-3 h-3 text-slate-600 group-hover/group-btn:text-slate-400 transition-transform duration-200 ${
          isOpen ? 'rotate-90' : ''
        }`} />
      </button>

      {/* Collapsible Content */}
      <motion.div
        initial={false}
        animate={{ 
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden space-y-1"
      >
        <div className="pb-0.5">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
