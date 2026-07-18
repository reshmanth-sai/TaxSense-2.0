import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PremiumCard } from './helpers/PremiumCard';
import { ThinkingDots } from './helpers/ThinkingDots';
import { audioPool } from '../../utils/audioPool';

interface PromptResponse {
  q: string;
  a: string;
  steps: string[];
  citations: string;
  tools: string[];
  confidence: string;
  reasoning: string;
}

const promptResponses: PromptResponse[] = [
  {
    q: "What is Section 80D?",
    a: "Section 80D allows a deduction of up to **₹25,000** for medical insurance premiums paid for yourself, spouse, and dependent children. You can claim an additional **₹25,000** (or ₹50,000 if senior citizen) for parents' premiums.",
    steps: ["Checking Section 80D tax parameters...", "Scanning family age profile...", "Applying maximum parent premium limits"],
    citations: "Sec 80D of the Income Tax Act, 1961",
    tools: ["deduction_lookup", "limit_validator"],
    confidence: "99.9%",
    reasoning: "Tax savings are computed based on your marginal slab rate. With a gross salary of **₹8,50,000**, your taxable income drops to **₹8,25,000** after applying the **₹25,000** health premium deduction, saving you **₹1,250** in tax (under the 5% bracket)."
  },
  {
    q: "Is standard deduction automatic?",
    a: "Yes. For FY 2025-26 (AY 2026-27), a standard deduction of **₹75,000** under the New Tax Regime (and **₹50,000** under the Old Tax Regime) is applied automatically to all salaried individuals.",
    steps: ["Verifying Finance Act updates...", "Applying ITR slab standard deductions...", "Recalculating net taxable income"],
    citations: "Sec 16(ia) of the Income Tax Act, 1961",
    tools: ["slab_engine", "rebate_applicator"],
    confidence: "99.8%",
    reasoning: "Under Sec 16(ia), standard deduction requires zero proof submission. For **₹8,50,000** gross, the taxable salary becomes **₹7,75,000** (New Regime) or **₹8,00,000** (Old Regime), reducing tax liability directly by **₹3,750** (New) or **₹2,500** (Old)."
  },
  {
    q: "Saves under New Regime?",
    a: "You save **₹18,240** based on your gross salary of ₹8,50,000. Under the New Regime, tax brackets are wider and rates are lower, resulting in a ₹36,360 tax liability compared to ₹54,600.",
    steps: ["Parsing Gross Salary: ₹8,50,000...", "Simulating Old slab liability (₹54,600)...", "Simulating New slab liability (₹36,360)...", "Computing net optimized difference"],
    citations: "Sec 115BAC slab structures",
    tools: ["regime_comparator", "savings_calculator"],
    confidence: "99.7%",
    reasoning: "Old Regime taxable: **₹8,00,000** (after standard deduction) -> Tax: **₹54,600**.\nNew Regime taxable: **₹7,75,000** (after standard deduction) -> Tax: **₹36,360**.\nNet savings difference: **₹54,600 - ₹36,360 = ₹18,240** saved."
  }
];

interface CopilotSectionProps {
  soundEnabled: boolean;
}

export const CopilotSection: React.FC<CopilotSectionProps> = React.memo(({ soundEnabled }) => {
  const [copilotQuery, setCopilotQuery] = useState("How much tax do I save under the New Regime?");
  const [copilotResponse, setCopilotResponse] = useState(
    "You save **₹18,240** by filing under the New Regime. This is because under the New Regime, standard deductions of ₹75,000 apply automatically, and your ₹8,50,000 gross salary is taxed under lower rate bands, resulting in a liability of ₹36,360 compared to ₹54,600 under the Old Regime."
  );
  const [isTyping, setIsTyping] = useState(false);
  const [copilotIsThinking, setCopilotIsThinking] = useState(false);
  const [copilotReasoning, setCopilotReasoning] = useState<string[]>([
    "Parsing Gross Salary: ₹8,50,000...", 
    "Simulating Old slab liability (₹54,600)...", 
    "Simulating New slab liability (₹36,360)...", 
    "Computing net optimized difference"
  ]);
  const [copilotCitations, setCopilotCitations] = useState("Sec 115BAC slab structures");
  const [copilotTools, setCopilotTools] = useState<string[]>(["regime_comparator", "savings_calculator"]);
  const [copilotConfidence, setCopilotConfidence] = useState("99.7%");
  const [reasoningExpanded, setReasoningExpanded] = useState(false);
  const [copilotReasoningText, setCopilotReasoningText] = useState(
    "Old Regime taxable: **₹8,00,000** (after standard deduction) -> Tax: **₹54,600**.\nNew Regime taxable: **₹7,75,000** (after standard deduction) -> Tax: **₹36,360**.\nNet savings difference: **₹54,600 - ₹36,360 = ₹18,240** saved."
  );

  const handleTriggerPrompt = (idx: number) => {
    if (isTyping || copilotIsThinking) return;
    if (soundEnabled) {
      audioPool.playBeep(600, 'sine', 0.06, 0.02);
    }
    const prompt = promptResponses[idx];
    setCopilotQuery(prompt.q);
    setIsTyping(false);
    setCopilotResponse("");
    setCopilotReasoning([]);
    setCopilotIsThinking(true);
    setReasoningExpanded(false);
    setCopilotReasoningText(prompt.reasoning);

    let stepIdx = 0;
    const streamSteps = () => {
      if (stepIdx < prompt.steps.length) {
        setCopilotReasoning(prev => [...prev, prompt.steps[stepIdx]]);
        stepIdx++;
        setTimeout(streamSteps, 500);
      } else {
        setCopilotIsThinking(false);
        setCopilotCitations(prompt.citations);
        setCopilotTools(prompt.tools);
        setCopilotConfidence(prompt.confidence);
        setIsTyping(true);

        let currentText = "";
        const targetText = prompt.a;
        let charIndex = 0;

        const interval = setInterval(() => {
          if (charIndex < targetText.length) {
            currentText = targetText.substring(0, charIndex + 2);
            setCopilotResponse(currentText);
            charIndex += 2;
          } else {
            clearInterval(interval);
            setIsTyping(false);
          }
        }, 15);
      }
    };

    setTimeout(streamSteps, 300);
  };

  return (
    <section id="copilot" className="py-32 md:py-36 border-y border-slate-200/50 dark:border-white/[0.04] bg-transparent px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-3"
        >
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold uppercase tracking-widest">Conversational Assistant</span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
            AI Copilot Showcase
          </h2>
          <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Click preset prompt pills to watch the AI engine reason and stream answers to complex tax questions.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
          {promptResponses.map((p, idx) => (
            <button
              key={idx}
              disabled={isTyping || copilotIsThinking}
              onClick={() => handleTriggerPrompt(idx)}
              className="px-3.5 py-1.5 bg-white/60 hover:bg-[#3B82F6]/10 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] hover:border-[#3B82F6]/25 dark:hover:border-[#3B82F6]/25 rounded-full text-slate-700 dark:text-slate-300 hover:text-[#3B82F6] transition-all text-[10px] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm dark:shadow-none"
            >
              {p.q}
            </button>
          ))}
        </div>

        <PremiumCard className="p-6 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.05] rounded-3xl space-y-6 text-left max-w-xl mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-none">
          {/* User Turn */}
          <div className="flex gap-3 items-start flex-row-reverse">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
              U
            </div>
            <div className="flex flex-col items-end max-w-[85%]">
              <div className="px-4 py-2.5 rounded-[14px] bg-blue-600 text-white rounded-tr-none text-xs font-medium shadow-sm">
                {copilotQuery}
              </div>
            </div>
          </div>

          {/* AI Turn */}
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-[#3B82F6]/10 border border-blue-200 dark:border-[#3B82F6]/25 text-blue-600 dark:text-[#3B82F6] text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
              AI
            </div>
            <div className="flex flex-col items-start max-w-[85%] w-full space-y-4">
              {/* Reasoning Timeline */}
              {copilotReasoning.length > 0 && (
                <div className="w-full space-y-1.5 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-white/[0.04] rounded-xl text-[10px] font-mono text-slate-655 dark:text-slate-400">
                  <div className="text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold mb-1">Reasoning Chain</div>
                  {copilotReasoning.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>{step}</span>
                    </div>
                  ))}
                  {copilotIsThinking && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                      </span>
                      <span>AI is thinking<ThinkingDots /></span>
                    </div>
                  )}
                </div>
              )}

              {/* Response Text */}
              {(copilotResponse || isTyping) && (
                <div className="px-4 py-2.5 rounded-[14px] bg-slate-50 dark:bg-[#050607] border border-slate-200 dark:border-white/[0.06] text-slate-800 dark:text-slate-350 rounded-tl-none text-xs leading-relaxed min-h-[50px] shadow-inner w-full">
                  {copilotResponse.split(/(\*\*.*?\*\*)/g).map((part, idx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={idx} className="font-bold text-slate-900 dark:text-white">{part.replace(/\*\*/g, '')}</strong>;
                    }
                    return part;
                  })}
                  {isTyping && (
                    <span className="inline-block w-1.5 h-3 bg-[#3B82F6] ml-1 animate-pulse" />
                  )}
                </div>
              )}

              {/* Citations, Tools, Confidence & Reasoning Expander */}
              {!copilotIsThinking && copilotResponse && (
                <div className="flex flex-col w-full gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[8px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20 px-1.5 py-0.5 rounded font-bold tracking-wider uppercase font-mono">
                      Confidence: {copilotConfidence}
                    </span>
                    <span className="text-[8px] bg-slate-100 dark:bg-white/5 text-slate-655 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.04] px-1.5 py-0.5 rounded font-bold uppercase font-mono">
                      {copilotCitations}
                    </span>
                    {copilotTools.map((tool, i) => (
                      <span key={i} className="text-[8px] bg-emerald-50 dark:bg-[#16E27A]/10 text-emerald-650 dark:text-[#16E27A] border border-emerald-200/50 dark:border-[#16E27A]/20 px-1.5 py-0.5 rounded font-bold uppercase font-mono">
                        ⚙ {tool}
                      </span>
                    ))}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => setReasoningExpanded(!reasoningExpanded)}
                      className="inline-flex items-center gap-1 text-[9.5px] font-bold font-mono uppercase tracking-wider text-slate-555 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {reasoningExpanded ? "Hide AI Reasoning ▲" : "See AI Reasoning ▼"}
                    </button>

                    <AnimatePresence>
                      {reasoningExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/[0.04] rounded-xl text-[11px] leading-relaxed font-sans text-slate-655 dark:text-slate-400 space-y-2 border-l-2 border-l-emerald-500/50">
                            <div className="text-[8px] font-bold font-mono uppercase tracking-widest text-slate-400 mb-1">Detailed Computations</div>
                            <p className="whitespace-pre-line">
                              {copilotReasoningText.split(/(\*\*.*?\*\*)/g).map((part, idx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={idx} className="text-slate-900 dark:text-[#16E27A] font-bold">{part.replace(/\*\*/g, '')}</strong>;
                                }
                                return part;
                              })}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PremiumCard>
      </div>
    </section>
  );
});
CopilotSection.displayName = "CopilotSection";
