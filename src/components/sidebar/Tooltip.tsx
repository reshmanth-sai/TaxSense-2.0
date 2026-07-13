import React from 'react';

interface TooltipProps {
  content: string;
  shortcut?: string;
  badge?: string;
  savings?: number;
  children: React.ReactNode;
  visible?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  shortcut, 
  badge,
  savings,
  children,
  visible = true
}) => {
  if (!visible) return <>{children}</>;

  return (
    <div className="relative group/tooltip w-full">
      {children}
      
      {/* Tooltip Content box */}
      <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 border border-white/[0.08] backdrop-blur-md text-slate-100 text-[10px] font-bold rounded-lg shadow-2xl opacity-0 scale-95 translate-x-[-4px] group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-hover/tooltip:translate-x-0 transition-all duration-180 ease-out pointer-events-none whitespace-nowrap z-50 flex items-center gap-2">
        <span className="font-semibold">{content}</span>
        
        {badge && (
          <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
            {badge}
          </span>
        )}
        
        {savings !== undefined && savings > 0 && (
          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-black">
            ₹{savings.toLocaleString('en-IN')}
          </span>
        )}
        
        {shortcut && (
          <span className="text-[8px] bg-white/10 text-slate-400 px-1 rounded font-mono">
            {shortcut}
          </span>
        )}
      </div>
    </div>
  );
};
