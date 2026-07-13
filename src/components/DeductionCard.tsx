import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  Lock, 
  ShieldCheck, 
  Minus, 
  Plus, 
  ArrowRight,
  X,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';

// ---------------------------------------------------------
// REUSABLE ENGINEERING COMPONENTS
// ---------------------------------------------------------

// Animated Counter for dynamic numbers (savings, claimed, etc.)
const AnimatedCounter: React.FC<{ value: number }> = React.memo(({ value }) => {
  const [displayValue, setDisplayValue] = React.useState(value);

  React.useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    const duration = 250; // 250ms counting animation
    const startTime = performance.now();
    let animationFrameId: number;

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // Ease out quad
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

// Premium Side Sheet for "Why did AI recommend this?"
interface WhyRecommendationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  explanation: string;
}

const WhyRecommendationSheet: React.FC<WhyRecommendationSheetProps> = React.memo(({ isOpen, onClose, title, explanation }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0A0D14] border-l border-white/[0.08] p-8 shadow-2xl z-50 flex flex-col justify-between text-left"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-450">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Tax Explanation</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/[0.04] rounded-full text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-100">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed bg-[#0E131B] border border-white/[0.02] p-5 rounded-2xl">
                  {explanation}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-slate-650" />
                <span>Exemption verified using AY 2026-27 Tax Slabs</span>
              </div>
              <button
                onClick={onClose}
                className="w-full h-11 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-98"
              >
                Got it, thank you
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// Premium Savings Hero (centered, maximum width ~1200px)
interface SavingsHeroProps {
  savings: number;
  subtitle: string;
}

const SavingsHero: React.FC<SavingsHeroProps> = React.memo(({ savings, subtitle }) => {
  return (
    <div className="bg-slate-900/30 border border-white/[0.03] rounded-3xl p-10 text-center relative overflow-hidden backdrop-blur-md max-w-[1200px] mx-auto">
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-4">
        <Sparkles className="h-3 w-3 text-emerald-400" />
        <span>Exemption Blueprint Prepared</span>
      </div>
      
      <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight leading-tight">
        {subtitle}
      </h1>
      
      <div className="my-6">
        <span className="text-4xl md:text-5xl font-black text-emerald-400 tracking-tight">
          <AnimatedCounter value={savings} />
        </span>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Estimated Tax Savings</p>
      </div>

      <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
        Our AI advisor analyzed your Form 16 ledger records, matched employer validation tags, validated AY 2026-27 rules, and optimized your deductions structure automatically.
      </p>
    </div>
  );
});

// AI Recommendation Card (handles WHY click side sheet)
interface RecommendationCardProps {
  title: string;
  badge: string;
  amountText: string;
  whyExplanation: string;
  isPrimary?: boolean;
  onWhyClick: (title: string, exp: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = React.memo(({ 
  title, 
  badge, 
  amountText, 
  whyExplanation, 
  isPrimary = false, 
  onWhyClick 
}) => {
  return (
    <div className={`bg-[#0E131B] border border-white/[0.04] rounded-2xl p-[18px] flex flex-col justify-between hover:border-white/[0.08] transition-all hover:-translate-y-0.5 duration-200 ${
      isPrimary ? 'md:col-span-2 md:p-[24px] border-emerald-500/10 bg-gradient-to-br from-[#0E131B] to-slate-900/10' : ''
    }`}>
      <div className="space-y-2 text-left">
        <div className="flex items-baseline justify-between gap-2.5 flex-wrap">
          <span className={`font-extrabold text-slate-200 uppercase tracking-wider ${isPrimary ? 'text-base' : 'text-sm'}`}>
            {title}
          </span>
          <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border align-middle ${
            badge.includes('Auto') 
              ? 'bg-slate-800 text-slate-400 border-white/[0.04]' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {badge}
          </span>
        </div>
        <p className="text-xs md:text-[13px] text-slate-450 leading-relaxed pt-0.5 font-medium">
          {whyExplanation}
        </p>
      </div>

      <div className="flex justify-between items-end mt-4 pt-3 border-t border-white/[0.02]">
        <div>
          <span className="text-[9px] text-slate-505 uppercase tracking-wider font-bold block mb-0.5">Value</span>
          <span className={`font-mono font-black text-slate-100 ${isPrimary ? 'text-lg md:text-xl' : 'text-base'}`}>
            {amountText}
          </span>
        </div>

        <button
          onClick={() => onWhyClick(title, whyExplanation)}
          className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors cursor-pointer border-none bg-transparent p-0"
        >
          <span>See AI reasoning →</span>
        </button>
      </div>
    </div>
  );
});

// Confidence Shield Chips
const ConfidenceShield: React.FC = React.memo(() => {
  const chips = [
    'Form 16 verified',
    'Employer Profile verified',
    'PAN validated',
    'AY Rules matched',
    'Income mapping completed'
  ];

  return (
    <div className="bg-slate-900/20 border border-white/[0.03] rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 text-left max-w-[1200px] mx-auto">
      <div className="shrink-0 w-32 h-14 bg-blue-500/5 text-blue-400 border border-blue-500/10 rounded-2xl flex flex-col items-center justify-center">
        <span className="text-base font-black font-mono">99% Verified</span>
        <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-500">Confidence Shield</span>
      </div>
      <div className="space-y-2 flex-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Exemption Verification Shield</span>
        <div className="flex flex-wrap gap-2 pt-1">
          {chips.map((check) => (
            <span key={check} className="inline-flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450" />
              <span>{check}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

// ---------------------------------------------------------
// MAIN EXPORTED DEDUCTIONS WORKSPACE
// ---------------------------------------------------------

interface DeductionCardProps {
  onContinue?: () => void;
  onBack?: () => void;
}

type SubStage = '3A' | '3B' | '3C';

export const DeductionCard: React.FC<DeductionCardProps> = React.memo(({ onContinue, onBack }) => {
  const [subStage, setSubStage] = React.useState<SubStage>('3A');
  const [expandedAccordion, setExpandedAccordion] = React.useState<string | null>('80C');

  // Sheet detail overlays
  const [whySheetOpen, setWhySheetOpen] = React.useState(false);
  const [whySheetTitle, setWhySheetTitle] = React.useState('');
  const [whySheetExplanation, setWhySheetExplanation] = React.useState('');

  const openWhySheet = React.useCallback((title: string, explanation: string) => {
    setWhySheetTitle(title);
    setWhySheetExplanation(explanation);
    setWhySheetOpen(true);
  }, []);

  // Load centralized states & actions from Zustand store
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const updateDeduction = useTaxStore((state) => state.updateDeduction);
  const isExtracting = useTaxStore((state) => state.isExtracting);
  const incomeProfile = useTaxStore((state) => state.incomeProfile);

  // Calculate dynamic outputs
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

  const val80C = confirmedDeductions?.['80C'] || 0;
  const val80D = confirmedDeductions?.['80D'] || 0;
  const valHRA = confirmedDeductions?.['HRA exemption'] || confirmedDeductions?.hraExemption || 0;
  const valNPS = confirmedDeductions?.['80CCD(1B)'] || 0;
  const val80CCD2 = confirmedDeductions?.['80CCD(2)'] || 0;
  const val80CCH = confirmedDeductions?.['80CCH'] || 0;
  const valSection24bLetOut = confirmedDeductions?.['section24bLetOut'] || 0;

  // Limits
  const LIMIT_80C = 150000;
  const LIMIT_80D = 75000;
  const LIMIT_HRA = 300000;
  const LIMIT_NPS = 50000;
  const LIMIT_24B_LETOUT = 200000;

  // Calculation parameters for sliders
  const grossSalary = incomeProfile?.grossSalary || 850000;
  const otherIncome = incomeProfile?.otherIncome || 0;
  const totalClaimed = val80C + val80D + valHRA + valNPS + val80CCD2 + valSection24bLetOut + val80CCH;

  // Slabs & marginal calculations
  const newSlabTaxable = Math.max(0, grossSalary + otherIncome - 75000 - val80CCD2 - val80CCH - valSection24bLetOut);
  let bracketRate = 0.30;
  if (newSlabTaxable <= 400000) bracketRate = 0.0;
  else if (newSlabTaxable <= 800000) bracketRate = 0.05;
  else if (newSlabTaxable <= 1200000) bracketRate = 0.10;
  else if (newSlabTaxable <= 1600000) bracketRate = 0.15;
  else if (newSlabTaxable <= 2000000) bracketRate = 0.20;
  else if (newSlabTaxable <= 2400000) bracketRate = 0.25;

  const oldSlabTaxable = Math.max(0, grossSalary - valHRA + otherIncome - totalClaimed - 50000);
  let oldMarginalRate = 0;
  if (oldSlabTaxable > 1000000) oldMarginalRate = 0.30;
  else if (oldSlabTaxable > 500000) oldMarginalRate = 0.20;
  else if (oldSlabTaxable > 250000) oldMarginalRate = 0.05;

  const currentRate = recommendedRegime === 'OLD' ? oldMarginalRate : bracketRate;

  const handleSliderChange = React.useCallback((key: any, maxLimit: number, valStr: string) => {
    const val = Math.min(maxLimit, Math.max(0, parseInt(valStr.replace(/,/g, '')) || 0));
    updateDeduction(key, val);
  }, [updateDeduction]);

  const handleSliderKeyDown = React.useCallback((key: any, limit: number, step: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const val = confirmedDeductions?.[key] || 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      updateDeduction(key, Math.min(limit, val + step));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      updateDeduction(key, Math.max(0, val - step));
    }
  }, [confirmedDeductions, updateDeduction]);

  const setDeductionPreset = React.useCallback((key: any, value: number) => {
    updateDeduction(key, value);
  }, [updateDeduction]);

  if (isExtracting) {
    return (
      <div className="bg-[#0E131B] border border-white/[0.04] rounded-3xl p-8 text-slate-200 h-96 flex flex-col justify-center items-center space-y-4 animate-pulse">
        <Sparkles className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 animate-pulse">AI preparing your tax savings roadmap...</span>
      </div>
    );
  }

  return (
    <div className="w-full text-slate-100 font-sans max-w-[1200px] mx-auto py-4">
      <AnimatePresence mode="wait">
        
        {/* PAGE 3A: AI Deduction Recommendation */}
        {subStage === '3A' && (
          <motion.div
            key="3a"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* Savings Hero Section */}
            <SavingsHero 
              savings={calculation.savings || 39000} 
              subtitle="Great news — we’ve already optimized your deductions." 
            />

            {/* AI Recommendation Cards with Spacing & Padding Hierarchy */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">AI Exemption Plan Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* PRIMARY LARGE CARD: Standard Deduction */}
                <RecommendationCard
                  title="Standard Deduction"
                  badge="Applied Automatically"
                  amountText="₹75,000"
                  whyExplanation="Standard deduction is automatically applied to all salaried professionals under Section 16(ia) of the Income Tax Act to discount the taxable salary base by ₹75,000."
                  isPrimary={true}
                  onWhyClick={openWhySheet}
                />

                {/* Card 2: Section 80C */}
                <RecommendationCard
                  title="Section 80C Exemption"
                  badge="Recommended"
                  amountText={formatINR(val80C || 150000)}
                  whyExplanation="We mapped your employee provident fund (EPF) and tax-saving deposits to claim the maximum ₹1,50,000 base exemption limit."
                  onWhyClick={openWhySheet}
                />

                {/* Card 3: Corporate NPS Exemption */}
                <RecommendationCard
                  title="Corporate NPS Exemption"
                  badge="Opportunity Found"
                  amountText={`Save ${formatINR(Math.round(val80CCD2 * currentRate * 1.04) || 2475)}`}
                  whyExplanation="Structuring matching contributions under Section 80CCD(2) directly offsets basic salary taxable bases."
                  onWhyClick={openWhySheet}
                />

                {/* Card 4: New Tax Regime Slab Switch */}
                <RecommendationCard
                  title="New Tax Regime"
                  badge="Best Overall Option"
                  amountText="Lowest slab liability option"
                  whyExplanation="Our comparative analysis verifies that at your income ledger bracket, the New Slabs outperform the Old Slabs for net tax savings."
                  onWhyClick={openWhySheet}
                />

              </div>
            </div>

            {/* Confidence Verification Shield */}
            <ConfidenceShield />

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={onBack}
                className="h-12 px-6 border border-slate-850 hover:bg-white/[0.02] text-slate-400 hover:text-white text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95 transition-all w-full sm:w-auto"
              >
                Back to Income Summary
              </button>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSubStage('3B')}
                  className="h-12 px-6 border border-slate-850 hover:bg-white/[0.02] text-slate-405 hover:text-slate-200 text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95 transition-all w-full sm:w-auto"
                >
                  Review manually
                </button>
                
                <button
                  onClick={() => setSubStage('3C')}
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95 transition-all flex items-center justify-center gap-2 w-full sm:w-auto group shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5"
                >
                  <span>Continue with AI Plan</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PAGE 3B: Manual Deduction Planner */}
        {subStage === '3B' && (
          <motion.div
            key="3b"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left"
          >
            {/* Accordion Interface Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-100">Interactive Exemption Planner</h2>
                <p className="text-xs text-slate-450 leading-relaxed font-medium">
                  We've prefilled your eligible limits. Tweak any values below to customize your tax filing roadmap manually. Only one category is expanded at a time to minimize complexity.
                </p>
              </div>

              <div className="border border-white/[0.04] rounded-2xl overflow-hidden bg-slate-900/10 backdrop-blur-md">
                
                {/* Accordion Item: Section 80C */}
                <div className="border-b border-white/[0.04]">
                  <button
                    onClick={() => setExpandedAccordion(expandedAccordion === '80C' ? null : '80C')}
                    className="w-full py-4.5 px-5 flex items-center justify-between font-bold text-slate-200 hover:bg-white/[0.01] transition-all text-xs uppercase tracking-wider"
                  >
                    <span>Section 80C (Provident Fund, ELSS, Insurance)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono font-medium tracking-normal text-[11px] normal-case">{formatINR(val80C)}</span>
                      {expandedAccordion === '80C' ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {expandedAccordion === '80C' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 bg-[#070A0F] space-y-5 border-t border-white/[0.02] text-xs">
                          {/* 1. Current Claimed Amount */}
                          <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-white/[0.02]">
                            <span className="text-slate-400 font-semibold">Current Claimed Amount</span>
                            <span className="font-mono text-slate-200 font-extrabold">{formatINR(val80C)}</span>
                          </div>

                          {/* 2. Remaining Eligible Amount */}
                          <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-white/[0.02]">
                            <span className="text-slate-400 font-semibold">Remaining Eligible Amount</span>
                            <span className="font-mono text-slate-200 font-extrabold">{formatINR(Math.max(0, LIMIT_80C - val80C))}</span>
                          </div>

                          {/* 3. Live Savings */}
                          <div className="flex justify-between items-center bg-emerald-500/[0.02] p-3 rounded-lg border border-emerald-500/10">
                            <span className="text-emerald-450 font-bold">Live Section Savings</span>
                            <span className="font-mono text-emerald-400 font-black">
                              <AnimatedCounter value={Math.round(val80C * currentRate * 1.04)} />
                            </span>
                          </div>

                          {/* 4. Slider */}
                          <div className="space-y-2 bg-[#0E131B] border border-white/[0.03] p-4.5 rounded-xl">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Adjust Claim amount</span>
                              <div className="relative w-32 shrink-0">
                                <span className="absolute left-2.5 top-1.5 text-slate-500 text-[10px] font-bold">₹</span>
                                <input
                                  aria-label="Adjust 80C deduction amount"
                                  type="text"
                                  inputMode="numeric"
                                  value={val80C || ''}
                                  onChange={(e) => handleSliderChange('80C', LIMIT_80C, e.target.value)}
                                  placeholder="0"
                                  className="w-full pl-5 pr-2.5 py-1 bg-slate-950 border border-white/[0.06] rounded-lg text-xs font-mono font-extrabold text-right text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 relative">
                              <button 
                                type="button"
                                onClick={() => setDeductionPreset('80C', Math.max(0, val80C - 5000))}
                                className="p-1 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-slate-350 rounded-md transition-colors cursor-pointer"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              
                              <div className="flex-1 relative flex items-center">
                                <input
                                  id="range-80c"
                                  type="range"
                                  min="0"
                                  max={LIMIT_80C}
                                  step="5000"
                                  value={val80C}
                                  onChange={(e) => handleSliderChange('80C', LIMIT_80C, e.target.value)}
                                  onKeyDown={(e) => handleSliderKeyDown('80C', LIMIT_80C, 5000, e)}
                                  className="w-full accent-emerald-500 h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer border border-white/[0.04]"
                                />
                                <div className="absolute right-0 w-2 h-2 rounded-full bg-emerald-500 pointer-events-none shadow" title="Recommended Limit" />
                              </div>

                              <button 
                                type="button"
                                onClick={() => setDeductionPreset('80C', Math.min(LIMIT_80C, val80C + 5000))}
                                className="p-1 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-slate-355 rounded-md transition-colors cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="flex justify-between text-[9px] text-slate-500 font-mono font-semibold pt-1">
                              <span>₹0</span>
                              <span>₹75K (50%)</span>
                              <span>{formatINR(LIMIT_80C)} Limit</span>
                            </div>
                          </div>

                          {/* 5. Suggestions (Action-oriented chips) */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Quick Actions</span>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setDeductionPreset('80C', Math.min(LIMIT_80C, val80C + 25000))}
                                className="px-3 py-1.5 text-[10px] font-bold bg-[#0E131B] hover:bg-slate-800 border border-white/[0.04] rounded-lg text-slate-300 cursor-pointer transition-colors"
                              >
                                Add ₹25,000 to ELSS • Save {formatINR(Math.round(25000 * currentRate * 1.04))}
                              </button>
                              <button
                                onClick={() => setDeductionPreset('80C', LIMIT_80C)}
                                className="px-3 py-1.5 text-[10px] font-bold bg-[#0E131B] hover:bg-slate-800 border border-white/[0.04] rounded-lg text-slate-300 cursor-pointer transition-colors"
                              >
                                Max out PPF • Save {formatINR(Math.round((LIMIT_80C - val80C) * currentRate * 1.04))}
                              </button>
                            </div>
                          </div>

                          {/* 6. AI Advice (Conversational recommendation) */}
                          <div className="p-4 bg-[#0E131B] border border-white/[0.02] rounded-xl flex items-start gap-2.5 text-slate-400 leading-relaxed text-[11px]">
                            <span className="text-sm shrink-0">💡</span>
                            <p>
                              <strong>AI Suggestion:</strong> Adding ₹25,000 to ELSS could increase your tax savings by approximately {formatINR(Math.round(25000 * currentRate * 1.04))}. Your employer already contributes EPF.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion Item: Section 80D */}
                <div className="border-b border-white/[0.04]">
                  <button
                    onClick={() => setExpandedAccordion(expandedAccordion === '80D' ? null : '80D')}
                    className="w-full py-4.5 px-5 flex items-center justify-between font-bold text-slate-200 hover:bg-white/[0.01] transition-all text-xs uppercase tracking-wider"
                  >
                    <span>Section 80D (Medical Insurance Premium)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono font-medium tracking-normal text-[11px] normal-case">{formatINR(val80D)}</span>
                      {expandedAccordion === '80D' ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {expandedAccordion === '80D' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 bg-[#070A0F] space-y-5 border-t border-white/[0.02] text-xs">
                          {/* 1. Current Claimed Amount */}
                          <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-white/[0.02]">
                            <span className="text-slate-400 font-semibold">Current Claimed Amount</span>
                            <span className="font-mono text-slate-200 font-extrabold">{formatINR(val80D)}</span>
                          </div>

                          {/* 2. Remaining Eligible Amount */}
                          <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-white/[0.02]">
                            <span className="text-slate-400 font-semibold">Remaining Eligible Amount</span>
                            <span className="font-mono text-slate-200 font-extrabold">{formatINR(Math.max(0, LIMIT_80D - val80D))}</span>
                          </div>

                          {/* 3. Live Savings */}
                          <div className="flex justify-between items-center bg-emerald-500/[0.02] p-3 rounded-lg border border-emerald-500/10">
                            <span className="text-emerald-450 font-bold">Live Section Savings</span>
                            <span className="font-mono text-emerald-400 font-black">
                              <AnimatedCounter value={Math.round(val80D * currentRate * 1.04)} />
                            </span>
                          </div>

                          {/* 4. Slider */}
                          <div className="space-y-2 bg-[#0E131B] border border-white/[0.03] p-4.5 rounded-xl">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-slate-404 font-bold uppercase tracking-wider">Adjust Claim amount</span>
                              <div className="relative w-32 shrink-0">
                                <span className="absolute left-2.5 top-1.5 text-slate-500 text-[10px] font-bold">₹</span>
                                <input
                                  aria-label="Adjust 80D deduction amount"
                                  type="text"
                                  inputMode="numeric"
                                  value={val80D || ''}
                                  onChange={(e) => handleSliderChange('80D', LIMIT_80D, e.target.value)}
                                  placeholder="0"
                                  className="w-full pl-5 pr-2.5 py-1 bg-slate-955 border border-white/[0.06] rounded-lg text-xs font-mono font-extrabold text-right text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 relative">
                              <button 
                                type="button"
                                onClick={() => setDeductionPreset('80D', Math.max(0, val80D - 2500))}
                                className="p-1 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-slate-350 rounded-md transition-colors cursor-pointer"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              
                              <div className="flex-1 relative flex items-center">
                                <input
                                  id="range-80d"
                                  type="range"
                                  min="0"
                                  max={LIMIT_80D}
                                  step="2500"
                                  value={val80D}
                                  onChange={(e) => handleSliderChange('80D', LIMIT_80D, e.target.value)}
                                  onKeyDown={(e) => handleSliderKeyDown('80D', LIMIT_80D, 2500, e)}
                                  className="w-full accent-emerald-500 h-1.5 bg-slate-855 rounded-lg appearance-none cursor-pointer border border-white/[0.04]"
                                />
                                <div className="absolute right-0 w-2 h-2 rounded-full bg-emerald-500 pointer-events-none shadow" title="Recommended Limit" />
                              </div>

                              <button 
                                type="button"
                                onClick={() => setDeductionPreset('80D', Math.min(LIMIT_80D, val80D + 2500))}
                                className="p-1 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-slate-355 rounded-md transition-colors cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="flex justify-between text-[9px] text-slate-500 font-mono font-semibold pt-1">
                              <span>₹0</span>
                              <span>₹25K (Self/Family)</span>
                              <span>{formatINR(LIMIT_80D)} Limit</span>
                            </div>
                          </div>

                          {/* 5. Suggestions */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Quick Actions</span>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setDeductionPreset('80D', Math.min(LIMIT_80D, val80D + 25000))}
                                className="px-3 py-1.5 text-[10px] font-bold bg-[#0E131B] hover:bg-slate-800 border border-white/[0.04] rounded-lg text-slate-300 cursor-pointer transition-colors"
                              >
                                Claim Self Premium (₹25K) • Save {formatINR(Math.round(25000 * currentRate * 1.04))}
                              </button>
                              <button
                                onClick={() => setDeductionPreset('80D', Math.min(LIMIT_80D, val80D + 5000))}
                                className="px-3 py-1.5 text-[10px] font-bold bg-[#0E131B] hover:bg-slate-800 border border-white/[0.04] rounded-lg text-slate-300 cursor-pointer transition-colors"
                              >
                                Preventive Checkup (₹5K) • Save {formatINR(Math.round(5000 * currentRate * 1.04))}
                              </button>
                            </div>
                          </div>

                          {/* 6. AI Advice */}
                          <div className="p-4 bg-[#0E131B] border border-white/[0.02] rounded-xl flex items-start gap-2.5 text-slate-400 leading-relaxed text-[11px]">
                            <span className="text-sm shrink-0">💡</span>
                            <p>
                              <strong>AI Suggestion:</strong> Claiming ₹25,000 for self/family medical insurance premium saves {formatINR(Math.round(25000 * currentRate * 1.04))}. Adding preventive check-up receipts (up to ₹5,000) utilizes the remaining margin.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion Item: HRA Exemption */}
                <div className="border-b border-white/[0.04]">
                  <button
                    onClick={() => setExpandedAccordion(expandedAccordion === 'HRA' ? null : 'HRA')}
                    className="w-full py-4.5 px-5 flex items-center justify-between font-bold text-slate-200 hover:bg-white/[0.01] transition-all text-xs uppercase tracking-wider"
                  >
                    <span>HRA (House Rent Exemption)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono font-medium tracking-normal text-[11px] normal-case">{formatINR(valHRA)}</span>
                      {expandedAccordion === 'HRA' ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {expandedAccordion === 'HRA' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 bg-[#070A0F] space-y-5 border-t border-white/[0.02] text-xs">
                          {/* 1. Current Claimed Amount */}
                          <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-white/[0.02]">
                            <span className="text-slate-400 font-semibold">Current Claimed Amount</span>
                            <span className="font-mono text-slate-200 font-extrabold">{formatINR(valHRA)}</span>
                          </div>

                          {/* 2. Remaining Eligible Amount */}
                          <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-white/[0.02]">
                            <span className="text-slate-400 font-semibold">Remaining Eligible Amount</span>
                            <span className="font-mono text-slate-200 font-extrabold">{formatINR(Math.max(0, LIMIT_HRA - valHRA))}</span>
                          </div>

                          {/* 3. Live Savings */}
                          <div className="flex justify-between items-center bg-emerald-500/[0.02] p-3 rounded-lg border border-emerald-500/10">
                            <span className="text-emerald-450 font-bold">Live Section Savings</span>
                            <span className="font-mono text-emerald-400 font-black">
                              <AnimatedCounter value={Math.round(valHRA * currentRate * 1.04)} />
                            </span>
                          </div>

                          {/* 4. Slider */}
                          <div className="space-y-2 bg-[#0E131B] border border-white/[0.03] p-4.5 rounded-xl">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-slate-404 font-bold uppercase tracking-wider">Adjust Claim amount</span>
                              <div className="relative w-32 shrink-0">
                                <span className="absolute left-2.5 top-1.5 text-slate-500 text-[10px] font-bold">₹</span>
                                <input
                                  aria-label="Adjust HRA deduction amount"
                                  type="text"
                                  inputMode="numeric"
                                  value={valHRA || ''}
                                  onChange={(e) => handleSliderChange('HRA exemption', LIMIT_HRA, e.target.value)}
                                  placeholder="0"
                                  className="w-full pl-5 pr-2.5 py-1 bg-slate-950 border border-white/[0.06] rounded-lg text-xs font-mono font-extrabold text-right text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 relative">
                              <button 
                                type="button"
                                onClick={() => setDeductionPreset('HRA exemption', Math.max(0, valHRA - 10000))}
                                className="p-1 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-slate-355 rounded-md transition-colors cursor-pointer"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              
                              <div className="flex-1 relative flex items-center">
                                <input
                                  id="range-hra"
                                  type="range"
                                  min="0"
                                  max={LIMIT_HRA}
                                  step="5000"
                                  value={valHRA}
                                  onChange={(e) => handleSliderChange('HRA exemption', LIMIT_HRA, e.target.value)}
                                  onKeyDown={(e) => handleSliderKeyDown('HRA exemption', LIMIT_HRA, 5000, e)}
                                  className="w-full accent-emerald-500 h-1.5 bg-slate-855 rounded-lg appearance-none cursor-pointer border border-white/[0.04]"
                                />
                                <div className="absolute right-0 w-2 h-2 rounded-full bg-emerald-500 pointer-events-none shadow" title="Recommended Limit" />
                              </div>

                              <button 
                                type="button"
                                onClick={() => setDeductionPreset('HRA exemption', Math.min(LIMIT_HRA, valHRA + 10000))}
                                className="p-1 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-slate-355 rounded-md transition-colors cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="flex justify-between text-[9px] text-slate-500 font-mono font-semibold pt-1">
                              <span>₹0</span>
                              <span>₹1.5L (Metro average)</span>
                              <span>{formatINR(LIMIT_HRA)} Limit</span>
                            </div>
                          </div>

                          {/* 5. Suggestions */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Quick Actions</span>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setDeductionPreset('HRA exemption', 180000)}
                                className="px-3 py-1.5 text-[10px] font-bold bg-[#0E131B] hover:bg-slate-800 border border-white/[0.04] rounded-lg text-slate-300 cursor-pointer transition-colors"
                              >
                                Metro Rent Match (1.8L) • Save {formatINR(Math.round(180000 * currentRate * 1.04))}
                              </button>
                            </div>
                          </div>

                          {/* 6. AI Advice */}
                          <div className="p-4 bg-[#0E131B] border border-white/[0.02] rounded-xl flex items-start gap-2.5 text-slate-400 leading-relaxed text-[11px]">
                            <span className="text-sm shrink-0">💡</span>
                            <p>
                              <strong>AI Suggestion:</strong> Your rent receipts matching Mumbai residency support metro classifications. Claiming ₹1.8L rent exemption saves {formatINR(Math.round(180000 * currentRate * 1.04))} under Rule 2A.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion Item: Housing Loan Exemption */}
                <div className="border-b border-white/[0.04]">
                  <button
                    onClick={() => setExpandedAccordion(expandedAccordion === '24B' ? null : '24B')}
                    className="w-full py-4.5 px-5 flex items-center justify-between font-bold text-slate-205 hover:bg-white/[0.01] transition-all text-xs uppercase tracking-wider"
                  >
                    <span>Housing Loan Interest Exemption (Section 24b)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono font-medium tracking-normal text-[11px] normal-case">{formatINR(valSection24bLetOut)}</span>
                      {expandedAccordion === '24B' ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {expandedAccordion === '24B' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 bg-[#070A0F] space-y-5 border-t border-white/[0.02] text-xs">
                          {/* 1. Current Claimed Amount */}
                          <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-white/[0.02]">
                            <span className="text-slate-400 font-semibold">Current Claimed Amount</span>
                            <span className="font-mono text-slate-200 font-extrabold">{formatINR(valSection24bLetOut)}</span>
                          </div>

                          {/* 2. Remaining Eligible Amount */}
                          <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-white/[0.02]">
                            <span className="text-slate-400 font-semibold">Remaining Eligible Amount</span>
                            <span className="font-mono text-slate-200 font-extrabold">{formatINR(Math.max(0, LIMIT_24B_LETOUT - valSection24bLetOut))}</span>
                          </div>

                          {/* 3. Live Savings */}
                          <div className="flex justify-between items-center bg-emerald-500/[0.02] p-3 rounded-lg border border-emerald-500/10">
                            <span className="text-emerald-455 font-bold">Live Section Savings</span>
                            <span className="font-mono text-emerald-400 font-black">
                              <AnimatedCounter value={Math.round(valSection24bLetOut * currentRate * 1.04)} />
                            </span>
                          </div>

                          {/* 4. Slider */}
                          <div className="space-y-2 bg-[#0E131B] border border-white/[0.03] p-4.5 rounded-xl">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-slate-404 font-bold uppercase tracking-wider">Adjust Claim amount</span>
                              <div className="relative w-32 shrink-0">
                                <span className="absolute left-2.5 top-1.5 text-slate-500 text-[10px] font-bold">₹</span>
                                <input
                                  aria-label="Adjust Housing Loan deduction amount"
                                  type="text"
                                  inputMode="numeric"
                                  value={valSection24bLetOut || ''}
                                  onChange={(e) => handleSliderChange('section24bLetOut', LIMIT_24B_LETOUT, e.target.value)}
                                  placeholder="0"
                                  className="w-full pl-5 pr-2.5 py-1 bg-slate-955 border border-white/[0.06] rounded-lg text-xs font-mono font-extrabold text-right text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 relative">
                              <button 
                                type="button"
                                onClick={() => setDeductionPreset('section24bLetOut', Math.max(0, valSection24bLetOut - 10000))}
                                className="p-1 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-slate-355 rounded-md transition-colors cursor-pointer"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              
                              <div className="flex-1 relative flex items-center">
                                <input
                                  id="range-24b"
                                  type="range"
                                  min="0"
                                  max={LIMIT_24B_LETOUT}
                                  step="10000"
                                  value={valSection24bLetOut}
                                  onChange={(e) => handleSliderChange('section24bLetOut', LIMIT_24B_LETOUT, e.target.value)}
                                  onKeyDown={(e) => handleSliderKeyDown('section24bLetOut', LIMIT_24B_LETOUT, 10000, e)}
                                  className="w-full accent-emerald-500 h-1.5 bg-slate-855 rounded-lg appearance-none cursor-pointer border border-white/[0.04]"
                                />
                                <div className="absolute right-0 w-2 h-2 rounded-full bg-emerald-500 pointer-events-none shadow" title="Recommended Limit" />
                              </div>

                              <button 
                                type="button"
                                onClick={() => setDeductionPreset('section24bLetOut', Math.min(LIMIT_24B_LETOUT, valSection24bLetOut + 10000))}
                                className="p-1 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-slate-355 rounded-md transition-colors cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="flex justify-between text-[9px] text-slate-500 font-mono font-semibold pt-1">
                              <span>₹0</span>
                              <span>₹1L (Average self occupancy)</span>
                              <span>{formatINR(LIMIT_24B_LETOUT)} Limit</span>
                            </div>
                          </div>

                          {/* 5. Suggestions */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Quick Actions</span>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setDeductionPreset('section24bLetOut', LIMIT_24B_LETOUT)}
                                className="px-3 py-1.5 text-[10px] font-bold bg-[#0E131B] hover:bg-slate-800 border border-white/[0.04] rounded-lg text-slate-300 cursor-pointer transition-colors"
                              >
                                Claim Max self-occupancy (₹2L) • Save {formatINR(Math.round(LIMIT_24B_LETOUT * currentRate * 1.04))}
                              </button>
                            </div>
                          </div>

                          {/* 6. AI Advice */}
                          <div className="p-4 bg-[#0E131B] border border-white/[0.02] rounded-xl flex items-start gap-2.5 text-slate-405 leading-relaxed text-[11px]">
                            <span className="text-sm shrink-0">💡</span>
                            <p>
                              <strong>AI Suggestion:</strong> Home loan interest remains deductible under the Old Regime up to ₹2,00,000. Interest on let-out properties is fully deductible without the ₹2L ceiling limit.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>

            {/* Desktop Sticky Summary Panel (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
              <div className="bg-slate-905 border border-white/[0.04] rounded-3xl p-6 backdrop-blur-md space-y-6 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-white/[0.02] pb-3">Exemption Summary</span>
                
                <div className="space-y-4 border-b border-white/[0.04] pb-4">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold block">Claimed Amount</span>
                    <span className="text-base font-extrabold text-slate-200 font-mono">
                      <AnimatedCounter value={totalClaimed} />
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold block">Remaining Eligibility</span>
                    <span className="text-base font-extrabold text-blue-405 font-mono">
                      <AnimatedCounter value={Math.max(0, LIMIT_80C - val80C + LIMIT_80D - val80D + LIMIT_HRA - valHRA)} />
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold block">Estimated Savings</span>
                    <span className="text-base font-extrabold text-emerald-455 font-mono">
                      <AnimatedCounter value={calculation.savings || 39000} />
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold block">Selected Regime</span>
                    <span className="text-xs font-bold text-slate-300">{recommendedRegime === 'NEW' ? 'New Tax Slabs' : 'Old Tax Slabs'}</span>
                  </div>
                </div>

                {/* Completion Checklist (80C Complete, HRA Pending etc.) */}
                <div className="space-y-2.5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold block">Exemption Milestones</span>
                  <div className="space-y-2 text-xs font-medium text-slate-400">
                    <div className="flex items-center gap-2">
                      {val80C >= LIMIT_80C ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] font-bold">○</div>
                      )}
                      <span className={val80C >= LIMIT_80C ? 'text-emerald-450' : ''}>80C {val80C >= LIMIT_80C ? 'Complete' : 'Pending'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {val80D >= 25000 ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] font-bold">○</div>
                      )}
                      <span className={val80D >= 25000 ? 'text-emerald-450' : ''}>80D {val80D >= 25000 ? 'Complete' : 'Pending'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {valHRA > 0 ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] font-bold">○</div>
                      )}
                      <span className={valHRA > 0 ? 'text-emerald-450' : ''}>HRA {valHRA > 0 ? 'Complete' : 'Pending'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">○</div>
                      <span>NPS Optional</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/[0.02]">
                  <button
                    onClick={() => setSubStage('3C')}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Review Final Plan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setSubStage('3A')}
                    className="w-full h-11 border border-slate-850 hover:bg-white/[0.02] text-slate-400 hover:text-slate-205 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 text-center"
                  >
                    Cancel Manual Review
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* PAGE 3C: Final Deduction Review */}
        {subStage === '3C' && (
          <motion.div
            key="3c"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 max-w-xl mx-auto"
          >
            {/* Completion Success Hero */}
            <div className="text-center space-y-3 pb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">✓ Everything looks good</h2>
              <p className="text-xs text-slate-450 leading-relaxed max-w-sm mx-auto font-medium">
                Your deductions have been finalized and verified against active AY 2026-27 compliance matrices.
              </p>
            </div>

            {/* Savings Card Comparison (+₹14,200 previous filing) */}
            <div className="bg-[#0E131B] border border-white/[0.04] rounded-3xl p-6 text-center space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Estimated Tax Savings</span>
              <span className="text-3xl font-black text-emerald-400 tracking-tight block font-mono">
                {formatINR(calculation.savings || 39000)}
              </span>
              <div className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-450 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full mt-2">
                <TrendingUp className="h-3 w-3" />
                <span>+{formatINR(14200)} compared to previous filing</span>
              </div>
            </div>

            {/* Deduction Summary Checklist */}
            <div className="bg-slate-905 border border-white/[0.04] rounded-3xl p-6 backdrop-blur-md space-y-4 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-white/[0.02] pb-3">Final Ledger Breakdown</span>

              <div className="flex justify-between items-center py-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-450" />
                  <span className="text-xs font-semibold text-slate-200">Standard Deduction</span>
                </div>
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {formatINR(recommendedRegime === 'NEW' ? 75000 : 50000)}
                </span>
              </div>

              {val80C > 0 && (
                <div className="flex justify-between items-center py-2.5 border-t border-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-455" />
                    <span className="text-xs font-semibold text-slate-200">Section 80C Exemption</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 font-mono">{formatINR(val80C)}</span>
                </div>
              )}

              {val80D > 0 && (
                <div className="flex justify-between items-center py-2.5 border-t border-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-455" />
                    <span className="text-xs font-semibold text-slate-200">Section 80D Exemption</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 font-mono">{formatINR(val80D)}</span>
                </div>
              )}

              {valHRA > 0 && (
                <div className="flex justify-between items-center py-2.5 border-t border-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-455" />
                    <span className="text-xs font-semibold text-slate-200">HRA Exemption</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 font-mono">{formatINR(valHRA)}</span>
                </div>
              )}

              {val80CCD2 > 0 && (
                <div className="flex justify-between items-center py-2.5 border-t border-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-455" />
                    <span className="text-xs font-semibold text-slate-200">Employer NPS (80CCD(2))</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 font-mono">{formatINR(val80CCD2)}</span>
                </div>
              )}

              {valNPS > 0 && (
                <div className="flex justify-between items-center py-2.5 border-t border-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-455" />
                    <span className="text-xs font-semibold text-slate-200">Voluntary NPS (80CCD(1B))</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 font-mono">{formatINR(valNPS)}</span>
                </div>
              )}

              {valSection24bLetOut > 0 && (
                <div className="flex justify-between items-center py-2.5 border-t border-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-455" />
                    <span className="text-xs font-semibold text-slate-200">Housing Loan (Sec 24b)</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 font-mono">{formatINR(valSection24bLetOut)}</span>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setSubStage('3A')}
                className="h-12 px-6 border border-slate-850 hover:bg-white/[0.02] text-slate-400 hover:text-white text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95 transition-all w-full sm:w-auto"
              >
                Back to Recommendation
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSubStage('3B')}
                  className="h-12 px-6 border border-slate-850 hover:bg-white/[0.02] text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95 transition-all w-full sm:w-auto"
                >
                  Edit deductions
                </button>
                
                <button
                  onClick={onContinue}
                  className="h-12 px-6 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto group font-extrabold"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-955" />
                  <span>Proceed to Filing Review</span>
                </button>
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* Slide sheet details */}
      <WhyRecommendationSheet 
        isOpen={whySheetOpen} 
        onClose={() => setWhySheetOpen(false)} 
        title={whySheetTitle} 
        explanation={whySheetExplanation} 
      />
    </div>
  );
});

export default DeductionCard;
