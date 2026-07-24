import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Sliders, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';
import { CountUp } from './helpers/CountUp';
import { ShareSavingsModal } from './ShareSavingsModal';

export const InteractiveShowcaseSection: React.FC = React.memo(() => {
  const [salary, setSalary] = useState(1850000);
  const [claim80C, setClaim80C] = useState(true);
  const [claim80D, setClaim80D] = useState(true);
  const [claimHRA, setClaimHRA] = useState(true);
  const [claimNPS, setClaimNPS] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Dynamic Indian Tax Calculation (AY 2026-27 rules)
  const stdDedNew = 75000;
  const stdDedOld = 50000;

  const deductionsOld = stdDedOld + (claim80C ? 150000 : 0) + (claim80D ? 25000 : 0) + (claimHRA ? 120000 : 0) + (claimNPS ? 50000 : 0);
  const taxableOld = Math.max(0, salary - deductionsOld);
  const taxableNew = Math.max(0, salary - stdDedNew);

  const calculateOldTax = (taxable: number) => {
    if (taxable <= 250000) return 0;
    let tax = 0;
    if (taxable > 250000) tax += Math.min(250000, taxable - 250000) * 0.05;
    if (taxable > 500000) tax += Math.min(500000, taxable - 500000) * 0.20;
    if (taxable > 1000000) tax += (taxable - 1000000) * 0.30;
    return Math.round(tax * 1.04);
  };

  const calculateNewTax = (taxable: number) => {
    if (taxable <= 300000) return 0;
    if (taxable <= 700000) return 0;
    let tax = 0;
    if (taxable > 300000) tax += Math.min(400000, taxable - 300000) * 0.05;
    if (taxable > 700000) tax += Math.min(300000, taxable - 700000) * 0.10;
    if (taxable > 1000000) tax += Math.min(200000, taxable - 1000000) * 0.15;
    if (taxable > 1200000) tax += Math.min(300000, taxable - 1200000) * 0.20;
    if (taxable > 1500000) tax += (taxable - 1500000) * 0.30;
    return Math.round(tax * 1.04);
  };

  const oldTax = calculateOldTax(taxableOld);
  const newTax = calculateNewTax(taxableNew);
  const savings = Math.max(0, oldTax - newTax);
  const recommendedRegime = newTax <= oldTax ? 'New Tax Regime' : 'Old Tax Regime';

  return (
    <section id="interactive-showcase" className="py-24 md:py-28 px-6 max-w-6xl mx-auto space-y-16 border-y border-slate-200/60 dark:border-white/[0.04] bg-transparent relative">
      <ShareSavingsModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        savingsAmount={savings}
        ctcAmount={salary}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-3 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono uppercase tracking-widest mx-auto">
          <Sliders className="w-3 h-3" />
          <span>Interactive Calculator</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          Simulate Your Tax Savings
        </h2>
        <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Adjust salary inputs and deduction toggles to test live regime calculations in real-time.
        </p>
      </motion.div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Salary Slider Card */}
          <PremiumCard className="p-6 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl space-y-4 shadow-sm text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">Gross Annual CTC</span>
              <span className="text-lg font-bold font-mono text-blue-600 dark:text-[#16E27A]">
                ₹{salary.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="600000"
              max="3000000"
              step="50000"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>₹6.0 Lakhs</span>
              <span>₹18.5 Lakhs</span>
              <span>₹30.0 Lakhs</span>
            </div>
          </PremiumCard>

          {/* Deductions Toggle Card */}
          <PremiumCard className="p-6 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl space-y-4 shadow-sm text-left">
            <span className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider block">
              Section 80 & Exemption Claims (Old Regime)
            </span>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer hover:border-blue-400/40 transition-all">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Sec 80C Investments</span>
                  <span className="text-[10px] text-slate-500">PPF, EPF, ELSS (Max ₹1,50,000)</span>
                </div>
                <input
                  type="checkbox"
                  checked={claim80C}
                  onChange={(e) => setClaim80C(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer hover:border-blue-400/40 transition-all">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Sec 80D Health Insurance</span>
                  <span className="text-[10px] text-slate-500">Self & Family Premium (Max ₹25,000)</span>
                </div>
                <input
                  type="checkbox"
                  checked={claim80D}
                  onChange={(e) => setClaim80D(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer hover:border-blue-400/40 transition-all">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">House Rent Allowance (HRA)</span>
                  <span className="text-[10px] text-slate-500">Rent Paid Allowance (₹1,20,000)</span>
                </div>
                <input
                  type="checkbox"
                  checked={claimHRA}
                  onChange={(e) => setClaimHRA(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer hover:border-blue-400/40 transition-all">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Sec 80CCD(1B) NPS</span>
                  <span className="text-[10px] text-slate-500">National Pension Scheme (₹50,000)</span>
                </div>
                <input
                  type="checkbox"
                  checked={claimNPS}
                  onChange={(e) => setClaimNPS(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
              </label>
            </div>
          </PremiumCard>
        </div>

        {/* Dynamic Display Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <PremiumCard className="p-8 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-3xl space-y-6 text-left shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">Live Computation</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tax Regime Breakdown</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#16E27A] text-[10px] font-mono font-bold uppercase rounded-full">
                AI Recommendation: {recommendedRegime}
              </span>
            </div>

            {/* Savings Callout Banner */}
            <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-blue-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-[#16E27A] font-bold uppercase tracking-wider block">Total Tax Saved</span>
                <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                  <CountUp value={savings} prefix="₹" />
                </span>
              </div>

              <button
                onClick={() => setShareModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 hover:scale-105"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Card</span>
              </button>
            </div>

            {/* Side-by-side Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.04] rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Old Regime Tax</span>
                <div className="text-xl font-mono font-bold text-slate-700 dark:text-slate-300">
                  <CountUp value={oldTax} prefix="₹" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  Taxable: ₹{taxableOld.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-5 bg-emerald-50/60 dark:bg-[#16E27A]/10 border border-emerald-300/50 dark:border-[#16E27A]/30 rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-[#16E27A] uppercase tracking-wider block font-bold">New Regime Tax</span>
                <div className="text-xl font-mono font-extrabold text-emerald-600 dark:text-[#16E27A]">
                  <CountUp value={newTax} prefix="₹" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  Taxable: ₹{taxableNew.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/[0.04] rounded-xl text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>Standard Deduction Applied Automatically</span>
              </div>
              <p>Under FY 2025-26 rules, standard deduction of ₹75,000 applies to New Regime and ₹50,000 to Old Regime without requiring proof.</p>
            </div>
          </PremiumCard>
        </div>
      </div>
    </section>
  );
});
InteractiveShowcaseSection.displayName = "InteractiveShowcaseSection";
