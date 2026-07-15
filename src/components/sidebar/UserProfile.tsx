import React from 'react';
import { User, LogOut, ArrowRight } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface UserProfileProps {
  isExpanded: boolean;
  user: any;
  incomeProfile: any;
  authMode: 'GOOGLE' | 'PAN' | 'GUEST';
  onLogout: () => void;
  setActiveStep: (step: number) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  isExpanded,
  user,
  incomeProfile,
  authMode,
  onLogout,
  setActiveStep
}) => {
  const userName = user?.name || incomeProfile?.employeeName || 'Guest User';
  const isGuest = authMode === 'GUEST';
  const userSubText = isGuest ? 'Guest Workspace' : 'Secure Workspace';

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      // Direct back to authentication step 2
      setActiveStep(2);
    } else {
      onLogout();
    }
  };

  if (isExpanded) {
    return (
      <div 
        onClick={handleActionClick}
        className="flex items-center justify-between gap-2.5 py-1.5 rounded-lg select-none cursor-pointer transition-colors duration-150 group/profile"
      >
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0 flex-1">
          {/* Avatar (clean circle, minimal border) */}
          <div className="w-7 h-7 rounded-full bg-slate-900 border border-white/10 text-slate-400 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-3.5 h-3.5 stroke-[1.5]" />
            )}
          </div>
          <div className="flex flex-col text-left min-w-0 font-sans">
            <span className="text-[12px] font-semibold text-slate-350 group-hover/profile:text-slate-100 transition-colors truncate">
              {userName}
            </span>
            <span className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
              {userSubText}
            </span>
          </div>
        </div>
        
        {/* Action Link (e.g. Sign In or Sign Out) */}
        <button
          onClick={handleActionClick}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-400 transition-colors duration-150 shrink-0"
        >
          {isGuest ? (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover/profile:translate-x-0.5 duration-150" />
            </>
          ) : (
            <LogOut className="w-3.5 h-3.5 transition-transform group-hover/profile:translate-x-0.5 duration-150 text-slate-500 hover:text-red-400" />
          )}
        </button>
      </div>
    );
  }

  // Collapsed Mode
  const tooltipText = isGuest ? `${userName} (Guest) • Click to Sign In` : `${userName} (Secure) • Sign Out`;
  return (
    <Tooltip content={tooltipText} visible={true}>
      <button 
        onClick={handleActionClick}
        className="w-full flex justify-center py-1 cursor-pointer focus:outline-none"
        aria-label={isGuest ? "Sign In" : "Sign Out"}
      >
        <div className="w-7 h-7 rounded-full bg-slate-900 border border-white/10 text-slate-400 font-bold flex items-center justify-center text-[10px] shrink-0 overflow-hidden hover:bg-slate-800 transition-all duration-200 hover:scale-105 active:scale-95">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </button>
    </Tooltip>
  );
};
