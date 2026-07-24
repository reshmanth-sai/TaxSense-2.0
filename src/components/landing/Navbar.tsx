import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, ArrowRight, ChevronDown, Menu, X, ShieldCheck } from 'lucide-react';
import { useSidebarStore } from '../sidebar/useSidebarStore';

interface NavbarProps {
  onStart: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onStart, activeSection }) => {
  const theme = useSidebarStore((state) => state.theme);
  const setTheme = useSidebarStore((state) => state.setTheme);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track window scroll for subtle glass elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScrollTo = (id: string) => {
    setIsMoreOpen(false);
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const primaryLinks = [
    { id: 'comparison', label: 'Compare' },
    { id: 'interactive-showcase', label: 'Tax Calculator' },
    { id: 'refund-finder', label: 'Refund Audit' },
    { id: 'security', label: 'Security' },
  ];

  const moreLinks = [
    { id: 'tipping-point', label: 'Tipping Point' },
    { id: 'faq', label: 'FAQ' },
    { href: 'https://github.com', label: 'GitHub', external: true },
  ];

  return (
    <div className="fixed top-11 left-1/2 -translate-x-1/2 z-40 w-full max-w-[1200px] px-4 sm:px-6 pointer-events-none select-none">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`pointer-events-auto w-full h-[68px] sm:h-[72px] px-5 sm:px-6 flex items-center justify-between rounded-[22px] transition-all duration-300 border ${
          isScrolled
            ? 'bg-white/75 border-white/80 dark:bg-[#0B1220]/80 dark:border-white/[0.1] backdrop-blur-[28px] shadow-[0_12px_44px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.5)]'
            : 'bg-white/55 border-white/70 dark:bg-[#0B1220]/65 dark:border-white/[0.07] backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.04)]'
        }`}
      >
        {/* LEFT SECTION: BRANDING & DIVIDER */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleScrollTo('hero')}
            className="flex items-center gap-2.5 cursor-pointer text-left group focus:outline-none"
          >
            {/* Dynamic Theme Logo Icon */}
            <div className="w-8 h-8 rounded-xl bg-[#0B1730] dark:bg-gradient-to-br dark:from-blue-600/30 dark:via-sky-500/20 dark:to-emerald-500/30 border border-[#0B1730]/20 dark:border-blue-400/40 text-emerald-400 flex items-center justify-center font-bold shadow-md shadow-[#0B1730]/15 dark:shadow-[0_0_16px_rgba(59,130,246,0.35)] transition-all duration-300 group-hover:scale-105">
              <svg className="w-4 h-4 text-emerald-400 dark:text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="15" y2="13"></line>
                <line x1="9" y1="17" x2="13" y2="17"></line>
              </svg>
            </div>
            <span className="text-base font-extrabold tracking-tight text-[#0B1730] dark:text-white">
              TAXSENSE
            </span>
          </button>

          {/* Thin subtle vertical divider */}
          <div className="hidden sm:block h-4 w-[1px] bg-slate-200/80 dark:bg-white/10 mx-1" />
        </div>

        {/* CENTER SECTION: PRIMARY SINGLE-LINE LINKS & MORE DROPDOWN */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-sans font-medium text-slate-600 dark:text-slate-300">
          {primaryLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleScrollTo(link.id)}
                className={`relative py-1 transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'hover:text-[#0B1730] dark:hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          {/* MORE DROPDOWN TRIGGER */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`flex items-center gap-1 py-1 transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                isMoreOpen || ['tipping-point', 'faq'].includes(activeSection)
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'hover:text-[#0B1730] dark:hover:text-white'
              }`}
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
            </button>

            {/* MORE DROPDOWN MENU */}
            <AnimatePresence>
              {isMoreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full right-0 mt-3 w-44 p-2 rounded-2xl bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-50 flex flex-col gap-1 text-[13px] font-sans text-slate-700 dark:text-slate-200"
                >
                  {moreLinks.map((item) => (
                    item.external ? (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-650 dark:text-slate-300 hover:text-[#0B1730] dark:hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">↗</span>
                      </a>
                    ) : (
                      <button
                        key={item.id}
                        onClick={() => handleScrollTo(item.id!)}
                        className={`px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left w-full cursor-pointer ${
                          activeSection === item.id ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-500/10' : ''
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* RIGHT SECTION: THEME TOGGLE & MAIN CTA BUTTON */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Subtle Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Primary Navbar CTA: "Compare Regimes →" */}
          <button
            onClick={onStart}
            className="group relative px-5 py-2.5 bg-[#0B1730] hover:bg-[#122244] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-[13px] rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(11,23,48,0.15)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2"
          >
            <span>Compare Regimes</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* MOBILE & TABLET MENU BUTTON */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* MOBILE SLIDE-OUT / DROPDOWN MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-auto mt-2 w-full p-4 rounded-2xl bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col gap-3 md:hidden z-50 text-sans"
          >
            {primaryLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScrollTo(link.id)}
                className={`py-3 px-4 rounded-xl text-left text-sm font-semibold transition-colors ${
                  activeSection === link.id
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}

            {moreLinks.map((item) => (
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 flex justify-between items-center"
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-mono text-slate-400">↗</span>
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => handleScrollTo(item.id!)}
                  className="py-3 px-4 rounded-xl text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {item.label}
                </button>
              )
            ))}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onStart();
              }}
              className="mt-2 w-full py-3.5 bg-[#0B1730] dark:bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Compare Regimes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
