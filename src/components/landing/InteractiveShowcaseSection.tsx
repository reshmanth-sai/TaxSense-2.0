import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';
import { CountUp } from './helpers/CountUp';

export const InteractiveShowcaseSection: React.FC = React.memo(() => {
  const [activeShowcase, setActiveShowcase] = useState<'extraction' | 'regime' | 'optimization'>('extraction');
  const [showcaseSalary, setShowcaseSalary] = useState(850000);
  const [showcaseOptimized, setShowcaseOptimized] = useState(false);
  const [showcaseLoading, setShowcaseLoading] = useState(false);

  return (
    <section id="interactive-showcase" className="py-32 md:py-36 border-y border-slate-200/50 dark:border-white/[0.04] bg-transparent px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-3"
        >
          <span className="text-[10px] text-slate-500 dark:text-[#16E27A] font-mono font-bold uppercase tracking-widest">Product Interface</span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
            Interactive Showcase
          </h2>
          <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-sans">
            Experience the core platform dashboard. Click the features on the left or interact directly with the tabs in the workspace mockup.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-2 space-y-6">
            <PremiumCard
              onMouseEnter={() => setActiveShowcase('extraction')}
              onClick={() => setActiveShowcase('extraction')}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
              className={`p-6 border transition-colors duration-300 text-left cursor-pointer group relative overflow-hidden ${activeShowcase === 'extraction'
                  ? 'border-slate-400 bg-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:border-white/20 dark:bg-white/[0.08] dark:shadow-none'
                  : 'border-slate-200/50 bg-white/40 hover:border-slate-400 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/20'
                }`}
            >
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Component 01</span>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Extraction Details</h3>
                <ArrowRight className="w-4 h-4 text-slate-450 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                Real-time parsed employer metadata displaying primary entity details, ITR-1 suitability, and base salary.
              </p>
            </PremiumCard>

            <PremiumCard
              onMouseEnter={() => setActiveShowcase('regime')}
              onClick={() => setActiveShowcase('regime')}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
              className={`p-6 border transition-colors duration-300 text-left cursor-pointer group relative overflow-hidden ${activeShowcase === 'regime'
                  ? 'border-blue-500 bg-white/80 shadow-[0_8px_32px_rgba(59,130,246,0.15)] dark:border-blue-500/50 dark:bg-white/[0.08] dark:shadow-none'
                  : 'border-slate-200/50 bg-white/40 hover:border-blue-400 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-blue-500/40'
                }`}
            >
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider block mb-1">Component 02</span>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Regime Comparison</h3>
                <ArrowRight className="w-4 h-4 text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                Dynamically evaluates the optimal path, showing saving projections between New and Old regimes.
              </p>
            </PremiumCard>

            <PremiumCard
              onMouseEnter={() => setActiveShowcase('optimization')}
              onClick={() => setActiveShowcase('optimization')}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
              className={`p-6 border transition-colors duration-300 text-left cursor-pointer group relative overflow-hidden ${activeShowcase === 'optimization'
                  ? 'border-amber-500 bg-white/80 shadow-[0_8px_32px_rgba(245,158,11,0.15)] dark:border-amber-500/50 dark:bg-white/[0.08] dark:shadow-none'
                  : 'border-slate-200/50 bg-white/40 hover:border-amber-400 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-amber-500/40'
                }`}
            >
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block mb-1">Component 03</span>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Optimization</h3>
                <ArrowRight className="w-4 h-4 text-amber-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                Circular optimization percentage mapping standard allowances (80C, 80D, HRA) to underutilized opportunities.
              </p>
            </PremiumCard>
          </div>

          <div className={`lg:col-span-3 p-5 bg-white/45 dark:bg-[#0E131B]/45 border rounded-[20px] relative overflow-hidden aspect-[4/3] flex flex-col justify-between shadow-[0_24px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-500 ${
              activeShowcase === 'extraction' ? 'border-slate-400 dark:border-slate-700 shadow-[0_0_40px_rgba(100,116,139,0.05)]' :
              activeShowcase === 'regime' ? 'border-blue-500 dark:border-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.08)]' :
              'border-amber-500 dark:border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.08)]'
            }`}>
            {/* Bezel bezel depth layer reflections */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-white/5 dark:from-white/[0.005] dark:via-white/[0.015] dark:to-white/[0.005] pointer-events-none z-20" />

            {/* Titlebar */}
            <div className="h-8 border-b border-slate-200/50 dark:border-white/[0.04] flex items-center justify-between shrink-0 mb-4 px-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              {/* Mockup tabs */}
              <div className="flex gap-2 text-[10px] font-bold text-slate-500">
                <button 
                  onClick={() => setActiveShowcase('extraction')} 
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${activeShowcase === 'extraction' ? 'bg-slate-200/60 dark:bg-white/5 text-slate-900 dark:text-white' : 'hover:text-slate-800'}`}
                >
                  Ingest
                </button>
                <button 
                  onClick={() => setActiveShowcase('regime')} 
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${activeShowcase === 'regime' ? 'bg-slate-200/60 dark:bg-white/5 text-slate-900 dark:text-white' : 'hover:text-slate-800'}`}
                >
                  Regimes
                </button>
                <button 
                  onClick={() => setActiveShowcase('optimization')} 
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${activeShowcase === 'optimization' ? 'bg-slate-200/60 dark:bg-white/5 text-slate-900 dark:text-white' : 'hover:text-slate-800'}`}
                >
                  Claims
                </button>
              </div>
              <span className="w-8" />
            </div>

            {/* Showcase Inner Container */}
            <div className="flex-1 text-left p-2 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeShowcase === 'extraction' && (
                  <motion.div
                    key="extraction"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Extracted Profile</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#16E27A] text-[9px] font-bold uppercase tracking-wider">100% Parsed</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                      <div className="p-3 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.04] rounded-xl shadow-sm">
                        <span className="text-slate-500 block text-[9px]">EMPLOYER</span>
                        <span className="font-bold text-slate-900 dark:text-white">Google India Pvt Ltd</span>
                      </div>
                      <div className="p-3 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.04] rounded-xl shadow-sm">
                        <span className="text-slate-500 block text-[9px]">PAN OF EMPLOYER</span>
                        <span className="font-bold text-slate-900 dark:text-white">AAACG8472M</span>
                      </div>
                      <div className="p-3 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.04] rounded-xl shadow-sm">
                        <span className="text-slate-500 block text-[9px]">GROSS SALARY (SEC 17.1)</span>
                        <span className="font-bold text-emerald-600 dark:text-[#16E27A]">₹8,50,000</span>
                      </div>
                      <div className="p-3 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.04] rounded-xl shadow-sm">
                        <span className="text-slate-500 block text-[9px]">TDS DEDUCTED (SEC 192)</span>
                        <span className="font-bold text-slate-900 dark:text-white">₹15,000</span>
                      </div>
                    </div>
                    <div className="p-3.5 bg-blue-50/50 dark:bg-blue-500/[0.02] border border-blue-200/50 dark:border-blue-500/10 rounded-xl text-[10px] text-slate-655 dark:text-slate-400">
                      💡 <span className="font-bold text-slate-900 dark:text-white">AI Suggestion:</span> This Form 16 profile qualifies for simple ITR-1 filing. No supplementary schedules needed.
                    </div>
                  </motion.div>
                )}

                {activeShowcase === 'regime' && (
                  <motion.div
                    key="regime"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Regime Savings Comparison</span>
                      <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider animate-pulse">Drag Salary Slider</span>
                    </div>
                    <div className="p-4 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.04] rounded-xl space-y-3 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-655 dark:text-slate-400 font-semibold">Gross Salary:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">₹{showcaseSalary.toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        type="range"
                        min="600000"
                        max="1500000"
                        step="50000"
                        value={showcaseSalary}
                        onChange={(e) => setShowcaseSalary(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.04] rounded-xl text-center shadow-sm">
                        <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-mono">Old Regime Tax</span>
                        <span className="text-sm font-mono font-bold text-slate-500 dark:text-slate-400 line-through decoration-red-500/60">
                          <CountUp value={Math.round(showcaseSalary * 0.08)} />
                        </span>
                      </div>
                      <div className="p-3 bg-blue-50/50 dark:bg-[#16E27A]/5 border border-blue-200/50 dark:border-[#16E27A]/25 rounded-xl text-center shadow-sm">
                        <span className="text-[9px] text-blue-600 dark:text-[#16E27A] block font-bold uppercase tracking-wider font-mono">New Regime Tax</span>
                        <span className="text-sm font-mono font-bold text-blue-600 dark:text-[#16E27A]">
                          <CountUp value={Math.round(showcaseSalary * 0.05)} />
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-950 dark:bg-[#050607] border border-slate-850 dark:border-white/[0.06] text-white rounded-xl flex items-center justify-between text-xs font-mono shadow-sm">
                      <span className="text-slate-400">Estimated Net Savings:</span>
                      <span className="font-bold text-[#16E27A]"><CountUp value={Math.round(showcaseSalary * 0.03)} /></span>
                    </div>
                  </motion.div>
                )}

                {activeShowcase === 'optimization' && (
                  <motion.div
                    key="optimization"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Smart Claims Audit</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider">Claim Adjuster</span>
                    </div>
                    <div className="flex items-center gap-4 p-3.5 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.04] rounded-xl shadow-sm">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" />
                          <circle 
                            cx="18" 
                            cy="18" 
                            r="16" 
                            fill="none" 
                            stroke={showcaseOptimized ? "#10B981" : "#F59E0B"} 
                            strokeWidth="4.5" 
                            strokeDasharray={showcaseOptimized ? "92, 100" : "72, 100"} 
                            className="transition-all duration-500" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-900 dark:text-white">
                          {showcaseOptimized ? "92%" : "72%"}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-900 dark:text-white">Deduction Optimization Score</h5>
                        <p className="text-[9px] text-slate-650 dark:text-slate-400">
                          {showcaseOptimized ? "Excellent optimization! All basic allowances fully declared." : "72% optimized. You have underclaimed exemptions under Sec 80D."}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.04] rounded-xl flex items-center justify-between text-[11px] shadow-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">Section 80C Exemptions</span>
                          <span className="text-[9px] text-slate-500">PPF, EPF, Life Insurance</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">₹1,50,000 / ₹1,50,000</span>
                      </div>
                      <div className="p-3 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.04] rounded-xl flex items-center justify-between text-[11px] shadow-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">Section 80D Health Premium</span>
                          <span className="text-[9px] text-slate-500">Self & parents medical premiums</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {showcaseOptimized ? "₹25,000 / ₹25,000" : "₹0 / ₹25,000"}
                          </span>
                          <button
                            onClick={() => {
                              if (showcaseLoading) return;
                              setShowcaseLoading(true);
                              setTimeout(() => {
                                setShowcaseLoading(false);
                                setShowcaseOptimized(!showcaseOptimized);
                              }, 600);
                            }}
                            className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-colors cursor-pointer border ${showcaseOptimized 
                              ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10' 
                              : 'bg-amber-500 text-white border-transparent hover:bg-amber-600'}`}
                          >
                            {showcaseLoading ? "..." : showcaseOptimized ? "Unclaim" : "Claim Max"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
InteractiveShowcaseSection.displayName = "InteractiveShowcaseSection";
