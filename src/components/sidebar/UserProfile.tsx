import React from 'react';
import { User, LogOut } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { motion } from 'framer-motion';

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

  const content = (
    <div className="w-full flex items-center justify-center">
      <div 
        onClick={onLogout}
        className={`flex items-center select-none cursor-pointer transition-all duration-200 group/profile ${
          isExpanded 
            ? 'w-full px-3 py-2 bg-slate-100/30 hover:bg-slate-200/40 dark:bg-white/[0.01] dark:hover:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.015] hover:border-slate-300 dark:hover:border-white/[0.03] rounded-xl justify-between' 
            : 'w-9 h-9 mx-auto justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 shadow-sm'
        }`}
      >
        <div className={`flex items-center ${isExpanded ? 'gap-2.5 overflow-hidden min-w-0 flex-1' : 'justify-center w-full h-full'}`}>
          {/* Avatar */}
          <div className="w-6.5 h-6.5 rounded-full bg-blue-600/10 text-blue-500 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-inner transition-transform group-hover/profile:scale-105 duration-200">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            )}
          </div>
          
          {isExpanded && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, width: 'auto' }}
              transition={{ duration: 0.15 }}
              className="flex flex-col text-left min-w-0 overflow-hidden whitespace-nowrap"
            >
              <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-200 group-hover/profile:text-slate-950 dark:group-hover/profile:text-white transition-colors truncate leading-tight">
                {userName}
              </span>
              <span className="text-[8.5px] text-slate-500 dark:text-slate-400 group-hover/profile:text-slate-600 dark:group-hover/profile:text-slate-400 transition-colors truncate mt-0.5 leading-none">
                {userSubText}
              </span>
            </motion.div>
          )}
        </div>
        
        {isExpanded && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleLogoutClick}
            title="Sign Out Session"
            className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-500/10 cursor-pointer transition-all duration-180 flex items-center justify-center shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 transition-transform group-hover/profile:translate-x-0.5 duration-200" />
          </motion.button>
        )}
      </div>
    </div>
  );

  return (
    <Tooltip 
      content={`${userName} (${userSubText}) • Click to Sign Out`} 
      visible={!isExpanded}
    >
      {content}
    </Tooltip>
  );
};
