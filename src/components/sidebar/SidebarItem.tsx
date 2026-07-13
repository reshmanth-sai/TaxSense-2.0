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
    <button
      onClick={handleItemClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-current={isActive ? 'page' : undefined}
      className={`w-full flex items-center justify-between group/btn relative ${
        isExpanded ? 'px-3' : 'px-0 justify-center'
      } py-2 rounded-xl text-[11.5px] font-medium transition-all duration-200 cursor-pointer select-none border border-transparent focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
        isActive 
          ? 'bg-blue-600/10 text-white font-bold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02),0_0_12px_rgba(37,99,235,0.08)]' 
          : `${isPrimary ? 'text-slate-200 font-bold' : 'text-slate-400 font-semibold'} hover:bg-white/[0.03] hover:text-slate-100`
      }`}
    >
      {/* Active Accent Bar & Glow */}
      {isActive && (
        <>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4.5 bg-blue-500 rounded-r shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </>
      )}

      {/* Icon and label block */}
      <div className={`flex items-center ${
        isExpanded ? 'gap-3 overflow-hidden min-w-0 flex-1' : 'justify-center w-full'
      }`}>
        <motion.div
          animate={{ 
            scale: isActive ? 1.05 : 1,
            filter: isActive ? 'brightness(1.15)' : 'brightness(1)'
          }}
          whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`shrink-0 flex items-center justify-center ${isActive ? 'text-blue-450' : 'text-slate-500 group-hover/btn:text-slate-200'}`}
        >
          <IconComp className="h-4.5 w-4.5" />
        </motion.div>

        {isExpanded && (
          <span className="truncate leading-none">
            {label}
          </span>
        )}
      </div>

      {/* Badges/Actions */}
      {isExpanded && (
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
          {badge && (
            <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-md font-bold tracking-wider uppercase">
              {badge}
            </span>
          )}
          {savings !== undefined && savings > 0 && (
            <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-450 px-2 py-0.5 rounded-full tracking-tighter">
              ₹{(savings / 1000).toFixed(0)}K
            </span>
          )}
          
          {/* Star Option to pin/favorite (only shown on item hover) */}
          {showFavoriteOption && (
            <button
              onClick={handleFavoriteClick}
              className={`p-0.5 rounded hover:bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-150 shrink-0 ${
                isFavorited ? 'text-amber-500 opacity-100' : 'text-slate-600 hover:text-slate-400'
              }`}
              title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Star className="w-3 h-3 fill-current" />
            </button>
          )}
        </div>
      )}
    </button>
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
