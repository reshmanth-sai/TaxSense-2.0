import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Cpu, 
  TrendingUp, 
  Sparkles, 
  FolderOpen, 
  ArrowRight, 
  Download, 
  Eye, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Clock,
  Settings,
  Lock,
  ExternalLink
} from 'lucide-react';

// Design Token Interfaces
interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// 1. Primary Action Button (Blue)
export const PrimaryButton: React.FC<ComponentProps & { disabled?: boolean }> = ({ 
  children, 
  className = '', 
  onClick, 
  disabled = false 
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01, y: disabled ? 0 : -0.5 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/10 disabled:opacity-40 disabled:pointer-events-none ${className}`}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </motion.button>
  );
};

// 2. Secondary Ghost Button (Glass border)
export const SecondaryButton: React.FC<ComponentProps & { disabled?: boolean }> = ({ 
  children, 
  className = '', 
  onClick, 
  disabled = false 
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01, y: disabled ? 0 : -0.5 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-slate-800 text-slate-200 hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${className}`}
    >
      {children}
    </motion.button>
  );
};

// 3. Premium Glass Card Container
export const DashboardCard: React.FC<ComponentProps & { 
  variant?: 'primary' | 'secondary' | 'accent-purple' | 'accent-amber';
  interactive?: boolean;
}> = ({ 
  children, 
  className = '', 
  onClick, 
  variant = 'primary', 
  interactive = false 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-slate-950/20 border-slate-800/40 shadow-sm';
      case 'accent-purple':
        return 'bg-gradient-to-b from-slate-900/50 to-slate-950/40 border-purple-500/20 shadow-[0_8px_32px_0_rgba(168,85,247,0.02)]';
      case 'accent-amber':
        return 'bg-slate-900/40 border-amber-500/20 shadow-[0_8px_32px_0_rgba(245,158,11,0.02)]';
      case 'primary':
      default:
        return 'bg-[#0f172a]/45 border-white/[0.06] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)]';
    }
  };

  const cardProps = interactive ? {
    whileHover: { scale: 1.01, y: -4 },
    transition: { type: 'spring' as const, stiffness: 350, damping: 30 }
  } : {};

  return (
    <motion.div
      {...cardProps}
      onClick={onClick}
      className={`backdrop-blur-md border rounded-[24px] p-6 relative overflow-hidden transition-shadow duration-300 ${getVariantStyles()} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {variant === 'accent-purple' && (
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-purple-500/[0.03] blur-[60px] rounded-full pointer-events-none" />
      )}
      {children}
    </motion.div>
  );
};

// 4. Section Header with Icon
export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  iconColor?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, icon: Icon, iconColor = 'text-slate-400', action }) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-4 select-none">
      <div className="space-y-0.5 text-left">
        {subtitle && (
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block">
            {subtitle}
          </span>
        )}
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
          {title}
        </h3>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

// 5. Semantic Status Badges
export const StatusBadge: React.FC<{
  type: 'success' | 'warning' | 'info' | 'ai' | 'neutral';
  text: string;
  pulsing?: boolean;
}> = ({ type, text, pulsing = false }) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'info':
        return 'bg-blue-600/10 text-blue-400 border border-blue-600/20';
      case 'ai':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'neutral':
      default:
        return 'bg-slate-800/40 text-slate-400 border border-slate-700/30';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase font-sans ${getStyles()}`}>
      {pulsing && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${type === 'ai' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${type === 'ai' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
        </span>
      )}
      {text}
    </span>
  );
};

// 6. Integrated Progress Widget
export const ProgressWidget: React.FC<{
  percentage: number;
  stepsRemaining: number;
  estimatedMinutes: number;
  checklist: Array<{ label: string; completed: boolean; stepNum: number }>;
}> = ({ percentage, stepsRemaining, estimatedMinutes, checklist }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none relative">
      <div className="relative w-24 h-24 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.15)]">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <circle
            cx="18"
            cy="18"
            r="15.915"
            className="text-slate-800/40"
            strokeWidth="2.5"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="18"
            cy="18"
            r="15.915"
            className="text-emerald-500 transition-all duration-1000 ease-out"
            strokeWidth="3.2"
            strokeDasharray={`${percentage} 100`}
            strokeLinecap="round"
            stroke="url(#ringGradient)"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-base font-extrabold font-mono leading-none tracking-tight">
            {percentage}%
          </span>
          <span className="text-[7px] text-slate-500 uppercase tracking-widest font-bold mt-1">
            Complete
          </span>
        </div>
      </div>

      <div className="relative mt-3.5 flex flex-col items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] text-slate-400 hover:text-emerald-400 font-semibold tracking-normal cursor-pointer transition-colors flex items-center gap-1 focus:outline-none"
        >
          <span>{stepsRemaining} Steps Remaining</span>
          <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <span className="text-[8.5px] text-slate-500 font-mono mt-0.5">Est. {estimatedMinutes} mins left</span>

        {/* Hover/Click Checklist Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 w-56 p-4 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl z-50 text-left space-y-3 backdrop-blur-md"
            >
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider font-mono block">
                ITR-1 Checklist
              </span>
              <div className="space-y-2 text-[10.5px] font-semibold text-slate-300">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    {item.completed ? (
                      <span className="w-4 h-4 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-[7px] text-emerald-400">✓</span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-[8px] text-slate-550 font-mono">{item.stepNum}</span>
                    )}
                    <span className={item.completed ? 'line-through text-slate-500 font-normal' : 'text-slate-300'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// 7. Premium Actionable Recommendation Card
export const RecommendationCard: React.FC<{
  title: string;
  description: string;
  savings: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time: string;
  documents: string[];
  confidence: 'High' | 'Medium' | 'Low';
  onAction: () => void;
}> = ({ title, description, savings, difficulty, time, documents, confidence, onAction }) => {
  return (
    <div className="relative bg-[#0f172a]/30 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden group hover:scale-[1.01] hover:border-blue-500/30 transition-all duration-300">
      {/* Spotlight Ambient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.01] via-transparent to-transparent pointer-events-none group-hover:from-emerald-500/[0.02]" />
      
      <div className="space-y-3 z-10 text-left flex-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
              Next Highest Impact Action
            </span>
            <StatusBadge type="success" text={`Save ${savings}`} />
          </div>
          <h4 className="text-[14px] font-semibold text-white tracking-tight font-sans">
            {title}
          </h4>
        </div>
        <p className="text-[11.5px] text-slate-400 leading-[1.6] font-normal">
          {description}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[9.5px] bg-slate-950/40 text-slate-400 border border-slate-800/40 px-2 py-0.5 rounded-md font-medium">
            Time: {time}
          </span>
          <span className="text-[9.5px] bg-slate-950/40 text-slate-400 border border-slate-800/40 px-2 py-0.5 rounded-md font-medium">
            Difficulty: {difficulty}
          </span>
          <span className="text-[9.5px] bg-purple-500/10 text-purple-400 border border-purple-500/15 px-2 py-0.5 rounded-md font-bold">
            Confidence: {confidence}
          </span>
          {documents.length > 0 && (
            <span className="text-[9.5px] bg-slate-950/40 text-slate-400 border border-slate-800/40 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
              <FileText className="w-2.5 h-2.5" />
              Requires: {documents.join(', ')}
            </span>
          )}
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAction}
        className="px-4 py-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.1] hover:border-white/[0.15] text-white font-semibold text-xs rounded-full transition-all duration-200 cursor-pointer shrink-0 select-none flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
      >
        <span>Continue</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-350" />
      </motion.button>
    </div>
  );
};

// 8. Warning Alert Card
export const AlertCard: React.FC<{
  title: string;
  message: string;
  type?: 'warning' | 'info';
}> = ({ title, message, type = 'warning' }) => {
  const isWarning = type === 'warning';
  return (
    <div className={`p-4 bg-slate-950/30 border border-white/[0.03] border-l-2 ${isWarning ? 'border-l-amber-500' : 'border-l-blue-500'} rounded-xl space-y-1.5 hover:border-white/[0.06] transition-all`}>
      <div className={`flex items-center gap-1.5 text-[9px] font-bold ${isWarning ? 'text-amber-500' : 'text-blue-400'} uppercase tracking-wider`}>
        <AlertCircle className={`w-3.5 h-3.5 ${isWarning ? 'text-amber-500' : 'text-blue-455'} shrink-0`} />
        {title}
      </div>
      <p className="text-[10px] text-slate-400 leading-normal font-medium text-left">
        {message}
      </p>
    </div>
  );
};

// 9. Numeric/Metric Card
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  maxVal?: string | number;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'ai' | 'neutral';
}> = ({ title, value, maxVal, badgeText, badgeType = 'success' }) => {
  return (
    <div className="border-l border-white/[0.04] pl-6 shrink-0 flex flex-col justify-center space-y-1 text-left">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
        {title}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold text-white font-mono tracking-tighter leading-none">
          {value}
        </span>
        {maxVal && (
          <span className="text-[11px] text-slate-500 font-bold font-mono">/ {maxVal}</span>
        )}
      </div>
      {badgeText && (
        <span className="mt-1">
          <StatusBadge type={badgeType} text={badgeText} />
        </span>
      )}
    </div>
  );
};

// 10. Timeline Node
export const TimelineItem: React.FC<{
  label: string;
  desc: string;
  date: string;
  icon: React.ComponentType<any>;
  iconColor?: string;
}> = ({ label, desc, date, icon: IconComp, iconColor = 'text-blue-400' }) => {
  return (
    <div className="relative text-xs space-y-0.5 group/node">
      {/* Node Bullet */}
      <div className="absolute -left-[27px] top-0.5 w-6 h-6 rounded-full bg-slate-950 border border-white/[0.08] shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center relative z-10 group-hover/node:border-blue-500/20 transition-all duration-300">
        <IconComp className={`w-3 h-3 ${iconColor}`} />
      </div>
      <div className="pl-3">
        <span className="block font-semibold text-slate-200 font-sans tracking-tight">
          {label}
        </span>
        <span className="block text-[9.5px] text-slate-450 leading-relaxed font-normal">
          {desc}
        </span>
        <span className="block text-[8px] text-slate-500/80 font-mono mt-0.5">
          {date}
        </span>
      </div>
    </div>
  );
};

// 11. Document Preview Modal Container
interface PreviewProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    size: string;
    uploadTime: string;
    status: string;
    confidence: number;
    employer?: string;
    financialYear?: string;
    pages?: number;
  };
}

export const DocumentPreviewModal: React.FC<PreviewProps> = ({ isOpen, onClose, document: doc }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative bg-slate-900/95 border border-white/[0.08] rounded-[24px] w-full max-w-lg p-6 overflow-hidden shadow-2xl z-10"
        >
          {/* Top Header bar */}
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <h3 className="text-sm font-semibold text-white truncate max-w-[280px]">
                  {doc.name}
                </h3>
                <p className="text-[10px] text-slate-500">
                  {doc.size} • Uploaded {doc.uploadTime}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Body metadata list */}
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">
                  Employer Entity
                </span>
                <span className="text-xs text-slate-200 font-medium">
                  {doc.employer || 'Acme Corp Technologies'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">
                  Financial Year
                </span>
                <span className="text-xs text-slate-200 font-medium">
                  {doc.financialYear || 'FY 2025-26'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">
                  Total Pages
                </span>
                <span className="text-xs text-slate-200 font-medium">
                  {doc.pages || 3} pages
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">
                  OCR Accuracy
                </span>
                <span className="text-xs text-purple-400 font-bold font-mono">
                  {doc.confidence || 99}% Confidence
                </span>
              </div>
            </div>

            {/* Simulated Extracted Form Fields */}
            <div className="border border-white/[0.04] bg-slate-950/40 rounded-xl p-3.5 space-y-2">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider font-mono block">
                Extracted Payload Fields
              </span>
              <div className="space-y-1.5 font-mono text-[10px] text-slate-300">
                <div className="flex justify-between border-b border-white/[0.02] pb-1">
                  <span className="text-slate-450">Gross Salary (Section 17)</span>
                  <span className="text-emerald-400 font-bold">₹8,50,000</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.02] pb-1">
                  <span className="text-slate-450">Standard Deduction</span>
                  <span className="text-slate-100">₹75,000</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.02] pb-1">
                  <span className="text-slate-450">PF Contribution (80C)</span>
                  <span className="text-emerald-400">₹40,800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">TDS Deducted (Employer)</span>
                  <span className="text-emerald-400 font-bold">₹15,000</span>
                </div>
              </div>
            </div>

            {/* Ingestion Steps */}
            <div className="space-y-2.5">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider font-mono block">
                Processing History
              </span>
              <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-medium">
                <div className="flex items-center gap-1 text-emerald-450">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>OCR Ingested</span>
                </div>
                <span className="text-slate-600">→</span>
                <div className="flex items-center gap-1 text-emerald-450">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Payload Extracted</span>
                </div>
                <span className="text-slate-600">→</span>
                <div className="flex items-center gap-1 text-emerald-450">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified OK</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-white/[0.05] pt-4 mt-5">
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            <PrimaryButton className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Download Source
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// 12. Expandable Copilot Accordion & Confidence Badge
export const CopilotDetailsDrawer: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  confidence: number;
}> = ({ isOpen, onToggle, confidence }) => {
  const [showConfidenceDetail, setShowConfidenceDetail] = useState(false);

  return (
    <div className="mt-3.5 border-t border-white/[0.04] pt-3.5 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Interactive Confidence Badge */}
          <button
            onClick={() => setShowConfidenceDetail(!showConfidenceDetail)}
            className="flex items-center gap-1.5 text-[10px] text-slate-300 hover:text-white font-medium bg-purple-500/10 hover:bg-purple-500/15 px-2 py-1 rounded-md border border-purple-500/20 cursor-pointer focus:outline-none"
            title="Click to view confidence calculation explanation"
          >
            <span>Confidence</span>
            <span className="text-purple-400 font-bold font-mono">{confidence}%</span>
            <Info className="w-3 h-3 text-purple-400" />
          </button>

          {/* Quick Stats */}
          <span className="text-[10px] text-slate-500 font-medium">
            AI Engine: Gemini Pro 1.5
          </span>
        </div>

        <button
          onClick={onToggle}
          className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer focus:outline-none"
        >
          <span>{isOpen ? 'Collapse Panel' : 'Explain Savings'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Confidence explanation popup */}
      <AnimatePresence>
        {showConfidenceDetail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl space-y-2 text-[10.5px] leading-relaxed text-purple-200"
          >
            <div className="flex items-center gap-1.5 font-bold text-purple-300 uppercase text-[9px] tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Confidence Metric Breakdown
            </div>
            <p>
              This {confidence}% score represents a compound score of:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>**Document Parsing Reliability (99%)**: Clean digital OCR scan of Form 16.</li>
              <li>**Rule Engine Match (98%)**: Strict correspondence to Section 80C and Section 80D provisions of AY 2026-27.</li>
              <li>**Cross-field Validation (95%)**: Employee employer payroll deduction matching.</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed reasoning accordion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4 space-y-4"
          >
            {/* Why recommendation was made */}
            <div className="space-y-1.5">
              <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">
                Why was this recommendation made?
              </span>
              <p className="text-[11.5px] text-slate-355 leading-relaxed">
                Our analysis of your Form 16 detected that while you have a gross salary of ₹8,50,000 and ₹40,800 deducted as employee PF contribution under Section 80C, your **Section 80D health insurance** allocation is currently ₹0. A typical salaried profile with this income range actively optimizes ₹25,000 in personal medical premiums, resulting in an immediate direct tax reduction of ₹5,200.
              </p>
            </div>

            {/* Documents analyzed */}
            <div className="space-y-1.5">
              <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">
                Source Materials Analyzed
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-white/[0.04] rounded-lg text-[10.5px] text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Form_16_Mohit_FY25-26.pdf</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-white/[0.04] rounded-lg text-[10.5px] text-slate-300">
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>Income Tax Rules API Portal</span>
                </div>
              </div>
            </div>

            {/* Tax Rules Applied */}
            <div className="space-y-1.5">
              <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">
                Income Tax Rules Applied
              </span>
              <div className="space-y-2 text-[10.5px] text-slate-355 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-white/[0.02]">
                <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                  <span className="font-semibold text-slate-200">Section 80D</span>
                  <span className="text-slate-400">Deduction for Medical Insurance Premium paid up to ₹25,000.</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="font-semibold text-slate-200">AY 2026-27 (New Regime)</span>
                  <span className="text-slate-400">Under the default New Regime, deductions are limited. Old Regime requires full filing confirmation.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 13. Ingested Document Ledger Row Component
export const LedgerRow: React.FC<{
  doc: {
    id: string;
    name: string;
    size: string;
    uploadTime: string;
    status: string;
    confidence: number;
  };
  onPreview: () => void;
}> = ({ doc, onPreview }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center justify-between p-3.5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] rounded-xl text-xs text-left relative transition-all group"
    >
      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors shrink-0" />
        <div className="flex flex-col">
          <span className="font-bold text-slate-200 group-hover:text-white transition-colors">
            {doc.name}
          </span>
          <span className="text-[8.5px] text-slate-500 font-mono">
            {doc.size} • Ingested {doc.uploadTime}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Interactive Hover Preview Pill */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              onClick={onPreview}
              className="text-[9px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded font-bold cursor-pointer flex items-center gap-1 shrink-0 shadow-md shadow-blue-500/10 focus:outline-none"
            >
              <Eye className="w-2.5 h-2.5" />
              <span>Inspect Payload</span>
            </motion.button>
          )}
        </AnimatePresence>

        <StatusBadge type={doc.status === 'Verified' ? 'success' : 'ai'} text={doc.status} />
      </div>
    </div>
  );
};
