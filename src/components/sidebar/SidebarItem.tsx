import React from 'react';
import { motion } from 'motion/react';
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick();
    }
  };

  // Simplify AI Badge: replace "Gemini" with "AI"
  const resolvedBadge = badge === 'Gemini' ? 'AI' : badge;

  const content = (
    <button
      onClick={handleItemClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-current={isActive ? 'page' : undefined}
      className={`w-full flex items-center justify-between group/btn relative ${
        isExpanded ? 'px-3' : 'px-0 justify-center'
      } py-2 rounded-xl text-[13px] font-medium transition-all duration-[160ms] cursor-pointer select-none border border-transparent focus:outline-none focus-visible:ring-1 focus-visible:ring-[#10B981]/50 ${
        isActive 
          ? 'text-white font-bold' 
          : `${isPrimary ? 'text-slate-200' : 'text-slate-400'} hover:bg-white/[0.025] hover:text-slate-100`
      }`}
    >
      {/* Active Accent Bar & background shadow glow (Linear-style motion indicators) */}
      {isActive && (
        <>
          {/* Vertical sliding bar */}
          <motion.div 
            layoutId="sidebar-active-bar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#10B981] rounded-r shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
          {/* Subtle green ambient backing glow */}
          <motion.div 
            layoutId="sidebar-active-bg"
            className="absolute inset-0 bg-[#10B981]/[0.03] border-y border-white/[0.01] rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.02),0_0_15px_rgba(16,185,129,0.05)] -z-10"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        </>
      )}

      {/* Icon and label block */}
      <div className={`flex items-center ${
        isExpanded ? 'gap-3 overflow-hidden min-w-0 flex-1' : 'justify-center w-full'
      }`}>
        <div className={`shrink-0 flex items-center justify-center transition-colors duration-[160ms] ${
          isActive ? 'text-[#10B981]' : 'text-slate-500 group-hover/btn:text-slate-350'
        }`}>
          <IconComp className="h-4.5 w-4.5 stroke-[1.5]" />
        </div>

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
          {resolvedBadge && (
            <span className="text-[8px] bg-emerald-500/10 text-emerald-450 px-1.5 py-0.5 rounded font-bold tracking-wider uppercase">
              {resolvedBadge}
            </span>
          )}
          {savings !== undefined && savings > 0 && (
            <span className="text-[9px] font-bold bg-emerald-500/10 text-[#34D399] px-2 py-0.5 rounded-full tracking-tight">
              Save ₹{(savings / 1000).toFixed(0)}K
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
      badge={resolvedBadge} 
      savings={savings}
    >
      {content}
    </Tooltip>
  );
});
