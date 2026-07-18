import React from 'react';
import { motion } from 'motion/react';
import { Quote, CheckCircle2 } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';

const testimonialsData = [
  {
    stars: 5,
    text: "\"Uploading my Form 16 took less than 10 seconds. The AI parsed everything perfectly and recommended the New Regime, saving me ₹18,240.\"",
    initials: "MK",
    name: "Mohit Kumar",
    role: "Software Engineer",
    company: "Google",
    offsetY: "sm:translate-y-0"
  },
  {
    stars: 5,
    text: "\"TaxSense sandbox mode let me compare regimes and claims safely without registering first. Frictionless, fast, and secure.\"",
    initials: "AS",
    name: "Anjali Sharma",
    role: "Product Lead",
    company: "Stripe",
    offsetY: "sm:translate-y-4"
  },
  {
    stars: 5,
    text: "\"The AI Copilot answered my specific questions about Section 80D with confidence and backed the calculations with actual math. Unbelievably good.\"",
    initials: "RV",
    name: "Rohan Verma",
    role: "UX Designer",
    company: "Notion",
    offsetY: "sm:-translate-y-2"
  }
];

export const TestimonialsSection: React.FC = React.memo(() => {
  return (
    <section id="testimonials" className="py-32 md:py-36 border-y border-slate-200/50 dark:border-white/[0.04] bg-transparent px-6">
      <div className="max-w-5xl mx-auto space-y-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3"
        >
          <span className="text-[10px] text-slate-500 dark:text-[#16E27A] font-mono font-bold uppercase tracking-widest">User Stories</span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
            Loved by Taxpayers
          </h2>
          <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Read how Indian salaried professionals file their returns confidently with TaxSense.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4">
          {testimonialsData.map((test, index) => (
            <PremiumCard
              key={index}
              className={`p-6 space-y-5 text-left flex flex-col justify-between ${test.offsetY} border border-slate-200/50 dark:border-transparent bg-white/40 dark:bg-transparent group relative overflow-hidden`}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Floating quote icon on hover */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-400/5 dark:text-white/5 transition-all duration-300 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 pointer-events-none" />

              <div className="space-y-3 relative z-10">
                {/* Rating Stars */}
                <div className="flex gap-0.5 text-amber-500 text-xs transition-transform duration-300 group-hover:scale-105 origin-left">
                  {Array.from({ length: test.stars }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed italic font-medium">
                  {test.text}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3.5 border-t border-slate-200 dark:border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold flex items-center justify-center border border-slate-200 dark:border-transparent">
                    {test.initials}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white block leading-none">{test.name}</span>
                    <span className="text-[8.5px] text-slate-500 dark:text-slate-500 font-mono mt-0.5 block">{test.role} • {test.company}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#16E27A] text-[7.5px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-2.5 h-2.5 fill-emerald-500/20" />
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
