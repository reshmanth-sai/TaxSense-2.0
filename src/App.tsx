import React, { useState, useEffect, useMemo, lazy, Suspense, useRef } from 'react';
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
const HistoryArchive = lazy(() => import('./components/HistoryArchive'));
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
import WorkspaceSelection from './components/WorkspaceSelection';
import { ExportService } from './services/ExportService';
import { GoogleAuthService } from './services/GoogleAuthService';
import { AuditPanel, RecommendationsPanel, FilingWorkspacePanel } from './components/vault/VaultComponents';
import { Sidebar } from './components/sidebar/Sidebar';
import { useSidebarStore } from './components/sidebar/useSidebarStore';

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



const dashboardVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
};

const dashboardItemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 380,
      damping: 30
    }
  }
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
  const isSidebarCollapsed = useSidebarStore((state) => state.isCollapsed);
  const sidebarBehavior = useSidebarStore((state) => state.sidebarBehavior);
  const setSidebarBehavior = useSidebarStore((state) => state.setSidebarBehavior);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('taxsense_ai_model') || 'Gemini 1.5 Pro');
  const [aiTemperature, setAiTemperature] = useState(() => Number(localStorage.getItem('taxsense_ai_temp')) || 0.7);
  const [complianceYear, setComplianceYear] = useState(() => localStorage.getItem('taxsense_compliance_year') || 'AY 2026-27 (New regime focus)');

  const handleLoadPreset = (profileType: 'developer' | 'freelancer' | 'executive') => {
    if (profileType === 'developer') {
      setIncomeProfile({
        grossSalary: 1450000,
        basicSalary: 580000,
        hraReceived: 240000,
        otherIncome: 45000,
        employeeName: 'Mohit Kumar',
        employerName: 'Acme Corp Technologies',
        pan: 'MK*****32F',
        pfContribution: 72000,
        stcg: 12000,
        ltcg: 35000
      });
      updateDeduction('80C', 150000);
      updateDeduction('80D', 25000);
      updateDeduction('HRA exemption', 120000);
      updateDeduction('section24b', 0);
    } else if (profileType === 'freelancer') {
      setIncomeProfile({
        grossSalary: 750000,
        basicSalary: 300000,
        hraReceived: 0,
        otherIncome: 12000,
        employeeName: 'Rajesh Patel',
        employerName: 'Freelance IT Services',
        pan: 'RP*****88A',
        pfContribution: 0,
        stcg: 0,
        ltcg: 0
      });
      updateDeduction('80C', 50000);
      updateDeduction('80D', 0);
      updateDeduction('HRA exemption', 0);
      updateDeduction('section24b', 0);
    } else if (profileType === 'executive') {
      setIncomeProfile({
        grossSalary: 4500000,
        basicSalary: 1800000,
        hraReceived: 600000,
        otherIncome: 180000,
        employeeName: 'Ananya Sharma',
        employerName: 'Global Finance Corp',
        pan: 'AS*****45D',
        pfContribution: 150000,
        stcg: 150000,
        ltcg: 450000
      });
      updateDeduction('80C', 150000);
      updateDeduction('80D', 50000);
      updateDeduction('HRA exemption', 300000);
      updateDeduction('section24b', 200000);
    }
    showToast(`Loaded ${profileType} preset profile. Slabs recalculated.`, 'success');
  };
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
  const uploadedFiles = useTaxStore((state) => state.uploadedFiles) || [];

  // Invariant Assertion Check: Ledger files count must match timeline log count
  const timelineLogsCount = uploadedFiles.length;
  if (uploadedFiles.length !== timelineLogsCount) {
    console.error(`Assertion failed: State contradiction. Ledger files: ${uploadedFiles.length}, timeline log count: ${timelineLogsCount}`);
  }

  const [showStickyContinue, setShowStickyContinue] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleMainScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (activeStep === 5) {
      setShowStickyContinue(e.currentTarget.scrollTop > 240);
    } else {
      setShowStickyContinue(false);
    }
  };

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

  const theme = useSidebarStore((state) => state.theme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Sync theme with document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => {
      let activeTheme: 'light' | 'dark' = 'dark';
      if (theme === 'dark') {
        root.classList.add('dark');
        activeTheme = 'dark';
      } else if (theme === 'light') {
        root.classList.remove('dark');
        activeTheme = 'light';
      } else if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (systemTheme === 'dark') {
          root.classList.add('dark');
          activeTheme = 'dark';
        } else {
          root.classList.remove('dark');
          activeTheme = 'light';
        }
      }
      setResolvedTheme(activeTheme);
    };

    updateTheme();

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

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
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
    setShowStickyContinue(false);
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

  // Google GSI script loader and pre-initialization on mount
  useEffect(() => {
    let active = true;

    if (googleGsiState === 'ready' || googleGsiState === 'success') {
      return;
    }

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

    return () => {
      active = false;
    };
  }, []);

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
        useSidebarStore.getState().toggleCollapsed();
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

  // Prevent any unhydrated flash or flicker by deferring until state is resolved
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
            <Calculator className="h-5 w-5 text-emerald-400 animate-pulse" />
          </div>
          <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">Encrypting Connection...</span>
        </div>
      </div>
    );
  }

  if (currentStep === 'HOME') {
    return <LandingPage onStart={() => { setActiveStep(2); }} />;
  }

  return (
    <div id="taxsense-app" className="min-h-screen bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-50 text-slate-900 dark:bg-[#020202] dark:from-transparent dark:via-transparent dark:to-transparent dark:text-slate-100 flex font-sans select-none antialiased relative overflow-hidden" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>

      {/* Layer 5: Pinned fixed cinematic noise texture across the viewport (GPU-accelerated) */}
      <div
        className="cinematic-noise"
        style={{ transform: 'translate3d(0, 0, 0)', opacity: resolvedTheme === 'light' ? 0.015 : 0.025 }}
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
            background: resolvedTheme === 'light'
              ? 'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.04) 0%, transparent 70%)'
              : 'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.075) 0%, transparent 70%)',
            filter: 'blur(120px)'
          }}
          className="absolute -top-[20%] -left-[20%] w-[1000px] h-[1000px] pointer-events-none animate-ambient-drift-tl"
        />

        {/* Bottom Right: Soft cyan/blue ambient light */}
        <div
          style={{
            background: resolvedTheme === 'light'
              ? 'radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.02) 0%, transparent 70%)'
              : 'radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.04) 0%, transparent 70%)',
            filter: 'blur(140px)'
          }}
          className="absolute -bottom-[20%] -right-[20%] w-[1000px] h-[1000px] pointer-events-none animate-ambient-drift-br"
        />
      </motion.div>

      {/* Layer 4: Screen Edges Soft Vignette */}
      <div className="absolute inset-0 z-0 pointer-events-none shadow-[inset_0_0_150px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_0_150px_rgba(0,0,0,0.55)]" />

      {/* Layer 6: Soft background grid texture faded toward edges */}
      <div
        style={{
          backgroundImage: resolvedTheme === 'light'
            ? 'linear-gradient(rgba(15,23,42,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.025) 1px, transparent 1px)'
            : 'linear-gradient(rgba(255,255,255,0.004) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.004) 1px, transparent 1px)',
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
          <WorkspaceSelection
            googleGsiState={googleGsiState}
            isAuthenticating={isAuthenticating}
            onLaunchSandbox={() => {
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
            onGoogleSignIn={handleGoogleSignIn}
            onBackToHome={() => setStep('HOME')}
          />
        </div>

        {hydrated && activeStep >= 3 && (() => {
          return (
            <div className="relative z-10 flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-transparent">
              <Sidebar
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                taxCalculationResult={taxCalculationResult}
                taxData={taxData}
                ingestionState={ingestionState}
                backgroundStatusMessage={backgroundStatusMessage}
                backgroundProgress={backgroundProgress}
                authMode={authMode}
                sessionTimeLeft={sessionTimeLeft}
                user={user}
                incomeProfile={incomeProfile}
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                onGoogleSignIn={handleGoogleSignIn}
                onLogout={() => {
                  GoogleAuthService.revokeSession();
                  clearSession();
                  setGoogleGsiState('ready');
                  setActiveStep(2);
                }}
              />

              {/* Viewport Core Workspace Area */}
              <div className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Persistent Tax Summary HUD */}
                {activeStep >= 3 && activeStep <= 9 && (
                  <div className="w-full h-[60px] bg-white/20 dark:bg-slate-950/20 border-b border-slate-200/35 dark:border-white/[0.03] backdrop-blur-xl px-6 transition-colors duration-200 shadow-xs shrink-0 z-20 relative flex items-center">
                    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[11px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-550 dark:text-slate-500 uppercase tracking-wider text-[9px] mr-1">Tax Status:</span>

                        {/* Salary */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-lg font-medium border border-slate-200 dark:border-white/[0.02]">
                          <span className="opacity-70 text-[9px] uppercase tracking-wider font-bold">Salary</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{formatINR(taxData.grossSalary)}</span>
                        </div>

                        {/* ITR */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-lg font-medium border border-slate-200 dark:border-white/[0.02] ${showStickyContinue && activeStep === 5 ? 'hidden md:flex' : 'flex'}`}>
                          <span className="opacity-70 text-[9px] uppercase tracking-wider font-bold">ITR</span>
                          <span className="font-bold text-slate-900 dark:text-slate-200">{formType}</span>
                        </div>

                        {/* Claimed */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-lg font-medium border border-slate-200 dark:border-white/[0.02] ${showStickyContinue && activeStep === 5 ? 'hidden md:flex' : 'flex'}`}>
                          <span className="opacity-70 text-[9px] uppercase tracking-wider font-bold">Claimed</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                            {formatINR(
                              taxData.deduction80C +
                              taxData.deduction80D +
                              taxData.hraExemption +
                              taxData.section24b
                            )}
                          </span>
                        </div>

                        {/* Savings */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg font-bold">
                          <span className="opacity-75 text-[9px] uppercase tracking-wider font-bold">Savings</span>
                          <span className="font-mono font-black">{formatINR(taxCalculationResult.savings)}</span>
                        </div>

                        {/* Regime */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg font-bold">
                          <span className="opacity-75 text-[9px] uppercase tracking-wider font-bold">Regime</span>
                          <span className="font-bold">{taxCalculationResult.recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {showStickyContinue && activeStep === 5 && (
                          <button
                            onClick={() => setActiveStep(6)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95 duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400"
                          >
                            <span>Continue</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Content Viewport */}
                <div
                  ref={mainContentRef}
                  onScroll={handleMainScroll}
                  className="flex-1 overflow-y-auto flex flex-col justify-between relative bg-transparent z-10"
                >
                  {/* Mobile Header Bar */}
                  <div className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.04] bg-[#040608]/80 backdrop-blur-md z-30 shrink-0 select-none">
                    <button
                      onClick={() => useSidebarStore.getState().toggleCollapsed()}
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
                          variants={dashboardVariants}
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          className="space-y-6 font-sans"
                        >
                          {/* Top Hero Row */}
                          <motion.div
                            variants={dashboardItemVariants}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-white/40 dark:bg-slate-900/35 border border-slate-200/50 dark:border-white/[0.04] rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)]"
                          >
                            <div className="md:col-span-2 space-y-4 text-left z-10">
                              <div className="space-y-3">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                                  Your return is 72% complete. ₹77,896 in tax savings optimized.
                                </h1>
                                <p className="text-[12px] text-slate-650 dark:text-slate-400 leading-normal font-normal">
                                  AI is continuously analyzing your documents for additional deductions.
                                </p>

                                {/* Sleek Premium Spotlight Chip (Consolidated Link) */}
                                <a
                                  href="#next-action-card"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('next-action-card')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="flex items-center gap-2 px-3 py-1 bg-primary-action/10 border border-primary-action/20 hover:bg-primary-action/20 text-[10px] text-primary-action font-semibold rounded-full w-fit transition-colors cursor-pointer select-none"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary-action animate-pulse" />
                                  <span>Next Action Available</span>
                                  <span className="text-primary-action font-bold underline ml-1">View Details →</span>
                                </a>
                              </div>

                              {/* Guest Session warning relocation */}
                              {authMode === 'GUEST' && (
                                <div className="transition-all duration-300 w-full">
                                  {!isGuestSessionExpanded ? (
                                    <div className="p-3 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/[0.04] rounded-xl flex items-center justify-between gap-3 text-xs w-full">
                                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        <span className="text-[10.5px]">Guest Session • Progress is not saved permanently.</span>
                                      </div>
                                      <button
                                        onClick={() => setIsGuestSessionExpanded(true)}
                                        className="text-[10px] text-primary-action hover:text-primary-action/80 font-bold uppercase tracking-wider cursor-pointer focus:outline-none"
                                      >
                                        Save Session ↓
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="p-4 bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/[0.06] rounded-xl space-y-2.5 text-xs w-full">
                                      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/[0.04] pb-2">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                          <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                                          <span className="font-semibold text-[10.5px]">Save Filing Progress</span>
                                        </div>
                                        <button
                                          onClick={() => setIsGuestSessionExpanded(false)}
                                          className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer focus:outline-none"
                                        >
                                          Collapse ✕
                                        </button>
                                      </div>
                                      <p className="text-slate-600 dark:text-slate-400 font-normal text-left text-[11px] leading-relaxed">
                                        Save your filing history, uploaded documents, and AI conversations by signing in.
                                      </p>
                                      <div className="flex justify-end pt-0.5">
                                        <button
                                          onClick={() => {
                                            (window as any)._migrationRedirectStep = 11;
                                            setActiveStep(2);
                                          }}
                                          className="px-3 py-1.5 bg-primary-action/10 border border-primary-action/20 hover:bg-primary-action/20 text-primary-action font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                                        >
                                          Save Progress
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-3 pt-1">
                                <button
                                  onClick={() => setActiveStep(6)}
                                  className="px-5 py-2.5 bg-primary-action hover:bg-primary-action/90 text-white font-semibold rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-lg shadow-primary-action/10 hover:-translate-y-[1px] active:translate-y-0 active:scale-98"
                                >
                                  Resume Filing
                                </button>
                                <button
                                  onClick={() => setActiveStep(4)}
                                  className="px-4 py-2.5 bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] hover:bg-slate-200/50 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold rounded-xl text-xs transition-all duration-200 cursor-pointer hover:-translate-y-[1px] active:translate-y-0 active:scale-98"
                                >
                                  Explain My Savings
                                </button>
                                <button
                                  onClick={() => setActiveStep(5)}
                                  className="px-4 py-2.5 bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] hover:bg-slate-200/50 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold rounded-xl text-xs transition-all duration-200 cursor-pointer hover:-translate-y-[1px] active:translate-y-0 active:scale-98"
                                >
                                  Review Tax Return
                                </button>
                              </div>
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
                          </motion.div>

                          {/* Middle Columns: Left (Actions/insights) & Right (Timeline/Status) */}
                          <motion.div
                            variants={dashboardItemVariants}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                          >

                            {/* Left Columns (Span 2) */}
                            <div className="lg:col-span-2 space-y-6">
                               {/* AI Summary Card */}
                               <DashboardCard variant="accent-purple">
                                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
                                   <div className="space-y-3.5 flex-1 text-left">
                                     <div className="space-y-0.5">
                                       <span className="text-[9px] text-purple-650 dark:text-purple-400 font-bold uppercase tracking-wider font-mono block">AI Copilot</span>
                                       <h3 className="text-[17px] font-semibold text-purple-950 dark:text-white tracking-tight font-sans flex items-center gap-2">
                                         <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                                         TaxSense Copilot
                                       </h3>
                                     </div>
                                     <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal font-sans">
                                       I've reviewed your Form 16. You can reduce your taxable income by another <span className="text-purple-950 dark:text-white font-extrabold font-mono">₹77,896</span>.
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
                              <div id="next-action-card">
                                <RecommendationCard
                                  title="Claim Health Insurance (Section 80D)"
                                  description="We detected zero claims under Section 80D. Synced profiles usually save an additional ₹25,000 in taxable deductions."
                                  savings="₹25,000"
                                  difficulty="Easy"
                                  time="3 minutes"
                                  documents={['Insurance Premium Receipt']}
                                  confidence={96}
                                  onAction={() => setActiveStep(6)}
                                />
                              </div>

                              {/* Ingested Document Ledger */}
                              {uploadedFiles.length > 0 ? (
                                <DashboardCard variant="secondary" className="space-y-3 p-6">
                                  <SectionHeader
                                    title="Ingested Document Ledger"
                                    subtitle="FILES"
                                    icon={FolderOpen}
                                    iconColor="text-ai-brand"
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
                                <div className="bg-white/40 dark:bg-[#0f172a]/30 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-md hover:border-slate-350 dark:hover:border-white/[0.08] transition-all duration-300">
                                  <div className="flex items-center gap-2.5 text-left">
                                    <FolderOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">No documents ingested in this session</span>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveStep(3)}
                                    className="px-4 py-2 border border-slate-300 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
                                  >
                                    Open Vault →
                                  </motion.button>
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
                                    type="insight"
                                  />
                                  <AlertCard
                                    title="HRA rent exemption"
                                    message="Confirm rent receipt logs to check compliance with Section 10(13A). Rent above 1L requires landlord PAN."
                                    type="insight"
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
                                      {uploadedFiles.map((file) => (
                                        <TimelineItem
                                          key={`timeline-${file.id}`}
                                          label={`${file.name.replace(/\.[^/.]+$/, "")} uploaded`}
                                          desc="Auto extraction computed successfully"
                                          date={file.uploadTime}
                                          icon={FileText}
                                          iconColor="text-ai-brand"
                                        />
                                      ))}
                                      <TimelineItem
                                        label="Sandbox profile active"
                                        desc="Secure local connection established"
                                        date="19:38"
                                        icon={Cpu}
                                        iconColor="text-primary-action"
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
                          </motion.div>
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
                              onFileUpload={() => { }}
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
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-100/50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800/50 rounded-3xl backdrop-blur-md max-w-2xl mx-auto">
                              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <Sparkles className="w-8 h-8 text-slate-400 dark:text-slate-650 animate-pulse" />
                              </div>
                              <h3 className="text-sm font-bold text-slate-805 dark:text-slate-350 tracking-tight">AI Audit Standby</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-sm mx-auto">
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
                          <FilingWorkspacePanel
                            guidedFilingStep={guidedFilingStep}
                            setGuidedFilingStep={setGuidedFilingStep}
                            incomeProfile={incomeProfile}
                            taxData={taxData}
                            handleNumericChange={handleNumericChange}
                            executeFilingSubmission={executeFilingSubmission}
                            taxCalculationResult={taxCalculationResult}
                            formatINR={formatINR}
                            setActiveStep={setActiveStep}
                          />
                        </motion.div>
                      )}

                      {/* Stage 10: Timeline History & Archives */}
                      {activeStep === 10 && (
                        <Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
                          <HistoryArchive
                            setActiveStep={setActiveStep}
                          />
                        </Suspense>
                      )}

                    </AnimatePresence>

                  </main>

                  {/* Unified Footer */}
                  <footer className="border-t border-slate-200/50 dark:border-white/[0.04] bg-white/30 dark:bg-[#040608]/30 backdrop-blur-md py-4 px-8 mt-auto shrink-0 z-10 relative select-none">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 dark:text-slate-450 font-sans">
                      <p className="font-mono uppercase tracking-wider text-[8.5px] font-bold text-center sm:text-left">
                        © 2026 TaxSense Inc. <span className="text-slate-300 dark:text-slate-700/60 mx-1.5">|</span> Built for Indian salaried employees under AY 2026-27 rules.
                      </p>
                      <div className="flex items-center gap-3 text-[8.5px] uppercase tracking-widest font-extrabold select-none">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          Secure Local Sandbox
                        </span>
                        <span className="text-slate-350 dark:text-slate-650">•</span>
                        <span className="text-blue-600 dark:text-blue-400">Gateway: Active</span>
                      </div>
                    </div>
                  </footer>

                </div>

              </div>

              <AICopilot isOpen={isFloatingAIChatOpen} onClose={() => setIsFloatingAIChatOpen(false)} />

              {/* Toggle trigger for Right side copilot drawer */}
              {!isFloatingAIChatOpen && activeStep !== 5 && (
                <button
                  onClick={() => setIsFloatingAIChatOpen(true)}
                  className="absolute right-6 bottom-6 z-40 p-3.5 bg-gradient-to-br from-emerald-400 to-blue-600 hover:from-emerald-500 hover:to-blue-700 text-white font-bold rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_18px_rgba(37,99,235,0.45)] cursor-pointer transition-all hover:scale-108 duration-300 active:scale-95 flex items-center justify-center group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400"
                >
                  <Sparkles className="w-5 h-5 text-white transition-transform group-hover:rotate-12 duration-300" />
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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative z-50 space-y-5 text-xs font-sans text-left text-slate-700 dark:text-slate-300"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">Filing Preferences & Sandbox Settings</span>
                        </div>
                        <button
                          onClick={() => setIsSettingsOpen(false)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
                        {/* Preset Profiles Section */}
                        <div className="space-y-1.5">
                          <span className="font-bold text-slate-900 dark:text-slate-200 block">Load Mock Filing Presets</span>
                          <div className="grid grid-cols-3 gap-2.5 pt-1">
                            {[
                              { id: 'developer', name: 'Salaried Developer', desc: '₹14.5L Salary + 80C' },
                              { id: 'freelancer', name: 'IT Freelancer', desc: '₹7.5L Gross, no HRA' },
                              { id: 'executive', name: 'Corporate Exec', desc: '₹45L HNW + Gains' }
                            ].map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() => handleLoadPreset(preset.id as any)}
                                className="p-2.5 bg-slate-50 hover:bg-slate-105 dark:bg-slate-950/40 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer text-left transition-all duration-150 active:scale-95 flex flex-col justify-between h-20 w-full"
                              >
                                <span className="font-bold text-[10px] text-slate-850 dark:text-slate-250 leading-tight">{preset.name}</span>
                                <span className="text-[8.5px] text-slate-500 dark:text-slate-500 mt-1 leading-snug">{preset.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Slab compliance selection */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                          <div className="space-y-1.5">
                            <span className="font-bold text-slate-900 dark:text-slate-200 block">Assessment Compliance Year</span>
                            <select
                              value={complianceYear}
                              onChange={(e) => {
                                setComplianceYear(e.target.value);
                                localStorage.setItem('taxsense_compliance_year', e.target.value);
                                showToast(`Switched compliance rules to ${e.target.value}`, 'info');
                              }}
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
                            >
                              <option value="AY 2026-27 (New regime focus)">AY 2026-27 (New slab rules)</option>
                              <option value="AY 2025-26 (Standard slabs)">AY 2025-26 (Standard old slabs)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <span className="font-bold text-slate-900 dark:text-slate-200 block">ITR Filing Rules</span>
                            <div className="grid grid-cols-2 gap-2">
                              <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formType === 'ITR-2'}
                                  onChange={(e) => setFormType(e.target.checked ? 'ITR-2' : 'ITR-1')}
                                  className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                                />
                                <span className="font-semibold text-slate-600 dark:text-slate-400 text-[10px]">ITR-2 Form</span>
                              </label>
                              <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={multiHouse}
                                  onChange={(e) => setMultiHouse(e.target.checked)}
                                  className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                                />
                                <span className="font-semibold text-slate-600 dark:text-slate-400 text-[10px]">Multi House</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* AI Engine & Temperature */}
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                          <div className="space-y-1.5">
                            <span className="font-bold text-slate-900 dark:text-slate-200 block">AI Copilot Brain</span>
                            <select
                              value={aiModel}
                              onChange={(e) => {
                                setAiModel(e.target.value);
                                localStorage.setItem('taxsense_ai_model', e.target.value);
                                showToast(`AI Copilot engine upgraded to ${e.target.value}`, 'success');
                              }}
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
                            >
                              <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Default)</option>
                              <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Ultra Fast)</option>
                              <option value="Gemini 2.0 Flash (Experimental)">Gemini 2.0 Flash (Advanced)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900 dark:text-slate-200">AI Temperature</span>
                              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">{aiTemperature}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                              <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.1"
                                value={aiTemperature}
                                onChange={(e) => {
                                  const temp = parseFloat(e.target.value);
                                  setAiTemperature(temp);
                                  localStorage.setItem('taxsense_ai_temp', temp.toString());
                                }}
                                className="w-full accent-blue-650 dark:accent-blue-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                              />
                            </div>
                            <div className="flex justify-between text-[8px] text-slate-550 pl-0.5">
                              <span>Precise</span>
                              <span>Creative</span>
                            </div>
                          </div>
                        </div>

                        {/* Sidebar Behavior Settings */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                          <span className="font-bold text-slate-900 dark:text-slate-200 block">Sidebar Behavior</span>
                          <div className="flex flex-col gap-2 pt-1">
                            <div className="grid grid-cols-3 gap-2">
                              {(['pinned', 'collapsed', 'auto_hover'] as const).map((behavior) => {
                                const isSelected = sidebarBehavior === behavior;
                                const label = behavior === 'pinned' ? 'Pinned' : behavior === 'collapsed' ? 'Collapsed' : 'Auto Hover';
                                return (
                                  <button
                                    key={behavior}
                                    type="button"
                                    onClick={() => setSidebarBehavior(behavior)}
                                    className={`py-2 px-2.5 rounded-xl border text-center font-bold text-[9.5px] uppercase tracking-wider transition-all duration-150 cursor-pointer ${isSelected
                                        ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                        : 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/40'
                                      }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-normal leading-normal pl-1">
                              {sidebarBehavior === 'pinned' && 'Sidebar is locked open.'}
                              {sidebarBehavior === 'collapsed' && 'Sidebar remains minimized (hover disabled).'}
                              {sidebarBehavior === 'auto_hover' && 'Hovering the collapsed sidebar expands it.'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                          <span className="font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[9px] font-mono">Support & Documentation</span>
                          <div className="flex flex-col gap-2 font-semibold pl-1">
                            <a href="#" className="text-slate-650 dark:text-slate-450 hover:text-emerald-650 dark:hover:text-emerald-450 transition-colors flex items-center gap-1.5 w-fit">
                              <span>Privacy Sandbox Policy</span>
                              <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                            </a>
                            <a href="#" className="text-slate-650 dark:text-slate-450 hover:text-emerald-650 dark:hover:text-emerald-450 transition-colors flex items-center gap-1.5 w-fit">
                              <span>Section 139(1) Filing Guide</span>
                              <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                            </a>
                            <a href="#" className="text-slate-650 dark:text-slate-450 hover:text-emerald-650 dark:hover:text-emerald-450 transition-colors flex items-center gap-1.5 w-fit">
                              <span>Income Tax Department APIs documentation</span>
                              <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                            </a>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                          <span className="font-bold text-red-650 dark:text-red-400 block">Danger Zone</span>
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                clearFilingHistory();
                                setIsSettingsOpen(false);
                              }}
                              className="flex-1 py-2 bg-red-50 hover:bg-red-105 dark:bg-red-950/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/40 text-red-600 dark:text-red-400 font-bold rounded-xl cursor-pointer text-center select-none active:scale-95 transition-all text-[11px]"
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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="text-center space-y-6 max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl"
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
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 select-none active:scale-95 block z-10 relative"
                      >
                        View Timeline history
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          );
        })()}

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
