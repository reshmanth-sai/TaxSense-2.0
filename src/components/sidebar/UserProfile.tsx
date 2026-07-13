import React from 'react';
import { User, LogOut } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface UserProfileProps {
  isExpanded: boolean;
  user: any;
  incomeProfile: any;
  authMode: 'GOOGLE' | 'PAN' | 'GUEST';
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  isExpanded,
  user,
  incomeProfile,
  authMode,
  onLogout
}) => {
  const userName = user?.name || incomeProfile?.employeeName || 'Guest User';
  const userSubText = authMode === 'GUEST' ? 'Guest Mode' : (user?.email || 'PAN Profile');

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLogout();
  };

  if (isExpanded) {
    return (
      <div 
        onClick={onLogout}
        className="flex items-center justify-between gap-3 px-3 py-2.5 bg-white/[0.01] hover:bg-white/[0.04] border border-white/[0.015] hover:border-white/[0.03] rounded-xl relative select-none cursor-pointer transition-all duration-200 group/profile"
      >
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0 flex-1">
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-inner transition-transform group-hover/profile:scale-105 duration-200">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-3.5 h-3.5 text-blue-350" />
            )}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[10.5px] font-bold text-slate-200 group-hover/profile:text-white transition-colors truncate leading-tight">
              {userName}
            </span>
            <span className="text-[8.5px] text-slate-500 group-hover/profile:text-slate-400 transition-colors truncate mt-0.5 leading-none">
              {userSubText}
            </span>
          </div>
        </div>
        
        {/* Logout Trigger button */}
        <button
          onClick={handleLogoutClick}
          title="Sign Out Session"
          className="p-1.5 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-all duration-180 flex items-center justify-center shrink-0"
        >
          <LogOut className="w-3.5 h-3.5 transition-transform group-hover/profile:translate-x-0.5 duration-200" />
        </button>
      </div>
    );
  }

  // Collapsed Mode Profile Button
  return (
    <Tooltip content={`${userName} (${userSubText}) • Click to Sign Out`} visible={true}>
      <button 
        onClick={onLogout}
        className="w-full flex justify-center py-1.5 cursor-pointer focus:outline-none"
        aria-label="Sign Out Session"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0 overflow-hidden hover:bg-blue-600/20 transition-all duration-200 hover:scale-105 active:scale-95">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-blue-300" />
          )}
        </div>
      </button>
    </Tooltip>
  );
};
