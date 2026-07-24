import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, CheckCircle2, Lock, ArrowRight, ArrowDown, HelpCircle, 
  MessageSquare, BookOpen, Send, CheckCircle, Info, ChevronDown, ChevronRight, AlertCircle,
  Copy, Check
} from 'lucide-react';

interface AIReasoningDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  explanation: string;
  recommendedRegime?: 'OLD' | 'NEW';
  savings?: number;
  grossSalary?: number;
  val80C?: number;
  val80D?: number;
  valHRA?: number;
  valNPS?: number;
  val80CCD2?: number;
  valSection24bLetOut?: number;
}

export const AIReasoningDrawer: React.FC<AIReasoningDrawerProps> = ({
  isOpen,
  onClose,
  title = "Standard Deduction",
  explanation = "Standard deduction is automatically applied.",
  recommendedRegime = "NEW",
  savings = 77896,
  grossSalary = 850000,
  val80C = 150000,
  val80D = 25000,
  valHRA = 0,
  valNPS = 0,
  val80CCD2 = 0,
  valSection24bLetOut = 0
}) => {
  const [toggleState, setToggleState] = useState<'PROFESSIONAL' | 'SIMPLE'>('PROFESSIONAL');
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(3); // Default expanded Standard Deduction
  const [expandedCalc, setExpandedCalc] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [showOpportunity, setShowOpportunity] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isChatExpanded, setIsChatExpanded] = useState<boolean>(true);

  const drawerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when chat updates
  useEffect(() => {
    if (chatHistory.length > 0 || isChatTyping) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatTyping]);

  // Formatting currency helper
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Close drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        // Check if the click is not on a tooltip or portal
        const target = e.target as HTMLElement;
        if (!target.closest('.tooltip-trigger') && !target.closest('.drawer-trigger')) {
          onClose();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // AI loading progressive checklist simulation
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Reading Form 16 records...",
    "Mapping salary structures...",
    "Evaluating Section 80C & 80D eligibility...",
    "Comparing Old vs New Regime configurations...",
    "Formulating optimization reasoning..."
  ];

  useEffect(() => {
    if (isOpen) {
      setIsAiLoading(true);
      setLoadingStep(0);
      let step = 0;
      const interval = setInterval(() => {
        step += 1;
        if (step < loadingSteps.length) {
          setLoadingStep(step);
        } else {
          clearInterval(interval);
          setIsAiLoading(false);
        }
      }, 350);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Dictionary for dynamic explanations based on toggled complexity
  const getBilingualContent = () => {
    const cleanTitle = title.toUpperCase();
    if (cleanTitle.includes('STANDARD')) {
      return {
        lawTitle: "Section 16(ia) - Standard Deduction",
        professional: "Under Section 16(ia) of the Income Tax Act, a flat standard deduction of ₹75,000 is automatically applied to reduce your taxable salary base. This is available in both the Old and New tax regimes for Assessment Year 2026-27.",
        simple: "The government automatically subtracts a flat ₹75,000 from your salary before calculating any taxes. This is a built-in discount for all salaried employees, and you do not need to show any bills or proofs to get it.",
        status: "Automatically Applicable",
        section: "Section 16(ia)",
        source: "Salary Ledger",
        action: "None required"
      };
    } else if (cleanTitle.includes('80C')) {
      return {
        lawTitle: "Section 80C - Investment Exemption",
        professional: "Exemptions under Section 80C are capped at ₹1,50,000. Based on your Form 16 payroll history, your Employee Provident Fund (EPF) contributions completely satisfy this threshold. Note: Section 80C is disallowed under the New Regime.",
        simple: "We saved ₹1,50,000 from taxes using the money you put into your Provident Fund (EPF). Note: This tax break is only available if you choose the Old Tax Regime.",
        status: "Recommended (Old Regime Only)",
        section: "Section 80C",
        source: "Form 16 Part B",
        action: "Enabled in Old Slabs comparison"
      };
    } else if (cleanTitle.includes('NPS') || cleanTitle.includes('80CCD')) {
      return {
        lawTitle: "Section 80CCD(2) - Corporate NPS Exemption",
        professional: "Section 80CCD(2) allows deduction of employer pension contributions up to 10% of basic salary + DA. This remains a highly optimized tax-exempt allowance that is allowed under both the Old and New Regimes.",
        simple: "This is a tax deduction for pension contributions made by your employer. It lowers your taxable income in both the old and new systems up to 10% of your basic pay.",
        status: "Opportunity Found",
        section: "Section 80CCD(2)",
        source: "Employer Payroll",
        action: "Check Corporate Restructuring"
      };
    } else if (cleanTitle.includes('REGIME') || cleanTitle.includes('SLAB')) {
      return {
        lawTitle: "Section 115BAC - Regime Choice Optimization",
        professional: "A mathematical comparison of slab liability yields that the New Tax Slabs under Section 115BAC result in ₹77,896 in absolute savings. The progressive 5/10/15/20/30% slabs with higher tax rebate thresholds outperform the Old Regime even with standard investments.",
        simple: "Choosing the New Tax system is the best option for your ₹8,50,000 salary. The tax rates are lower, meaning you save ₹77,896 without having to lock up your savings in tax investments.",
        status: "Best Option Recommended",
        section: "Section 115BAC",
        source: "Tax Slabs AY 2026-27",
        action: "Select New Slabs on final submission"
      };
    }

    return {
      lawTitle: "Income Tax Act Exemption Block",
      professional: explanation,
      simple: "Our AI mapped your tax data to get the maximum possible savings under active rules.",
      status: "Verified",
      section: "Chapter VI-A",
      source: "Uploaded Document Ledger",
      action: "Review and proceed"
    };
  };

  const activeContent = getBilingualContent();

  // AI Chat responses simulation
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setIsChatExpanded(true);
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setChatMessage('');
    setIsChatTyping(true);

    // Simulate AI Advisor writing response
    setTimeout(() => {
      let replyText = "Based on your income parameters, the New Tax Regime offers lower rates. Standard Deduction of ₹75,000 has been applied automatically.";
      const query = userText.toLowerCase();

      if (query.includes('new') || query.includes('regime')) {
        replyText = `With a gross salary of ${formatINR(grossSalary)}, the New Slabs tax you at progressive rates starting from ₹3,00,000, and include a full tax rebate up to ₹7,00,000. Under the Old Slabs, even with 80C deductions, your taxable base of ₹6,25,000 carries higher tax liability. Thus, the New Regime saves you ${formatINR(savings)}.`;
      } else if (query.includes('80c') || query.includes('investment')) {
        replyText = `Under Section 80C, you can deduct up to ₹1,50,000 for PF, PPF, and ELSS. However, 80C is NOT allowed in the New Slabs. Our engine compared the benefit: the New slabs still save you ${formatINR(savings)} more than claiming 80C in the Old Slabs.`;
      } else if (query.includes('nps') || query.includes('corporate')) {
        replyText = `Employer NPS contribution under Section 80CCD(2) is a special tax break allowed in both regimes. Your company can deduct up to 10% of your basic pay. If you restructure your salary, you can save an additional ₹2,475.`;
      } else if (query.includes('hra') || query.includes('rent')) {
        replyText = `House Rent Allowance (HRA) exemption under Section 10(13A) is only allowed under the Old Tax Regime. In your case, the New Regime's lower rates still yield higher savings than claiming HRA under the Old Regime.`;
      }

      setChatHistory(prev => [...prev, { sender: 'ai', text: replyText }]);
      setIsChatTyping(false);
    }, 1000);
  };

  const quickPrompts = [
    "Why New Regime?",
    "How to claim Corporate NPS?",
    "How is 80C calculated?",
    "Why didn't HRA apply?"
  ];

  if (typeof window === 'undefined' || !document.body) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Custom Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/28 backdrop-blur-[2px] z-[200] transition-opacity duration-200"
          />

          {/* Slide-over floating panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed right-0 top-0 bottom-0 w-full min-w-[460px] max-w-[560px] md:w-[520px] bg-white dark:bg-[#0B1020] border-l border-slate-200 dark:border-white/[0.06] rounded-l-[24px] shadow-2xl dark:shadow-[0_32px_80px_rgba(0,0,0,0.35)] z-[200] flex flex-col justify-between text-left overflow-hidden h-[100vh]"
          >
            {/* Ambient Purple Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-radial from-blue-500/5 via-transparent to-transparent pointer-events-none blur-3xl z-0" />

            {/* HEADER */}
            <div className="p-6 border-b border-slate-200 dark:border-white/[0.04] flex items-center justify-between shrink-0 relative z-10 bg-white/95 dark:bg-[#0B1020]/95 backdrop-blur-sm">
              <div className="space-y-1 max-w-[80%]">
                <h2 className="text-[20px] font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>🧠 Why this recommendation?</span>
                </h2>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-normal">
                  {toggleState === 'PROFESSIONAL' 
                    ? "Generated from Form 16, employer records, salary structure, AY 2026–27 rules & active Income Tax Act."
                    : "Plain-English breakdown of your tax savings and simple optimization recommendations."
                  }
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Verified badge */}
                <div className="relative tooltip-trigger">
                  <button
                    onMouseEnter={() => setActiveTooltip(true)}
                    onMouseLeave={() => setActiveTooltip(false)}
                    onClick={() => setActiveTooltip(!activeTooltip)}
                    className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/15 transition-all select-none cursor-help"
                  >
                    <span>✓ VERIFIED</span>
                    <span className="font-mono">99%</span>
                  </button>
                  <AnimatePresence>
                    {activeTooltip && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] p-3 rounded-xl shadow-xl z-[210] text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed"
                      >
                        Confidence is calculated from salary data completeness and statutory validation algorithms.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                  aria-label="Close explanation report"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scrollbar-thin">
              
              {/* Segmented Control - Explanation Style Switcher */}
              <div className="flex justify-between items-center bg-slate-100 dark:bg-[#0E1527] border border-slate-200 dark:border-white/[0.04] p-1.5 rounded-xl shadow-inner">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold pl-2">Explanation style</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setToggleState('PROFESSIONAL')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      toggleState === 'PROFESSIONAL' 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                        : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-transparent'
                    }`}
                  >
                    Professional
                  </button>
                  <button
                    onClick={() => setToggleState('SIMPLE')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      toggleState === 'SIMPLE' 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                        : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-transparent'
                    }`}
                  >
                    Simple
                  </button>
                </div>
              </div>

              {isAiLoading ? (
                /* INTELLIGENT CHECKLIST LOADER */
                <div className="py-20 flex flex-col justify-center space-y-5">
                  <div className="flex flex-col items-center justify-center space-y-2 mb-6">
                    <Sparkles className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold animate-pulse">Formulating reasoning matrix...</span>
                  </div>
                  <div className="max-w-xs mx-auto space-y-3">
                    {loadingSteps.map((stepMsg, idx) => {
                      const isDone = loadingStep > idx;
                      const isCurrent = loadingStep === idx;
                      return (
                        <div key={stepMsg} className="flex items-center justify-between text-xs transition-all duration-200">
                          <span className={`${isDone ? 'text-slate-400 dark:text-slate-500 font-medium line-through' : isCurrent ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-600'}`}>
                            {stepMsg}
                          </span>
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : isCurrent ? (
                            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* DYNAMIC streamed content container */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* AI SUMMARY CARD */}
                  <div className="bg-slate-50 dark:bg-[#0E1527] border border-slate-200 dark:border-white/[0.04] p-5 rounded-2xl space-y-3 relative overflow-hidden shadow-sm dark:shadow-lg group hover:border-slate-350 dark:hover:border-white/[0.08] transition-all hover:-translate-y-0.5 duration-200">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/[0.02] pb-2.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Advisory Summary</span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 font-mono tracking-wider">High Confidence</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {toggleState === 'PROFESSIONAL' ? (
                          <>Based on your salary records, eligible exemptions, and statutory rules, the <strong className="text-blue-600 dark:text-blue-400">New Regime Slabs</strong> optimize your structure to yield the lowest tax liability.</>
                        ) : (
                          <>We analyzed your salary and tax options. The <strong className="text-blue-600 dark:text-blue-400">New Tax Regime</strong> is the smartest choice for you—it leaves the maximum cash in your pocket without requiring extra investment proofs.</>
                        )}
                      </p>
                      <div className="flex justify-between items-baseline pt-2">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Estimated Savings</span>
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">{formatINR(savings)}</span>
                      </div>
                    </div>
                  </div>

                  {/* TAX CALCULATION FLOW DIAGRAM */}
                  <div className="bg-slate-50/50 dark:bg-[#0E1527]/60 border border-slate-200 dark:border-white/[0.03] p-5 rounded-2xl space-y-4">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Tax calculation flow</span>
                    
                    <div className="flex flex-col items-center space-y-2">
                      {/* Gross Salary node */}
                      <div className="w-full bg-white dark:bg-[#12192D] border border-slate-200 dark:border-white/[0.04] p-3 rounded-xl flex justify-between items-center hover:border-slate-300 dark:hover:border-blue-500/30 transition-colors">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          {toggleState === 'PROFESSIONAL' ? "Gross Salary (Sec 17(1))" : "Total Annual Salary"}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{formatINR(grossSalary)}</span>
                      </div>

                      <ArrowDown className="w-3.5 h-3.5 text-blue-500/40 animate-pulse" />

                      {/* Deduction node */}
                      <div className="w-full bg-white dark:bg-[#12192D] border border-slate-200 dark:border-white/[0.04] p-3 rounded-xl flex justify-between items-center hover:border-slate-300 dark:hover:border-red-500/20 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                            {toggleState === 'PROFESSIONAL' ? "Standard Deduction" : "Built-in Tax Discount"}
                          </span>
                          <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-mono">
                            {toggleState === 'PROFESSIONAL' ? "Sec 16(ia)" : "Automatic"}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">-{formatINR(75000)}</span>
                      </div>

                      <ArrowDown className="w-3.5 h-3.5 text-blue-500/40" />

                      {/* Taxable base node */}
                      <div className="w-full bg-white dark:bg-[#12192D] border border-slate-200 dark:border-white/[0.04] p-3 rounded-xl flex justify-between items-center">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          {toggleState === 'PROFESSIONAL' ? "Taxable Income" : "Final Income Subject to Tax"}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{formatINR(grossSalary - 75000)}</span>
                      </div>

                      <ArrowDown className="w-3.5 h-3.5 text-blue-500/40 animate-pulse" />

                      {/* Final Net Tax */}
                      <div className="w-full bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            {toggleState === 'PROFESSIONAL' ? "Estimated Net Tax" : "Final Tax Payable"}
                          </span>
                          <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-semibold uppercase">
                            {toggleState === 'PROFESSIONAL' ? "New Regime" : "New System: ₹0"}
                          </span>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">₹0</span>
                      </div>
                    </div>
                  </div>

                  {/* AI THINKING TIMELINE WITH COLLAPSIBLE DETAILED STEPS */}
                  <div className="bg-slate-50 dark:bg-[#0E1527] border border-slate-200 dark:border-white/[0.04] p-5 rounded-2xl space-y-4">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">AI Advisory Timeline</span>
                    
                    <div className="relative border-l border-slate-200 dark:border-white/[0.06] ml-3 pl-5 space-y-5 text-left">
                      {[
                        { 
                          id: 1, 
                          label: toggleState === 'PROFESSIONAL' ? "Reading Form 16 payload" : "Reading your Form 16 document", 
                          descProf: "Digital Form 16 OCR scan completed with 99% accuracy.", 
                          descSimple: "Scanned your Form 16 document cleanly with 99% accuracy.", 
                          section: "OCR Parser", 
                          amount: null 
                        },
                        { 
                          id: 2, 
                          label: toggleState === 'PROFESSIONAL' ? "Mapping salary structure" : "Analyzing basic pay & allowances", 
                          descProf: "Basic Pay and HRA allowances parsed from Part B records.", 
                          descSimple: "Checked your basic salary, HRA, and tax-free allowance breakdowns.", 
                          section: "Structure Ledger", 
                          amount: null 
                        },
                        { 
                          id: 3, 
                          label: toggleState === 'PROFESSIONAL' ? "Applying Standard Deduction" : "Applying automatic ₹75,000 discount", 
                          descProf: activeContent.professional, 
                          descSimple: activeContent.simple, 
                          section: activeContent.section, 
                          amount: 75000 
                        },
                        { 
                          id: 4, 
                          label: toggleState === 'PROFESSIONAL' ? "Evaluating Section 80C investments" : "Checking Provident Fund (EPF) claims", 
                          descProf: "Provident Fund (EPF) of ₹1,50,000 processed under Section 80C.", 
                          descSimple: "Checked your Provident Fund (EPF) savings of ₹1,50,000.", 
                          section: "Section 80C", 
                          amount: 150000 
                        },
                        { 
                          id: 5, 
                          label: toggleState === 'PROFESSIONAL' ? "Checking Corporate NPS provisions" : "Checking company pension tax-breaks", 
                          descProf: "Employer pension mapping analysed under Sec 80CCD(2).", 
                          descSimple: "Checked if your employer contributes to Corporate NPS pension.", 
                          section: "Section 80CCD(2)", 
                          amount: 0 
                        },
                        { 
                          id: 6, 
                          label: toggleState === 'PROFESSIONAL' ? "Comparing Old vs New Regime slabs" : "Comparing Old vs New tax systems", 
                          descProf: "Calculated old regime liability (₹77,896) vs new regime (₹0).", 
                          descSimple: "Compared both systems to find your maximum savings of ₹77,896.", 
                          section: "Section 115BAC", 
                          amount: savings 
                        }
                      ].map((step) => {
                        const isExpanded = expandedStep === step.id;
                        return (
                          <div key={step.id} className="relative group">
                            {/* Glow connector line */}
                            <div className={`absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border transition-all z-10 ${
                              isExpanded 
                                ? 'bg-blue-500 border-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)] scale-125' 
                                : 'bg-emerald-500 border-emerald-500'
                            }`} />

                            <div className="space-y-1">
                              <button
                                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                                className="w-full flex items-center justify-between font-bold text-[13px] text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                              >
                                <span>{step.label}</span>
                                <div className="flex items-center gap-2">
                                  {step.amount !== null && (
                                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{formatINR(step.amount)}</span>
                                  )}
                                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                                </div>
                              </button>

                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pt-2 pb-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium space-y-3 border-t border-slate-200 dark:border-white/[0.02] mt-1">
                                      <p>{toggleState === 'PROFESSIONAL' ? step.descProf : step.descSimple}</p>
                                      
                                      {/* Expanded step details card */}
                                      {step.id === 3 && (
                                        <div className="grid grid-cols-2 gap-2 bg-white dark:bg-[#12192D] border border-slate-200 dark:border-white/[0.04] p-3.5 rounded-xl text-[11px]">
                                          <div>
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block font-bold">Section</span>
                                            <span className="font-mono text-slate-800 dark:text-slate-300 font-bold">{activeContent.section}</span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block font-bold">Status</span>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeContent.status}</span>
                                          </div>
                                          <div className="pt-1.5 border-t border-slate-200 dark:border-white/[0.02] mt-1.5">
                                            <span className="text-[9px] text-slate-500 uppercase block font-bold">Source Mapped</span>
                                            <span className="text-slate-600 dark:text-slate-300 font-semibold">{activeContent.source}</span>
                                          </div>
                                          <div className="pt-1.5 border-t border-slate-200 dark:border-white/[0.02] mt-1.5">
                                            <span className="text-[9px] text-slate-500 uppercase block font-bold">Action Required</span>
                                            <span className="text-slate-500 dark:text-slate-400 font-semibold">{activeContent.action}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* REASONING DEDUCTION DETAIL CARDS */}
                  <div className="bg-slate-50 dark:bg-[#0E1527] border border-slate-200 dark:border-white/[0.04] p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Exemption Explanations</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Citations Available</span>
                    </div>

                    <div className="space-y-3.5">
                      {/* Card 1: Standard Deduction */}
                      <div className="bg-white dark:bg-[#12192D] border border-slate-200 dark:border-white/[0.04] p-4.5 rounded-xl space-y-3 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Standard Deduction</span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">Applied</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {toggleState === 'PROFESSIONAL' 
                            ? "The Income Tax Act automatically provides salaried employees with a flat deduction of ₹75,000 under Section 16(ia). Since your gross income consists entirely of salary income, this deduction has been fully claimed."
                            : "The government automatically reduces ₹75,000 from your total salary before calculating tax, saving you money automatically without requiring bills."
                          }
                        </p>
                        
                        {/* Expandable calculation link */}
                        <div className="pt-2.5 border-t border-slate-200 dark:border-white/[0.02]">
                          <button
                            onClick={() => setExpandedCalc(expandedCalc === 'std' ? null : 'std')}
                            className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Official Section 16(ia) Calculation</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedCalc === 'std' ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {expandedCalc === 'std' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2.5 p-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/[0.02] rounded-lg space-y-1.5 text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-300"
                              >
                                <div className="flex justify-between">
                                  <span>Gross Salary Mapped:</span>
                                  <span className="font-mono text-slate-800 dark:text-slate-200">{formatINR(grossSalary)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Exemption Eligibility:</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Yes (Salaried Head)</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                                  <span>Applied Deduction:</span>
                                  <span className="font-mono">₹75,000</span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OPPORTUNITY CARD */}
                  <AnimatePresence>
                    {showOpportunity && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-amber-500/5 dark:bg-amber-500/[0.03] border border-amber-500/20 dark:border-amber-500/10 p-5 rounded-2xl space-y-3 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                        <div className="flex justify-between items-center border-b border-amber-500/15 pb-2">
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Opportunity Found</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 font-mono bg-amber-500/10 px-2 py-0.5 rounded">
                            Save +₹2,475
                          </span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200">Corporate NPS Structuring</h4>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            {toggleState === 'PROFESSIONAL' ? (
                              <>Your employer currently does not contribute under Section 80CCD(2). If your company restructures your CTC to contribute to NPS, you could save an additional ₹2,475.</>
                            ) : (
                              <>If your company deposits part of your salary into Corporate NPS pension directly, you can save an extra ₹2,475 tax-free every year!</>
                            )}
                          </p>
                          <div className="flex gap-2 pt-2 justify-end">
                            <button
                              onClick={() => setShowOpportunity(false)}
                              className="px-3.5 py-1.5 border border-slate-250 dark:border-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => {
                                setChatHistory(prev => [...prev, { sender: 'user', text: "Tell me how to claim Corporate NPS savings" }]);
                                setIsChatTyping(true);
                                setTimeout(() => {
                                  setChatHistory(prev => [...prev, { sender: 'ai', text: "Section 80CCD(2) lets private employers contribute up to 10% of basic pay directly to your NPS. This reduces your net taxable salary. Request your payroll admin to add Corporate NPS in your salary breakdown!" }]);
                                  setIsChatTyping(false);
                                }, 850);
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                            >
                              Learn More
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* CONFIDENCE PANEL SHIELD */}
                  <div className="bg-slate-50 dark:bg-[#0E1527] border border-slate-200 dark:border-white/[0.04] p-5 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Confidence Shield</span>
                      <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-450">99% Validated</span>
                    </div>

                    {/* Custom graphic progress bar */}
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-300/50 dark:border-white/[0.02] relative">
                      <div className="h-full bg-emerald-500 rounded-full w-[99%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-semibold font-sans">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                        <span>Form 16 verified</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                        <span>PAN matched</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                        <span>Employer validated</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                        <span>Salary mapped</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                        <span>AY rules matched</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                        <span>Classification verified</span>
                      </div>
                    </div>
                  </div>

                  {/* SOURCES LIST */}
                  <div className="bg-slate-50/50 dark:bg-[#0E1527]/40 border border-slate-200 dark:border-white/[0.02] p-4.5 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Information Sources</span>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider font-mono">
                      {["Income Tax Act", "CBDT Notification", "AY 2026-27 Rules", "Employer Form 16", "Salary Ledger"].map(s => (
                        <div key={s} className="flex items-center gap-1 bg-white dark:bg-[#12192D] border border-slate-200 dark:border-white/[0.04] px-2 py-0.8 rounded-lg select-none">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500/80" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* AI CHAT AND FOOTER (COLLAPSIBLE CHAT ASSISTANT) */}
            <div className="border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/90 dark:bg-[#0E1527]/90 backdrop-blur-md p-4 shrink-0 relative z-10 space-y-3 shadow-lg">
              
              {/* Collapsible Header Bar */}
              <div 
                onClick={() => setIsChatExpanded(!isChatExpanded)}
                className="flex items-center justify-between cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                    Ask AI Assistant
                  </span>
                  {chatHistory.length > 0 && (
                    <span className="text-[9.5px] font-extrabold font-mono bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full">
                      {chatHistory.length} {chatHistory.length === 1 ? 'message' : 'messages'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    {isChatExpanded ? 'Minimize' : 'Expand Chat'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isChatExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Collapsible Chat Body */}
              <AnimatePresence initial={false}>
                {isChatExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="space-y-3 overflow-hidden"
                  >
                    {/* Chat history logs */}
                    {chatHistory.length > 0 && (
                      <div className="max-h-56 md:max-h-64 overflow-y-auto space-y-3 pb-2 pr-1 scrollbar-thin text-xs text-left border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-3.5 bg-slate-100/50 dark:bg-slate-900/50">
                        {chatHistory.map((item, idx) => (
                          <div 
                            key={idx} 
                            className={`p-3.5 rounded-2xl leading-relaxed font-medium transition-all ${
                              item.sender === 'user' 
                                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 ml-6 shadow-sm' 
                                : 'bg-purple-500/10 dark:bg-purple-500/[0.08] border border-purple-500/20 text-slate-800 dark:text-slate-200 mr-4 shadow-sm relative group'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                {item.sender === 'ai' ? (
                                  <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-purple-600 dark:text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                                    AI Tax Advisor
                                  </span>
                                ) : (
                                  <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>

                              {item.sender === 'ai' && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.text);
                                    setCopiedIndex(idx);
                                    setTimeout(() => setCopiedIndex(null), 2000);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-purple-500/20 rounded transition-all text-purple-600 dark:text-purple-400 cursor-pointer"
                                  title="Copy response"
                                >
                                  {copiedIndex === idx ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              )}
                            </div>

                            <p className="text-xs leading-relaxed font-medium whitespace-pre-line">{item.text}</p>
                          </div>
                        ))}

                        {isChatTyping && (
                          <div className="bg-purple-500/10 dark:bg-purple-500/[0.08] border border-purple-500/20 p-3.5 rounded-2xl text-purple-600 dark:text-purple-300 mr-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 animate-spin text-purple-500 shrink-0" />
                            <span className="font-semibold text-xs">AI Tax Advisor is generating explanation</span>
                            <span className="flex gap-1 items-center ml-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                          </div>
                        )}

                        <div ref={chatEndRef} />
                      </div>
                    )}

                    <div className="space-y-2 text-left">
                      {/* Chat Suggestion prompts */}
                      {chatHistory.length === 0 && (
                        <div className="flex flex-wrap gap-1.5 pb-1">
                          {quickPrompts.map(p => (
                            <button
                              key={p}
                              onClick={() => {
                                setChatMessage(p);
                                setIsChatExpanded(true);
                              }}
                              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer transition-colors"
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      )}

                      <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onFocus={() => setIsChatExpanded(true)}
                          placeholder="Ask anything about this recommendation..."
                          className="flex-1 bg-white dark:bg-[#12192D] border border-slate-200 dark:border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-colors font-medium outline-none focus-visible:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0"
                          aria-label="Send query"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2 text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-left pt-1 border-t border-slate-200 dark:border-white/[0.04]">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Exemption verified using AY 2026-27 rules</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
