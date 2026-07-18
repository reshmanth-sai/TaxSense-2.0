import React from 'react';
import { motion } from 'motion/react';
import { Lock, Shield, FileText, Cpu } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';

export const SecuritySection: React.FC = React.memo(() => {
  return (
    <section id="security" className="py-32 md:py-36 px-6 max-w-5xl mx-auto space-y-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-3"
      >
        <span className="text-[10px] text-slate-500 dark:text-[#16E27A] font-mono font-bold uppercase tracking-widest">Privacy & Security</span>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
          Security Highlights
        </h2>
        <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Your financial data is private. We implement rigorous security parameters to ensure your data stays yours.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <PremiumCard
          className="p-6 space-y-4 text-left transition-colors duration-300 hover:border-blue-500/30 hover:shadow-[0_20px_48px_rgba(59,130,246,0.05)] dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.05)]"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div 
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
            className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400"
          >
            <Lock className="w-5 h-5" />
          </motion.div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">AES Encryption</h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            All uploaded Form 16 documents are encrypted client-side using industry-standard AES-256 local keys.
          </p>
        </PremiumCard>

        <PremiumCard
          className="p-6 space-y-4 text-left transition-colors duration-300 hover:border-emerald-500/30 hover:shadow-[0_20px_48px_rgba(16,185,129,0.05)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div 
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.8 }}
            className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-[#16E27A]"
          >
            <Shield className="w-5 h-5" />
          </motion.div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Privacy First</h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Your session is parsed locally in-memory, making guest workspaces entirely transient and secure.
          </p>
        </PremiumCard>

        <PremiumCard
          className="p-6 space-y-4 text-left transition-colors duration-300 hover:border-purple-500/30 hover:shadow-[0_20px_48px_rgba(168,85,247,0.05)] dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.05)]"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.1 }}
            className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400"
          >
            <FileText className="w-5 h-5" />
          </motion.div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">No Data Selling</h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            We do not sell user profiles or financial telemetry. Your data is used exclusively to find tax savings.
          </p>
        </PremiumCard>

        <PremiumCard
          className="p-6 space-y-4 text-left transition-colors duration-300 hover:border-amber-500/30 hover:shadow-[0_20px_48px_rgba(245,158,11,0.05)] dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.05)]"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div 
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.4 }}
            className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400"
          >
            <Cpu className="w-5 h-5" />
          </motion.div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Fast Processing</h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Calculations run in an isolated client sandbox environment preventing unauthorized network leaks.
          </p>
        </PremiumCard>
      </div>
    </section>
  );
});
SecuritySection.displayName = "SecuritySection";
