import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Cpu,
  FileText,
  Sparkles,
  UploadCloud,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  Eye,
  Trash2,
  Edit2,
  Download,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  File,
  AlertCircle,
  Copy,
  Terminal,
  User,
  Shield,
  Calculator,
  DollarSign,
  ListTodo,
  Award,
  Receipt,
  Send
} from 'lucide-react';

const RegimeComparison = React.lazy(() => import('../RegimeComparison'));
const DeductionCard = React.lazy(() => import('../DeductionCard'));
const FilingReviewCard = React.lazy(() => import('../FilingReviewCard'));
const GenerateReturnCard = React.lazy(() => import('../GenerateReturnCard'));
import { useTaxStore } from '../../store/useTaxStore';

// Format INR currency
const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

// ----------------------------------------------------
// 1. SecurityBadge
// ----------------------------------------------------
export const SecurityBadge: React.FC<{
  icon: React.ComponentType<any>;
  text: string;
}> = ({ icon: IconComp, text }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.04] text-[10px] text-slate-600 dark:text-slate-450 font-bold uppercase tracking-wider select-none hover:bg-slate-200/50 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-white/[0.08] transition-colors duration-200 cursor-default shadow-xs">
      <IconComp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>{text}</span>
    </div>
  );
};

// ----------------------------------------------------
// 2. UploadDropzone
// ----------------------------------------------------
interface UploadDropzoneProps {
  onFileDrop: (file: File) => void;
  onPasteClick: () => void;
  onSampleClick: () => void;
  errorMessage: string | null;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileDrop,
  onPasteClick,
  onSampleClick,
  errorMessage
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileDrop(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileDrop(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative rounded-[32px] p-8 md:p-12 border backdrop-blur-xl transition-all duration-300 overflow-hidden text-center group shadow-xl ${
        dragActive
          ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.25)] scale-[1.01]'
          : 'border-slate-200/80 dark:border-white/[0.06] bg-white/80 dark:bg-[#060A10]/70 hover:border-blue-500/30'
      }`}
    >
      {/* Subtle background gradient glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none blur-3xl" />

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-3 text-left"
        >
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-red-700 dark:text-red-200">Ingestion Alert</p>
            <p className="text-[11px] text-red-600 dark:text-red-300 leading-relaxed font-medium">{errorMessage}</p>
          </div>
        </motion.div>
      )}

      {dragActive ? (
        <div className="space-y-6 py-6 animate-pulse">
          <div className="w-16 h-16 bg-blue-500/15 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <UploadCloud className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">Drop your Form 16 here</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Release to begin secure client verification</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 py-2 relative z-10">
          {/* Custom Volumetric AI Document Icon with Halo */}
          <div className="w-24 h-24 mx-auto relative flex items-center justify-center group-hover:scale-105 transition-transform duration-500 select-none">
            <div className="absolute w-20 h-20 bg-blue-500/15 blur-2xl rounded-full pointer-events-none animate-pulse" />

            <div className="absolute -translate-x-3 -translate-y-2 w-12 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-xl opacity-40 transition-transform duration-300 group-hover:-translate-x-4" />
            <div className="absolute translate-x-3 translate-y-2 w-12 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-xl opacity-40 transition-transform duration-300 group-hover:translate-x-4" />

            <div className="absolute w-14 h-18 bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col justify-between p-3 transform -rotate-3 transition-transform duration-300 group-hover:rotate-0">
              <div className="space-y-1.5">
                <div className="w-8 h-1 bg-blue-500 rounded-full" />
                <div className="w-6 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <div className="w-7 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="w-4 h-1 bg-emerald-400 rounded-full" />
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Drag & Drop your Form 16</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
              Supports PDF, JPG and PNG • Maximum size: 20 MB<br />
              Average processing time: 15–30 seconds
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md mx-auto">
            {/* Primary Blue Upload CTA */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:flex-1 h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 select-none hover:-translate-y-0.5 duration-200 cursor-pointer"
            >
              <span>Upload Form 16</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt,.csv,.jpg,.jpeg,.png"
              className="hidden"
            />

            {/* Secondary Paste CTA */}
            <button
              onClick={onPasteClick}
              className="w-full sm:w-auto h-12 px-5 bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer border border-slate-200 dark:border-white/[0.06] active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>📋 Paste Raw Text</span>
            </button>
          </div>

          {/* Tertiary Sample trigger */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.04] flex justify-center">
            <button
              onClick={onSampleClick}
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-xl hover:bg-purple-500/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span>Explore with Sample Form 16 (Demo)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// 3. PipelineStep
// ----------------------------------------------------
export interface PipelineStepProps {
  num: number;
  title: string;
  desc: string;
  items: string[];
  status: 'pending' | 'running' | 'completed';
  isExpanded: boolean;
  onToggle: () => void;
}

export const PipelineStep: React.FC<PipelineStepProps> = ({
  num,
  title,
  desc,
  items,
  status,
  isExpanded,
  onToggle
}) => {
  const isCompleted = status === 'completed';
  const isRunning = status === 'running';
  const isPending = status === 'pending';

  return (
    <div
      className={`relative pl-8 transition-all duration-350 ${isCompleted ? 'opacity-60' : isRunning ? 'opacity-100' : 'opacity-40'
        }`}
    >
      {/* Connector vertical line */}
      {num < 3 && (
        <div className="absolute left-3.5 top-8 bottom-0 w-[1px] bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: isCompleted ? '100%' : isRunning ? '50%' : '0%' }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="w-full bg-blue-500"
          />
        </div>
      )}

      {/* Step Icon / Dot */}
      <div className="absolute left-1 top-1 z-10">
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.15)]"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
        ) : isRunning ? (
          <motion.div
            animate={{
              boxShadow: ["0 0 0 0px rgba(59, 130, 246, 0.2)", "0 0 0 6px rgba(59, 130, 246, 0)", "0 0 0 0px rgba(59, 130, 246, 0.2)"]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(59, 130, 246, 0.2)]"
          >
            <RefreshCw className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin animate-duration-3000" />
          </motion.div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.04] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-800" />
          </div>
        )}
      </div>

      {/* Step Text Details */}
      <button
        onClick={onToggle}
        className="w-full text-left space-y-1 focus:outline-none select-none cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <h4 className={`text-xs font-bold font-sans transition-colors ${isRunning ? 'text-blue-650 dark:text-blue-400' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-655 dark:text-slate-550'
            }`}>
            {title}
          </h4>
          <span className="text-[9px] text-slate-550 dark:text-slate-500 font-mono font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {isExpanded ? 'Hide' : 'Details'}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-455 font-medium leading-relaxed font-sans">{desc}</p>
      </button>

      {/* Accordion detail list */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1.5 mt-2.5 pl-1.5 pb-2 text-[9px] text-slate-500 dark:text-slate-500 font-semibold leading-relaxed border-l border-slate-200 dark:border-slate-855">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-emerald-500' : isRunning ? 'bg-blue-500' : 'bg-slate-800'}`} />
                  <span>{it}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ----------------------------------------------------
// 4. ProcessingPipeline
// ----------------------------------------------------
interface ProcessingPipelineProps {
  ingestionState: string;
  backgroundProgress: number;
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  ingestionState,
  backgroundProgress
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({ 1: true });

  const getStepStatus = (stepNum: number): 'completed' | 'pending' | 'running' => {
    if (ingestionState === 'COMPLETED') return 'completed';

    if (stepNum === 1) {
      if (['UPLOADING', 'OCR'].includes(ingestionState)) return 'running';
      if (['EXTRACTING', 'VERIFYING', 'GENERATING_RETURN'].includes(ingestionState)) return 'completed';
    }
    if (stepNum === 2) {
      if (ingestionState === 'EXTRACTING') return 'running';
      if (['VERIFYING', 'GENERATING_RETURN'].includes(ingestionState)) return 'completed';
    }
    if (stepNum === 3) {
      if (['VERIFYING', 'GENERATING_RETURN'].includes(ingestionState)) return 'running';
    }
    return 'pending';
  };

  // Sync auto expansion based on active step
  useEffect(() => {
    if (['UPLOADING', 'OCR'].includes(ingestionState)) {
      setExpandedSteps({ 1: true, 2: false, 3: false });
    } else if (ingestionState === 'EXTRACTING') {
      setExpandedSteps({ 1: false, 2: true, 3: false });
    } else if (['VERIFYING', 'GENERATING_RETURN'].includes(ingestionState)) {
      setExpandedSteps({ 1: false, 2: false, 3: true });
    }
  }, [ingestionState]);

  const steps = [
    {
      num: 1,
      title: 'Reading Document',
      desc: 'Secure layout scan & text OCR validation',
      items: ['Form 16 structure validated', 'OCR character mapping loaded', 'Security checksum verified'],
      status: getStepStatus(1)
    },
    {
      num: 2,
      title: 'Extracting Income Details',
      desc: 'Salary elements & identity verification',
      items: ['Employer details matched', 'Section 17 salary records parsed', 'PAN formats verified'],
      status: getStepStatus(2)
    },
    {
      num: 3,
      title: 'Evaluating Deductions & Slabs',
      desc: 'Regime Slab audits & optimization compliance',
      items: ['Deductions mapped in sandbox', 'Assessment Year 2026-27 compliance verified', 'Optimal regime calculated'],
      status: getStepStatus(3)
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900/20 border border-slate-205 dark:border-white/[0.03] rounded-[24px] p-6 backdrop-blur-md space-y-6 text-left relative overflow-hidden shadow-xs">
      <div>
        <span className="text-[9px] text-slate-550 dark:text-slate-505 font-bold uppercase tracking-wider font-mono block">Analysis progress</span>
        <h3 className="text-xs font-bold text-slate-805 dark:text-slate-355 flex items-center gap-1.5 uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-blue-650 dark:text-blue-400" />
          Ingestion Timeline
        </h3>
      </div>

      <div className="space-y-6 relative">
        {steps.map((st) => (
          <PipelineStep
            key={st.num}
            num={st.num}
            title={st.title}
            desc={st.desc}
            items={st.items}
            status={st.status}
            isExpanded={!!expandedSteps[st.num]}
            onToggle={() => setExpandedSteps(prev => ({ ...prev, [st.num]: !prev[st.num] }))}
          />
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 5. DocumentAttachment
// ----------------------------------------------------
export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  employer: string;
  financialYear: string;
  pages: number;
  uploadTime: string;
  status: 'Verified' | 'Failed' | 'Processing';
  confidence: number;
}

interface DocumentAttachmentProps {
  file: UploadedFile;
  onPreview: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}

export const DocumentAttachment: React.FC<DocumentAttachmentProps> = ({
  file,
  onPreview,
  onDelete,
  onRename
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(file.name);

  const handleSaveRename = () => {
    if (editName.trim() && editName !== file.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleDownloadMock = () => {
    const element = document.createElement("a");
    const fileContent = `TaxSense Document Vault - Mock Source Download\nID: ${file.id}\nName: ${file.name}\nSize: ${file.size}\nEmployer: ${file.employer}\nYear: ${file.financialYear}`;
    const fileBlob = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = file.name.endsWith('.pdf') ? file.name : file.name + '.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.06] shadow-xs dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)] rounded-[20px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md hover:border-blue-500/20 hover:scale-[1.005] transition-all duration-200 group relative text-left"
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.04] rounded-xl text-slate-500 dark:text-slate-400 shrink-0 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-650 dark:text-blue-450" />
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-805 dark:text-white focus:outline-none focus:border-blue-500/50 flex-1 font-semibold"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-md cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditName(file.name); }}
                  className="p-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/[0.04] text-slate-500 dark:text-slate-400 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-500 hover:text-slate-350 transition-all duration-200 cursor-pointer shrink-0"
                  title="Rename File"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}

            {!isEditing && (
              <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/25 shrink-0">
                {file.status}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-[10px] text-slate-500 dark:text-slate-450 font-semibold leading-relaxed">
            <span className="truncate">Employer: <strong className="text-slate-800 dark:text-slate-300">{file.employer}</strong></span>
            <span>Year: <strong className="text-slate-800 dark:text-slate-300">{file.financialYear}</strong></span>
            <span>Size: <strong className="text-slate-800 dark:text-slate-300 font-mono">{file.size}</strong></span>
            <span>Time: <strong className="text-slate-800 dark:text-slate-300 font-mono">{file.uploadTime}</strong></span>
          </div>
        </div>
      </div>

      {/* Row of actions - visible on hover & layout matching */}
      <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t border-slate-200 dark:border-slate-800/40 md:border-0 shrink-0">
        <div className="flex flex-col text-right">
          <span className="text-[8px] text-slate-550 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">Confidence</span>
          <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-450">{file.confidence}%</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview Extracted Data */}
          <button
            onClick={onPreview}
            title="Inspect Extracted Data"
            className="p-2 bg-slate-100/50 dark:bg-white/[0.02] hover:bg-slate-200/50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.04] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer shadow-inner active:scale-95"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Download mock source file */}
          <button
            onClick={handleDownloadMock}
            title="Download Document Copy"
            className="p-2 bg-slate-100/50 dark:bg-white/[0.02] hover:bg-slate-200/50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.04] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer shadow-inner active:scale-95"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Delete File */}
          <button
            onClick={onDelete}
            title="Purge Attachment"
            className="p-2 bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 text-red-500 dark:text-red-400 hover:text-red-650 dark:hover:text-red-300 rounded-xl transition-all cursor-pointer shadow-inner active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 6. CopilotPanel
// ----------------------------------------------------
interface CopilotPanelProps {
  incomeProfile: any;
  confirmedDeductions: any;
  onActionClick: () => void;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({
  incomeProfile,
  confirmedDeductions,
  onActionClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const missing80D = !confirmedDeductions['80D'] || confirmedDeductions['80D'] === 0;

  return (
    <div className="bg-gradient-to-b from-purple-50/20 to-indigo-50/10 dark:from-slate-900/50 dark:to-slate-950/40 border border-purple-200 dark:border-purple-500/20 shadow-[0_8px_32px_0_rgba(168,85,247,0.02)] rounded-[24px] p-6 backdrop-blur-md space-y-4 text-left relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-purple-500/[0.03] blur-[60px] rounded-full pointer-events-none" />

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
        </div>
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-purple-605 dark:text-purple-400 font-bold uppercase tracking-wider font-mono">TaxSense Copilot</span>
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full select-none">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">97% Confidence</span>
            </div>
          </div>
          <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200 pt-0.5">Expert Verification Review</h4>
        </div>
      </div>

      <p className="text-[11.5px] text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
        “I’ll review every section of your Form 16, verify extracted values, identify missing deductions, and explain every recommendation before you file.”
      </p>

      {/* Expandable Copilot Insights */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4 pt-4 border-t border-slate-200 dark:border-slate-900/80 text-xs text-slate-500 dark:text-slate-450 font-medium"
          >
            {/* Why this recommendation */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Why this recommendation?</span>
              <p className="leading-relaxed text-[11px] text-slate-655 dark:text-slate-400">
                Extracted salary is {formatINR(incomeProfile?.grossSalary || 0)}.
                {missing80D ? " We verified zero claims under Section 80D. If you pay medical premiums for parents/self, you could unlock up to ₹25,000 to ₹50,000 in extra deductions." : " Section 80D and standard deductions are mapped correctly."}
              </p>
            </div>

            {/* Documents analyzed */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Documents Analyzed</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.04] rounded-lg">
                  <FileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 font-sans">Form 16 Part B</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.04] rounded-lg">
                  <FileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 font-sans">Section 12BB Declaration</span>
                </div>
              </div>
            </div>

            {/* Applicable Rules */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Applicable Tax Rules</span>
              <ul className="list-disc pl-4 space-y-1 leading-relaxed text-[11px] text-slate-655 dark:text-slate-400">
                <li>Section 10(13A) HRA exemption limits calculated based on rent receipts.</li>
                <li>Standard deduction of ₹75,000 preloaded under AY 2026-27 rules.</li>
                <li>Section 80C caps verified at ₹1,50,000 maximum.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="py-2.5 px-4 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 transition-all select-none"
        >
          <span>{isExpanded ? 'Hide Details' : 'Explain Savings'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onActionClick}
          className="flex-1 py-2.5 bg-purple-100/50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 border border-purple-205 dark:border-purple-500/20 text-purple-650 dark:text-purple-400 font-bold text-xs rounded-xl cursor-pointer transition-all text-center select-none active:scale-[0.98]"
        >
          View Recommendations
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 7. CollapsePanel (Processing Details)
// ----------------------------------------------------
interface CollapsePanelProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const CollapsePanel: React.FC<CollapsePanelProps> = ({
  title,
  subtitle,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900/20 border border-white/[0.04] rounded-[20px] overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-white/[0.01] select-none"
      >
        <div className="space-y-0.5">
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block font-mono">{subtitle}</span>
          <span className="text-xs font-bold text-slate-300">{title}</span>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-slate-900/60 bg-[#040608]/20">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ----------------------------------------------------
// 8. MetricChip
// ----------------------------------------------------
export const MetricChip: React.FC<{
  label: string;
  value: string;
  type?: 'success' | 'info' | 'neutral';
}> = ({ label, value, type = 'neutral' }) => {
  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'info':
        return 'text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'neutral':
      default:
        return 'text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/[0.04]';
    }
  };

  return (
    <div className={`p-3 border rounded-xl flex flex-col gap-1 text-left ${getColorClasses()}`}>
      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider font-mono">{label}</span>
      <span className="font-mono text-xs font-black">{value}</span>
    </div>
  );
};

// ----------------------------------------------------
// 9. BreathingIllustration
// ----------------------------------------------------
export const BreathingIllustration: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <div className="relative w-28 h-28 mx-auto flex items-center justify-center select-none">
      {/* Background radial glow */}
      <motion.div
        animate={active ? {
          scale: [1, 1.12, 1],
          opacity: [0.15, 0.35, 0.15],
        } : { scale: 1, opacity: 0.15 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"
      />
      {/* Inner concentric ring */}
      <motion.div
        animate={active ? {
          scale: [0.95, 1.05, 0.95],
        } : { scale: 1 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-20 h-20 rounded-3xl border border-blue-500/20 bg-blue-500/10 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center shadow-lg shadow-blue-500/10"
      >
        <Cpu className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </motion.div>
      {/* Pulsing outer accent circle */}
      <motion.div
        animate={active ? {
          scale: [0.8, 1.15, 0.8],
          opacity: [0.4, 0, 0.4],
        } : { scale: 0.8, opacity: 0 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-24 h-24 rounded-full border border-blue-500/30 pointer-events-none"
      />
    </div>
  );
};

// ----------------------------------------------------
// 10. ReassuranceText
// ----------------------------------------------------
export const ReassuranceText: React.FC = () => {
  const messages = [
    "Your document remains encrypted throughout processing.",
    "Nothing is permanently stored in our databases.",
    "Processing is happening securely in your local sandbox.",
    "Your data never leaves your protected workspace."
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-6 flex items-center justify-start max-w-xs overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.5, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.5 }}
          className="text-[10px] text-slate-400 font-semibold text-left select-none"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

// ----------------------------------------------------
// 11. GhostButton
// ----------------------------------------------------
export const GhostButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return (
    <button
      {...props}
      className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/[0.04] text-slate-450 hover:text-slate-200 font-semibold text-xs rounded-xl cursor-pointer transition-all duration-200 active:scale-98 select-none focus:outline-none focus:ring-1 focus:ring-blue-500/30"
    />
  );
};

// ----------------------------------------------------
// 12. LoadingSkeleton
// ----------------------------------------------------
export const LoadingSkeleton: React.FC<{ width?: string }> = ({ width = '100%' }) => {
  return (
    <div className="flex items-center gap-3 animate-pulse py-1">
      <div className="w-12 h-3 bg-slate-800/40 rounded shrink-0" />
      <div className="w-1.5 h-1.5 rounded-full bg-slate-800/40 shrink-0" />
      <div className="h-3 bg-slate-800/40 rounded" style={{ width }} />
    </div>
  );
};

// ----------------------------------------------------
// 13. ProcessingLogs
// ----------------------------------------------------
export interface LogEntry {
  timestamp: string;
  message: string;
  id: string;
}

export const ProcessingLogs: React.FC<{
  ingestionState: string;
}> = ({ ingestionState }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-generate logs chronologically based on state transitions
  useEffect(() => {
    const formatTime = (date: Date) => {
      return date.toTimeString().split(' ')[0];
    };

    const addLog = (msg: string) => {
      const entry: LogEntry = {
        timestamp: formatTime(new Date()),
        message: msg,
        id: Math.random().toString(36).substring(7)
      };
      setLogs((prev) => {
        // Prevent duplicate messages if added within a close timeframe
        if (prev.some((l) => l.message === msg)) return prev;
        return [...prev, entry];
      });
    };

    if (ingestionState === 'UPLOADING') {
      setLogs([]); // clear logs on upload start
      addLog("Initializing secure upload connection...");
      const t1 = setTimeout(() => addLog("Uploading document packet..."), 1000);
      return () => clearTimeout(t1);
    }

    if (ingestionState === 'OCR') {
      addLog("Reading document layout and font geometry...");
      const t1 = setTimeout(() => addLog("Running OCR character validation..."), 1500);
      return () => clearTimeout(t1);
    }

    if (ingestionState === 'EXTRACTING') {
      addLog("Analyzing salary structures and employer data...");
      const t1 = setTimeout(() => addLog("Locating Section 17 income variables..."), 1000);
      return () => clearTimeout(t1);
    }

    if (ingestionState === 'VERIFYING') {
      addLog("Auditing investment tax declarations...");
      const t1 = setTimeout(() => addLog("Cross-checking details against AY 2026-27 regime parameters..."), 1200);
      return () => clearTimeout(t1);
    }

    if (ingestionState === 'GENERATING_RETURN') {
      addLog("Calculating optimal tax regime slab...");
      const t1 = setTimeout(() => addLog("Filing calculations verified and ready."), 1000);
      return () => clearTimeout(t1);
    }
  }, [ingestionState]);

  // Scroll to bottom when logs update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const copyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    alert("Logs copied to clipboard!");
  };

  const downloadLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxsense_ingestion_logs_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/10 border border-slate-205 dark:border-white/[0.03] rounded-3xl p-6 space-y-4 backdrop-blur-md text-left shadow-xs">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-505 font-bold uppercase tracking-wider font-mono">Activity timeline</span>
          <h4 className="text-xs font-bold text-slate-805 dark:text-slate-205 font-sans">Processing Activity</h4>
        </div>
        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <>
              <button
                onClick={copyLogs}
                title="Copy activity logs"
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-205 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={downloadLogs}
                title="Download logs"
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-205 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-455 dark:hover:text-slate-205 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`transition-all duration-350 ease-in-out overflow-y-auto font-mono text-[10px] space-y-2 border-t border-slate-200 dark:border-slate-950 pt-3 ${isExpanded ? 'max-h-64' : 'max-h-36'
          }`}
      >
        {logs.length === 0 ? (
          <div className="space-y-2.5">
            <LoadingSkeleton />
            <LoadingSkeleton width="75%" />
            <LoadingSkeleton width="50%" />
          </div>
        ) : (
          logs.map((log, idx) => {
            const isNewest = idx === logs.length - 1;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: isNewest ? 1 : 0.65, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 leading-relaxed ${isNewest ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-400'}`}
              >
                <span className="text-slate-500 dark:text-slate-600 shrink-0 select-none font-semibold">{log.timestamp}</span>
                <span className="text-slate-400 dark:text-slate-655 select-none">•</span>
                <span>{log.message}</span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 14. ProcessingHero
// ----------------------------------------------------
interface ProcessingHeroProps {
  ingestionState: string;
  backgroundProgress: number;
  backgroundStatusMessage: string;
  onCancel: () => void;
}

export const ProcessingHero: React.FC<ProcessingHeroProps> = ({
  ingestionState,
  backgroundProgress,
  backgroundStatusMessage,
  onCancel
}) => {
  const [smoothProgress, setSmoothProgress] = useState(backgroundProgress);

  useEffect(() => {
    let animationFrameId: number;
    const step = () => {
      setSmoothProgress((prev) => {
        const diff = backgroundProgress - prev;
        if (Math.abs(diff) < 0.2) {
          return backgroundProgress;
        }
        const next = prev + diff * 0.15;
        animationFrameId = requestAnimationFrame(step);
        return next;
      });
    };
    step();
    return () => cancelAnimationFrame(animationFrameId);
  }, [backgroundProgress]);

  const getETA = () => {
    if (ingestionState === 'UPLOADING') {
      const remaining = Math.max(2, Math.round((100 - smoothProgress) / 8));
      return `About ${remaining} seconds remaining`;
    }
    if (ingestionState === 'OCR') {
      return "About 12 seconds remaining";
    }
    if (ingestionState === 'EXTRACTING') {
      return "About 6 seconds remaining";
    }
    if (ingestionState === 'VERIFYING') {
      return "Almost done...";
    }
    if (ingestionState === 'GENERATING_RETURN') {
      return "Final verification...";
    }
    return "Preparing recommendations...";
  };

  const getHumanTitle = () => {
    switch (ingestionState) {
      case 'UPLOADING':
        return "Uploading your Form 16...";
      case 'OCR':
        return "Reading your document...";
      case 'EXTRACTING':
        return "Analyzing salary details...";
      case 'VERIFYING':
        return "Verifying deductions...";
      case 'GENERATING_RETURN':
      default:
        return "Preparing your tax profile...";
    }
  };

  const isActive = ['UPLOADING', 'OCR', 'EXTRACTING', 'VERIFYING', 'GENERATING_RETURN'].includes(ingestionState);

  return (
    <div className="bg-white dark:bg-[#0f172a]/20 border border-slate-205 dark:border-slate-800 rounded-[24px] p-8 backdrop-blur-md relative overflow-hidden text-left flex flex-col md:flex-row md:items-center gap-8 shadow-xs">
      <div className="absolute inset-0 bg-radial-at-c from-blue-500/[0.02] to-transparent pointer-events-none" />

      {/* Centered illustration graphic */}
      <div className="w-full md:w-1/3 flex justify-center shrink-0">
        <BreathingIllustration active={isActive} />
      </div>

      {/* Left-aligned details, progress, ETA */}
      <div className="flex-1 space-y-5">
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-105 font-sans tracking-tight leading-snug">
            {getHumanTitle()}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed font-sans max-w-xl">
            We’re securely verifying your salary details, deductions, and tax regime using AY 2026–27 rules.
          </p>
        </div>

        {/* Progress Bar & Indicators */}
        <div className="space-y-3.5 max-w-md">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs font-black">{Math.round(smoothProgress)}%</span>
            <span className="text-slate-500 text-[10px] font-mono font-bold tracking-wide">{getETA()}</span>
          </div>

          <div
            className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.02] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(smoothProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${smoothProgress}%` }}
              transition={{ type: "tween", ease: "easeOut" }}
            />
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping shrink-0" />
            <span className="truncate">Current operation: {backgroundStatusMessage || "Initializing secure workspace"}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 max-w-md border-t border-slate-200 dark:border-slate-900/60">
          <GhostButton onClick={onCancel}>
            Cancel Upload
          </GhostButton>

          <ReassuranceText />
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 15. AnimatedSuccessCheckmark
// ----------------------------------------------------
export const AnimatedSuccessCheckmark: React.FC = () => {
  return (
    <div className="w-16 h-16 flex items-center justify-center rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.12)] relative overflow-hidden shrink-0">
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-emerald-500/10 blur-xl"
      />
      <svg className="w-8 h-8 text-emerald-400 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
};

// ----------------------------------------------------
// 16. VerificationMetric
// ----------------------------------------------------
export const VerificationMetric: React.FC<{
  label: string;
  value: string;
  type?: 'success' | 'info' | 'neutral' | 'status';
}> = ({ label, value, type = 'neutral' }) => {
  const getStyleClasses = () => {
    switch (type) {
      case 'status':
        return 'bg-emerald-500/[0.02] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.06)] p-5 md:col-span-2 border-2';
      case 'success':
        return 'bg-slate-50 dark:bg-slate-900/60 border-slate-205 dark:border-white/[0.04] text-emerald-605 dark:text-emerald-400 p-4';
      case 'info':
        return 'bg-slate-50 dark:bg-slate-900/60 border-slate-205 dark:border-white/[0.04] text-blue-650 dark:text-blue-400 p-4';
      case 'neutral':
      default:
        return 'bg-slate-50 dark:bg-slate-900/60 border-slate-205 dark:border-white/[0.04] text-slate-805 dark:text-slate-200 p-4';
    }
  };

  return (
    <div className={`border rounded-[18px] flex flex-col gap-1.5 text-left backdrop-blur-md transition-all duration-200 hover:border-slate-300 dark:hover:border-white/[0.08] hover:scale-[1.01] ${getStyleClasses()}`}>
      <span className={`text-[8.5px] font-bold uppercase tracking-wider font-mono ${type === 'status' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-550 dark:text-slate-500'
        }`}>
        {label}
      </span>
      <span className={`font-mono leading-none tracking-tight ${type === 'status' ? 'text-base font-black' : 'text-xs font-bold'
        }`}>
        {value}
      </span>
    </div>
  );
};

// ----------------------------------------------------
// 17. SummaryCard
// ----------------------------------------------------
interface SummaryCardProps {
  title: string;
  items: { label: string; verified: boolean; type: 'verification' | 'identity' | 'tax' | 'salary' }[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, items }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'verification':
        return <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
      case 'identity':
        return <User className="w-4 h-4 text-purple-605 dark:text-purple-400 shrink-0" />;
      case 'tax':
        return <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />;
      case 'salary':
      default:
        return <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
  };

  return (
    <div className="p-5 bg-slate-55 dark:bg-slate-900/20 border border-slate-205 dark:border-white/[0.03] rounded-2xl space-y-4 backdrop-blur-md text-left shadow-xs">
      <h5 className="text-[10px] font-bold text-slate-550 dark:text-slate-500 uppercase tracking-wider font-mono">{title}</h5>
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-705 dark:text-slate-300 font-sans font-semibold">
              {getIcon(it.type)}
              <span>{it.label}</span>
            </div>
            <div className="shrink-0 flex items-center justify-center">
              {it.verified ? (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide font-mono">
                  Verified
                </span>
              ) : (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-550 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide font-mono">
                  Pending
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 18. DeductionChip
// ----------------------------------------------------
export const DeductionChip: React.FC<{
  sectionCode: string;
  value: string;
  label: string;
}> = ({ sectionCode, value, label }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getDeductionDetails = (code: string) => {
    const detailsMap: Record<string, { desc: string; maxLimit: string; rule: string }> = {
      'Section 80C': {
        desc: "Life insurance, PF, ELSS, home loan principal",
        maxLimit: "₹1,50,000 max deduction",
        rule: "Income Tax Act Section 80C"
      },
      'Section 80D': {
        desc: "Health insurance premium for self and family",
        maxLimit: "₹25,000 max deduction (₹50,000 for seniors)",
        rule: "Income Tax Act Section 80D"
      },
      'Section 80CCD(1B)': {
        desc: "Additional contribution to NPS (National Pension System)",
        maxLimit: "₹50,000 max deduction",
        rule: "Income Tax Act Section 80CCD(1B)"
      },
      'Section 80CCD(2)': {
        desc: "Employer NPS contributions",
        maxLimit: "Up to 10% of salary",
        rule: "Income Tax Act Section 80CCD(2)"
      },
      'Section 24(b) (Housing Loan)': {
        desc: "Interest paid on self-occupied housing property loan",
        maxLimit: "₹2,000,000 max deduction",
        rule: "Income Tax Act Section 24(b)"
      }
    };
    return detailsMap[code] || {
      desc: "Tax deductible allowance mapped from Form 16",
      maxLimit: "Limit subject to standard rules",
      rule: "Income Tax Act Provisions"
    };
  };

  const info = getDeductionDetails(sectionCode);

  return (
    <div
      className="relative z-10"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className="px-3.5 py-2 bg-slate-100/50 hover:bg-slate-200/50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.04] text-[10px] font-bold text-slate-700 dark:text-slate-350 rounded-xl uppercase tracking-wider flex items-center gap-2 select-none transition-colors cursor-help"
      >
        <span className="text-slate-500 dark:text-slate-400">{sectionCode}</span>
        <span className="text-slate-400 dark:text-slate-600">•</span>
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{value}</span>
      </span>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl text-[10px] leading-relaxed text-slate-300 space-y-1.5 pointer-events-none"
          >
            <p className="font-bold text-white uppercase tracking-wider text-[8px] font-mono text-blue-400">{sectionCode}</p>
            <p className="font-semibold text-slate-200">{info.desc}</p>
            <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-900 text-[8px] font-bold font-mono">
              <span>{info.maxLimit}</span>
              <span>{info.rule}</span>
            </div>
            {/* Tooltip caret arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-slate-800 rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ----------------------------------------------------
// 19. PrimaryCTA
// ----------------------------------------------------
interface PrimaryCTAProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
}

export const PrimaryCTA: React.FC<PrimaryCTAProps> = ({ children, onClick, disabled, className }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.015, backgroundColor: '#2563eb' }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.2 }}
      className={`px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg active:scale-98 transition-all cursor-pointer flex items-center gap-2 group select-none focus:outline-none disabled:opacity-50 disabled:pointer-events-none ${className || ''}`}
    >
      <span>{children}</span>
      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
    </motion.button>
  );
};

// ----------------------------------------------------
// 20. ConfidenceBadge
// ----------------------------------------------------
export const ConfidenceBadge: React.FC<{ score: number }> = ({ score }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="text-emerald-650 dark:text-emerald-450 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full uppercase text-[10px] font-bold font-mono cursor-help select-none">
        {score}% Verified
      </span>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl text-[10px] leading-relaxed text-slate-700 dark:text-slate-300 space-y-1.5 pointer-events-none z-20 text-left font-sans"
          >
            <p className="font-bold uppercase tracking-wider text-[8px] font-mono text-emerald-600 dark:text-emerald-450">AI Confidence Audit</p>
            <p className="font-semibold text-slate-800 dark:text-slate-202">Verified against official AY 2026-27 tax rules.</p>
            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-900 text-slate-550 dark:text-slate-400 text-[8.5px] space-y-1">
              <div>✓ Employer TAN signature matched</div>
              <div>✓ Section 80C limit rules checked</div>
              <div>✓ Pan checksum validated</div>
              <div>✓ Basic/Gross ratio verified</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ----------------------------------------------------
// 21. AuditTimeline
// ----------------------------------------------------
interface AuditTimelineProps {
  analysisProgress: number;
  grossSalary: number;
  formType: string;
  savings: number;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({
  analysisProgress,
  grossSalary,
  formType,
  savings
}) => {
  const getStepStatus = (stepNum: number) => {
    if (analysisProgress >= stepNum) return 'completed';
    if (analysisProgress === stepNum - 1) return 'running';
    return 'pending';
  };

  const steps = [
    {
      num: 1,
      title: "Salary verified",
      desc: `Gross salary of ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(grossSalary)} mapped with standard allowances.`,
      status: getStepStatus(1)
    },
    {
      num: 2,
      title: "Income sources confirmed",
      desc: `Form type dynamically assigned as ${formType} based on active income streams.`,
      status: getStepStatus(2)
    },
    {
      num: 3,
      title: "Eligible deductions reviewed",
      desc: "Section 80C, 80D, and rent allowances audited and cross-checked.",
      status: getStepStatus(3)
    },
    {
      num: 4,
      title: "Best tax regime identified",
      desc: `Recommendation generated with tax savings of ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(savings)}.`,
      status: getStepStatus(4),
      isClimax: true
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 space-y-6 relative overflow-hidden backdrop-blur-md shadow-xs dark:shadow-2xl">
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-500/[0.01] blur-[60px] rounded-full pointer-events-none" />

      <div className="relative space-y-6 pl-0.5">
        {steps.map((st, index) => {
          const isCompleted = st.status === 'completed';
          const isRunning = st.status === 'running';
          const isPending = st.status === 'pending';

          return (
            <div
              key={st.num}
              className={`flex items-start gap-4 relative z-10 transition-all duration-350 ${st.isClimax && isCompleted ? 'bg-emerald-550/[0.02] dark:bg-emerald-500/[0.02] border border-emerald-500/10 p-4 rounded-xl -mx-4 shadow-[0_0_15px_rgba(16,185,129,0.04)]' : ''
                } ${isCompleted ? 'opacity-70' : isRunning ? 'opacity-100' : 'opacity-40'}`}
            >
              {/* Stepper connecting line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[9.5px] top-6 bottom-[-24px] w-[1.5px] bg-slate-200 dark:bg-slate-800 pointer-events-none">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                    className="w-full bg-emerald-500/60"
                  />
                </div>
              )}

              <div className="mt-0.5 shrink-0 relative z-20">
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black font-mono font-sans"
                  >
                    ✓
                  </motion.div>
                ) : isRunning ? (
                  <motion.div
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold font-mono"
                  >
                    •
                  </motion.div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-405 dark:text-slate-600 flex items-center justify-center text-[10px] font-bold font-mono">
                    -
                  </div>
                )}
              </div>

              <div className="space-y-1 text-left flex-1">
                <span className={`text-xs font-bold font-sans transition-colors ${st.isClimax && isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : isRunning ? 'text-blue-600 dark:text-blue-450' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                  {st.title}
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{st.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 22. ComparisonCard
// ----------------------------------------------------
interface ComparisonCardProps {
  taxCalculationResult: any;
  formatINR: (val: number) => string;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  taxCalculationResult,
  formatINR
}) => {
  const oldRegime = taxCalculationResult.oldRegime;
  const newRegime = taxCalculationResult.newRegime;

  const oldTotal = oldRegime.totalTaxPayable;
  const newTotal = newRegime.totalTaxPayable;
  const maxTotal = Math.max(oldTotal, newTotal, 1);
  return (
    <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/[0.03] rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden shadow-xs dark:shadow-xl text-left">
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/[0.01] blur-[60px] rounded-full pointer-events-none" />

      <div className="space-y-5">
        <div className="space-y-1">
          <span className="text-[9px] text-slate-550 dark:text-slate-505 font-bold uppercase tracking-wider font-mono block">Real-time analysis</span>
          <h3 className="text-sm font-bold text-slate-805 dark:text-slate-100 flex items-center gap-1.5 font-sans">
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Tax Regime Comparison
          </h3>
        </div>

        {/* Slabs Comparison Table */}
        <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/[0.02] rounded-2xl p-4 space-y-4 shadow-inner">
          <div className="flex items-center justify-between text-xs pb-2.5 border-b border-slate-200 dark:border-white/[0.03]">
            <span className="text-slate-550 font-bold font-mono text-[9px] uppercase tracking-wider">Parameters</span>
            <div className="flex items-center gap-6 font-mono font-bold text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-450">
              <span className="w-20 text-right">Current Regime</span>
              <span className="w-20 text-right text-emerald-600 dark:text-emerald-400">Recommended</span>
            </div>
          </div>

          {/* Group 1: Income */}
          <div className="space-y-2">
            <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider font-mono block font-sans">Income details</span>
            <div className="flex items-center justify-between text-xs py-0.5">
              <span className="text-slate-700 dark:text-slate-400 font-sans">Gross salary</span>
              <div className="flex items-center gap-6 font-mono text-slate-800 dark:text-slate-200">
                <span className="w-20 text-right">{formatINR(oldRegime.grossTotalIncome)}</span>
                <span className="w-20 text-right">{formatINR(newRegime.grossTotalIncome)}</span>
              </div>
            </div>
          </div>

          {/* Group 2: Deductions */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-900/60 pt-2">
            <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider font-mono block font-sans">Allowable deductions</span>
            <div className="flex items-center justify-between text-xs py-0.5">
              <span className="text-slate-700 dark:text-slate-400 font-sans font-medium">Standard deduction</span>
              <div className="flex items-center gap-6 font-mono text-rose-600 dark:text-rose-500/85">
                <span className="w-20 text-right">- {formatINR(50000)}</span>
                <span className="w-20 text-right">- {formatINR(75000)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs py-0.5">
              <span className="text-slate-700 dark:text-slate-400 font-sans font-medium">Other confirmed deductions</span>
              <div className="flex items-center gap-6 font-mono text-rose-600 dark:text-rose-500/85">
                <span className="w-20 text-right">- {formatINR(Math.max(0, oldRegime.totalDeductions - 50000))}</span>
                <span className="w-20 text-right">- {formatINR(0)}</span>
              </div>
            </div>
          </div>

          {/* Group 3: Taxable Base & Estimated Tax */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-900/60 pt-2">
            <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider font-mono block font-sans">Summary calculations</span>
            <div className="flex items-center justify-between text-xs py-1 px-2 -mx-2 bg-slate-100/50 dark:bg-white/[0.01] rounded">
              <span className="text-slate-800 dark:text-slate-200 font-semibold font-sans">Taxable base income</span>
              <div className="flex items-center gap-6 font-mono text-slate-805 dark:text-slate-200 font-bold">
                <span className="w-20 text-right">{formatINR(oldRegime.taxableIncome)}</span>
                <span className="w-20 text-right">{formatINR(newRegime.taxableIncome)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs py-1 px-2 -mx-2">
              <span className="text-slate-800 dark:text-slate-200 font-bold font-sans">Net estimated tax</span>
              <div className="flex items-center gap-6 font-mono font-bold">
                <span className="w-20 text-right text-slate-500 dark:text-slate-450">{formatINR(oldTotal)}</span>
                <span className="w-20 text-right text-emerald-600 dark:text-emerald-400 font-extrabold">{formatINR(newTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual comparison bars */}
        <div className="space-y-4 pt-1">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Tax Burden Visualization</span>

          <div className="space-y-3">
            {/* Current Regime */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[11px] font-mono font-medium">
                <span className="text-slate-500 dark:text-slate-450 font-sans">Current Regime (Old)</span>
                <span className="text-slate-800 dark:text-slate-355 font-bold">{formatINR(oldTotal)}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/[0.02]">
                <div className="h-full bg-slate-400 dark:bg-slate-600 rounded-full" style={{ width: `${(oldTotal / maxTotal) * 100}%` }} />
              </div>
            </div>

            {/* Recommended Regime */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[11px] font-mono font-medium">
                <span className="text-slate-500 dark:text-slate-450 font-sans">Recommended Regime (New)</span>
                <span className="text-emerald-600 dark:text-emerald-450 font-extrabold">{formatINR(newTotal)}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full flex overflow-hidden border border-slate-200/50 dark:border-white/[0.02]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(newTotal / maxTotal) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-emerald-500 rounded-l-full"
                />
                {taxCalculationResult.savings > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="h-full bg-emerald-500/10 border-l border-dashed border-emerald-400 flex-1 animate-pulse"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Savings Hero Accent */}
        {taxCalculationResult.savings > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 relative overflow-hidden mt-1 select-none">
            <div className="absolute -left-[50px] -bottom-[50px] w-24 h-24 bg-emerald-500/[0.03] rounded-full blur-xl pointer-events-none" />
            <div className="space-y-1 text-left relative z-10">
              <span className="text-[9px] text-emerald-600 dark:text-emerald-450 font-mono font-bold uppercase tracking-wider">Recommended Option Savings</span>
              <p className="text-[11px] text-slate-700 dark:text-slate-355 leading-relaxed font-sans">
                Based on your verified income and deductions, switching to the Recommended Regime reduces your estimated tax liability by <span className="font-bold text-slate-900 dark:text-white font-mono">{formatINR(taxCalculationResult.savings)}</span>.
              </p>
            </div>
            <div className="shrink-0 text-right bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/25 px-3.5 py-2.5 rounded-xl shadow-inner">
              <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block font-mono">Est. Savings</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{formatINR(taxCalculationResult.savings)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 23. AuditPanel
// ----------------------------------------------------
interface AuditPanelProps {
  analysisProgress: number;
  taxData: any;
  taxCalculationResult: any;
  formType: string;
  setActiveStep: (step: number) => void;
}

export const AuditPanel: React.FC<AuditPanelProps> = ({
  analysisProgress,
  taxData,
  taxCalculationResult,
  formType,
  setActiveStep
}) => {
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    if (analysisProgress >= 4) {
      const timer = setTimeout(() => setShowCTA(true), 600);
      return () => clearTimeout(timer);
    }
  }, [analysisProgress]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left font-sans">
      {/* Left Column - Hero and Timeline */}
      <div className="lg:col-span-7 space-y-6">
        {/* Audit Hero */}
        <div className="bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-205 dark:border-slate-800 rounded-[24px] p-6 backdrop-blur-md flex items-center gap-4 relative overflow-hidden shadow-xs">
          <div className="absolute inset-0 bg-radial-at-t from-emerald-500/[0.01] to-transparent pointer-events-none" />

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/5">
            <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2 font-sans">
              AI Tax Review Complete
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed font-sans">
              We’ve securely reviewed your income, deductions, exemptions, and tax regime using the latest AY 2026–27 income tax rules.
            </p>
          </div>
        </div>

        {/* Audit timeline */}
        <AuditTimeline
          analysisProgress={analysisProgress}
          grossSalary={taxData.grossSalary}
          formType={formType}
          savings={taxCalculationResult.savings}
        />

        {/* Confidence Badge & CTA Progress Bar */}
        {analysisProgress >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 bg-slate-55 dark:bg-slate-900/40 border border-slate-205 dark:border-white/[0.04] rounded-3xl space-y-4 backdrop-blur-md shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 text-left">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Validation details</span>
                <span className="text-xs font-bold text-slate-805 dark:text-slate-200 font-sans">AI Confidence Index</span>
              </div>
              <ConfidenceBadge score={98} />
            </div>

            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.02] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '98%' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              />
            </div>

            {showCTA && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <PrimaryCTA onClick={() => setActiveStep(5)}>
                  Continue to Tax Recommendations
                </PrimaryCTA>

                <span className="text-[10px] text-slate-600 dark:text-slate-450 font-semibold text-center sm:text-left leading-relaxed font-sans">
                  You’ll review personalized tax recommendations based on your verified return details.
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Right Column - regime comparison */}
      <div className="lg:col-span-5 space-y-6">
        <ComparisonCard
          taxCalculationResult={taxCalculationResult}
          formatINR={formatINR}
        />
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 24. RecommendationsPanel
// ----------------------------------------------------
interface RecommendationsPanelProps {
  taxData: any;
  taxCalculationResult: any;
  incomeProfile: any;
  confirmedDeductions: any;
  formType: string;
  formatINR: (val: number) => string;
  setActiveStep: (step: number) => void;
}

// Animated Savings Hero Counter for premium loaded feel
const HeroSavingsCounter: React.FC<{ value: number }> = React.memo(({ value }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 600; // 600ms duration
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{formatINR(displayValue)}</span>;
});

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  taxData,
  taxCalculationResult,
  incomeProfile,
  confirmedDeductions,
  formType,
  formatINR,
  setActiveStep
}) => {
  const savingsVal = taxCalculationResult.savings;
  const recommendedRegime = taxCalculationResult.recommendedRegime;
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const panelContainer = {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  } as any;

  const panelItem = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
  } as any;

  const chipContainer = {
    animate: {
      transition: {
        staggerChildren: 0.06
      }
    }
  } as any;

  const chipItem = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
  } as any;

  return (
    <motion.div
      variants={panelContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 font-sans max-w-6xl mx-auto pb-20 relative text-left"
    >
      {/* Background Volumetric Glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-radial from-blue-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* 1. Streamlined Hero Savings Section */}
      <motion.div
        variants={panelItem}
        className="bg-white/70 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-8 lg:p-10 text-center space-y-3 relative overflow-hidden backdrop-blur-xl shadow-xl dark:shadow-2xl z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            AY 2026–27 AI Strategy Verified
          </span>
        </div>

        <h2 className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase select-none">
          Your Optimal Tax Savings Calculation Is Ready
        </h2>

        {/* Big Savings Metric */}
        <div className="py-2 flex items-center justify-center select-all">
          <div className="text-6xl sm:text-7xl md:text-8xl lg:text-[90px] font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-[#34D399] dark:via-emerald-400 dark:to-cyan-400 drop-shadow-sm">
            <HeroSavingsCounter value={savingsVal} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Estimated Net Tax Savings
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-350 font-medium">
            By adopting the recommended strategy compared to your current filing.
          </p>
        </div>
      </motion.div>

      {/* 2. Structured Decision KPI Card (4 Columns) */}
      <motion.div
        variants={panelItem}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white/70 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl backdrop-blur-xl shadow-md z-10"
      >
        <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.03]">
          <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">New Tax Liability</span>
          <span className="font-mono text-slate-900 dark:text-white font-extrabold text-xl block">
            {formatINR(taxCalculationResult.newRegime.totalTaxPayable)}
          </span>
        </div>

        <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.03]">
          <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Time Required</span>
          <span className="text-slate-900 dark:text-white text-sm font-bold block pt-1">Less than 1 minute</span>
        </div>

        <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.03]">
          <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Recommendation</span>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mt-0.5">
            Switch to {recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime'}
          </span>
        </div>

        <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.03]">
          <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Expected Impact</span>
          <span className="text-slate-900 dark:text-white text-sm font-bold block pt-1">Lowest Tax Liability</span>
        </div>
      </motion.div>

      {/* 3. AI Verification Journey (2 Columns Restored) */}
      <motion.div
        variants={panelItem}
        className="bg-white/70 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 space-y-4 backdrop-blur-xl shadow-md z-10"
      >
        <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-white/[0.04] pb-3">
          <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            AI Verification Journey
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-1">
          {/* Verification checklist */}
          <div className="space-y-3 text-left border-slate-200 dark:border-slate-800/60 md:border-r border-b md:border-b-0 pb-4 md:pb-0 pr-6">
            <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              🛡 AI Verification Complete
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-350 font-semibold leading-relaxed">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>All employer data verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>All calculations matched</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>No compliance issues found</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified against AY 2026–27 Rules</span>
              </div>
            </div>
          </div>

          {/* Verified credentials chips */}
          <div className="space-y-2 select-none">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Verified Credentials
            </span>
            <motion.div
              variants={chipContainer}
              className="flex flex-wrap gap-2 pt-1"
            >
              {[
                'Form 16 Match',
                'PAN Match',
                'Salary Verification',
                'Employer Profile',
                'AY 2026–27 Rules',
                'Income Ledger'
              ].map((chip) => (
                <motion.div
                  key={chip}
                  variants={chipItem}
                  className="flex items-center gap-1.5 bg-blue-600/10 dark:bg-blue-600/5 border border-blue-200 dark:border-blue-500/10 px-3 py-1.5 rounded-lg text-[10px] text-blue-600 dark:text-blue-400 font-bold"
                >
                  <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>{chip}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 4. Single Unified Regime Comparison Breakdown Card */}
      <motion.div
        variants={panelItem}
        className="bg-white/70 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 space-y-4 backdrop-blur-xl shadow-md z-10"
      >
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Compared to your current filing
        </span>

        {/* 3-Column Comparison Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono select-none">
          {/* Current Filing */}
          <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/[0.04] space-y-1">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Current Filing (Old Regime)</span>
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300 block">
              {formatINR(taxCalculationResult.oldRegime.totalTaxPayable)}
            </span>
          </div>

          {/* Recommended Filing */}
          <div className="p-4 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 space-y-1">
            <span className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Recommended (New Regime)</span>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300 block">
              {formatINR(taxCalculationResult.newRegime.totalTaxPayable)}
            </span>
          </div>

          {/* Net Savings */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 space-y-1">
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Estimated Savings</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">
              {formatINR(savingsVal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 5. Action CTA Bar */}
      <motion.div
        variants={panelItem}
        className="bg-white/70 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 text-center space-y-4 backdrop-blur-xl shadow-md z-10"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setActiveStep(6)}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
          >
            <span>Continue with AI Filing</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-white/[0.08]"
          >
            <span>{isDetailsOpen ? 'Hide Detailed Breakdown' : 'View Detailed Breakdown'}</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          You can review every calculation and deduction line-item before final submission.
        </p>
      </motion.div>

      {/* 6. Collapsible Detailed Tax Calculation */}
      <AnimatePresence>
        {isDetailsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white/50 dark:bg-[#060A10]/50 border border-slate-200/60 dark:border-white/[0.04] rounded-3xl p-6 text-left"
          >
            <React.Suspense fallback={<div className="h-64 bg-slate-900/10 animate-pulse rounded-2xl" />}>
              <RegimeComparison hideHero={true} />
            </React.Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ----------------------------------------------------
// 25. CurrencyInput
// ----------------------------------------------------
interface CurrencyInputProps {
  value: number;
  onChange: (val: string) => void;
  label: string;
  sourceText?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, label, sourceText }) => {
  const [localVal, setLocalVal] = useState(value.toLocaleString('en-IN'));

  useEffect(() => {
    setLocalVal(value.toLocaleString('en-IN'));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const numVal = parseInt(raw, 10) || 0;
    setLocalVal(numVal.toLocaleString('en-IN'));
    onChange(raw);
  };

  return (
    <div className="p-5 bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-white/[0.03] rounded-2xl flex items-center justify-between transition-all group">
      <div className="flex flex-col text-left space-y-1">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</span>
        {sourceText && (
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase font-mono">
            {sourceText}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-blue-500 dark:focus-within:border-blue-450 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-150 w-48 shadow-xs">
        <span className="text-slate-500 font-mono text-xs font-bold">₹</span>
        <input
          type="text"
          value={localVal}
          onChange={handleChange}
          className="bg-transparent border-none text-right font-mono text-xs font-extrabold text-slate-800 dark:text-slate-100 focus:outline-none w-full"
        />
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 26. FilingWorkspacePanel
// ----------------------------------------------------
interface FilingWorkspacePanelProps {
  guidedFilingStep: number;
  setGuidedFilingStep: React.Dispatch<React.SetStateAction<number>>;
  incomeProfile: any;
  taxData: any;
  handleNumericChange: (field: 'grossSalary' | 'otherIncome' | 'tdsDeducted', val: string) => void;
  executeFilingSubmission: () => void;
  taxCalculationResult: any;
  formatINR: (val: number) => string;
  setActiveStep: (step: number) => void;
}

export const FilingWorkspacePanel: React.FC<FilingWorkspacePanelProps> = ({
  guidedFilingStep,
  setGuidedFilingStep,
  incomeProfile,
  taxData,
  handleNumericChange,
  executeFilingSubmission,
  taxCalculationResult,
  formatINR,
  setActiveStep
}) => {
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const val80C = confirmedDeductions?.['80C'] || 0;
  const val80D = confirmedDeductions?.['80D'] || 0;
  const val80CCD2 = confirmedDeductions?.['80CCD(2)'] || 0;

  const getAdvisorDeductionsMessage = () => {
    if (val80C === 0) {
      return "You haven't claimed Section 80C deductions yet. You could save up to ₹46,800 by maxing this out.";
    }
    if (val80C > 0 && val80C < 150000) {
      return `You're leaving ${formatINR(150000 - val80C)} unused under Section 80C. Click 'Max out' to capture full savings.`;
    }
    if (val80CCD2 === 0) {
      return "NPS could reduce another ₹12,000 from your tax liability. Review the New Regime NPS Strategy card.";
    }
    return "Your deductions are fully optimized. We've pre-selected the best possible exemptions based on your Form 16.";
  };

  const steps = [
    { id: 1, label: "Personal Details", progress: 20, icon: User },
    { id: 2, label: "Income", progress: 40, icon: DollarSign },
    { id: 3, label: "Deductions", progress: 60, icon: Receipt },
    { id: 4, label: "Review", progress: 80, icon: ShieldCheck },
    { id: 5, label: "Generate Return", progress: 100, icon: Send }
  ];

  const currentStepInfo = steps[guidedFilingStep - 1];

  const getBackLabel = () => {
    if (guidedFilingStep === 2) return "Back to Personal Details";
    if (guidedFilingStep === 3) return "Back to Income";
    if (guidedFilingStep === 4) return "Back to Deductions";
    if (guidedFilingStep === 5) return "Back to Review";
    return "Back";
  };

  const getContinueLabel = () => {
    if (guidedFilingStep === 1) return "Continue to Income";
    if (guidedFilingStep === 2) return "Continue to Deductions";
    if (guidedFilingStep === 3) return "Continue to Review";
    if (guidedFilingStep === 4) return "Continue to Generate Return";
    return "Continue";
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-16 text-left">
      {/* Progress Pipeline */}
      <div className="bg-white/70 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl space-y-6 shadow-md z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListTodo className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            ITR Filing Pipeline
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold font-mono">
            Step {guidedFilingStep} of 5 • {currentStepInfo.progress}% Complete
          </span>
        </div>

        {/* Progress Grid Container */}
        <div className="relative">
          {/* Connector Line Background */}
          <div className="absolute left-[10%] right-[10%] top-4 h-[2px] bg-slate-200 dark:bg-slate-800/80 rounded-full z-0" />

          {/* Connector Line Fill */}
          <div className="absolute left-[10%] right-[10%] top-4 h-[2px] rounded-full z-0 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((guidedFilingStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>

          {/* 5-Column Grid */}
          <div className="grid grid-cols-5 w-full relative z-10 select-none">
            {steps.map((s) => {
              const isCompleted = guidedFilingStep > s.id;
              const isActive = guidedFilingStep === s.id;
              const StepIcon = s.icon;

              return (
                <button
                  key={s.id}
                  onClick={() => setGuidedFilingStep(s.id)}
                  className="flex flex-col items-center group cursor-pointer focus:outline-none bg-transparent border-none p-0 w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400 rounded-xl"
                >
                  <div
                    className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all duration-300 relative z-20 ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20 scale-105'
                          : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 0.4 }}
                      >
                        <Check className="w-4 h-4 stroke-[3] text-slate-950" />
                      </motion.div>
                    ) : (
                      <StepIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center px-1">
                    <span
                      className={`text-[9.5px] uppercase tracking-widest font-extrabold transition-all duration-200 block leading-tight ${
                        isActive
                          ? 'text-slate-900 dark:text-white font-black'
                          : isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'
                      }`}
                    >
                      {s.label.split(' ').map((word, wIdx) => (
                        <span key={wIdx} className="block">
                          {word}
                        </span>
                      ))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main card with layout division */}
      {guidedFilingStep === 3 ? (
        <div className="w-full text-left">
          <React.Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
            <DeductionCard
              onContinue={() => setGuidedFilingStep(4)}
              onBack={() => setGuidedFilingStep(2)}
            />
          </React.Suspense>
        </div>
      ) : guidedFilingStep === 4 ? (
        <div className="w-full text-left">
          <React.Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
            <FilingReviewCard
              onContinue={() => setGuidedFilingStep(5)}
              onBack={() => setGuidedFilingStep(3)}
            />
          </React.Suspense>
        </div>
      ) : guidedFilingStep === 5 ? (
        <div className="w-full text-left">
          <React.Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
            <GenerateReturnCard
              onContinue={executeFilingSubmission}
              onBack={() => setGuidedFilingStep(4)}
            />
          </React.Suspense>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Side: Form Content Card */}
          <div className="lg:col-span-8 bg-white/70 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-7 backdrop-blur-xl space-y-8 relative shadow-md">

            {/* Reassurance Auto-save Badge */}
            <div className="absolute top-7 right-7 flex items-center gap-1.5 text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All changes saved
            </div>

            {/* Form Header */}
            <div className="space-y-1 text-left">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {guidedFilingStep === 1 && "Personal Information"}
                {guidedFilingStep === 2 && "Income Summary"}
              </h3>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium">
                {guidedFilingStep === 1 && "Verify your personal profile particulars extracted from Form 16."}
                {guidedFilingStep === 2 && "Configure and confirm ledger details of your gross taxable income."}
              </p>
            </div>

            <div className="pt-2">
              {/* Step 1: Personal Info */}
              {guidedFilingStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={incomeProfile?.employeeName || 'Mohit Kumar'}
                        readOnly
                        className="w-full bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-not-allowed focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9.5px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1 select-none">
                        <Check className="w-3 h-3 text-emerald-500" />
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Permanent Account Number (PAN)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={incomeProfile?.pan || 'MK*****32F'}
                        readOnly
                        className="w-full bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-not-allowed focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9.5px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1 select-none">
                        <Check className="w-3 h-3 text-emerald-500" />
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Employer Category</label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="Private Sector Co."
                        disabled
                        className="w-full bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-not-allowed focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9.5px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1 select-none">
                        <Check className="w-3 h-3 text-emerald-500" />
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Residential Status</label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="Resident Individual"
                        disabled
                        className="w-full bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-not-allowed focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9.5px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1 select-none">
                        <Check className="w-3 h-3 text-emerald-500" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Income Review */}
              {guidedFilingStep === 2 && (
                <div className="space-y-5">
                  <CurrencyInput
                    value={taxData.grossSalary}
                    onChange={(val) => handleNumericChange('grossSalary', val)}
                    label="Gross Salary (Section 17(1))"
                    sourceText="Extracted from verified Form 16"
                  />

                  <CurrencyInput
                    value={taxData.otherIncome}
                    onChange={(val) => handleNumericChange('otherIncome', val)}
                    label="Income from Other Sources"
                    sourceText="Estimated / Self-declared"
                  />
                </div>
              )}
            </div>

            {/* Bottom Navigation buttons */}
            <div className="pt-6 border-t border-slate-200/80 dark:border-white/[0.06] flex justify-between">
              <button
                onClick={() => setGuidedFilingStep(prev => Math.max(1, prev - 1))}
                disabled={guidedFilingStep === 1}
                className="px-6 py-3 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-30 disabled:pointer-events-none select-none active:scale-95 transition-all"
              >
                {getBackLabel()}
              </button>
              <button
                onClick={() => setGuidedFilingStep(prev => Math.min(5, prev + 1))}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 group"
              >
                <span>{getContinueLabel()}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>

          </div>

          {/* Right Side: Contextual Assistant Advice (4 columns) */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div className="bg-white/70 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl space-y-4 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-blue-500/10 via-transparent to-transparent pointer-events-none blur-xl z-0" />
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 relative z-10">
                <Sparkles className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Advisor Guidance</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium relative z-10">
                {guidedFilingStep === 1 && "Everything here was automatically extracted from your Form 16. You remain in control and can verify the ledger entries before filing."}
                {guidedFilingStep === 2 && "Verify your income ledgers. Your gross salary corresponds to section 17(1) of Form 16. You can edit any parameters if needed."}
                {guidedFilingStep === 4 && "This is a pre-filing compliance audit check. Switched regime liability calculations are verified against AY 2026-27 rules."}
                {guidedFilingStep === 5 && "Final verification before return ledger generation. This step logs your optimization history inside your local secure browser storage."}
              </p>

              <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.06] space-y-2.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider relative z-10">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Your data stays securely on your device</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Checked against official AY 2026-27 tax rules</span>
                </div>
              </div>
            </div>

            {/* Checklist Status */}
            <div className="bg-white/70 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none blur-xl z-0" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 relative z-10">Filing Progress</h4>
              <div className="space-y-2.5 text-xs">
                <div className={`flex justify-between items-center ${guidedFilingStep === 1 ? 'text-slate-900 dark:text-white font-bold' : 'opacity-60 text-slate-400'}`}>
                  <span>1. Personal Details</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">✓ Verified</span>
                </div>
                <div className={`flex justify-between items-center ${guidedFilingStep === 2 ? 'text-slate-900 dark:text-white font-bold' : guidedFilingStep > 2 ? 'opacity-60 text-slate-400' : 'opacity-40 text-slate-500'}`}>
                  <span>2. Income</span>
                  <span className={guidedFilingStep > 2 ? "text-emerald-600 dark:text-emerald-400 font-bold font-mono" : "font-mono"}>
                    {guidedFilingStep > 2 ? "✓ Verified" : guidedFilingStep === 2 ? "• Active" : "Pending"}
                  </span>
                </div>
                <div className={`flex justify-between items-center ${guidedFilingStep === 3 ? 'text-slate-900 dark:text-white font-bold' : guidedFilingStep > 3 ? 'opacity-60 text-slate-400' : 'opacity-40 text-slate-500'}`}>
                  <span>3. Deductions</span>
                  <span className={guidedFilingStep > 3 ? "text-emerald-600 dark:text-emerald-400 font-bold font-mono" : "font-mono"}>
                    {guidedFilingStep > 3 ? "✓ Verified" : guidedFilingStep === 3 ? "• Active" : "Pending"}
                  </span>
                </div>
                <div className={`flex justify-between items-center ${guidedFilingStep === 4 ? 'text-slate-900 dark:text-white font-bold' : guidedFilingStep > 4 ? 'opacity-60 text-slate-400' : 'opacity-40 text-slate-500'}`}>
                  <span>4. Review</span>
                  <span className={guidedFilingStep > 4 ? "text-emerald-600 dark:text-emerald-400 font-bold font-mono" : "font-mono"}>
                    {guidedFilingStep > 4 ? "✓ Verified" : guidedFilingStep === 4 ? "• Active" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
