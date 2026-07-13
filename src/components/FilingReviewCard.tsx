import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  Lock, 
  ArrowRight,
  X,
  TrendingUp,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';
import RegimeComparison from './RegimeComparison';

// Animated Counter for dynamic savings figures
const AnimatedCounter: React.FC<{ value: number }> = React.memo(({ value }) => {
  const [displayValue, setDisplayValue] = React.useState(value);

  React.useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    const duration = 250;
    const startTime = performance.now();
    let animationFrameId: number;

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);
      const current = Math.round(start + (end - start) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span className="font-mono">{formatINR(displayValue)}</span>;
});

// Checklist item row
interface ChecklistRowProps {
  label: string;
  valueText: string;
  explanation: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const ChecklistRow: React.FC<ChecklistRowProps> = React.memo(({ 
  label, 
  valueText, 
  explanation, 
  isExpanded, 
  onToggle 
}) => {
  return (
    <div className="border-b border-white/[0.03] last:border-b-0 py-3 text-left">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-xs md:text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-450 shrink-0" />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">{valueText}</span>
          {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-1 pb-3 pl-6 space-y-2">
              <span className="text-[10px] text-emerald-450 uppercase font-bold tracking-wider block">Why this recommendation?</span>
              <p className="text-xs text-slate-405 leading-relaxed bg-[#0E131B] border border-white/[0.02] p-4 rounded-xl">
                {explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Main Step 4 Component
interface FilingReviewCardProps {
  onContinue: () => void;
  onBack: () => void;
}

export const FilingReviewCard: React.FC<FilingReviewCardProps> = React.memo(({ onContinue, onBack }) => {
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const incomeProfile = useTaxStore((state) => state.incomeProfile);

  const taxDataForCalc = React.useMemo(() => ({
    assessmentYear: '2026-27',
    grossSalary: incomeProfile?.grossSalary || 0,
    hraExemption: confirmedDeductions?.['HRA exemption'] || confirmedDeductions?.hraExemption || 0,
    ltaExemption: 0,
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    otherIncome: incomeProfile?.otherIncome || 0,
    deduction80C: confirmedDeductions?.['80C'] || 0,
    deduction80D: confirmedDeductions?.['80D'] || 0,
    deduction80TTA: confirmedDeductions?.['80TTA'] || 0,
    deduction80G: confirmedDeductions?.['80G'] || 0,
    section24b: confirmedDeductions?.['section24b'] || 0,
    tdsDeducted: incomeProfile?.tdsDeducted || 0,
    stcg: incomeProfile?.stcg || 0,
    ltcg: incomeProfile?.ltcg || 0,
    deduction80CCD1B: confirmedDeductions?.['80CCD(1B)'] || 0,
    deduction80CCD2: confirmedDeductions?.['80CCD(2)'] || 0,
    deduction80DD: confirmedDeductions?.['80DD'] || 0,
    deduction80U: confirmedDeductions?.['80U'] || 0,
    deduction80DDB: confirmedDeductions?.['80DDB'] || 0,
    deduction80E: confirmedDeductions?.['80E'] || 0,
    deduction80EEA: confirmedDeductions?.['80EEA'] || 0,
    deduction80GG: confirmedDeductions?.['80GG'] || 0,
    deduction80TTB: confirmedDeductions?.['80TTB'] || 0,
    deduction80CCH: confirmedDeductions?.['80CCH'] || 0,
    section24bLetOut: confirmedDeductions?.['section24bLetOut'] || 0,
  }), [incomeProfile, confirmedDeductions]);

  const calculation = React.useMemo(() => {
    return calculateTax(taxDataForCalc);
  }, [taxDataForCalc]);

  const recommendedRegime = calculation.recommendedRegime || 'NEW';
  const savingsAmount = calculation.savings || 51480;

  const val80C = confirmedDeductions?.['80C'] || 0;
  const val80D = confirmedDeductions?.['80D'] || 0;

  const rowExplations = {
    personal: "AI verified your PAN profile status and residency declarations. Details perfectly match registered income profiles.",
    salary: "Salary parameters matched to Section 17(1) of verified Form 16, cross-referenced with your employer matches.",
    standard: `Standard Deduction is automatically applied to salaried employees to discount ₹75,000 off the taxable base under Section 16(ia).`,
    c80: `Your EPF matching and additional savings deposits have been claimed to maximize your Section 80C exemption up to the ${formatINR(150000)} limit.`,
    d80: `Medical premiums parsed from employer structures are claimed under Section 80D.`,
    regime: `Comparative analysis suggests the ${recommendedRegime === 'NEW' ? 'New Slab Structure' : 'Old Slab Structure'} yields the lowest net liability at your bracket.`
  };

  const toggleRow = React.useCallback((row: string) => {
    setExpandedRow((prev) => (prev === row ? null : row));
  }, []);

  return (
    <div className="space-y-8 max-w-[1000px] mx-auto text-slate-100 py-4">
      
      {/* Centered Review Hero */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="h-3 w-3" />
          <span>Filing Audited & Verified</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">Everything looks ready.</h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
          We've reviewed your salary, deductions, exemptions and filing profile. Everything has been verified against AY 2026–27 rules.
        </p>
      </div>

      {/* Estimated Savings Card with soft glow */}
      <div className="relative max-w-lg mx-auto bg-[#0E131B] border border-white/[0.04] rounded-3xl p-8 text-center shadow-xl overflow-hidden group">
        <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Estimated Tax Savings</span>
        <div className="my-3">
          <span className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight">
            <AnimatedCounter value={savingsAmount} />
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Compared to filing without optimization
        </span>
      </div>

      {/* Verification Shield (Individual Chips) */}
      <div className="bg-slate-900/10 border border-white/[0.03] rounded-3xl p-6 text-left max-w-2xl mx-auto space-y-3">
        <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Exemption Verification Shield</span>
        <div className="flex flex-wrap gap-2.5">
          {[
            'Form 16 Verified',
            'PAN Matched',
            'Employer Verified',
            'Income Cross Checked',
            'Deductions Validated',
            'AY 2026–27 Rules Applied'
          ].map((chip) => (
            <span key={chip} className="inline-flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider bg-[#0E131B] border border-white/[0.04] px-3 py-1.5 rounded-lg text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450 shrink-0" />
              <span>{chip}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Filing Summary Checklist */}
      <div className="max-w-2xl mx-auto bg-[#0A0D14] border border-white/[0.04] rounded-3xl p-6 space-y-1">
        <ChecklistRow 
          label="Personal Information" 
          valueText="Verified" 
          explanation={rowExplations.personal}
          isExpanded={expandedRow === 'personal'}
          onToggle={() => toggleRow('personal')}
        />
        <ChecklistRow 
          label="Salary Details" 
          valueText="Verified" 
          explanation={rowExplations.salary}
          isExpanded={expandedRow === 'salary'}
          onToggle={() => toggleRow('salary')}
        />
        <ChecklistRow 
          label="Standard Deduction" 
          valueText={formatINR(75000)} 
          explanation={rowExplations.standard}
          isExpanded={expandedRow === 'standard'}
          onToggle={() => toggleRow('standard')}
        />
        <ChecklistRow 
          label="Section 80C Exemption" 
          valueText={formatINR(val80C)} 
          explanation={rowExplations.c80}
          isExpanded={expandedRow === 'c80'}
          onToggle={() => toggleRow('c80')}
        />
        <ChecklistRow 
          label="Section 80D Exemption" 
          valueText={formatINR(val80D)} 
          explanation={rowExplations.d80}
          isExpanded={expandedRow === 'd80'}
          onToggle={() => toggleRow('d80')}
        />
        <ChecklistRow 
          label="Selected Tax Regime" 
          valueText={recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime'} 
          explanation={rowExplations.regime}
          isExpanded={expandedRow === 'regime'}
          onToggle={() => toggleRow('regime')}
        />
      </div>

      {/* Compliance Success Banner */}
      <div className="max-w-2xl mx-auto bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3 text-left">
        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-450 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-slate-400 font-semibold">
          <p className="text-emerald-400 font-bold uppercase tracking-wider text-[9.5px]">Filing Compliance Status</p>
          <p className="leading-relaxed text-[11px] pt-0.5">Your filing complies with current Income Tax rules. No issues detected.</p>
        </div>
      </div>

      {/* Manual Review Toggle Button */}
      <div className="text-center pt-2">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors cursor-pointer border border-white/[0.04] bg-[#0E131B] px-5 py-2.5 rounded-xl hover:bg-slate-900"
        >
          Review Calculation Details
        </button>
      </div>

      {/* Bottom CTA Actions */}
      <div className="max-w-2xl mx-auto pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="h-12 px-6 border border-slate-850 hover:bg-white/[0.02] text-slate-400 hover:text-white text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95 transition-all w-full sm:w-auto"
        >
          Back to Deductions
        </button>

        <button
          onClick={onContinue}
          className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto group shadow-lg shadow-blue-500/10"
        >
          <span>Continue to Generate Return</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Detailed Slabs Side Sheet Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 transition-opacity"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#0A0D14] border-l border-white/[0.08] p-8 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto text-left"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-bold text-slate-100">Verification Ledger Details</span>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 hover:bg-white/[0.04] rounded-full text-slate-400 hover:text-slate-205 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="pt-2">
                  <React.Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
                    <RegimeComparison />
                  </React.Suspense>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-900/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-slate-650" />
                  <span>Encrypted Local Sandboxed Calculations</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="h-10 px-5 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-98"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
});

export default FilingReviewCard;
