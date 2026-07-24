import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, CheckCircle2, AlertCircle, Award, Sparkles, ArrowRight } from 'lucide-react';
import { PremiumCard } from '../landing/helpers/PremiumCard';

export const CTCEfficiencyScorecard: React.FC = React.memo(() => {
  const [basicPercent, setBasicPercent] = useState(50);
  const [hasFoodCoupons, setHasFoodCoupons] = useState(true);
  const [hasLTA, setHasLTA] = useState(false);
  const [hasTelecom, setHasTelecom] = useState(true);
  const [hasCorpNPS, setHasCorpNPS] = useState(false); // Sec 80CCD(2)

  // Calculate efficiency score
  let score = 50;
  if (basicPercent >= 40 && basicPercent <= 50) score += 15;
  if (hasFoodCoupons) score += 10;
  if (hasLTA) score += 10;
  if (hasTelecom) score += 5;
  if (hasCorpNPS) score += 20;

  const grade = score >= 90 ? 'A+' : score >= 75 ? 'A' : score >= 60 ? 'B' : 'C';
  const gradeColor = score >= 75 ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10';

  return (
    <section id="ctc-scorecard" className="py-24 md:py-28 px-6 max-w-5xl mx-auto space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-3 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono uppercase tracking-widest mx-auto">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Employer Flexi-Basket Optimizer</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          CTC Tax Efficiency Scorecard
        </h2>
        <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Evaluate if your employer's salary structure is fully optimized to reduce taxable income legally.
        </p>
      </motion.div>

      <PremiumCard className="p-8 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-3xl space-y-8 text-left shadow-xl relative overflow-hidden">
        {/* Scorecard Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Corporate Flexi-Basket Status</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your CTC Optimization Grade</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-5 py-2 rounded-2xl border ${gradeColor} font-mono font-black text-2xl flex items-center gap-2`}>
              <Award className="w-6 h-6" />
              <span>Grade {grade} ({score}/100)</span>
            </div>
          </div>
        </div>

        {/* Toggles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.04] rounded-2xl">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-slate-700 dark:text-slate-300">Basic Salary % of CTC:</span>
                <span className="text-blue-600 dark:text-blue-400">{basicPercent}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="70"
                step="5"
                value={basicPercent}
                onChange={(e) => setBasicPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-500">Optimal Basic ratio is 40%-50% for maximum HRA & PF balancing.</p>
            </div>
          </div>

          <div className="space-y-3 p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.04] rounded-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">Employer Provided Allowances</span>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Food Coupons (₹26,400/yr tax free)</span>
                <input type="checkbox" checked={hasFoodCoupons} onChange={(e) => setHasFoodCoupons(e.target.checked)} className="accent-emerald-500" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>LTA (Leave Travel Allowance)</span>
                <input type="checkbox" checked={hasLTA} onChange={(e) => setHasLTA(e.target.checked)} className="accent-emerald-500" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Telecom / Internet Allowance</span>
                <input type="checkbox" checked={hasTelecom} onChange={(e) => setHasTelecom(e.target.checked)} className="accent-emerald-500" />
              </label>
              <label className="flex items-center justify-between cursor-pointer font-bold text-blue-600 dark:text-blue-400">
                <span>Sec 80CCD(2) Corporate NPS (10% Basic)</span>
                <input type="checkbox" checked={hasCorpNPS} onChange={(e) => setHasCorpNPS(e.target.checked)} className="accent-emerald-500" />
              </label>
            </div>
          </div>
        </div>

        {/* Tailored HR Recommendations */}
        <div className="p-5 bg-blue-50/70 dark:bg-blue-500/[0.03] border border-blue-200/70 dark:border-blue-500/20 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Recommended HR Modifications to Boost Efficiency:</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-sans">
            {!hasCorpNPS && (
              <li className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Ask HR to add Sec 80CCD(2) Corporate NPS:</strong> Saves up to 10% of Basic salary tax-free under both Old and New regimes.</span>
              </li>
            )}
            {!hasFoodCoupons && (
              <li className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Include Meal Vouchers / Sodexo:</strong> Exempts up to ₹2,200/month from taxable income.</span>
              </li>
            )}
            {hasCorpNPS && hasFoodCoupons && (
              <li className="flex items-center gap-2 text-emerald-600 dark:text-[#16E27A]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Great job! Your CTC structure is highly tax-optimized.</span>
              </li>
            )}
          </ul>
        </div>
      </PremiumCard>
    </section>
  );
});
CTCEfficiencyScorecard.displayName = "CTCEfficiencyScorecard";
