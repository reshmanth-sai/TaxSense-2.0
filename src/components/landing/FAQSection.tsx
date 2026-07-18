import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';

const faqsData = [
  {
    q: "Is my financial data safe with TaxSense?",
    a: "Yes. TaxSense uses local-first processing. If you use Guest Mode, your uploaded Form 16 documents are parsed in memory, encrypted locally, and are never saved on any database. For authenticated users, data is encrypted end-to-end and stored in your private secure vault."
  },
  {
    q: "Do I need to sign up to use the tool?",
    a: "No. You can click 'Start Guest Session' and experience the complete Form 16 extraction, regime optimization comparison, and AI chat assistant instantly without providing a name or email."
  },
  {
    q: "How accurate is the AI tax parser?",
    a: "Extremely accurate. Powered by the latest Gemini model context engines, it extracts all standard structural fields (Salary under Section 17(1), standard deductions, Chapter VI-A deductions, and TDS under Section 192) and cross-verifies sums mathematically."
  },
  {
    q: "Can I download my finalized ITR details?",
    a: "Yes. You can export a beautifully formatted PDF return guide or a clean raw JSON payload of the extracted tax parameters at any stage of the workflow."
  }
];

export const FAQSection: React.FC = React.memo(() => {
  const [faqOpen, setFaqOpen] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState("");

  return (
    <section id="faq" className="relative z-10 py-32 md:py-36 px-6 max-w-3xl mx-auto space-y-12 bg-transparent dark:bg-[#020202]">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-3"
      >
        <span className="text-[10px] text-slate-500 dark:text-[#16E27A] font-mono font-bold uppercase tracking-widest">Common Questions</span>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
          Frequently Asked FAQ
        </h2>
      </motion.div>

      {/* FAQ Search Bar */}
      <div className="max-w-md mx-auto w-full">
        <div className="relative">
          <input
            type="text"
            placeholder="Search FAQ..."
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            className="w-full px-5 py-3 pl-10 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.06] rounded-[16px] text-xs font-mono text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#16E27A] backdrop-blur-md transition-all shadow-inner"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      <div className="space-y-4">
        {faqsData
          .filter(faq => 
            faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
            faq.a.toLowerCase().includes(faqSearch.toLowerCase())
          )
          .map((faq) => {
            const isOpen = faqOpen === faq.q;
            return (
              <PremiumCard
                key={faq.q}
                onClick={() => setFaqOpen(isOpen ? null : faq.q)}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                tabIndex={0}
                role="button"
                aria-expanded={isOpen}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setFaqOpen(isOpen ? null : faq.q);
                  }
                }}
                className={`p-6 border transition-colors duration-300 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-450 ${
                  isOpen 
                    ? 'border-slate-350 dark:border-[#16E27A]/25 bg-white/70 dark:bg-[#0E131B]' 
                    : 'border-slate-200/50 dark:border-white/[0.04] bg-white/30 dark:bg-[#0E131B]/40 hover:border-slate-300 dark:hover:border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white font-bold text-xs uppercase tracking-wider">
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-950 dark:text-white' : ''}`} />
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, height: 'auto', filter: "blur(0px)" }}
                      exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden mt-3 text-[11px] text-slate-650 dark:text-[#8A96A8] leading-relaxed border-t border-slate-200 dark:border-white/[0.04] pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </PremiumCard>
            );
          })}
      </div>
    </section>
  );
});
FAQSection.displayName = "FAQSection";
