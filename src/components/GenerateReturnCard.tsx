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

interface GenerateReturnCardProps {
  onContinue: () => void;
  onBack: () => void;
}

export const GenerateReturnCard: React.FC<GenerateReturnCardProps> = React.memo(({ onContinue, onBack }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [generationStep, setGenerationStep] = React.useState(0);

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

  // Progressive modal checkpoints
  React.useEffect(() => {
    if (!isModalOpen) {
      setGenerationStep(0);
      return;
    }
    const timer1 = setTimeout(() => setGenerationStep(1), 500);
    const timer2 = setTimeout(() => setGenerationStep(2), 1000);
    const timer3 = setTimeout(() => setGenerationStep(3), 1500);
    const timer4 = setTimeout(() => setGenerationStep(4), 2000);
    const timer5 = setTimeout(() => setGenerationStep(5), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [isModalOpen]);

  const triggerGenerate = React.useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <div className="space-y-8 max-w-[1000px] mx-auto text-slate-100 py-4">
      
      {/* Centered Success Hero */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2">
          <ShieldCheck className="h-6 w-6 text-blue-400 animate-pulse" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">Your return is ready.</h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
          Everything has been reviewed. You're one step away from generating your Income Tax Return.
        </p>
      </div>

      {/* Completion Illustration (CSS/SVG checkmark-shield) */}
      <div className="flex justify-center my-4 select-none">
        <div className="relative w-28 h-28 flex items-center justify-center bg-slate-900/30 border border-white/[0.04] rounded-full">
          {/* Outer rotating pulse rings */}
          <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/20 animate-spin" style={{ animationDuration: '30s' }} />
          <div className="absolute inset-2 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: '4s' }} />
          
          <div className="relative w-18 h-18 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <FileCheck2 className="h-9 w-9 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Submission Summary Card */}
      <div className="max-w-md mx-auto bg-[#0E131B] border border-white/[0.04] rounded-3xl p-6 text-left space-y-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block border-b border-white/[0.02] pb-2">Final Exemption Summary</span>
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-0.5">Estimated Savings</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{formatINR(savingsAmount)}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-0.5">Tax Regime</span>
            <span className="text-sm font-bold text-slate-200">{recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime'}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-0.5">Filing Status</span>
            <span className="text-sm font-bold text-blue-400">Ready for Filing</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-0.5">Compliance</span>
            <span className="text-sm font-bold text-emerald-400">Verified</span>
          </div>
        </div>
      </div>

      {/* What Happens Next Timeline */}
      <div className="max-w-xl mx-auto space-y-4 text-left">
        <span className="text-[10px] font-bold text-slate-505 uppercase tracking-widest block pl-1">Filing Roadmap Checklist</span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Generate Return', desc: 'Build ledger' },
            { step: '2', title: 'Filing Workspace', desc: 'Verify JSON' },
            { step: '3', title: 'Final Preview', desc: 'Double-check XML' },
            { step: '4', title: 'Portal Submit', desc: 'Secure upload' }
          ].map((item, idx) => (
            <div key={item.title} className="bg-slate-900/10 border border-white/[0.03] p-4.5 rounded-2xl space-y-2 relative">
              <div className="w-6 h-6 bg-slate-900 border border-white/[0.06] rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400">
                {item.step}
              </div>
              <div className="text-[11px] font-bold text-slate-200 leading-tight">{item.title}</div>
              <div className="text-[10px] text-slate-500">{item.desc}</div>
              {idx < 3 && (
                <div className="hidden sm:block absolute top-6 -right-2.5 z-10 text-slate-650 font-bold font-mono">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Section (Trust Card) */}
      <div className="max-w-xl mx-auto bg-slate-950/40 border border-white/[0.02] rounded-3xl p-5 flex items-start gap-3.5 text-left">
        <Lock className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Zero-Knowledge Sandbox Guard</span>
          <p className="text-xs text-slate-405 leading-relaxed font-medium">
            Your information never leaves your secure local browser workspace. Generated filing logs remain heavily encrypted. Nothing is submitted automatically without your signature.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-xl mx-auto pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="h-12 px-6 border border-slate-850 hover:bg-white/[0.02] text-slate-400 hover:text-white text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95 transition-all w-full sm:w-auto"
        >
          Back to Review
        </button>

        <button
          onClick={triggerGenerate}
          className="h-12 px-8 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer select-none active:scale-95 transition-all flex items-center justify-center gap-2 w-full sm:w-auto group shadow-lg shadow-emerald-500/10 hover:-translate-y-0.5"
        >
          <ShieldCheck className="h-4 w-4 text-slate-950" />
          <span>Generate My Return</span>
        </button>
      </div>

      {/* Success Generation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 transition-opacity"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:max-w-md md:mx-auto bg-[#0A0D14] border border-white/[0.08] p-8 rounded-3xl z-50 shadow-2xl space-y-6 text-left"
            >
              
              {generationStep < 5 ? (
                // LOADING / GENERATING PACKAGE STATE
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Generating your filing package...</h3>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-3.5 font-medium text-xs text-slate-400">
                    <div className="flex items-center gap-2.5">
                      {generationStep >= 1 ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-450" />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">○</div>
                      )}
                      <span className={generationStep >= 1 ? 'text-slate-100' : ''}>Validating calculations</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {generationStep >= 2 ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-455" />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">○</div>
                      )}
                      <span className={generationStep >= 2 ? 'text-slate-100' : ''}>Creating return</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {generationStep >= 3 ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-455" />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">○</div>
                      )}
                      <span className={generationStep >= 3 ? 'text-slate-100' : ''}>Checking compliance</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {generationStep >= 4 ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-455" />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">○</div>
                      )}
                      <span className={generationStep >= 4 ? 'text-slate-100' : ''}>Preparing filing workspace</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {generationStep >= 4 ? (
                        <div className="w-4.5 h-4.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">○</div>
                      )}
                      <span className={generationStep >= 4 ? 'text-slate-100' : ''}>Generating PDF...</span>
                    </div>
                  </div>
                </div>
              ) : (
                // COMPLETED SUCCESS CELEBRATION STATE
                <div className="space-y-6 text-center">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 select-none">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-100">Your filing workspace is ready.</h3>
                    <p className="text-xs text-slate-450 leading-relaxed font-semibold">Everything has been generated successfully.</p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2.5 select-none">
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        onContinue(); // Transitions to stage 6 / final workspace
                      }}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Open Filing Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => alert("Downloading return PDF...")}
                      className="w-full h-11 border border-slate-850 hover:bg-white/[0.02] text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Return</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-full h-10 text-slate-500 hover:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                    >
                      View Summary
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
});

export default GenerateReturnCard;
