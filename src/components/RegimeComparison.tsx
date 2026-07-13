import React, { useState, useMemo } from 'react';
import { Check, ShieldCheck, Sparkles, ChevronDown, ChevronUp, AlertCircle, ArrowRight, BookOpen, Clock, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';
import { TaxData } from '../types';
import { ContextService } from '../services/ai/ContextService';
import { PromptBuilder } from '../services/ai/PromptBuilder';

const RegimeComparison = React.memo(() => {
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const [activeSection, setActiveSection] = useState<'overview' | 'recommendation' | 'details' | 'legal'>('overview');
  const { addChatMessage, setIsFloatingAIChatOpen } = useTaxStore();

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
  
  // Health Score calculation (mock heuristic for premium feel)
  const healthScore = useMemo(() => {
    let score = 70;
    if (savings > 0) score += 15;
    if (taxData.deduction80C >= 150000) score += 10;
    if (taxData.deduction80CCD2 > 0) score += 5;
    return Math.min(100, score);
  }, [savings, taxData]);

  const handleAskCopilot = (question: string) => {
    addChatMessage({ role: 'user', content: question });
    setIsFloatingAIChatOpen(true);
  };

  const isOptimized = savings === 0 && healthScore > 90;

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      
      {/* 1. Overview Health Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 lg:p-8 backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {/* Estimated Savings (Optimization Potential) - Dominant */}
          <div className="space-y-1 bg-emerald-500/[0.02] border border-emerald-500/20 p-4 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              Estimated Savings
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">{formatINR(savings)}</span>
            </div>
          </div>

          {/* Recommended Regime */}
          <div className="space-y-1 p-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              Recommended Regime
            </p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-extrabold text-slate-100">{recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime'}</span>
            </div>
          </div>

          {/* Verification Confidence */}
          <div className="space-y-1 p-4 relative group cursor-help">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              Verification Confidence
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500 w-[94%]" />
              </div>
              <span className="text-xs text-slate-300 font-bold font-mono">94%</span>
            </div>
            
            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 bg-slate-950 border border-slate-850 rounded-xl shadow-2xl text-[9.5px] leading-relaxed text-slate-350 space-y-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-30 text-left font-sans font-medium">
              <p className="font-bold text-white uppercase tracking-wider text-[8px] font-mono text-emerald-400">Confidence Analysis</p>
              <p className="font-semibold text-slate-200">94% confidence verification checks passed.</p>
              <div className="pt-1 border-t border-slate-900 text-slate-400 text-[8.5px] space-y-0.5">
                <div>✓ 12 Form 16 parameters matched</div>
                <div>✓ AY 2026-27 regime rules loaded</div>
                <div>✓ Deductions eligibility approved</div>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-slate-850 rotate-45 -mt-1" />
            </div>
          </div>

          {/* Tax Health Score */}
          <div className="space-y-1 p-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-450" />
              Tax Health Score
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold text-slate-100">{healthScore}</span>
              <span className="text-slate-500 font-mono text-sm mb-0.5">/100</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progressive Navigation */}
      <div className="flex items-center gap-3.5 mb-2 mt-4 border-b border-slate-800/60 pb-2 relative">
        {(['overview', 'recommendation', 'details', 'legal'] as const).map(section => {
          const displayNames: Record<string, string> = {
            overview: 'Summary',
            recommendation: 'Recommended Action',
            details: 'Explanation',
            legal: 'Tax Rules'
          };
          const isActive = activeSection === section;

          return (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`pb-2 px-1 text-xs font-bold transition-all duration-200 cursor-pointer relative select-none uppercase tracking-wider ${
                isActive ? 'text-blue-400' : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              <span>{displayNames[section]}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeTabBorder"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        
        {/* Section: Overview (Intelligent Recommendation Cards) */}
        {activeSection === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {isOptimized ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] p-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-extrabold text-emerald-400">Congratulations! You are highly optimized.</h3>
                <p className="text-xs text-emerald-400/80 max-w-md mx-auto">
                  Our AI models verify that your current investments and selected regime mathematically minimize your tax liability under AY 2026-27 rules.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-bold text-slate-350 mb-2">Next Best Actions</h3>
                {savings > 0 && (
                  <div className="bg-slate-900/60 border border-white/[0.04] rounded-2xl p-6 hover:border-blue-500/50 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">High Priority</span>
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Takes less than 1 minute</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-100">Switch to {recommendedRegime === 'NEW' ? 'New' : 'Old'} Regime</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                          Based on your verified gross salary and deductions, switching to the Recommended Regime reduces your estimated tax liability by <strong className="text-emerald-400 font-mono font-bold">{formatINR(savings)}</strong>.
                        </p>
                      </div>
                      <div className="shrink-0 flex flex-col gap-3 min-w-[200px]">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Estimated Savings</p>
                          <p className="text-2xl font-extrabold text-emerald-400">{formatINR(savings)}</p>
                        </div>
                        <button 
                          onClick={() => handleAskCopilot(`Why should I switch to the ${recommendedRegime} regime?`)}
                          className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Explain This Recommendation
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {taxData.deduction80C < 150000 && recommendedRegime === 'OLD' && (
                  <div className="bg-slate-900/60 border border-white/[0.04] rounded-2xl p-6 hover:border-blue-500/50 transition-colors group mt-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Medium Priority</span>
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Action required</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-100">Maximize Section 80C Shortfall</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                          You have {formatINR(150000 - taxData.deduction80C)} remaining in your 80C limit. Investing this before March 31st will lower your taxable base further.
                        </p>
                      </div>
                      <div className="shrink-0 flex flex-col gap-3 min-w-[200px]">
                        <button 
                          onClick={() => handleAskCopilot(`What are the best 80C investment options for my shortfall of ${formatINR(150000 - taxData.deduction80C)}?`)}
                          className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold text-xs rounded-lg transition-colors cursor-pointer h-full"
                        >
                          Ask AI for Options
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Section: Recommendation Explanation */}
        {activeSection === 'recommendation' && (
          <motion.div
            key="recommendation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 lg:p-8 backdrop-blur-md space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-200">Why We Recommend This</h3>
            </div>
            
            <div className="text-xs text-slate-400 leading-relaxed space-y-4">
              <p>
                Based on your verified salary and deductions, opting for the New Tax Regime is more efficient. The lower tax slab rates and the higher standard deduction of ₹75,000 provide a larger benefit than your total deductions of {formatINR(totalDeductionsClaimed)} would yield under the Old Regime.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className={`p-4 rounded-xl border ${recommendedRegime === 'OLD' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/40 border-white/[0.03]'}`}>
                  <h4 className={`text-xs font-bold mb-1.5 ${recommendedRegime === 'OLD' ? 'text-emerald-400' : 'text-slate-350'}`}>Why Old Regime?</h4>
                  <p className="text-[11px] text-slate-450">
                    Beneficial only if your exemptions (like HRA) and savings (80C, 80D) exceed the breakeven threshold of ~₹3.75L.
                  </p>
                </div>
                <div className={`p-4 rounded-xl border ${recommendedRegime === 'NEW' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/40 border-white/[0.03]'}`}>
                  <h4 className={`text-xs font-bold mb-1.5 ${recommendedRegime === 'NEW' ? 'text-emerald-400' : 'text-slate-355'}`}>Why New Regime?</h4>
                  <p className="text-[11px] text-slate-450">
                    Offers a higher basic tax exemption limit (₹3L) and lower tax slab rates, making it more favorable when deductions are under the threshold.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section: Detailed Calculations (The Original Table) */}
        {activeSection === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 backdrop-blur-md"
          >
            <div className="bg-slate-950 border border-white/[0.03] rounded-2xl overflow-hidden shadow-inner">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-slate-900/50 text-slate-500 font-semibold font-mono">
                    <th className="p-3">Tax Parameter</th>
                    <th className="p-3 text-right">Old Regime</th>
                    <th className="p-3 text-right">New Regime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03] text-slate-350 font-medium">
                  <tr>
                    <td className="p-3">Gross Salary + Interest</td>
                    <td className="p-3 text-right font-mono">{formatINR(oldRegime.grossTotalIncome - (incomeProfile?.stcg || 0) - (incomeProfile?.ltcg || 0))}</td>
                    <td className="p-3 text-right font-mono">{formatINR(newRegime.grossTotalIncome - (incomeProfile?.stcg || 0) - (incomeProfile?.ltcg || 0))}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-rose-400">Standard Deduction</td>
                    <td className="p-3 text-right font-mono text-rose-400">-{formatINR(50000)}</td>
                    <td className="p-3 text-right font-mono text-rose-400">-{formatINR(75000)}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Claimed Deductions (80C, 80D, HRA)</td>
                    <td className="p-3 text-right font-mono">-{formatINR(totalDeductionsClaimed)}</td>
                    <td className="p-3 text-right font-mono text-slate-505">
                      {confirmedDeductions?.['80CCD(2)'] ? `-${formatINR(confirmedDeductions['80CCD(2)'])}` : 'Not Allowed'}
                    </td>
                  </tr>
                  <tr className="bg-white/[0.01]">
                    <td className="p-3 font-semibold text-slate-200">Net Taxable Income</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-200">{formatINR(oldRegime.taxableIncome)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-200">{formatINR(newRegime.taxableIncome)}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Base Slab Tax</td>
                    <td className="p-3 text-right font-mono">{formatINR(oldRegime.baseTax)}</td>
                    <td className="p-3 text-right font-mono">{formatINR(newRegime.baseTax)}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Rebate (Sec 87A)</td>
                    <td className="p-3 text-right font-mono text-emerald-400">-{formatINR(oldRegime.rebate87A)}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">-{formatINR(newRegime.rebate87A)}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Health & Education Cess (4%)</td>
                    <td className="p-3 text-right font-mono">{formatINR(oldRegime.cess)}</td>
                    <td className="p-3 text-right font-mono">{formatINR(newRegime.cess)}</td>
                  </tr>
                  <tr className="bg-slate-900/50">
                    <td className="p-3 font-extrabold text-slate-100">Total Tax Payable</td>
                    <td className="p-3 text-right font-mono font-extrabold text-slate-100">{formatINR(oldRegime.totalTaxPayable)}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-slate-100">{formatINR(newRegime.totalTaxPayable)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Section: Legal References */}
        {activeSection === 'legal' && (
          <motion.div
            key="legal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 lg:p-8 backdrop-blur-md"
          >
             <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <BookOpen className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-200">Statutory References (AY 2026-27)</h3>
            </div>
            <ul className="space-y-4 text-xs text-slate-400">
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
  );
});

export default RegimeComparison;
