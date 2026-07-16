import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { useSidebarStore } from './useSidebarStore';

interface SidebarItemProps {
  label: string;
  icon: React.ComponentType<any>;
  isActive: boolean;
  isExpanded: boolean;
  completed?: boolean;
  badge?: string;
  savings?: number;
  onClick: () => void;
  isPrimary?: boolean;
  showFavoriteOption?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = React.memo(({
  label,
  icon: IconComp,
  isActive,
  isExpanded,
  completed,
  badge,
  savings,
  onClick,
  isPrimary = false,
  showFavoriteOption = true
}) => {
  const favorites = useSidebarStore((state) => state.favorites);
  const toggleFavorite = useSidebarStore((state) => state.toggleFavorite);
  const trackVisit = useSidebarStore((state) => state.trackVisit);

  const isFavorited = favorites.includes(label);

  const handleItemClick = () => {
    trackVisit(label);
    onClick();
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(label);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick();
    }
  };

  const content = (
    <motion.button
      onClick={handleItemClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      animate={{
        paddingLeft: isExpanded ? 12 : 0,
        paddingRight: isExpanded ? 12 : 0
      }}
      whileHover={isExpanded ? { paddingLeft: 16 } : {}}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      className={`w-full flex items-center group/btn relative py-2.5 rounded-xl text-[11.5px] font-medium transition-all duration-200 cursor-pointer select-none border focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-emerald-500/50 ${
        isActive 
          ? 'bg-blue-600/8 text-blue-600 border-blue-500/15 dark:bg-[#16E27A]/8 dark:text-[#16E27A] dark:border-[#16E27A]/15 font-bold shadow-[0_2px_8px_rgba(37,99,235,0.02)]' 
          : `${isPrimary ? 'text-slate-700 dark:text-slate-200 font-bold' : 'text-slate-500 dark:text-slate-400 font-semibold'} border-transparent hover:bg-slate-900/5 dark:hover:bg-white/[0.025] hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-xs transition-all duration-150`
      }`}
    >
      {/* Icon and label block */}
      <div className={`flex items-center ${isExpanded ? 'gap-3 justify-start' : 'justify-center'} overflow-hidden min-w-0 flex-1`}>
        <motion.div
          animate={{ 
            scale: isActive ? 1.05 : 1,
            filter: isActive ? 'brightness(1.15)' : 'brightness(1)'
          }}
          whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`shrink-0 flex items-center justify-center ${isActive ? 'text-blue-600 dark:text-[#16E27A]' : 'text-slate-500 group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200'}`}
        >
          <IconComp className="h-4.5 w-4.5" />
        </motion.div>

        <motion.span
          initial={false}
          animate={{ 
            opacity: isExpanded ? 1 : 0,
            x: isExpanded ? 0 : -8,
            width: isExpanded ? 'auto' : 0,
            display: isExpanded ? 'inline-block' : 'none'
          }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          className="truncate leading-none overflow-hidden whitespace-nowrap text-left"
        >
          {label}
        </motion.span>
      </div>

      {/* Badges/Actions */}
      <motion.div 
        initial={false}
        animate={{ 
          opacity: isExpanded ? 1 : 0,
          width: isExpanded ? 'auto' : 0,
          display: isExpanded ? 'flex' : 'none'
        }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-1.5 shrink-0 pl-1 overflow-hidden"
      >
        {completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
        {badge && (
          <span className="text-[8px] bg-purple-500/10 text-purple-655 dark:text-purple-400 px-1.5 py-0.5 rounded-md font-bold tracking-wider uppercase shrink-0">
            {badge}
          </span>
        )}
        {savings !== undefined && savings > 0 && (
          <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded-full tracking-tighter shrink-0">
            ₹{(savings / 1000).toFixed(0)}K
          </span>
        )}
        
        {/* Star Option to pin/favorite (only shown on item hover) */}
        {showFavoriteOption && (
          <button
            onClick={handleFavoriteClick}
            className={`p-0.5 rounded hover:bg-slate-900/5 dark:hover:bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-150 shrink-0 ${
              isFavorited ? 'text-amber-500 opacity-100' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-455'
            }`}
            title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
          </button>
        )}
      </motion.div>
    </motion.button>
  );

  return (
    <Tooltip 
      content={label} 
      visible={!isExpanded} 
      badge={badge} 
      savings={savings}
    >
      {content}
    </Tooltip>
  );
});
