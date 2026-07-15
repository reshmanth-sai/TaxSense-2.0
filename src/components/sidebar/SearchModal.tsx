import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LayoutDashboard, Award, ListTodo, FileUp, BrainCircuit, History, Settings, CornerDownLeft } from 'lucide-react';
import { useSidebarStore } from './useSidebarStore';

interface SearchModalProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  activeStep,
  setActiveStep,
  setIsSettingsOpen
}) => {
  const isOpen = useSidebarStore((state) => state.isSearchOpen);
  const setSearchOpen = useSidebarStore((state) => state.setSearchOpen);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchItems = [
    { label: 'Dashboard', stepNum: 11, icon: LayoutDashboard, category: 'Workspace' },
    { label: 'Optimizer', stepNum: 5, icon: Award, category: 'Workspace' },
    { label: 'Return', stepNum: 6, icon: ListTodo, category: 'Workspace' },
    { label: 'Vault', stepNum: 3, icon: FileUp, category: 'Documents' },
    { label: 'AI Chat', stepNum: 4, icon: BrainCircuit, category: 'Documents' },
    { label: 'History', stepNum: 10, icon: History, category: 'Documents' },
    { label: 'Settings', stepNum: 99, icon: Settings, category: 'Account' }
  ];

  const filteredItems = searchItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Key event listeners for Cmd+K / Ctrl+K and arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!isOpen);
      }
      
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setSearchOpen(false);
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (item: typeof searchItems[0]) => {
    if (item.stepNum === 99) {
      setIsSettingsOpen(true);
    } else {
      setActiveStep(item.stepNum);
    }
    setSearchOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 bg-[#060A10]/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="bg-slate-900 border border-white/[0.08] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[350px] font-sans"
          >
            {/* Input Row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.04]">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages, commands, or settings..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xs w-full placeholder-slate-500 font-sans"
              />
              <span className="text-[9px] bg-white/5 border border-white/[0.04] text-slate-400 px-1.5 py-0.5 rounded font-mono select-none">ESC</span>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-medium">No results found for "{query}"</div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.label}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                        isSelected 
                          ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-[0_0_12px_rgba(37,99,235,0.08)]' 
                          : 'text-slate-400 border border-transparent hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                        <span className="truncate font-semibold">{item.label}</span>
                        <span className={`text-[8.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${
                          isSelected ? 'bg-blue-500/10 text-blue-300' : 'bg-white/5 text-slate-500'
                        }`}>{item.category}</span>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center gap-1.5 text-[8.5px] text-blue-400 font-mono">
                          <span>Navigate</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
