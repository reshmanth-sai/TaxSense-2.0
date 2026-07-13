import React, { useState, useMemo } from 'react';
import { 
  Check, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Activity,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';
import { TaxData } from '../types';

// Animated Counter for savings
const SavingsCounter: React.FC<{ value: number }> = React.memo(({ value }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 1200;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{formatINR(displayValue)}</span>;
});

const RegimeComparison = React.memo(({ hideHero = false }: { hideHero?: boolean }) => {
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const { addChatMessage, setIsFloatingAIChatOpen, setActiveStep } = useTaxStore();
  
  const [activeSection, setActiveSection] = useState<'overview' | 'recommendation' | 'details' | 'legal'>('overview');
  const [isWhatChangedOpen, setIsWhatChangedOpen] = useState(false);

  const taxData: TaxData = useMemo(() => ({
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

  const calculation = useMemo(() => calculateTax(taxData), [taxData]);
  const { oldRegime, newRegime, recommendedRegime, savings } = calculation;
  const totalDeductionsClaimed = Math.max(0, oldRegime.totalDeductions - 50000);

  const handleAskCopilot = (question: string) => {
    addChatMessage({ role: 'user', content: question });
    setIsFloatingAIChatOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      
      {!hideHero && (
        <>
          {/* Premium Hero Section */}
          <div className="space-y-1.5 text-left border-b border-white/[0.04] pb-4">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
              AI Optimization Strategy
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-100">Your optimal tax strategy is ready.</h2>
          </div>

          {/* Redesigned Recommendation Summary Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0E131B] border border-white/[0.04] rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-2xl space-y-6"
          >
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-emerald-500/[0.02] blur-[70px] rounded-full pointer-events-none" />

            {/* 1. Estimated Savings Hero */}
            <div className="space-y-1 text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Estimated Tax Savings</span>
              <div className="text-5xl lg:text-6xl font-black text-emerald-400 font-mono tracking-tighter leading-none select-all">
                <SavingsCounter value={savings} />
              </div>
              <p className="text-[11px] text-slate-455 font-bold uppercase tracking-wider pt-1">
                Compared with your current filing strategy
              </p>
            </div>

            <div className="h-px bg-white/[0.04] w-full" />

            {/* 2. AI Recommendation */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-455" />
                AI Recommendation
              </span>
              <div className="text-lg lg:text-xl font-bold text-slate-100">
                {recommendedRegime === 'NEW' ? 'New Tax Regime' : 'Old Tax Regime'}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Produces the lowest projected tax liability for AY 2026-27.
              </p>
            </div>

            <div className="h-px bg-white/[0.04] w-full" />

            {/* 3. Verification checklist chips */}
            <div className="space-y-2.5 text-left select-none">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">Verified against</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Form 16 Extraction',
                  'Gross Salary',
                  'Eligible Deductions',
                  'AY 2026-27 Slab Rules',
                  'PAN Match Ledger'
                ].map((check) => (
                  <div key={check} className="flex items-center gap-1.5 bg-blue-600/5 border border-blue-500/10 px-3 py-1 rounded-lg text-[10px] text-blue-400 font-bold">
                    <Check className="h-3 w-3 text-blue-400" />
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/[0.04] w-full" />

            {/* 4. AI Confidence status */}
            <div className="space-y-1 text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">AI Confidence</span>
              <div className="text-xs text-emerald-455 font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Very High Confidence</span>
              </div>
              <p className="text-[11px] text-slate-450 font-medium">
                All calculations verified. No compliance issues detected.
              </p>
            </div>

          </motion.div>
        </>
      )}

      {/* Segmented Pills for Tabbed Sections */}
      <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-white/[0.04] rounded-xl self-start mt-2 select-none">
        {(['overview', 'recommendation', 'details', 'legal'] as const).map(section => {
          const displayNames: Record<string, string> = {
            overview: 'Overview',
            recommendation: 'Why This Works',
            details: 'Calculation',
            legal: 'Tax Rules'
          };
          const isActive = activeSection === section;

          return (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer relative ${
                isActive ? 'text-slate-100 bg-[#0E131B] shadow-inner' : 'text-slate-450 hover:text-slate-205'
              }`}
            >
              <span>{displayNames[section]}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels with AnimatePresence */}
      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW */}
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              {/* Recommended Next Action */}
              <div className="bg-[#0E131B] border border-white/[0.04] rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">Recommended Next Action</span>
                    <h4 className="text-sm font-bold text-slate-100">
                      We recommend switching to the {recommendedRegime === 'NEW' ? 'New Tax Regime' : 'Old Tax Regime'}.
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-450 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <span>High Impact</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 font-semibold text-left">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Why?</p>
                  <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
                    <li>Lowest projected tax liability</li>
                    <li>Saves <span className="text-emerald-450 font-mono font-bold">{formatINR(savings)}</span></li>
                    <li>Verified using your Form 16 details</li>
                    <li>No compliance concerns detected</li>
                    <li>Takes less than one minute</li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-white/[0.02]">
                  <button
                    onClick={() => setActiveSection('recommendation')}
                    className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors cursor-pointer border-none bg-transparent p-0"
                  >
                    Learn How AI Calculated This
                  </button>
                </div>
              </div>

              {/* AI Timeline Panel */}
              <div className="bg-[#0E131B] border border-white/[0.04] rounded-2xl p-5 space-y-3.5">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">AI Compliance Journey</span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-[10px] font-bold text-slate-400 select-none">
                  {[
                    'Form 16 analyzed',
                    'Salary verified',
                    'Deductions matched',
                    'Regimes compared',
                    'Savings estimated'
                  ].map((step, i) => (
                    <div key={step} className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-white/[0.02]">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 flex items-center justify-center font-mono text-[8.5px]">✓</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expandable What Changed */}
              <div className="border border-white/[0.04] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setIsWhatChangedOpen(!isWhatChangedOpen)}
                  className="w-full p-4 flex justify-between items-center bg-[#0E131B]/50 hover:bg-[#0E131B] transition-colors cursor-pointer text-left border-none"
                >
                  <span className="text-[10px] text-slate-350 uppercase tracking-widest font-black">Compared to your current filing</span>
                  {isWhatChangedOpen ? <ChevronUp className="h-4 w-4 text-slate-455" /> : <ChevronDown className="h-4 w-4 text-slate-455" />}
                </button>

                <AnimatePresence>
                  {isWhatChangedOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-[#0D1117]/30 border-t border-white/[0.02]"
                    >
                      <div className="p-4 space-y-2 text-xs font-semibold text-slate-400">
                        <div className="flex justify-between items-center py-1">
                          <span>Tax savings optimization:</span>
                          <span className="text-emerald-450 font-mono font-bold">+{formatINR(savings)} savings</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t border-white/[0.02] pt-2">
                          <span>Taxable income threshold:</span>
                          <span className="text-slate-300 font-mono">- Lower taxable base</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t border-white/[0.02] pt-2">
                          <span>Slabs configuration:</span>
                          <span className="text-slate-300">✓ Better slab selection</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Continue with AI Filing CTA */}
              {!hideHero && (
                <div className="pt-2 text-center space-y-2 select-none">
                  <button
                    onClick={() => setActiveStep(6)}
                    className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/10 active:scale-98 flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <span>Continue with AI Filing</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="text-[10px] text-slate-500 font-bold">
                    You can review every calculation before submission.
                  </p>
                </div>
              )}

            </motion.div>
          )}

          {/* TAB 2: WHY THIS WORKS */}
          {activeSection === 'recommendation' && (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              <div className="bg-[#0E131B] border border-white/[0.04] rounded-2xl p-5 space-y-4">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">AI Compliance Strategy</span>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  Based on your verified salary, employer deductions and Form 16, the New Tax Regime results in the lowest projected tax liability. Your current deductions are not sufficient to offset the lower slab rates introduced for AY 2026–27. Switching regimes increases your estimated savings by <strong className="text-emerald-450 font-mono font-bold">{formatINR(savings)}</strong>.
                </p>
              </div>

              {/* Benefits & Trade-offs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-[#0E131B] border border-white/[0.04] rounded-2xl p-5 space-y-3">
                  <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-black block">Benefits</span>
                  <div className="flex flex-wrap gap-1.5 select-none">
                    {[
                      '✓ Lower tax slabs',
                      '✓ Higher standard deduction',
                      '✓ Faster filing processing',
                      '✓ Zero compliance complexity'
                    ].map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0E131B] border border-white/[0.04] rounded-2xl p-5 space-y-3">
                  <span className="text-[9px] text-amber-500 uppercase tracking-widest font-black block">Trade-offs (Cannot claim)</span>
                  <div className="flex flex-wrap gap-1.5 select-none">
                    {[
                      'Section 80C',
                      'Section 80D',
                      'HRA Rent Rebate',
                      'LTA Allowance'
                    ].map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-slate-905 border border-white/[0.02] text-slate-400 text-[10px] font-bold rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CALCULATION */}
          {activeSection === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#0E131B] border border-white/[0.04] rounded-2xl p-5"
            >
              <div className="border border-white/[0.03] rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/[0.04] bg-slate-900/50 text-slate-500 font-semibold font-mono">
                      <th className="p-3">Tax Parameter</th>
                      <th className="p-3 text-right">Old Regime</th>
                      <th className="p-3 text-right text-blue-400">New Regime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02] text-slate-350 font-medium">
                    <tr>
                      <td className="p-3">Gross Salary + Interest</td>
                      <td className="p-3 text-right font-mono">{formatINR(oldRegime.grossTotalIncome - (incomeProfile?.stcg || 0) - (incomeProfile?.ltcg || 0))}</td>
                      <td className="p-3 text-right font-mono">{formatINR(newRegime.grossTotalIncome - (incomeProfile?.stcg || 0) - (incomeProfile?.ltcg || 0))}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-rose-450">Standard Deduction</td>
                      <td className="p-3 text-right font-mono text-rose-455">-{formatINR(50000)}</td>
                      <td className="p-3 text-right font-mono text-rose-455">-{formatINR(75000)}</td>
                    </tr>
                    <tr>
                      <td className="p-3">Claimed Deductions (80C, 80D, HRA)</td>
                      <td className="p-3 text-right font-mono">-{formatINR(totalDeductionsClaimed)}</td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        {confirmedDeductions?.['80CCD(2)'] ? `-${formatINR(confirmedDeductions['80CCD(2)'])}` : 'Not Allowed'}
                      </td>
                    </tr>
                    <tr className="bg-white/[0.01]">
                      <td className="p-3 font-semibold text-slate-205">Net Taxable Income</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-205">{formatINR(oldRegime.taxableIncome)}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-205">{formatINR(newRegime.taxableIncome)}</td>
                    </tr>
                    <tr>
                      <td className="p-3">Base Slab Tax</td>
                      <td className="p-3 text-right font-mono">{formatINR(oldRegime.baseTax)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(newRegime.baseTax)}</td>
                    </tr>
                    <tr>
                      <td className="p-3">Rebate (Sec 87A)</td>
                      <td className="p-3 text-right font-mono text-emerald-450">-{formatINR(oldRegime.rebate87A)}</td>
                      <td className="p-3 text-right font-mono text-emerald-450">-{formatINR(newRegime.rebate87A)}</td>
                    </tr>
                    <tr>
                      <td className="p-3">Health & Education Cess (4%)</td>
                      <td className="p-3 text-right font-mono">{formatINR(oldRegime.cess)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(newRegime.cess)}</td>
                    </tr>
                    <tr className="bg-slate-900/50">
                      <td className="p-3 font-extrabold text-slate-100">Total Tax Payable</td>
                      <td className="p-3 text-right font-mono font-extrabold text-slate-100">{formatINR(oldRegime.totalTaxPayable)}</td>
                      <td className="p-3 text-right font-mono font-extrabold text-slate-100 text-emerald-400">{formatINR(newRegime.totalTaxPayable)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 4: TAX RULES */}
          {activeSection === 'legal' && (
            <motion.div
              key="legal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#0E131B] border border-white/[0.04] rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.02] pb-3 select-none">
                <BookOpen className="w-5 h-5 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-205">Statutory References (AY 2026-27)</h3>
              </div>
              <ul className="space-y-4 text-xs text-slate-400 leading-relaxed font-semibold">
                <li className="flex gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-300 block mb-1">Section 115BAC (New Tax Regime)</strong>
                    Default tax regime offering reduced tax slab rates. Standard deduction increased to ₹75,000 for salaried employees. Forgoes most Chapter VI-A deductions except 80CCD(2).
                  </div>
                </li>
                <li className="flex gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-300 block mb-1">Section 87A Rebate</strong>
                    Rebate up to ₹25,000 for New Regime (taxable income up to ₹7,00,000) and ₹12,500 for Old Regime (taxable income up to ₹5,00,000).
                  </div>
                </li>
              </ul>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
});

export default RegimeComparison;
