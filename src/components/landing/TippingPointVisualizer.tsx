import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Sparkles, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';

export const TippingPointVisualizer: React.FC = React.memo(() => {
  const [ctc, setCtc] = useState(1500000);
  const [claimedDeductions, setClaimedDeductions] = useState(250000); // 80C + 80D + HRA

  // Standard deductions
  const stdOld = 50000;
  const stdNew = 75000;

  const totalOldDeductions = stdOld + claimedDeductions;
  const taxableOld = Math.max(0, ctc - totalOldDeductions);
  const taxableNew = Math.max(0, ctc - stdNew);

  // Simplified tax math
  const calcOldTax = (taxable: number) => {
    if (taxable <= 250000) return 0;
    let tax = 0;
    if (taxable > 250000) tax += Math.min(250000, taxable - 250000) * 0.05;
    if (taxable > 500000) tax += Math.min(500000, taxable - 500000) * 0.20;
    if (taxable > 1000000) tax += (taxable - 1000000) * 0.30;
    return Math.round(tax * 1.04);
  };

  const calcNewTax = (taxable: number) => {
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

  const oldTax = calcOldTax(taxableOld);
  const newTax = calcNewTax(taxableNew);
  const diff = Math.abs(oldTax - newTax);
  const winner = newTax <= oldTax ? 'New Tax Regime' : 'Old Tax Regime';

  // Tipping point calculation: Deductions threshold required to make Old Regime better than New Regime
  // Approximately if deductions exceed ~₹3.75L to ₹4.25L depending on CTC slab
  const requiredDeductionThreshold = Math.round(ctc * 0.22);

  return (
    <section id="tipping-point" className="py-24 md:py-28 px-6 max-w-5xl mx-auto space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-3 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#16E27A] text-[10px] font-bold font-mono uppercase tracking-widest mx-auto">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Interactive Crossover Model</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          Find Your Tax Regime Tipping Point
        </h2>
        <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Discover the exact deduction threshold where switching between Old and New tax regimes saves you the most money.
        </p>
      </motion.div>

      <PremiumCard className="p-8 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-3xl space-y-8 text-left shadow-xl relative overflow-hidden">
        {/* Top Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-slate-200 dark:border-white/[0.06]">
          {/* CTC Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-slate-700 dark:text-slate-300">Annual Salary (CTC):</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                ₹{ctc.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="600000"
              max="3000000"
              step="50000"
              value={ctc}
              onChange={(e) => setCtc(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>₹6 Lakhs</span>
              <span>₹18 Lakhs</span>
              <span>₹30 Lakhs</span>
            </div>
          </div>

          {/* Claimed Deductions Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-slate-700 dark:text-slate-300">Claimed Exemptions (80C + 80D + HRA):</span>
              <span className="font-extrabold text-emerald-600 dark:text-[#16E27A] text-sm">
                ₹{claimedDeductions.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="600000"
              step="25000"
              value={claimedDeductions}
              onChange={(e) => setClaimedDeductions(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>₹0 (No Claims)</span>
              <span>₹3 Lakhs</span>
              <span>₹6 Lakhs (High Claims)</span>
            </div>
          </div>
        </div>

        {/* Visual Crossover Bars */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Tax Liability Comparison</span>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#16E27A] text-[10px] font-mono font-bold uppercase rounded-full">
              Winner: {winner} (Saves ₹{diff.toLocaleString('en-IN')})
            </span>
          </div>

          <div className="space-y-4">
            {/* Old Regime Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-slate-700 dark:text-slate-300">Old Tax Regime</span>
                <span className="font-extrabold text-slate-900 dark:text-white">₹{oldTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-white/[0.04] p-0.5">
                <div
                  className="h-full bg-slate-400 dark:bg-slate-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (oldTax / (Math.max(oldTax, newTax, 1))) * 100)}%` }}
                />
              </div>
            </div>

            {/* New Regime Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-emerald-600 dark:text-[#16E27A]">New Tax Regime</span>
                <span className="font-extrabold text-emerald-600 dark:text-[#16E27A]">₹{newTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-4 bg-emerald-500/10 rounded-full overflow-hidden border border-emerald-500/20 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (newTax / (Math.max(oldTax, newTax, 1))) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tipping Point Rationale Note */}
        <div className="p-4 bg-blue-50/70 dark:bg-blue-500/[0.03] border border-blue-200/70 dark:border-blue-500/20 rounded-2xl flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
          <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">Tipping Point Insight:</span>
            <p className="leading-relaxed">
              At your CTC of <strong>₹{ctc.toLocaleString('en-IN')}</strong>, you need total tax deductions exceeding <strong>₹{requiredDeductionThreshold.toLocaleString('en-IN')}</strong> to make the Old Tax Regime cheaper than the New Regime.
            </p>
          </div>
        </div>
      </PremiumCard>
    </section>
  );
});
TippingPointVisualizer.displayName = "TippingPointVisualizer";
