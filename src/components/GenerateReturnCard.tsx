import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Clock,
  Download,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';
import { AIFilingWorkspaceModal } from './AIFilingWorkspaceModal';

interface GenerateReturnCardProps {
  onContinue: () => void;
  onBack: () => void;
}

export const GenerateReturnCard: React.FC<GenerateReturnCardProps> = React.memo(({ onContinue, onBack }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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

  const triggerGenerate = React.useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-slate-900 dark:text-slate-100 py-2">
      
      {/* Centered Success Hero Card */}
      <div className="bg-white/70 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-8 backdrop-blur-xl text-center space-y-4 shadow-md relative overflow-hidden">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none blur-2xl" />

        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 mb-1 shadow-inner">
          <FileCheck2 className="h-7 w-7 text-emerald-500 dark:text-emerald-400 animate-pulse" />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Your return is ready.</h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
          Everything has been reviewed. You're one step away from generating your Income Tax Return.
        </p>

        {/* Final Exemption Summary Grid */}
        <div className="mt-6 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-5 text-left shadow-inner">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block border-b border-slate-200/60 dark:border-white/[0.04] pb-2.5 mb-4">
            Final Exemption Summary
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
            <div className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/[0.02]">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-0.5">Estimated Savings</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatINR(savingsAmount)}</span>
            </div>
            <div className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/[0.02]">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-0.5">Tax Regime</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime'}</span>
            </div>
            <div className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/[0.02]">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-0.5">Filing Status</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Ready for Filing</span>
            </div>
            <div className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/[0.02]">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-0.5">Compliance</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filing Roadmap Checklist */}
      <div className="bg-white/70 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 text-left space-y-4 backdrop-blur-xl shadow-md">
        <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block border-b border-slate-200/60 dark:border-white/[0.04] pb-2.5">
          Filing Roadmap Checklist
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Generate Return', desc: 'Build ledger' },
            { step: '2', title: 'Filing Workspace', desc: 'Verify JSON' },
            { step: '3', title: 'Final Preview', desc: 'Double-check XML' },
            { step: '4', title: 'Portal Submit', desc: 'Secure upload' }
          ].map((item, idx) => (
            <div key={item.title} className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.04] p-4 rounded-2xl space-y-2 relative shadow-sm">
              <div className="w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.06] rounded-lg flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-300">
                {item.step}
              </div>
              <div className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{item.title}</div>
              <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">{item.desc}</div>
              {idx < 3 && (
                <div className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -right-3.5 z-10 items-center justify-center select-none pointer-events-none">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Section (Trust Card) */}
      <div className="bg-emerald-500/10 dark:bg-emerald-500/[0.04] border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl p-4.5 flex items-start gap-3.5 text-left">
        <Lock className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Zero-Knowledge Sandbox Guard</span>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Your information never leaves your secure local browser workspace. Generated filing logs remain heavily encrypted. Nothing is submitted automatically without your signature.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="h-12 px-6 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95 transition-all w-full sm:w-auto"
        >
          Back to Review
        </button>

        <button
          onClick={triggerGenerate}
          className="h-12 px-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer select-none active:scale-95 transition-all flex items-center justify-center gap-2 w-full sm:w-auto group shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
        >
          <ShieldCheck className="h-4 w-4 text-white" />
          <span>Generate My Return</span>
        </button>
      </div>

      {/* Premium AI Operating System Workspace Modal */}
      <AIFilingWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={() => {
          setIsModalOpen(false);
          onContinue();
        }}
        savingsAmount={savingsAmount}
        recommendedRegime={recommendedRegime}
      />

    </div>
  );
});

export default GenerateReturnCard;
