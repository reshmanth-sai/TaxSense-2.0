import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Check, Copy, X, Sparkles, ShieldCheck } from 'lucide-react';

interface ShareSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savingsAmount?: number;
  ctcAmount?: number;
}

export const ShareSavingsModal: React.FC<ShareSavingsModalProps> = ({
  isOpen,
  onClose,
  savingsAmount = 24850,
  ctcAmount = 1850000
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `I just compared my tax regimes and identified ₹${savingsAmount.toLocaleString('en-IN')} in tax savings using TaxSense AI! 🚀 Compare your tax regimes in 58 seconds: https://taxsense.in`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://taxsense.in')}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer rounded-full"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#16E27A] text-[9px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Viral Share Card
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share Your Tax Savings</h3>
            <p className="text-xs text-slate-500">Inspire your network to check their tax regime optimization.</p>
          </div>

          {/* Social Card Preview */}
          <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl border border-white/10 space-y-4 shadow-inner relative overflow-hidden">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span className="font-extrabold uppercase text-white">TaxSense AI</span>
              <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="w-3 h-3" /> Privacy Masked</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Tax Savings Identified</span>
              <div className="text-3xl font-extrabold font-mono text-white">
                +₹{savingsAmount.toLocaleString('en-IN')}
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-sans border-t border-white/10 pt-3">
              "Compared Old vs New Tax Regime for my ₹{(ctcAmount / 100000).toFixed(1)}L CTC in 58 seconds with zero manual paperwork."
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={handleShareLinkedIn}
                className="flex-1 py-3 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                LinkedIn
              </button>
              <button
                onClick={handleShareTwitter}
                className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                X / Twitter
              </button>
            </div>

            <button
              onClick={handleCopyText}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? "Copied Share Text!" : "Copy Share Link"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
