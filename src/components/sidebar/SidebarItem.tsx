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
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      className={`group/btn relative flex items-center transition-all duration-200 cursor-pointer select-none border focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-emerald-500/50 ${
        isExpanded 
          ? 'w-full h-9 px-3 gap-3 justify-start rounded-xl text-[11.5px] font-medium'
          : 'w-9 h-9 mx-auto justify-center rounded-xl text-[11.5px]'
      } ${
        isActive 
          ? 'bg-blue-600/10 text-blue-600 border-blue-500/25 dark:bg-[#16E27A]/10 dark:text-[#16E27A] dark:border-[#16E27A]/25 font-bold shadow-[0_2px_8px_rgba(37,99,235,0.06)] dark:shadow-[0_2px_8px_rgba(22,226,122,0.06)]' 
          : `${isPrimary ? 'text-slate-700 dark:text-slate-200 font-bold' : 'text-slate-500 dark:text-slate-400 font-semibold'} border-transparent hover:bg-slate-900/5 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-150`
      }`}
    >
      {/* Icon and label block */}
      <div className={`flex items-center ${isExpanded ? 'gap-3 justify-start' : 'justify-center'} overflow-hidden min-w-0 flex-1`}>
        <motion.div
          animate={{ 
            scale: isActive ? 1.05 : 1,
            filter: isActive ? 'brightness(1.15)' : 'brightness(1)'
          }}
          whileHover={{ scale: 1.08, filter: 'brightness(1.1)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`shrink-0 flex items-center justify-center ${
            isActive ? 'text-blue-600 dark:text-[#16E27A]' : 'text-slate-500 group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200'
          }`}
        >
          <IconComp className="h-4.5 w-4.5" />
        </motion.div>

        {isExpanded && (
          <motion.span
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="truncate leading-none overflow-hidden whitespace-nowrap text-left flex-1"
          >
            {label}
          </motion.span>
        )}
      </div>

      {/* Badges/Actions in Expanded Mode */}
      {isExpanded && (
        <motion.div 
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5 shrink-0 pl-1 overflow-hidden"
        >
          {completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
          {badge && (
            <span className="text-[8px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-md font-bold tracking-wider uppercase shrink-0">
              {badge}
            </span>
          )}
          {savings !== undefined && savings > 0 && (
            <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded-full tracking-tighter shrink-0">
              ₹{(savings / 1000).toFixed(0)}K
            </span>
          )}
          
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
      )}
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
