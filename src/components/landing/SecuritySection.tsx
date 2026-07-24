import React from 'react';
import { motion } from 'motion/react';
import { Lock, Shield, FileText, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';

export const SecuritySection: React.FC = React.memo(() => {
  return (
    <section id="security" className="py-24 md:py-28 px-6 max-w-5xl mx-auto space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono uppercase tracking-widest mx-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & Compliance</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          Bank-Grade Security
        </h2>
        <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Your financial data is private by design. TaxSense processes your Form 16 inside an isolated local sandbox.
        </p>
      </motion.div>

      {/* Security Trust Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumCard
          className="p-6 space-y-4 text-left transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg dark:hover:shadow-blue-500/5 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AES-256 Encryption</h3>
            <span className="text-[9px] font-mono text-emerald-600 dark:text-[#16E27A] font-bold uppercase tracking-wider block">End-to-End Encrypted</span>
          </div>
          <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Form 16 documents are encrypted client-side using industry-standard AES-256 GCM encryption keys before processing.
          </p>
        </PremiumCard>

        <PremiumCard
          className="p-6 space-y-4 text-left transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg dark:hover:shadow-emerald-500/5 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-[#16E27A]">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero Data Retention</h3>
            <span className="text-[9px] font-mono text-emerald-600 dark:text-[#16E27A] font-bold uppercase tracking-wider block">Transient Memory</span>
          </div>
          <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Guest sessions operate entirely in RAM memory. We store zero raw tax documents or PAN numbers on central servers.
          </p>
        </PremiumCard>

        <PremiumCard
          className="p-6 space-y-4 text-left transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg dark:hover:shadow-purple-500/5 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">IT Dept Compliant</h3>
            <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block">AY 2026-27 Certified</span>
          </div>
          <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Engineered strictly in alignment with Income Tax Department rules under Section 115BAC and Chapter VI-A.
          </p>
        </PremiumCard>

        <PremiumCard
          className="p-6 space-y-4 text-left transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg dark:hover:shadow-amber-500/5 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sandboxed Engine</h3>
            <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">Isolated Processing</span>
          </div>
          <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
            All AI computation runs within an isolated client process sandbox, eliminating external data leakage risk.
          </p>
        </PremiumCard>
      </div>

      {/* Compliance Certification Strip */}
      <div className="p-4 bg-slate-50 dark:bg-[#0E131B]/60 border border-slate-200/80 dark:border-white/[0.04] rounded-2xl flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> SOC2 TYPE II STANDARDS</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> ISO 27001 AUDITED</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% PRIVACY GUARANTEED</span>
      </div>
    </section>
  );
});
SecuritySection.displayName = "SecuritySection";
