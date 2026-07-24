import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw, Calculator, HelpCircle } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';
import { CountUp } from './helpers/CountUp';

interface RefundFinderWidgetProps {
  onStart: () => void;
}

export const RefundFinderWidget: React.FC<RefundFinderWidgetProps> = React.memo(({ onStart }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    monthlyRent: 20000,
    hasParentsHealthIns: true,
    investsNPS: true,
  });

  // Calculate estimated savings based on quick responses
  const rentSavings = answers.monthlyRent > 10000 ? Math.min(120000, (answers.monthlyRent - 5000) * 12) * 0.30 : 0;
  const healthSavings = answers.hasParentsHealthIns ? 50000 * 0.30 : 0;
  const npsSavings = answers.investsNPS ? 50000 * 0.30 : 0;

  const totalEstimatedRefund = Math.round(rentSavings + healthSavings + npsSavings);

  return (
    <section id="refund-finder" className="py-24 md:py-28 px-6 max-w-4xl mx-auto space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono uppercase tracking-widest mx-auto">
          <Calculator className="w-3.5 h-3.5" />
          <span>30-Second Micro Audit</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          No Form 16 Yet? Uncover Hidden Refunds
        </h2>
        <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Answer 3 simple questions to estimate how much unclaimed tax refund you could recover this year.
        </p>
      </motion.div>

      <PremiumCard className="p-8 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-3xl space-y-8 text-left shadow-xl relative overflow-hidden max-w-2xl mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.06]">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Quick Audit Step {step} of 3</span>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-[#16E27A] font-bold uppercase">No Document Required</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  1. How much monthly rent do you pay?
                </h3>
                <p className="text-xs text-slate-500">Helps compute your Section 10(13A) House Rent Allowance exemption cap.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-mono font-bold text-blue-600 dark:text-[#16E27A]">
                  <span>Monthly Rent:</span>
                  <span>₹{answers.monthlyRent.toLocaleString('en-IN')}/mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60000"
                  step="5000"
                  value={answers.monthlyRent}
                  onChange={(e) => setAnswers(prev => ({ ...prev, monthlyRent: Number(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-2"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  2. Do you pay health insurance for senior citizen parents?
                </h3>
                <p className="text-xs text-slate-500">Unlocks up to ₹50,000 Section 80D deduction limit under Old Regime.</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { setAnswers(prev => ({ ...prev, hasParentsHealthIns: true })); setStep(3); }}
                  className={`flex-1 p-4 rounded-2xl border font-bold text-xs cursor-pointer transition-all ${
                    answers.hasParentsHealthIns ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-[#16E27A]' : 'border-slate-200 dark:border-white/10'
                  }`}
                >
                  ✓ Yes (Senior Citizen Parents)
                </button>
                <button
                  onClick={() => { setAnswers(prev => ({ ...prev, hasParentsHealthIns: false })); setStep(3); }}
                  className={`flex-1 p-4 rounded-2xl border font-bold text-xs cursor-pointer transition-all ${
                    !answers.hasParentsHealthIns ? 'border-slate-400 bg-slate-100 dark:bg-white/5' : 'border-slate-200 dark:border-white/10'
                  }`}
                >
                  ✕ No / Not Applicable
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  3. Do you contribute to NPS (National Pension Scheme)?
                </h3>
                <p className="text-xs text-slate-500">Unlocks an extra ₹50,000 under Section 80CCD(1B) above standard 80C.</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setAnswers(prev => ({ ...prev, investsNPS: true }))}
                  className={`flex-1 p-4 rounded-2xl border font-bold text-xs cursor-pointer transition-all ${
                    answers.investsNPS ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-[#16E27A]' : 'border-slate-200 dark:border-white/10'
                  }`}
                >
                  ✓ Yes (Active NPS Account)
                </button>
                <button
                  onClick={() => setAnswers(prev => ({ ...prev, investsNPS: false }))}
                  className={`flex-1 p-4 rounded-2xl border font-bold text-xs cursor-pointer transition-all ${
                    !answers.investsNPS ? 'border-slate-400 bg-slate-100 dark:bg-white/5' : 'border-slate-200 dark:border-white/10'
                  }`}
                >
                  ✕ No
                </button>
              </div>

              {/* Final Result Card */}
              <div className="p-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-blue-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-[#16E27A] font-bold uppercase tracking-wider block">Estimated Refund Unlocked</span>
                <div className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                  <CountUp value={totalEstimatedRefund} prefix="₹" />
                </div>
                <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
                  Based on your responses, claiming your HRA, 80D, and NPS allowances could reduce your annual tax liability by up to <strong>₹{totalEstimatedRefund.toLocaleString('en-IN')}</strong>.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={onStart}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <span>Claim My Full Refund</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                    title="Restart Micro Audit"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PremiumCard>
    </section>
  );
});
RefundFinderWidget.displayName = "RefundFinderWidget";
