import React from 'react';
import { motion } from 'motion/react';
import { Quote, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';

const testimonialsData = [
  {
    stars: 5,
    savedAmount: "₹24,850 Saved",
    timeTaken: "48 seconds",
    text: "\"Uploading my Form 16 PDF took literally 2 seconds. TaxSense automatically compared both tax regimes and recommended New Regime, saving me ₹24,850. The AI breakdown explained every single clause clearly.\"",
    initials: "MK",
    name: "Mohit Kumar",
    role: "Software Architect",
    company: "Google",
    city: "Bangalore",
    offsetY: "sm:translate-y-0"
  },
  {
    stars: 5,
    savedAmount: "₹32,100 Saved",
    timeTaken: "54 seconds",
    text: "\"I used to spend 3 hours calculating HRA exemption and 80D limits on Excel every year. TaxSense parsed my salary, found missed NPS deductions, and calculated net savings instantly without requiring a login.\"",
    initials: "AS",
    name: "Anjali Sharma",
    role: "Senior Product Manager",
    company: "Stripe",
    city: "Mumbai",
    offsetY: "sm:translate-y-4"
  },
  {
    stars: 5,
    savedAmount: "₹18,400 Saved",
    timeTaken: "42 seconds",
    text: "\"The AI Copilot answered my specific questions about Section 80D for my parents with 99.9% confidence and backed the calculations with actual tax code citations. Hands down the best financial tool I've used.\"",
    initials: "RV",
    name: "Rohan Verma",
    role: "Design Lead",
    company: "Notion",
    city: "Delhi NCR",
    offsetY: "sm:-translate-y-2"
  }
];

export const TestimonialsSection: React.FC = React.memo(() => {
  return (
    <section id="testimonials" className="py-24 md:py-28 border-y border-slate-200/60 dark:border-white/[0.04] bg-transparent px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#16E27A] text-[10px] font-bold font-mono uppercase tracking-widest mx-auto">
            <Sparkles className="w-3 h-3" />
            <span>Verified Social Proof</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            Loved by 15,000+ Taxpayers
          </h2>
          <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            See how Indian salaried professionals optimize their tax returns with TaxSense.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {testimonialsData.map((test, index) => (
            <PremiumCard
              key={index}
              className={`p-7 space-y-6 text-left flex flex-col justify-between ${test.offsetY} bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-3xl group relative overflow-hidden shadow-lg shadow-black/[0.02] dark:shadow-none hover:border-emerald-500/40 transition-all duration-300`}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Top Row: Stars + Savings Metric Badge */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex text-amber-400 gap-0.5 text-xs">
                  {[...Array(test.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#16E27A] text-[10px] font-mono font-bold">
                  {test.savedAmount}
                </div>
              </div>

              {/* Quote Body */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic font-medium relative z-10">
                {test.text}
              </p>

              {/* Profile Row */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/[0.06] relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-bold font-mono flex items-center justify-center shadow-md">
                    {test.initials}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-none">{test.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">{test.role} • {test.company}</span>
                    <span className="text-[9px] text-slate-400 font-mono block">📍 {test.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 text-[8px] font-mono font-bold uppercase">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Verified</span>
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>
      </div>
    </section>
  );
});
TestimonialsSection.displayName = "TestimonialsSection";
