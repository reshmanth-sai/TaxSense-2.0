import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';

interface FAQItem {
  category: 'regimes' | 'deductions' | 'security' | 'filing';
  q: string;
  a: string;
}

const faqsData: FAQItem[] = [
  {
    category: 'security',
    q: "Is my financial data safe with TaxSense?",
    a: "Yes. TaxSense uses local-first processing. In Guest Mode, your uploaded Form 16 PDF documents are parsed in temporary browser memory, encrypted locally with AES-256 GCM keys, and are never stored on any database or external server."
  },
  {
    category: 'filing',
    q: "Do I need to sign up or create an account to use the calculator?",
    a: "No. You can start instantly in Guest Mode. Upload your Form 16 or enter salary figures to receive an immediate side-by-side Old vs New tax regime comparison without giving your name, phone number, or email."
  },
  {
    category: 'regimes',
    q: "How does TaxSense calculate Old vs New tax regime liability?",
    a: "Our computation engine is updated for FY 2025-26 (AY 2026-27). It applies standard deductions (₹75,000 for New Regime, ₹50,000 for Old Regime), tax slab brackets, Section 87A rebate rules, and 4% Health & Education Cess down to the exact rupee."
  },
  {
    category: 'deductions',
    q: "Which deductions are auto-detected from my Form 16?",
    a: "Gemini automatically reads Section 17(1) Gross Salary, Section 16(ia) Standard Deduction, Chapter VI-A deductions (Sec 80C, 80D, 80E), HRA Section 10(13A) exemptions, and Section 192 TDS deducted by your employer."
  },
  {
    category: 'filing',
    q: "Can I download my finalized ITR filing summary?",
    a: "Yes. You can export a beautifully formatted PDF summary guide or download a structured JSON payload of all extracted tax parameters at any stage of the workflow."
  },
  {
    category: 'deductions',
    q: "Can I claim Section 80C and 80D under the New Tax Regime?",
    a: "No. Chapter VI-A deductions like 80C (PPF/ELSS) and 80D (Health Insurance) are not allowed under the New Tax Regime. However, standard deduction of ₹75,000 and employer NPS contribution under Sec 80CCD(2) remain eligible."
  }
];

export const FAQSection: React.FC = React.memo(() => {
  const [faqOpen, setFaqOpen] = useState<string | null>(faqsData[0].q);
  const [faqSearch, setFaqSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'regimes', label: 'Tax Regimes' },
    { id: 'deductions', label: 'Deductions' },
    { id: 'security', label: 'Security & Privacy' },
    { id: 'filing', label: 'Filing & Export' }
  ];

  const filteredFaqs = faqsData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          faq.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq" className="relative z-10 py-24 md:py-28 px-6 max-w-4xl mx-auto space-y-12 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono uppercase tracking-widest mx-auto">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Clear Answers</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Everything you need to know about tax calculations, privacy, and regime comparisons.
        </p>
      </motion.div>

      {/* FAQ Controls Bar */}
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search tax questions (e.g. 80D, standard deduction, security)..."
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            className="w-full px-5 py-3.5 pl-11 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl text-xs sm:text-sm font-sans text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/70 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06] hover:bg-blue-50 dark:hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Cards */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            No matching questions found for "{faqSearch}". Try searching for "regime" or "80C".
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = faqOpen === faq.q;
            return (
              <PremiumCard
                key={faq.q}
                onClick={() => setFaqOpen(isOpen ? null : faq.q)}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                tabIndex={0}
                role="button"
                aria-expanded={isOpen}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setFaqOpen(isOpen ? null : faq.q);
                  }
                }}
                className={`p-6 border transition-all duration-300 text-left cursor-pointer rounded-2xl ${
                  isOpen 
                    ? 'border-blue-500/50 dark:border-blue-500/30 bg-white dark:bg-[#0E131B] shadow-lg' 
                    : 'border-slate-200/80 dark:border-white/[0.06] bg-white/70 dark:bg-[#0E131B]/50 hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden mt-3 text-xs text-slate-650 dark:text-slate-350 leading-relaxed border-t border-slate-200 dark:border-white/[0.06] pt-3 font-sans"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </PremiumCard>
            );
          })
        )}
      </div>
    </section>
  );
});
FAQSection.displayName = "FAQSection";
