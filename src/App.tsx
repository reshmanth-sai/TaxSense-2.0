import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import CountUp from './components/CountUp';
import { motion, AnimatePresence } from 'motion/react';
import { TaxData, FilingHistoryItem } from './types';
import { TAX_CONFIG } from './config';
import { calculateTax, formatINR } from './utils/taxCalculator';
const DeductionCard = lazy(() => import('./components/DeductionCard'));
const RegimeComparison = lazy(() => import('./components/RegimeComparison'));
const ExtractionConfirm = lazy(() => import('./components/ExtractionConfirm'));
const ExportControl = lazy(() => import('./components/ExportControl'));
const FilingGuide = lazy(() => import('./components/FilingGuide'));
const DocumentVault = lazy(() => import('./components/DocumentVault'));
const AICopilot = lazy(() => import('./components/copilot/AICopilot').then(m => ({ default: m.AICopilot })));
import { useTaxStore, useTaxStoreHydrated, UserProfile } from './store/useTaxStore';
import { 
  DashboardCard, 
  SectionHeader, 
  StatusBadge, 
  ProgressWidget, 
  RecommendationCard, 
  AlertCard, 
  MetricCard, 
  TimelineItem, 
  LedgerRow, 
  PrimaryButton, 
  SecondaryButton, 
  DocumentPreviewModal, 
  CopilotDetailsDrawer 
} from './components/dashboard/DashboardComponents';
import LandingPage from './components/LandingPage';
import { ExportService } from './services/ExportService';
import { GoogleAuthService } from './services/GoogleAuthService';
import { AuditPanel, RecommendationsPanel } from './components/vault/VaultComponents';

import { 
  Lock, 
  SlidersHorizontal, 
  Calculator, 
  BookOpen, 
  RotateCcw,
  ListTodo,
  TrendingUp,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  FileUp,
  BrainCircuit,
  Award,
  History,
  Settings,
  ChevronDown,
  LogOut,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  FileText,
  KeyRound,
  Download,
  Printer,
  ShieldCheck,
  Send,
  X,
  Bot,
  User,
  Plus,
  Minus,
  AlertCircle,
  Cpu,
  Menu
} from 'lucide-react';

const ParamInfo: React.FC<{ text: string }> = ({ text }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1 z-30 group">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-slate-350 focus:outline-none cursor-pointer p-0.5 inline-flex items-center align-middle"
        title={text}
      >
        <Info className="h-3.5 w-3.5 inline text-slate-400 hover:text-blue-400 transition-colors" />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900 border border-slate-800 text-white text-[10px] font-medium rounded-lg shadow-xl leading-normal text-left z-50 pointer-events-none transition-all">
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          {text}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const hydrated = useTaxStoreHydrated();
  const [isFilingGuideOpen, setIsFilingGuideOpen] = useState(false);
  const activeStep = useTaxStore((state) => state.activeStep);
  const setActiveStep = useTaxStore((state) => state.setActiveStep);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [authEmail, setAuthEmail] = useState('guest@taxsense.in');
  const [authPassword, setAuthPassword] = useState('••••••••••••');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCopilotExpanded, setIsCopilotExpanded] = useState(false);
  const [activePreviewDoc, setActivePreviewDoc] = useState<any>(null);
  const [isGuestSessionExpanded, setIsGuestSessionExpanded] = useState(false);
  const [guidedFilingStep, setGuidedFilingStep] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [sessionTimeLeft, setSessionTimeLeft] = useState(900);

  // Form 16 extraction UI state
  const [extractedData, setExtractedData] = useState<Partial<TaxData> | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showConfirmScreen, setShowConfirmScreen] = useState(false);

  // Manual Paste code drawer state
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [manualRawText, setManualRawText] = useState('');
  const [isPasteProcessing, setIsPasteProcessing] = useState(false);

  // Zustand Store variables
  const filingHistory = useTaxStore((state) => state.filingHistory) || [];
  const addFilingHistory = useTaxStore((state) => state.addFilingHistory);
  const clearFilingHistory = useTaxStore((state) => state.clearFilingHistory);
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const setIncomeProfile = useTaxStore((state) => state.setIncomeProfile);
  const updateDeduction = useTaxStore((state) => state.updateDeduction);
  const addChatMessage = useTaxStore((state) => state.addChatMessage);
  const setIsStoreExtracting = useTaxStore((state) => state.setIsExtracting);
  const clearSession = useTaxStore((state) => state.clearSession);
  const user = useTaxStore((state) => state.user);
  const authMode = useTaxStore((state) => state.authMode);
  const setUser = useTaxStore((state) => state.setUser);
  const setAuthMode = useTaxStore((state) => state.setAuthMode);
  const isBackgroundProcessing = useTaxStore((state) => state.isBackgroundProcessing);
  const backgroundProgress = useTaxStore((state) => state.backgroundProgress);
  const backgroundStatusMessage = useTaxStore((state) => state.backgroundStatusMessage);
  const formType = useTaxStore((state) => state.formType);
  const setFormType = useTaxStore((state) => state.setFormType);
  const multiHouse = useTaxStore((state) => state.multiHouse);
  const setMultiHouse = useTaxStore((state) => state.setMultiHouse);
  const foreignAssets = useTaxStore((state) => state.foreignAssets);
  const setForeignAssets = useTaxStore((state) => state.setForeignAssets);
  const currentStep = useTaxStore((state) => state.currentStep);
  const setStep = useTaxStore((state) => state.setStep);
  const ingestionState = useTaxStore((state) => state.ingestionState);
  const theme = useTaxStore((state) => state.theme) || 'light';
  const setTheme = useTaxStore((state) => state.setTheme);
  const uploadedFiles = useTaxStore((state) => state.uploadedFiles) || [];

  // Guest Session countdown ticker
  useEffect(() => {
    if (authMode !== 'GUEST') return;
    const interval = setInterval(() => {
      setSessionTimeLeft((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(interval);
  }, [authMode]);
  const isFloatingAIChatOpen = useTaxStore((state) => state.isFloatingAIChatOpen);
  const setIsFloatingAIChatOpen = useTaxStore((state) => state.setIsFloatingAIChatOpen);

  // Workspace entrance card coordinate tracking
  const [authCardCoords, setAuthCardCoords] = useState({ x: 0, y: 0 });
  const [authCardHovered, setAuthCardHovered] = useState(false);
  const [authCardTilt, setAuthCardTilt] = useState({ x: 0, y: 0 });
  const [googleGsiState, setGoogleGsiState] = useState<'loading' | 'ready' | 'success' | 'failed'>('loading');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('info');

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAuthCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setAuthCardCoords({ x, y });

    // Calculate tilt (max 1.5 degrees for premium depth)
    const tiltX = -((y / rect.height) - 0.5) * 1.5;
    const tiltY = ((x / rect.width) - 0.5) * 1.5;
    setAuthCardTilt({ x: tiltX, y: tiltY });
  };


  // Generate 40 twinkling particles for unified background canvas
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, idx) => ({
      id: idx,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.6, // 0.6px to 2.4px
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 5, // 5s to 11s
    }));
  }, []);

  // Smooth High-Performance Mouse Parallax via CSS Variables
  useEffect(() => {
    let rafid: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafid);
      rafid = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        document.documentElement.style.setProperty('--mouse-x', `${x}`);
        document.documentElement.style.setProperty('--mouse-y', `${y}`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafid);
    };
  }, []);

  // Enforce dark mode class on document element
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Stepped thinking timer in Stage 4
  useEffect(() => {
    if (activeStep === 4) {
      setAnalysisProgress(0);
      const t1 = setTimeout(() => setAnalysisProgress(1), 800);
      const t2 = setTimeout(() => setAnalysisProgress(2), 1600);
      const t3 = setTimeout(() => setAnalysisProgress(3), 2400);
      const t4 = setTimeout(() => setAnalysisProgress(4), 3200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [activeStep]);

  // Automatically clear overlay modals when routing step changes
  useEffect(() => {
    setShowConfirmScreen(false);
    setShowCelebration(false);
  }, [activeStep]);

  const handleGoogleLoginSuccess = (profile: UserProfile) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setUser(profile);
      setAuthMode('GOOGLE');
      
      const redirectStep = (window as any)._migrationRedirectStep || 11;
      (window as any)._migrationRedirectStep = null;
      setActiveStep(redirectStep);
    }, 600);
  };

  // Google GSI script loader and pre-initialization
  useEffect(() => {
    let active = true;

    if (activeStep === 2) {
      if (googleGsiState === 'ready' || googleGsiState === 'success') {
        return;
      }
      setGoogleGsiState('loading');
      
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.error("[GIS] Google Client ID missing");
        setGoogleGsiState('failed');
        return;
      }

      GoogleAuthService.loadScript()
        .then(() => {
          if (!active) return;
          console.log('[GIS] Google Script Loaded & Ready');
          setGoogleGsiState('ready');
        })
        .catch((err) => {
          if (!active) return;
          console.error('[GIS] Failed to preload Google Identity SDK:', err);
          setGoogleGsiState('failed');
        });
    }

    return () => {
      active = false;
    };
  }, [activeStep]);

  // Programmatic custom login click handler
  const handleGoogleSignIn = async () => {
    if (googleGsiState === 'loading' || googleGsiState === 'success') {
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("[GIS] Google Client ID missing");
      showToast("Google OAuth configuration is missing.", 'error');
      return;
    }

    setGoogleGsiState('loading');

    try {
      console.log('[GIS] Launching programmatic OAuth 2.0 flow');
      const profile = await GoogleAuthService.signIn(clientId);
      console.log('[GIS] Google Sign-In Success:', profile);
      
      setGoogleGsiState('success');
      
      // Delay briefly for Signed In checkmark animation before entering workspace
      setTimeout(() => {
        handleGoogleLoginSuccess(profile);
      }, 950);
    } catch (err: any) {
      console.error('[GIS] Sign-In Failed:', err);
      setGoogleGsiState('ready'); // reset button state to ready so they can retry
      
      // Human-friendly error translation for the toast
      let userMessage = "Authentication cancelled. Please try again.";
      if (err.message && err.message.includes("popup_closed_by_user")) {
        userMessage = "Authentication cancelled.";
      } else if (err.message && err.message.includes("network")) {
        userMessage = "Network error. Unable to reach Google.";
      } else if (err.message && err.message.includes("access_denied")) {
        userMessage = "Access denied. Please grant required permissions.";
      }
      
      showToast(userMessage, 'error');
    }
  };

  // Auto-forward logged-in users past the login screen
  useEffect(() => {
    if (hydrated && activeStep === 2 && authMode !== null) {
      setActiveStep(11);
    }
  }, [hydrated, activeStep, authMode]);

  // Guest Session Inactivity Expiry (15 minutes)
  useEffect(() => {
    if (authMode === 'GUEST') {
      const checkExpiry = () => {
        const lastActive = localStorage.getItem('taxsense_last_active');
        if (lastActive) {
          const inactiveMs = Date.now() - parseInt(lastActive, 10);
          const maxInactiveMs = 15 * 60 * 1000; // 15 minutes of inactivity
          if (inactiveMs > maxInactiveMs) {
            clearSession();
            setActiveStep(2);
            alert("Your guest session has expired due to 15 minutes of inactivity.");
          }
        }
      };

      // Set initial activity
      localStorage.setItem('taxsense_last_active', Date.now().toString());

      // Setup interval to check inactivity
      const interval = setInterval(checkExpiry, 30000); // Check every 30 seconds

      // Listen to user interaction events to refresh inactivity timer
      const refreshActivity = () => {
        localStorage.setItem('taxsense_last_active', Date.now().toString());
      };
      
      window.addEventListener('mousemove', refreshActivity);
      window.addEventListener('keydown', refreshActivity);
      window.addEventListener('click', refreshActivity);

      return () => {
        clearInterval(interval);
        window.removeEventListener('mousemove', refreshActivity);
        window.removeEventListener('keydown', refreshActivity);
        window.removeEventListener('click', refreshActivity);
      };
    }
  }, [authMode]);

  // Global keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar: Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
      
      // Stage jumps: only when activeStep >= 3 and not typing in input
      if (activeStep >= 3 && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        switch (e.key) {
          case '1':
            setActiveStep(11); // Dashboard Hub
            break;
          case '2':
            setActiveStep(3);  // Documents
            break;
          case '3':
            setActiveStep(4);  // AI Analysis
            break;
          case '4':
            setActiveStep(5);  // Recommendations
            break;
          case '5':
            setActiveStep(6);  // Tax Return
            break;
          case '6':
            setActiveStep(10); // History logs
            break;
          case '7':
            setIsSettingsOpen(prev => !prev); // Toggle Settings
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep]);

  // Derive taxData state from Zustand store for calculations and reviews
  const taxData: TaxData = useMemo(() => ({
    assessmentYear: TAX_CONFIG.assessmentYear,
    grossSalary: incomeProfile?.grossSalary || 0,
    hraExemption: confirmedDeductions?.['HRA exemption'] || confirmedDeductions?.hraExemption || 0,
    ltaExemption: 0,
    standardDeductionOld: TAX_CONFIG.standardDeductionOld,
    standardDeductionNew: TAX_CONFIG.standardDeductionNew,
    otherIncome: incomeProfile?.otherIncome || 0,
    deduction80C: confirmedDeductions?.['80C'] || 0,
    deduction80D: confirmedDeductions?.['80D'] || 0,
    deduction80TTA: confirmedDeductions?.['80TTA'] || 0,
    deduction80G: confirmedDeductions?.['80G'] || 0,
    section24b: confirmedDeductions?.['section24b'] || 0,
    tdsDeducted: incomeProfile?.tdsDeducted || 0,
    stcg: incomeProfile?.stcg || 0,
    ltcg: incomeProfile?.ltcg || 0,
    deduction80CCD1B: confirmedDeductions?.['80CCD(1B)'] || 0,
    deduction80CCD2: confirmedDeductions?.['80CCD(2)'] || 0,
    deduction80DD: confirmedDeductions?.['80DD'] || 0,
    deduction80U: confirmedDeductions?.['80U'] || 0,
    deduction80DDB: confirmedDeductions?.['80DDB'] || 0,
    deduction80E: confirmedDeductions?.['80E'] || 0,
    deduction80EEA: confirmedDeductions?.['80EEA'] || 0,
    deduction80GG: confirmedDeductions?.['80GG'] || 0,
    deduction80TTB: confirmedDeductions?.['80TTB'] || 0,
  }), [incomeProfile, confirmedDeductions]);

  // Memoize tax calculation result to avoid redundant evaluations
  const taxCalculationResult = useMemo(() => {
    return calculateTax(taxData);
  }, [taxData]);
  const acceptExtractedData = (confirmedData: TaxData) => {
    setIncomeProfile({
      grossSalary: confirmedData.grossSalary || 0,
      otherIncome: confirmedData.otherIncome || 0,
      tdsDeducted: confirmedData.tdsDeducted || 0,
      employerName: confirmedData.employerName || '',
      pfContribution: confirmedData.pfContribution || 0,
      basicSalary: confirmedData.basicSalary || 0,
      stcg: confirmedData.stcg || 0,
      ltcg: confirmedData.ltcg || 0,
    });
    updateDeduction('80C', confirmedData.deduction80C || 0);
    updateDeduction('80D', confirmedData.deduction80D || 0);
    updateDeduction('HRA exemption', confirmedData.hraExemption || 0);
    updateDeduction('section24b', confirmedData.section24b || 0);
    
    setShowConfirmScreen(false);
    setActiveStep(4); // Route to Copilot diagnosis stage
  };

  const handleNumericChange = (field: 'grossSalary' | 'otherIncome' | 'tdsDeducted', val: string) => {
    const numeric = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
    setIncomeProfile({ [field]: numeric });
  };

  const executeFilingSubmission = () => {
    // Collect active values and push into log history
    const taxSummary = taxCalculationResult;
    const optimalTax = taxSummary.recommendedRegime === 'NEW' 
      ? taxSummary.newRegime.totalTaxPayable 
      : taxSummary.oldRegime.totalTaxPayable;
    const netTax = Math.max(0, optimalTax - taxData.tdsDeducted);
    const randomId = `TXS-${Math.floor(100000 + Math.random() * 900000)}`;
    const curDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    addFilingHistory({
      id: randomId,
      date: curDate,
      grossSalary: taxData.grossSalary,
      totalDeductions: taxData.deduction80C + taxData.deduction80D + taxData.hraExemption + taxData.section24b,
      netTaxPaid: netTax,
      recommendedRegime: taxSummary.recommendedRegime,
      formType: formType,
      taxData: { ...taxData }
    });
    
    setShowCelebration(true);
  };

  const handleDownloadHistoryJSON = (item: FilingHistoryItem) => {
    let dataToExport = item.taxData;
    if (!dataToExport) {
      dataToExport = {
        assessmentYear: TAX_CONFIG.assessmentYear,
        grossSalary: item.grossSalary,
        hraExemption: 0,
        ltaExemption: 0,
        standardDeductionOld: TAX_CONFIG.standardDeductionOld,
        standardDeductionNew: TAX_CONFIG.standardDeductionNew,
        otherIncome: 0,
        deduction80C: item.recommendedRegime === 'OLD' ? Math.min(item.totalDeductions, 150000) : 0,
        deduction80D: item.recommendedRegime === 'OLD' ? Math.max(0, Math.min(item.totalDeductions - 150000, 25000)) : 0,
        deduction80TTA: 0,
        deduction80G: 0,
        section24b: 0,
        tdsDeducted: 0,
      };
    }
    ExportService.downloadJSON(dataToExport, item.formType);
  };

  const handleDownloadHistoryPDF = (item: FilingHistoryItem) => {
    let dataToExport = item.taxData;
    if (!dataToExport) {
      dataToExport = {
        assessmentYear: TAX_CONFIG.assessmentYear,
        grossSalary: item.grossSalary,
        hraExemption: 0,
        ltaExemption: 0,
        standardDeductionOld: TAX_CONFIG.standardDeductionOld,
        standardDeductionNew: TAX_CONFIG.standardDeductionNew,
        otherIncome: 0,
        deduction80C: item.recommendedRegime === 'OLD' ? Math.min(item.totalDeductions, 150000) : 0,
        deduction80D: item.recommendedRegime === 'OLD' ? Math.max(0, Math.min(item.totalDeductions - 150000, 25000)) : 0,
        deduction80TTA: 0,
        deduction80G: 0,
        section24b: 0,
        tdsDeducted: 0,
      };
    }
    ExportService.downloadPDF(dataToExport, item.formType);
  };

  // Get dynamic greeting greeting message based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    const name = incomeProfile?.employeeName || 'Mohit';
    const shortName = name.split(/\s+/)[0];
    if (hours < 12) return `Good Morning, ${shortName}`;
    if (hours < 18) return `Good Afternoon, ${shortName}`;
    return `Good Evening, ${shortName}`;
  };

  // Show the landing page immediately to avoid initial loading block/spinner
  if (currentStep === 'HOME' || !hydrated) {
    return <LandingPage onStart={() => { if (hydrated) { setActiveStep(2); } }} />;
  }

  return (
    <div id="taxsense-app" className="min-h-screen bg-[#060708] text-white dark:text-slate-100 flex font-sans select-none antialiased relative overflow-hidden" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
      
      {/* Layer 5: Pinned fixed cinematic noise texture across the viewport (GPU-accelerated) */}
      <div 
        className="cinematic-noise" 
        style={{ transform: 'translate3d(0, 0, 0)', opacity: 0.012 }}
      />

      {/* BACKGROUND FLOATING EFFECTS: Ambient Glows */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          transform: 'translate3d(calc(var(--mouse-x, 0) * -4px), calc(var(--mouse-y, 0) * -4px), 0)',
          transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        {/* Top Left: Large dark emerald ambient light */}
        <div 
          style={{ 
            background: 'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.075) 0%, transparent 70%)',
            filter: 'blur(120px)'
          }}
          className="absolute -top-[20%] -left-[20%] w-[1000px] h-[1000px] pointer-events-none animate-ambient-drift-tl" 
        />
        
        {/* Bottom Right: Soft cyan/blue ambient light */}
        <div 
          style={{ 
            background: 'radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.04) 0%, transparent 70%)',
            filter: 'blur(140px)'
          }}
          className="absolute -bottom-[20%] -right-[20%] w-[1000px] h-[1000px] pointer-events-none animate-ambient-drift-br" 
        />
      </motion.div>

      {/* Layer 4: Screen Edges Soft Vignette */}
      <div className="absolute inset-0 z-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.55)]" />

      {/* Layer 6: Soft background grid texture faded toward edges */}
      <div 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.004) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.004) 1px, transparent 1px)', 
          backgroundSize: '100px 100px',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 80%)',
          maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 80%)'
        }} 
        className="absolute inset-0 z-0 pointer-events-none" 
      />

      {/* TWINKLING PARTICLE FIELD */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.2 }}
        style={{
          transform: 'translate3d(calc(var(--mouse-x, 0) * 25px), calc(var(--mouse-y, 0) * 25px), 0)',
          transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
        className="absolute inset-0 pointer-events-none overflow-hidden z-1"
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
            className="absolute bg-emerald-400/20 rounded-full animate-particle-twinkle"
          />
        ))}
      </motion.div>

      <Suspense fallback={
        <div className="relative z-10 flex-1 min-h-screen bg-[#040608]/40 p-8 space-y-6 animate-pulse font-sans">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-slate-200/10 dark:bg-slate-800/20 rounded-xl" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-200/10 dark:bg-slate-800/20 rounded-lg" />
              <div className="w-48 h-3 bg-slate-200/10 dark:bg-slate-800/20 rounded-lg" />
            </div>
          </div>
          <div className="w-full h-64 bg-slate-200/10 dark:bg-slate-800/20 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-slate-200/10 dark:bg-slate-800/20 rounded-2xl" />
            <div className="h-32 bg-slate-200/10 dark:bg-slate-800/20 rounded-2xl" />
            <div className="h-32 bg-slate-200/10 dark:bg-slate-800/20 rounded-2xl" />
          </div>
        </div>
      }>
        {/* Stage 2: Sandbox Entry (No Sidebar) */}
        <div style={{ display: activeStep === 2 ? 'block' : 'none' }} className="w-full">
          {(() => {
            const containerVariants = {
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2
                }
              }
            } as const;

            const childVariants = {
              hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
              visible: { 
                opacity: 1, 
                y: 0, 
                filter: "blur(0px)",
                transition: { type: "spring" as const, stiffness: 100, damping: 20 }
              }
            } as const;

            return (
              <div className="relative z-10 flex-1 flex flex-col min-h-screen bg-transparent overflow-hidden justify-center items-center py-20 px-8">
                
                {/* Viewport Edge Vignette for Stage 2 */}
                <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_120px_rgba(0,0,0,0.9)]" />

                {/* Fading technical grid overlay (gently pulses in and out) */}
                <div 
                  style={{ 
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.002) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.002) 1px, transparent 1px)', 
                    backgroundSize: '120px 120px'
                  }} 
                  className="absolute inset-0 z-0 pointer-events-none" 
                />

                {/* Floating Entrance Navbar (Arc Browser Style) */}
                <motion.div 
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] z-50 flex items-center justify-between px-6 py-3 bg-[#0E131B]/40 border border-white/[0.04] rounded-full backdrop-blur-md shadow-lg shadow-black/20"
                >
                  <div 
                    onClick={() => setStep('HOME')}
                    className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <div className="w-6 h-6 rounded bg-[#16E27A] flex items-center justify-center text-slate-950 font-bold text-xs animate-logo-pulse">
                      T
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase text-white font-geist">TaxSense</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.015] border border-white/[0.04]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16E27A] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#16E27A]"></span>
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Public Beta Active</span>
                  </div>
                </motion.div>

                {/* Main Interactive Entrance Card Container scaled to max-w-[720px] */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.98, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  onMouseMove={handleAuthCardMouseMove}
                  onMouseEnter={() => setAuthCardHovered(true)}
                  onMouseLeave={() => {
                    setAuthCardHovered(false);
                    setAuthCardTilt({ x: 0, y: 0 });
                  }}
                  style={{
                    transform: authCardHovered ? `perspective(1000px) rotateX(${authCardTilt.x}deg) rotateY(${authCardTilt.y}deg)` : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                    transition: authCardHovered ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  className="max-w-[720px] w-full relative z-10 p-[1px] rounded-[24px] overflow-hidden transition-all duration-300"
                >
                  {/* Subtle inner border sweep */}
                  <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent,rgba(22,226,122,0.06),transparent_50%)] animate-border-beam" />

                  {/* Surface Card with layered glassmorphism and compact padding (p-12) */}
                  <div className="relative w-full h-full rounded-[24px] p-12 space-y-10 overflow-hidden glass-panel-surface">
                    
                    {/* Radial interactive spotlight following cursor */}
                    <div 
                      style={{
                        background: `radial-gradient(220px circle at ${authCardCoords.x}px ${authCardCoords.y}px, rgba(22, 226, 122, 0.025), transparent 85%)`
                      }}
                      className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${authCardHovered ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Glass reflections overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.003] to-white/[0.008] pointer-events-none" />

                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-10"
                    >
                      {/* Header elements block with refined vertical spacing */}
                      <motion.div variants={childVariants} className="text-center relative z-10 flex flex-col items-center">
                        {/* Secure Shield emblem with rotating halo animation */}
                        <div className="relative mb-6 flex items-center justify-center">
                          {/* Rotating outer dashed ring (24-second spin loop) */}
                          <div className="absolute w-20 h-20 rounded-full border border-dashed border-[#16E27A]/15 animate-spin-dashed pointer-events-none" />
                          
                          {/* Frosted glass circle badge with inner highlight and breath pulse */}
                          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-500/[0.03] border border-[#16E27A]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_20px_rgba(22,226,122,0.06)] animate-shield-pulse relative z-10">
                            <div className="absolute inset-0.5 rounded-full bg-slate-950/20 backdrop-blur-md" />
                            <ShieldCheck className="w-6.5 h-6.5 text-[#16E27A] relative z-10 filter drop-shadow-[0_0_6px_rgba(22,226,122,0.35)]" />
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-2">
                          <h2 className="text-3xl sm:text-[36px] font-bold tracking-tight text-white leading-none font-sans">Continue Securely</h2>
                          <p className="text-[11.5px] text-slate-400 leading-relaxed max-w-md mx-auto font-medium tracking-wide mt-3.5 select-none font-sans">
                            Choose how you'd like to access your TaxSense workspace.
                          </p>
                        </div>
                      </motion.div>

                      {/* Staggered choice cards wrapper */}
                      <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 relative z-10 items-stretch">
                        
                        {/* Soft Center Separator line */}
                        <div className="hidden md:block absolute top-[5%] bottom-[5%] left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-white/[0.05] to-transparent pointer-events-none" />

                        {/* Guest Access Card (Try Instantly) */}
                        <div className="p-8 rounded-[20px] flex flex-col justify-between group glass-option-card-sandbox">
                          <div className="space-y-5 text-left">
                            <div className="space-y-2">
                              <h3 className="text-[24px] font-semibold text-[#F5F7FA] tracking-tight font-sans">Try Instantly</h3>
                              <p className="text-[15px] text-white/68 leading-relaxed font-normal font-sans">
                                Start immediately without creating an account.
                              </p>
                            </div>
                            
                            {/* Elegant Feature Rows (No checkboxes) */}
                            <div className="space-y-4 pt-1">
                              <div className="flex gap-3 text-left">
                                <div className="w-6.5 h-6.5 rounded-md bg-white/[0.015] border border-white/[0.04] flex items-center justify-center text-[11px] flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.01)]">
                                  <span>⚡</span>
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-[11px] font-medium text-slate-200 font-sans">Instant Sandbox</h4>
                                  <p className="text-[9.5px] text-slate-400/80 font-normal font-sans">Temporary isolated workspace</p>
                                </div>
                              </div>

                              <div className="flex gap-3 text-left">
                                <div className="w-6.5 h-6.5 rounded-md bg-white/[0.015] border border-white/[0.04] flex items-center justify-center text-[11px] flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.01)]">
                                  <span>🔒</span>
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-[11px] font-medium text-slate-200 font-sans">Local Processing</h4>
                                  <p className="text-[9.5px] text-slate-400/80 font-normal font-sans">Files never leave your device</p>
                                </div>
                              </div>

                              <div className="flex gap-3 text-left">
                                <div className="w-6.5 h-6.5 rounded-md bg-white/[0.015] border border-white/[0.04] flex items-center justify-center text-[11px] flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.01)]">
                                  <span>🗂</span>
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-[11px] font-medium text-slate-200 font-sans">Auto Cleanup</h4>
                                  <p className="text-[9.5px] text-slate-400/80 font-normal font-sans">Session automatically expires</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-8 flex flex-col justify-center items-center">
                            <button
                              onClick={() => {
                                setIsAuthenticating(true);
                                setTimeout(() => {
                                  setIsAuthenticating(false);
                                  setAuthMode('GUEST');
                                  setUser(null);
                                  const redirectStep = (window as any)._migrationRedirectStep || 11;
                                  (window as any)._migrationRedirectStep = null;
                                  setActiveStep(redirectStep);
                                }, 600);
                              }}
                              className="w-[220px] h-[44px] rounded-full text-[12.5px] tracking-wide font-sans cursor-pointer flex items-center justify-between px-5 transition-all duration-200 font-semibold border z-20 relative select-none btn-tactile-google"
                            >
                              <span className="w-3.5 h-3.5" />
                              <span className="text-[12.5px] font-semibold tracking-wide font-sans">
                                {isAuthenticating ? 'Initializing...' : 'Launch Sandbox'}
                              </span>
                              {!isAuthenticating ? (
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                              ) : (
                                <span className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Google Access Card (Continue Securely) */}
                        <div className="p-8 rounded-[20px] relative flex flex-col justify-between group glass-option-card-google">
                          
                          {/* Dynamic recommended badge with pulsing ring */}
                           <div className="absolute top-3 right-3 bg-emerald-500/10 border border-emerald-500/20 text-[#16E27A] px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(22,226,122,0.08)] select-none">
                            <span className="relative flex h-1 w-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16E27A] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1 w-1 bg-[#16E27A]"></span>
                            </span>
                            <span>Recommended</span>
                          </div>
                          
                          <div className="space-y-5 text-left">
                            <div className="space-y-2">
                              <h3 className="text-[24px] font-semibold text-[#F5F7FA] tracking-tight font-sans">Continue Securely</h3>
                              <p className="text-[15px] text-white/68 leading-relaxed font-normal font-sans">
                                Secure cloud sync with your TaxSense workspace.
                              </p>
                            </div>
                            
                            {/* Elegant Feature Rows (No checkboxes) */}
                            <div className="space-y-4 pt-1">
                              <div className="flex gap-3 text-left">
                                <div className="w-6.5 h-6.5 rounded-md bg-white/[0.015] border border-white/[0.04] flex items-center justify-center text-[11px] flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.01)]">
                                  <span>☁</span>
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-[11px] font-medium text-slate-200 font-sans">Cloud Sync</h4>
                                  <p className="text-[9.5px] text-slate-400/80 font-normal font-sans">Securely sync between devices</p>
                                </div>
                              </div>

                              <div className="flex gap-3 text-left">
                                <div className="w-6.5 h-6.5 rounded-md bg-white/[0.015] border border-white/[0.04] flex items-center justify-center text-[11px] flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.01)]">
                                  <span>🛡</span>
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-[11px] font-medium text-slate-200 font-sans">Secure Vault</h4>
                                  <p className="text-[9.5px] text-slate-400/80 font-normal font-sans">AES-256 cloud encryption</p>
                                </div>
                              </div>

                              <div className="flex gap-3 text-left">
                                <div className="w-6.5 h-6.5 rounded-md bg-white/[0.015] border border-white/[0.04] flex items-center justify-center text-[11px] flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.01)]">
                                  <span>💬</span>
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-[11px] font-medium text-slate-200 font-sans">AI History</h4>
                                  <p className="text-[9.5px] text-slate-400/80 font-normal font-sans">Synchronized Copilot chats</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Custom Designed Google Sign-In Button */}
                          <div className="mt-8 flex flex-col justify-center items-center">
                            <button
                              type="button"
                              disabled={googleGsiState === 'loading' || googleGsiState === 'success'}
                              onClick={handleGoogleSignIn}
                              aria-label="Continue with Google"
                              className={`w-[220px] h-[44px] rounded-full text-[12.5px] tracking-wide font-sans cursor-pointer flex items-center justify-between px-5 transition-all duration-200 font-semibold border z-20 relative select-none btn-tactile-google ${
                                googleGsiState === 'success'
                                  ? 'bg-[#16E27A]/10 border-[#16E27A]/25 text-[#16E27A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_15px_rgba(22,226,122,0.15)]'
                                  : googleGsiState === 'loading'
                                  ? 'text-slate-500 cursor-wait'
                                  : ''
                              }`}
                            >
                              {googleGsiState === 'loading' ? (
                                <>
                                  <svg className="w-3.5 h-3.5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="32" strokeDashoffset="8" />
                                  </svg>
                                  <span className="mx-auto text-[12px] font-semibold tracking-normal font-sans">Signing you in...</span>
                                  <span className="w-3.5 h-3.5" />
                                </>
                              ) : googleGsiState === 'success' ? (
                                <>
                                  <svg className="w-3.5 h-3.5 text-emerald-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  <span className="mx-auto text-[12px] font-semibold tracking-normal font-sans">Signed In</span>
                                  <span className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  {/* Official Google G Logo */}
                                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                  </svg>
                                  <span className="text-[12.5px] font-semibold tracking-wide font-sans">Continue with Google</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>

                      {/* Animated Divider (fade -> center glow -> fade) */}
                      <motion.div variants={childVariants} className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-4">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[1px] bg-[#16E27A]/30 blur-[1px]" />
                      </motion.div>

                      {/* Trust Footer Badges with glassmorphism details */}
                      <motion.div variants={childVariants} className="flex flex-wrap items-center justify-center gap-3.5 my-8">
                        <div className="px-3.5 py-1 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-default glass-badge-premium opacity-95 transition-all duration-200 hover:shadow-[0_0_12px_rgba(255,255,255,0.02)]">
                          <span className="filter drop-shadow-[0_0_2px_rgba(255,255,255,0.15)]">🔒</span> AES-256 Encryption
                        </div>
                        <div className="px-3.5 py-1 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-default glass-badge-premium opacity-85 transition-all duration-200 hover:shadow-[0_0_12px_rgba(255,255,255,0.02)]">
                          <span className="filter drop-shadow-[0_0_2px_rgba(255,255,255,0.15)]">🛡</span> ISO 27001 Certified
                        </div>
                        <div className="px-3.5 py-1 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-default glass-badge-premium opacity-75 transition-all duration-200 hover:shadow-[0_0_12px_rgba(255,255,255,0.02)]">
                          <span className="filter drop-shadow-[0_0_2px_rgba(255,255,255,0.15)]">⚡</span> Local AI Processing
                        </div>
                        <div className="px-3.5 py-1 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-default glass-badge-premium opacity-65 transition-all duration-200 hover:shadow-[0_0_12px_rgba(255,255,255,0.02)]">
                          <span className="filter drop-shadow-[0_0_2px_rgba(255,255,255,0.15)]">☁</span> Secure Cloud Sync
                        </div>
                      </motion.div>

                      {/* Understated Trust Row Section */}
                      <motion.div variants={childVariants} className="text-[8.5px] text-slate-500/40 font-semibold uppercase tracking-[0.1em] text-center pt-2 select-none font-geist">
                        Powered by Google Identity ✦ Gemini AI ✦ AES-256 Encryption ✦ ISO 27001
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </div>

        {/* Stage 3-11: Workspace layout with Sidebar */}
        {activeStep >= 3 && (
          <div className="relative z-10 flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-transparent">
            {/* Mobile Drawer Backdrop Overlay */}
            {!isSidebarCollapsed && (
              <div 
                onClick={() => setIsSidebarCollapsed(true)} 
                className="fixed inset-0 bg-slate-955/70 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
              />
            )}

            {/* Collapsible Sidebar / Drawer */}
            <aside className={`border-r border-white/[0.04] dark:border-slate-800/40 bg-[#040608]/95 dark:bg-slate-900/95 md:bg-[#040608]/40 md:dark:bg-slate-900/35 backdrop-blur-md flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out z-40 fixed inset-y-0 left-0 md:relative ${
              isSidebarCollapsed 
                ? '-translate-x-full md:translate-x-0 md:w-[72px]' 
                : 'translate-x-0 md:w-60'
            }`}>
              <div className="flex flex-col">
                <div className={`py-5 border-b border-white/[0.04] dark:border-slate-900/50 flex items-center relative ${
                  isSidebarCollapsed ? 'px-0 justify-center' : 'px-4 justify-between'
                }`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg text-slate-950 font-bold shrink-0 flex items-center justify-center">
                      <Calculator className="h-4.5 w-4.5 text-slate-950" />
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="font-black text-xs uppercase tracking-wider text-slate-100">TaxSense</span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-6 p-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full text-slate-400 hover:text-slate-200 cursor-pointer hidden md:block z-50 shadow-lg"
                  >
                    {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <nav className="p-3 space-y-1">
                  {[
                    { label: 'Dashboard', step: 11, icon: LayoutDashboard },
                    { 
                      label: 'Document Vault', 
                      step: 3, 
                      icon: FileUp, 
                      completed: taxData.grossSalary !== 850000 || taxData.tdsDeducted !== 15000 
                    },
                    { 
                      label: 'AI Analysis', 
                      step: 4, 
                      icon: BrainCircuit, 
                      badge: 'Gemini' 
                    },
                    { 
                      label: 'Recommendations', 
                      step: 5, 
                      icon: Award, 
                      savings: taxCalculationResult.savings > 0 
                    },
                    { label: 'Tax Return', step: 6, icon: ListTodo },
                    { label: 'History & Archive', step: 10, icon: History },
                  ].map((item) => {
                    const isActive = activeStep === item.step;
                    const IconComp = item.icon;
                    return (
                      <div key={item.label} className="relative group/sidebar-item w-full">
                        <button
                          onClick={() => {
                            setActiveStep(item.step);
                          }}
                          className={`w-full flex items-center ${
                            isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                          } py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer group active:scale-98 ${
                            isActive 
                              ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_12px_rgba(37,99,235,0.05)]' 
                              : 'text-slate-400/80 hover:bg-white/[0.03] hover:text-[#F6F7F8] border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-4 overflow-hidden">
                            <IconComp className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-200'}`} />
                            {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                          </div>
                          {!isSidebarCollapsed && (
                            <div className="flex items-center gap-1.5">
                              {item.completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                              {item.badge && <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1 py-0.5 rounded font-black tracking-wider uppercase shrink-0">{item.badge}</span>}
                              {item.savings && <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1 py-0.5 rounded font-black shrink-0">₹{taxCalculationResult.savings}</span>}
                            </div>
                          )}
                        </button>
                        
                        {isSidebarCollapsed && (
                          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-950/95 border border-white/[0.08] backdrop-blur-md text-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-2xl opacity-0 scale-95 group-hover/sidebar-item:opacity-100 group-hover/sidebar-item:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 flex items-center gap-2">
                            <span>{item.label}</span>
                            {item.badge && <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">{item.badge}</span>}
                            {item.savings && <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-black">₹{taxCalculationResult.savings}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom user settings sidebar profile row */}
              <div className="p-3 border-t border-white/[0.04] dark:border-slate-900/50 space-y-2">
                {/* Background Ingestion Status indicator */}
                {ingestionState !== 'IDLE' && (
                  <div 
                     title={`${backgroundStatusMessage} (${backgroundProgress}%)`}
                     className={`p-2 bg-[#16E27A]/10 border border-[#16E27A]/20 rounded-xl space-y-1 ${
                       isSidebarCollapsed ? 'flex justify-center items-center' : ''
                     }`}
                  >
                    {isSidebarCollapsed ? (
                      <div className="relative">
                        {ingestionState === 'COMPLETED' ? (
                          <CheckCircle className="w-4.5 h-4.5 text-[#16E27A]" />
                        ) : (
                          <>
                            <Cpu className="w-4.5 h-4.5 text-[#16E27A] animate-spin" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#16E27A] rounded-full animate-ping" />
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1 text-left">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-[#16E27A]">
                          <span className="flex items-center gap-1">
                            {ingestionState === 'COMPLETED' ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-450" />
                            ) : (
                              <Cpu className="w-3.5 h-3.5 text-emerald-450 animate-pulse" /> 
                            )}
                            AI Ingestion
                          </span>
                          <span>{ingestionState === 'COMPLETED' ? 'Completed' : `${backgroundProgress}%`}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                            style={{ width: `${ingestionState === 'COMPLETED' ? 100 : backgroundProgress}%` }} 
                          />
                        </div>
                        <p className="text-[8px] text-slate-400 leading-none truncate font-medium">
                          {ingestionState === 'COMPLETED' ? 'Form 16 successfully verified.' : backgroundStatusMessage}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                 {authMode === 'GUEST' && (
                  isSidebarCollapsed ? (
                    <div className="relative group/sidebar-item w-full animate-pulse">
                      <button
                        onClick={() => {
                          (window as any)._migrationRedirectStep = activeStep;
                          setActiveStep(2);
                        }}
                        className="w-full flex items-center justify-center p-2.5 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] rounded-xl text-slate-200 transition-all cursor-pointer"
                      >
                        <AlertCircle className="w-4.5 h-4.5 text-slate-400" />
                      </button>
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-955 border border-white/[0.08] backdrop-blur-md text-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-2xl opacity-0 scale-95 group-hover/sidebar-item:opacity-100 group-hover/sidebar-item:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                        Guest Session - Click to Sign In
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white/[0.02] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] rounded-2xl space-y-2 text-left relative overflow-hidden">
                      <div className="text-[9px] font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Guest Session
                      </div>
                      <div className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                        Temporary sandbox. Session expires in <strong className="font-mono text-slate-300 font-bold">{Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}</strong> due to inactivity.
                      </div>
                      <button
                        onClick={() => {
                          (window as any)._migrationRedirectStep = activeStep;
                          setActiveStep(2);
                        }}
                        className="w-full text-center py-1.5 bg-white hover:bg-slate-100 text-slate-955 font-bold rounded-lg text-[9px] uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
                      >
                        Sign In to Save
                      </button>
                    </div>
                  )
                )}

                <div className="relative group/sidebar-item w-full">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    } py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/[0.03] hover:text-white transition-all cursor-pointer`}
                  >
                    <Settings className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    {!isSidebarCollapsed && <span>Settings & Sandbox</span>}
                  </button>
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-955 border border-white/[0.08] backdrop-blur-md text-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-2xl opacity-0 scale-95 group-hover/sidebar-item:opacity-100 group-hover/sidebar-item:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                      Settings & Sandbox
                    </div>
                  )}
                </div>

                <div className="relative group/sidebar-item w-full">
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-2 px-3 py-2`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          (() => {
                            const name = user?.name || incomeProfile?.employeeName || 'Guest User';
                            const parts = name.trim().split(/\s+/);
                            if (parts.length >= 2) {
                              return (parts[0][0] + parts[1][0]).toUpperCase();
                            }
                            return parts[0].slice(0, 2).toUpperCase();
                          })()
                        )}
                      </div>
                      {!isSidebarCollapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-slate-200 truncate">{user?.name || incomeProfile?.employeeName || 'Guest User'}</span>
                          <span className="text-[8px] text-slate-500 truncate">
                            {authMode === 'GUEST' ? 'Guest Mode' : (user?.email || `PAN: ${incomeProfile?.pan || 'MK*****32F'}`)}
                          </span>
                        </div>
                      )}
                    </div>
                    {!isSidebarCollapsed && (
                      <button
                        onClick={() => {
                          GoogleAuthService.revokeSession();
                          clearSession();
                          setActiveStep(2);
                        }}
                        title="Log Out Session"
                        className="p-1 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-955 border border-white/[0.08] backdrop-blur-md text-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-2xl opacity-0 scale-95 group-hover/sidebar-item:opacity-100 group-hover/sidebar-item:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                      <div className="text-[10px] font-bold text-slate-200">{user?.name || incomeProfile?.employeeName || 'Guest User'}</div>
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5">{authMode === 'GUEST' ? 'Guest Mode' : (user?.email || 'PAN Profile')}</div>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Viewport Core Workspace Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Persistent Tax Summary HUD */}
              {activeStep >= 3 && activeStep <= 9 && (
                <div className="w-full bg-[#040608]/20 border-b border-white/[0.04] dark:border-slate-800/30 backdrop-blur-md py-3 px-6 transition-colors duration-200 shadow-xs shrink-0 z-20 relative">
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Tax Status:</span>
                      
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/40 border border-white/[0.04] rounded-lg">
                        <span className="text-slate-400">Gross Salary:</span>
                        <span className="font-mono font-semibold text-slate-200">{formatINR(taxData.grossSalary)}</span>
                      </div>

                      <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/40 border border-white/[0.04] rounded-lg text-slate-400">
                        <span>{formType} Eligible</span>
                      </div>

                      <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/40 border border-white/[0.04] rounded-lg text-slate-500">
                        <span>
                          {formatINR(
                            taxData.deduction80C + 
                            taxData.deduction80D + 
                            taxData.hraExemption + 
                            taxData.section24b
                          )} Claimed
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] text-slate-350 border border-white/[0.08] rounded-lg font-semibold">
                        <span>✓ {taxCalculationResult.recommendedRegime === 'NEW' ? 'New Regime Recommended' : 'Old Regime Recommended'}</span>
                      </div>
                      <div className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-955 font-extrabold rounded-full shadow-[0_0_18px_rgba(16,185,129,0.35)] border border-emerald-300/10 hover:border-emerald-300/25 transition-all duration-300 scale-105 active:scale-100 hover:shadow-[0_0_25px_rgba(16,185,129,0.55)] cursor-pointer">
                        <span className="text-[9px] uppercase font-extrabold tracking-widest opacity-85">Saves</span>
                        <span className="font-mono text-sm font-black tracking-tight"><CountUp end={taxCalculationResult.savings} formatter={formatINR} /></span>
                        <span className="text-[9px] uppercase font-extrabold tracking-wididest opacity-85">Estimated</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content Viewport */}
              <div className="flex-1 overflow-y-auto flex flex-col justify-between relative bg-transparent z-10">
                {/* Mobile Header Bar */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.04] bg-[#040608]/80 backdrop-blur-md z-30 shrink-0 select-none">
                  <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                    className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 focus:outline-none cursor-pointer"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <span className="font-black text-xs uppercase tracking-wider text-slate-100 text-left flex-1 pl-3">TaxSense</span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/[0.05] flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
                  
                  {/* Dialog Trigger: Extraction Confirmation */}
                  <AnimatePresence>
                    {showConfirmScreen && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 15 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative z-50 space-y-6"
                        >
                          <Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
                            <ExtractionConfirm 
                              extractedData={extractedData} 
                              onConfirm={acceptExtractedData}
                              onCancel={() => {
                                setShowConfirmScreen(false);
                                setExtractedData(null);
                              }}
                              isProcessing={isExtracting}
                            />
                          </Suspense>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {/* Stage 11: Dashboard Command Center */}
                    {activeStep === 11 && (
                      <motion.div
                        key="step-11"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6 font-sans"
                      >
                        {/* Top Hero Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#0f172a]/45 border border-white/[0.06] rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)]">
                          <div className="md:col-span-2 space-y-4 text-left z-10">
                            <div className="space-y-2">
                              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                                Your return is 72% complete. ₹77,896 in tax savings optimized.
                              </h1>
                              <p className="text-[12px] text-slate-400 leading-normal font-normal">
                                AI is continuously analyzing your documents for additional deductions.
                              </p>
                              <p className="text-[11px] text-slate-350 leading-normal font-medium bg-blue-600/10 border border-blue-600/20 w-fit px-2.5 py-1 rounded-lg">
                                Next Highest Impact Action: <span className="text-white font-bold">Claim Health Insurance under Section 80D</span>
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                              <button
                                onClick={() => setActiveStep(6)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/10 hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
                              >
                                Resume Filing
                              </button>
                              <button
                                onClick={() => setActiveStep(4)}
                                className="px-4 py-2.5 bg-white/5 border border-slate-800 hover:bg-white/10 text-slate-200 hover:text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
                              >
                                Explain My Savings
                              </button>
                              <button
                                onClick={() => setActiveStep(5)}
                                className="px-4 py-2.5 bg-white/5 border border-slate-800 hover:bg-white/10 text-slate-200 hover:text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
                              >
                                Review Tax Return
                              </button>
                            </div>

                            {authMode === 'GUEST' && (
                              <div className="transition-all duration-300">
                                {!isGuestSessionExpanded ? (
                                  <div className="mt-3 p-3 bg-slate-900/30 border border-white/[0.04] rounded-xl flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2 text-slate-400">
                                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span className="text-[10.5px]">Guest Session • Progress is not saved permanently.</span>
                                    </div>
                                    <button 
                                      onClick={() => setIsGuestSessionExpanded(true)}
                                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider cursor-pointer focus:outline-none"
                                    >
                                      Save Session ↓
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mt-3 p-4 bg-slate-900/40 border border-white/[0.06] rounded-xl space-y-2.5 text-xs">
                                    <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                                      <div className="flex items-center gap-2 text-slate-300">
                                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="font-semibold text-[10.5px]">Save Filing Progress</span>
                                      </div>
                                      <button 
                                        onClick={() => setIsGuestSessionExpanded(false)}
                                        className="text-[10px] text-slate-550 hover:text-slate-350 cursor-pointer focus:outline-none"
                                      >
                                        Collapse ✕
                                      </button>
                                    </div>
                                    <p className="text-slate-400 font-normal text-left text-[11px] leading-relaxed">
                                      Save your filing history, uploaded documents, and AI conversations by signing in.
                                    </p>
                                    <div className="flex justify-end pt-0.5">
                                      <button
                                        onClick={() => {
                                          (window as any)._migrationRedirectStep = 11;
                                          setActiveStep(2);
                                        }}
                                        className="px-3 py-1.5 bg-blue-600/10 border border-blue-600/20 hover:bg-blue-600/20 text-blue-400 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                                      >
                                        Save Progress
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Circular Filing Progress Ring */}
                          <div className="z-10">
                            <ProgressWidget 
                              percentage={72} 
                              stepsRemaining={3} 
                              estimatedMinutes={4} 
                              checklist={[
                                { label: 'Upload Form 16', completed: true, stepNum: 1 },
                                { label: 'Verify Deductions', completed: true, stepNum: 2 },
                                { label: 'Run AI Copilot Diagnosis', completed: false, stepNum: 3 },
                                { label: 'Review Optimization Recommendations', completed: false, stepNum: 4 },
                                { label: 'File Tax Return', completed: false, stepNum: 5 }
                              ]} 
                            />
                          </div>
                        </div>

                        {/* Middle Columns: Left (Actions/insights) & Right (Timeline/Status) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Left Columns (Span 2) */}
                          <div className="lg:col-span-2 space-y-6">
                            {/* AI Summary Card */}
                            <DashboardCard variant="accent-purple">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
                                <div className="space-y-3.5 flex-1 text-left">
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider font-mono block">AI Copilot</span>
                                    <h3 className="text-[17px] font-semibold text-white tracking-tight font-sans flex items-center gap-2">
                                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                                      TaxSense Copilot
                                    </h3>
                                  </div>
                                  <p className="text-[13px] text-slate-300 leading-relaxed font-normal font-sans">
                                    I've reviewed your Form 16. You can reduce your taxable income by another <span className="text-white font-semibold font-mono">₹77,896</span>.
                                  </p>
                                  <CopilotDetailsDrawer 
                                    isOpen={isCopilotExpanded} 
                                    onToggle={() => setIsCopilotExpanded(!isCopilotExpanded)} 
                                    confidence={97} 
                                  />
                                </div>
                                
                                <MetricCard 
                                  title="Tax Health Score" 
                                  value={85} 
                                  maxVal={100} 
                                  badgeText="Good • Claim 80D" 
                                  badgeType="success" 
                                />
                              </div>
                            </DashboardCard>

                            {/* Volumetric Next Step CTA Spotlight (Apple Wallet style) */}
                            <RecommendationCard 
                              title="Claim Health Insurance (Section 80D)"
                              description="We detected zero claims under Section 80D. Synced profiles usually save an additional ₹25,000 in taxable deductions."
                              savings="₹25,000"
                              difficulty="Easy"
                              time="3 minutes"
                              documents={['Insurance Premium Receipt']}
                              confidence="High"
                              onAction={() => setActiveStep(6)}
                            />

                            {/* Ingested Document Ledger */}
                            {uploadedFiles.length > 0 ? (
                              <DashboardCard variant="secondary" className="space-y-3 p-6">
                                <SectionHeader 
                                  title="Ingested Document Ledger" 
                                  subtitle="FILES" 
                                  icon={FolderOpen} 
                                  iconColor="text-blue-400" 
                                />
                                <div className="space-y-2.5">
                                  {uploadedFiles.map((doc) => (
                                    <LedgerRow 
                                      key={doc.id} 
                                      doc={doc} 
                                      onPreview={() => setActivePreviewDoc(doc)} 
                                    />
                                  ))}
                                  {(taxData.stcg > 0 || taxData.ltcg > 0) && (
                                    <LedgerRow 
                                      doc={{
                                        id: 'equity-cg-csv',
                                        name: 'Equity_Capital_Gains.csv',
                                        size: '1.2 MB',
                                        uploadTime: 'Jul 4, 19:40',
                                        status: 'Verified',
                                        confidence: 98
                                      }} 
                                      onPreview={() => setActivePreviewDoc({
                                        id: 'equity-cg-csv',
                                        name: 'Equity_Capital_Gains.csv',
                                        size: '1.2 MB',
                                        uploadTime: 'Jul 4, 19:40',
                                        status: 'Verified',
                                        confidence: 98,
                                        employer: 'Zerodha Sync',
                                        financialYear: 'FY 2025-26',
                                        pages: 1
                                      })} 
                                    />
                                  )}
                                </div>
                              </DashboardCard>
                            ) : (
                              /* Low-profile inline upload row when empty */
                              <div className="bg-[#0f172a]/30 border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-md hover:border-white/[0.08] transition-all duration-300">
                                <div className="flex items-center gap-2.5 text-left">
                                  <FolderOpen className="w-4 h-4 text-slate-500" />
                                  <span className="text-xs font-semibold text-slate-400">No documents ingested in this session</span>
                                </div>
                                <button 
                                  onClick={() => setActiveStep(3)}
                                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider cursor-pointer focus:outline-none"
                                >
                                  Open Vault →
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Right Columns (Span 1) */}
                          <div className="space-y-6">
                            
                            {/* Latest AI Insights drawer card */}
                            <DashboardCard variant="secondary" className="space-y-4">
                              <SectionHeader 
                                title="Latest Copilot Alerts" 
                                subtitle="AI INSIGHTS" 
                                icon={Sparkles} 
                                iconColor="text-purple-400" 
                              />
                              
                              <div className="space-y-3.5">
                                <AlertCard 
                                  title="Section 80D Audit"
                                  message="You paid zero medical premiums. Seniors aged 60+ parents unlock an extra limit of ₹50,000."
                                  type="warning"
                                />
                                <AlertCard 
                                  title="HRA rent exemption"
                                  message="Confirm rent receipt logs to check compliance with Section 10(13A). Rent above 1L requires landlord PAN."
                                  type="warning"
                                />
                              </div>
                            </DashboardCard>

                            {/* Recent Activity Log timeline card */}
                            <DashboardCard variant="secondary" className="space-y-4">
                              <SectionHeader 
                                title="Activity History" 
                                subtitle="WORKSPACE" 
                                icon={History} 
                                iconColor="text-slate-400" 
                              />
                              
                              <div className="space-y-4 text-left">
                                <div className="space-y-2">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Today</span>
                                  <div className="relative pl-6 space-y-4">
                                    <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-slate-800 pointer-events-none" />
                                    <TimelineItem 
                                      label="Form 16 uploaded" 
                                      desc="Auto extraction computed successfully" 
                                      date="19:40" 
                                      icon={FileText} 
                                      iconColor="text-blue-400" 
                                    />
                                    <TimelineItem 
                                      label="Sandbox profile active" 
                                      desc="Secure local connection established" 
                                      date="19:38" 
                                      icon={Cpu} 
                                      iconColor="text-blue-400" 
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Yesterday</span>
                                  <div className="relative pl-6 space-y-4">
                                    <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-slate-850 pointer-events-none" />
                                    <TimelineItem 
                                      label="Regime optimized" 
                                      desc="New regime saves ₹18,240" 
                                      date="15:45" 
                                      icon={TrendingUp} 
                                      iconColor="text-emerald-450" 
                                    />
                                  </div>
                                </div>
                              </div>
                            </DashboardCard>

                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Stage 3: Dedicated Document Vault page */}
                    {activeStep === 3 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6"
                      >
                        <Suspense fallback={<div className="h-[400px] bg-slate-900/10 animate-pulse rounded-3xl" />}>
                          <DocumentVault 
                            onFileUpload={() => {}} 
                            setActiveStep={setActiveStep}
                            onViewExtractedFields={() => setShowConfirmScreen(true)}
                          />
                        </Suspense>
                      </motion.div>
                    )}

                    {/* Stage 4: AI Analysis page */}
                    {activeStep === 4 && (
                      <motion.div
                        key="step-4"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="font-sans max-w-6xl mx-auto space-y-6"
                      >
                        {uploadedFiles.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-900/40 border-2 border-dashed border-slate-800/50 rounded-3xl backdrop-blur-md max-w-2xl mx-auto">
                            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4">
                              <Sparkles className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-400 tracking-tight">AI Audit Standby</h3>
                            <p className="text-xs text-slate-505 font-medium mt-2 max-w-sm mx-auto">
                              The TaxSense AI engine requires a Form 16 document to perform compliance validations. Upload a file in the Document Vault to begin the audit.
                            </p>
                          </div>
                        ) : (
                          <AuditPanel 
                            analysisProgress={analysisProgress}
                            taxData={taxData}
                            taxCalculationResult={taxCalculationResult}
                            formType={formType}
                            setActiveStep={setActiveStep}
                          />
                        )}
                      </motion.div>
                    )}

                    {/* Stage 5: Recommendations page */}
                    {activeStep === 5 && (
                      <motion.div
                        key="step-5"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6 font-sans"
                      >
                        {taxData.grossSalary === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-900/40 border-2 border-dashed border-slate-800/50 rounded-3xl backdrop-blur-md">
                            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4">
                              <Cpu className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-400 tracking-tight">Diagnostic Standby</h3>
                            <p className="text-xs text-slate-505 font-medium mt-2 max-w-sm mx-auto">
                              Tax calculation diagnostics are waiting for income data. Upload a Form 16 or enter manual values to generate a regime comparison.
                            </p>
                          </div>
                        ) : (
                          <RecommendationsPanel 
                            taxData={taxData}
                            taxCalculationResult={taxCalculationResult}
                            incomeProfile={incomeProfile}
                            confirmedDeductions={confirmedDeductions}
                            formType={formType}
                            formatINR={formatINR}
                            setActiveStep={setActiveStep}
                          />
                        )}
                      </motion.div>
                    )}

                    {/* Stage 6: Guided Filing Experience */}
                    {activeStep === 6 && (
                      <motion.div
                        key="step-6"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6 font-sans"
                      >
                        {/* filing progress tracker */}
                        <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-5 backdrop-blur-md space-y-4">
                          <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                              <ListTodo className="w-5 h-5 text-emerald-450" />
                              ITR Filing Pipeline
                            </h2>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Step {guidedFilingStep} of 5</span>
                          </div>
                          
                          {/* Stepper bar */}
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((stepIdx) => (
                              <button
                                key={stepIdx}
                                onClick={() => setGuidedFilingStep(stepIdx)}
                                className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                                  guidedFilingStep >= stepIdx ? 'bg-emerald-500' : 'bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                          
                          <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase tracking-wider">
                            <span>1. Personal</span>
                            <span>2. Income</span>
                            <span>3. Deductions</span>
                            <span>4. Verification</span>
                            <span>5. Generate</span>
                          </div>
                        </div>

                        {/* Main step container */}
                        <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-6 backdrop-blur-md space-y-6">
                          
                          {/* Step 1: Personal Info */}
                          {guidedFilingStep === 1 && (
                            <div className="space-y-5">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Review Personal Details</h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                  <input type="text" value={incomeProfile?.employeeName || 'Mohit Kumar'} readOnly className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-400 focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Permanent Account Number (PAN)</label>
                                  <input type="text" value={incomeProfile?.pan || 'MK*****32F'} readOnly className="w-full bg-slate-955 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-400 focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employer Category</label>
                                  <input type="text" defaultValue="Private Sector Co." disabled className="w-full bg-slate-955 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-400 focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Residential Status</label>
                                  <input type="text" defaultValue="Resident Individual" disabled className="w-full bg-slate-955 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-400 focus:outline-none" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 2: Income Review */}
                          {guidedFilingStep === 2 && (
                            <div className="space-y-5">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Income Ledgers Summary</h3>
                              
                              <div className="space-y-4">
                                <div className="p-5 bg-slate-955/40 border border-white/[0.02] rounded-xl flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-slate-500 animate-pulse" />
                                    <div>
                                      <span className="block text-xs font-bold text-slate-200">Gross Salary (Section 17(1))</span>
                                      <span className="text-[9px] text-slate-500">Auto parsed from Form 16</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500 font-mono text-sm font-bold">₹</span>
                                    <input 
                                      type="text" 
                                      value={taxData.grossSalary}
                                      onChange={(e) => handleNumericChange('grossSalary', e.target.value)}
                                      className="bg-slate-950 border border-white/[0.06] focus:border-emerald-500/40 rounded-xl py-2 px-3 w-40 text-right font-mono text-sm font-extrabold text-slate-100 focus:outline-none transition-colors"
                                    />
                                  </div>
                                </div>

                                <div className="p-5 bg-slate-955/40 border border-white/[0.02] rounded-xl flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-slate-500" />
                                    <div>
                                      <span className="block text-xs font-bold text-slate-200">Income from Other Sources</span>
                                      <span className="text-[9px] text-slate-500">Savings account interest, etc.</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500 font-mono text-sm font-bold">₹</span>
                                    <input 
                                      type="text" 
                                      value={taxData.otherIncome}
                                      onChange={(e) => handleNumericChange('otherIncome', e.target.value)}
                                      className="bg-slate-950 border border-white/[0.06] focus:border-emerald-500/40 rounded-xl py-2 px-3 w-40 text-right font-mono text-sm font-extrabold text-slate-100 focus:outline-none transition-colors"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 3: Deductions Claims */}
                          {guidedFilingStep === 3 && (
                            <div className="space-y-6">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sync Deductions Claims</h3>
                              <Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
                                <DeductionCard />
                              </Suspense>
                            </div>
                          )}

                          {/* Step 4: Verification & Slabs */}
                          {guidedFilingStep === 4 && (
                            <div className="space-y-6">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verifications and Slabs Audit</h3>
                              <Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
                                <RegimeComparison />
                              </Suspense>
                            </div>
                          )}

                          {/* Step 5: Generate Return */}
                          {guidedFilingStep === 5 && (
                            <div className="space-y-5 text-center py-6">
                              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Award className="w-8 h-8 text-emerald-400" />
                              </div>
                              
                              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Verify Return & Submit</h3>
                              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                                Slabs audits verified compliance with Section 139(1) of the Income Tax Act. Ready to submit to the sandbox?
                              </p>

                              <button
                                onClick={executeFilingSubmission}
                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-955 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-1.5 mx-auto"
                              >
                                <ShieldCheck className="w-4 h-4 text-slate-955" />
                                <span>Generate and Log return</span>
                              </button>
                            </div>
                          )}

                          {/* Bottom Navigation buttons inside guided filing */}
                          <div className="pt-4 border-t border-slate-800/60 flex justify-between">
                            <button
                              onClick={() => setGuidedFilingStep(prev => Math.max(1, prev - 1))}
                              disabled={guidedFilingStep === 1}
                              className="px-4 py-2 border border-slate-800 hover:bg-white/[0.02] text-slate-400 hover:text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-30 disabled:pointer-events-none select-none active:scale-95"
                            >
                              Back
                            </button>
                            {guidedFilingStep < 5 ? (
                              <button
                                onClick={() => setGuidedFilingStep(prev => Math.min(5, prev + 1))}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95"
                              >
                                Continue
                              </button>
                            ) : (
                              <div />
                            )}
                          </div>

                        </div>
                      </motion.div>
                    )}

                    {/* Stage 10: Timeline History & Archives */}
                    {activeStep === 10 && (
                      <motion.div
                        key="step-10"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6 font-sans"
                      >
                        <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-5 backdrop-blur-md">
                          <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-450" />
                            Stage 10: Filing History & Archives
                          </h2>
                          <p className="text-xs text-slate-400">
                            Access secure, local archive ledger logs. Search and filter across previous assessment years.
                          </p>
                        </div>

                        {/* AI Summary Banner */}
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-455 leading-relaxed shadow-xs">
                          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-slate-200">AI Archive Diagnostic</span>
                            <span>
                              {filingHistory.length === 0 
                                ? "No previous filings detected in the sandbox cache." 
                                : `Across your logged filings, your average Gross Salary is ${formatINR(
                                    Math.round(filingHistory.reduce((acc, item) => acc + item.grossSalary, 0) / filingHistory.length)
                                  )}. Slabs audit verifies compliance with Section 139(1) for all logged assessment cycles.`}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-6 space-y-6 backdrop-blur-md">
                          {/* Search & Filter Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timeline Ledger</h3>
                            
                            <div className="flex flex-wrap items-center gap-3">
                              <input
                                type="text"
                                placeholder="Search by ID or date..."
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-3 text-xs text-slate-200 font-medium focus:outline-none focus:border-blue-500 focus:bg-slate-900 w-44"
                              />
                              <select
                                value={historyFilter}
                                onChange={(e) => setHistoryFilter(e.target.value)}
                                className="bg-slate-955 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-400 font-bold focus:outline-none cursor-pointer"
                              >
                                <option value="ALL">All regimes</option>
                                <option value="NEW">New regime</option>
                                <option value="OLD">Old regime</option>
                              </select>
                            </div>
                          </div>

                          {/* Notion Inspired Timeline View */}
                          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800 before:border-dashed">
                            {filingHistory
                              .filter(item => {
                                const matchesSearch = item.id.toLowerCase().includes(historySearch.toLowerCase()) || item.date.toLowerCase().includes(historySearch.toLowerCase());
                                const matchesFilter = historyFilter === 'ALL' || item.recommendedRegime === historyFilter;
                                return matchesSearch && matchesFilter;
                              })
                              .map((item, i) => (
                                <div key={item.id} className="relative text-xs space-y-2">
                                  {/* Marker circle */}
                                  <div className="absolute -left-[20px] top-1 w-3 h-3 rounded-full bg-emerald-500 border border-slate-950 ring-4 ring-emerald-500/15" />
                                  
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-slate-100 text-xs font-mono">{item.id}</span>
                                      <span className="text-[9px] bg-slate-900 border border-white/[0.04] text-slate-400 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">{item.formType}</span>
                                      <span className="text-[9px] bg-blue-600/10 text-blue-400 px-1.5 py-0.5 rounded font-bold">{item.recommendedRegime} REGIME</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold">{item.date}</span>
                                  </div>

                                  <div className="p-4 bg-slate-955/40 border border-white/[0.02] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 leading-relaxed">
                                    <div>
                                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Gross Salary</span>
                                      <span className="font-mono text-[11px] font-bold text-slate-200">{formatINR(item.grossSalary)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Total Deductions</span>
                                      <span className="font-mono text-[11px] font-bold text-slate-200">{formatINR(item.totalDeductions)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Net Tax Liability</span>
                                      <span className="font-mono text-[11px] font-bold text-slate-200">{formatINR(item.netTaxPaid)}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3.5 text-[10px] text-slate-400 font-bold pt-1">
                                    <button 
                                      onClick={() => handleDownloadHistoryJSON(item)}
                                      className="flex items-center gap-1 hover:text-blue-400 cursor-pointer select-none transition-colors"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>Download JSON return</span>
                                    </button>
                                    <span>•</span>
                                    <button 
                                      onClick={() => handleDownloadHistoryPDF(item)}
                                      className="flex items-center gap-1 hover:text-blue-400 cursor-pointer select-none transition-colors"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                      <span>Print Summary PDF</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>

                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>

                </main>

                {/* Unified Footer */}
                <footer className="border-t border-white/[0.04] dark:border-slate-900/50 bg-[#040608]/40 dark:bg-slate-900/10 py-5 px-6 text-center text-[10px] text-slate-600 mt-auto shrink-0 z-10 relative">
                  <p>© 2026 TaxSense Inc. | Built for Indian salaried employees under AY 2026-27 rules.</p>
                </footer>

              </div>

            </div>

            <AICopilot isOpen={isFloatingAIChatOpen} onClose={() => setIsFloatingAIChatOpen(false)} />

            {/* Toggle trigger for Right side copilot drawer */}
            {!isFloatingAIChatOpen && (
              <button
                onClick={() => setIsFloatingAIChatOpen(true)}
                className="fixed right-6 bottom-6 z-40 p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-955 font-bold rounded-full shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 animate-bounce"
              >
                <Sparkles className="w-5 h-5 text-slate-955" />
              </button>
            )}

            {/* Settings Dialog Panel Overlay */}
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-slate-905 border border-slate-850 rounded-3xl p-6 max-w-md w-full shadow-2xl relative z-50 space-y-5 text-xs font-sans"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4.5 h-4.5 text-slate-400" />
                        <span className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px]">Filing Preferences & Sandbox Settings</span>
                      </div>
                      <button 
                        onClick={() => setIsSettingsOpen(false)}
                        className="p-1 hover:bg-white/[0.04] rounded text-slate-500 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">


                      {/* Store settings */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-300 block">ITR Filing Rules</span>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <label className="flex items-center gap-2.5 p-2 bg-slate-950/40 border border-slate-850 rounded-xl cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formType === 'ITR-2'} 
                              onChange={(e) => setFormType(e.target.checked ? 'ITR-2' : 'ITR-1')} 
                              className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="font-semibold text-slate-400">ITR-2 Form</span>
                          </label>
                          <label className="flex items-center gap-2.5 p-2 bg-slate-950/40 border border-slate-850 rounded-xl cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={multiHouse} 
                              onChange={(e) => setMultiHouse(e.target.checked)} 
                              className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="font-semibold text-slate-400">Multi House Property</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
                        <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Support & Documentation</span>
                        <div className="flex flex-col gap-2 font-semibold text-slate-450 pl-1">
                          <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 w-fit">
                            <span>Privacy Sandbox Policy</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                          </a>
                          <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 w-fit">
                            <span>Section 139(1) Filing Guide</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                          </a>
                          <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 w-fit">
                            <span>Income Tax Department APIs documentation</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                          </a>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-4 border-t border-slate-800/80">
                        <span className="font-bold text-red-400 block">Danger Zone</span>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              clearFilingHistory();
                              setIsSettingsOpen(false);
                            }}
                            className="flex-1 py-2 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold rounded-xl cursor-pointer text-center select-none active:scale-95 transition-all"
                          >
                            Clear archives history
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filing Completion Celebration Overlay Modal */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/90 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="text-center space-y-6 max-w-md w-full p-8 bg-slate-905 border border-slate-850 rounded-3xl relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                    
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-455 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2 animate-bounce">
                      <CheckCircle className="w-9 h-9 text-emerald-400" />
                    </div>

                    <div className="space-y-2 z-10 relative">
                      <h2 className="text-xl font-bold tracking-tight text-white">ITR Return Logged Successfully!</h2>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Your filing draft has been compiled, audited against AY 2026-27 rules, and logged to your local sandbox archives database.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowCelebration(false);
                        setGuidedFilingStep(1);
                        setActiveStep(10); // Route directly to Timeline Archives (Stage 10)
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-955 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 select-none active:scale-95 block z-10 relative"
                    >
                      View Timeline history
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </Suspense>

      {/* Toast Notification Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl bg-[#0E131B]/90 border border-red-500/20 backdrop-blur-md shadow-2xl text-xs font-semibold text-slate-200"
          >
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <FilingGuide isOpen={isFilingGuideOpen} onClose={() => setIsFilingGuideOpen(false)} />
      
      {/* Ledger document preview modal */}
      <DocumentPreviewModal 
        isOpen={activePreviewDoc !== null}
        onClose={() => setActivePreviewDoc(null)}
        document={activePreviewDoc || {}}
      />
    </div>
  );
}
