import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Download,
  Terminal,
  History,
  TrendingUp,
  Award,
  Search,
  Filter,
  Layers,
  ChevronRight,
  X,
  FileCheck2,
  ListFilter
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTaxStore } from '../store/useTaxStore';
import { formatINR } from '../utils/taxCalculator';

interface HistoryArchiveProps {
  setActiveStep: (step: number) => void;
}

// Custom Premium SVG Line Chart showing tax savings over time
const SavingsChart: React.FC<{ data: { year: string; savings: number; regime: string }[] }> = React.memo(({ data }) => {
  const [hoveredPoint, setHoveredPoint] = React.useState<number | null>(null);

  if (data.length === 0) return null;

  const width = 500;
  const height = 180;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 30;

  const maxSavings = Math.max(...data.map(d => d.savings), 60000);
  const minSavings = 0;

  const getX = (index: number) => {
    if (data.length <= 1) {
      return paddingLeft + (width - paddingLeft - paddingRight) / 2;
    }
    return paddingLeft + (index / (data.length - 1)) * (width - paddingLeft - paddingRight);
  };

  const getY = (val: number) => {
    const scale = (val - minSavings) / (maxSavings - minSavings);
    return height - paddingBottom - scale * (height - paddingTop - paddingBottom);
  };

  // Build the path string
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.savings) }));
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  // Path for fill gradient under the line
  let fillD = '';
  if (points.length > 0) {
    fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }

  return (
    <div className="bg-white dark:bg-[#0E131B] border border-slate-205 dark:border-white/[0.04] rounded-3xl p-6 text-left relative overflow-hidden group shadow-sm">
      <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Financial Analytics</span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">Savings Over Time</h4>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full select-none">
          <TrendingUp className="h-3 w-3" />
          <span>Optimized Growth</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[450px]">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((scale, idx) => {
            const val = minSavings + scale * (maxSavings - minSavings);
            const y = getY(val);
            return (
              <g key={idx}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="currentColor"
                  className="text-slate-100 dark:text-white/[0.02]"
                  strokeDasharray="2 4"
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 3} 
                  fill="#64748B" 
                  fontSize="8" 
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  ₹{(val / 1000).toFixed(0)}K
                </text>
              </g>
            );
          })}

          {/* Y Axis Line */}
          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="currentColor" className="text-slate-200 dark:text-white/[0.05]" />
          
          {/* X Axis Labels */}
          {data.map((d, i) => (
            <text 
              key={i} 
              x={getX(i)} 
              y={height - 10} 
              fill="#64748B" 
              fontSize="9" 
              fontWeight="bold"
              textAnchor="middle"
            >
              {d.year}
            </text>
          ))}

          {/* Fill Path */}
          {fillD && <path d={fillD} fill="url(#chartGradient)" />}

          {/* Line Path */}
          {pathD && (
            <path 
              d={pathD} 
              fill="none" 
              stroke="#10B981" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoveredPoint === i ? "6" : "4"} 
                fill="currentColor"
                className="text-white dark:text-[#0E131B] cursor-pointer transition-all duration-150"
                stroke="#10B981" 
                strokeWidth="2"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* Hover coordinate detail box */}
        <AnimatePresence>
          {hoveredPoint !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/[0.08] backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] text-slate-700 dark:text-slate-300 font-bold space-y-0.5 pointer-events-none z-10 shadow-xl dark:shadow-2xl"
            >
              <div className="text-slate-500 uppercase tracking-widest text-[8px] font-black">AY {data[hoveredPoint].year} savings</div>
              <div className="font-mono text-emerald-600 dark:text-emerald-450 font-black text-xs">{formatINR(data[hoveredPoint].savings)}</div>
              <div className="text-slate-600 dark:text-slate-400 uppercase text-[8px]">Regime: {data[hoveredPoint].regime}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
});

// Main History Archive redesign component
export const HistoryArchive: React.FC<HistoryArchiveProps> = React.memo(({ setActiveStep }) => {
  const [isDemoMode, setIsDemoMode] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('ALL');
  const [isTimelineView, setIsTimelineView] = React.useState(false);
  
  // Year Comparison Drawer states
  const [isComparisonOpen, setIsComparisonOpen] = React.useState(false);

  const filingHistory = useTaxStore((state) => state.filingHistory) || [];

  // MOCK DEMO TIMELINE DATA (AY 2023 to AY 2026 savings metrics)
  const demoHistory = React.useMemo(() => [
    {
      id: "Filing AY 2026-27",
      date: "Generated July 2026",
      grossSalary: 1450000,
      totalDeductions: 310000,
      netTaxPaid: 112500,
      recommendedRegime: 'NEW' as const,
      formType: "ITR-1",
      savings: 51480,
      status: "Filed"
    },
    {
      id: "Filing AY 2025-26",
      date: "Generated July 2025",
      grossSalary: 1180000,
      totalDeductions: 280000,
      netTaxPaid: 84300,
      recommendedRegime: 'NEW' as const,
      formType: "ITR-1",
      savings: 46000,
      status: "Filed"
    },
    {
      id: "Filing AY 2024-25",
      date: "Generated July 2024",
      grossSalary: 920000,
      totalDeductions: 210000,
      netTaxPaid: 53200,
      recommendedRegime: 'NEW' as const,
      formType: "ITR-1",
      savings: 32000,
      status: "Filed"
    },
    {
      id: "Filing AY 2023-24",
      date: "Generated August 2023",
      grossSalary: 750000,
      totalDeductions: 150000,
      netTaxPaid: 37500,
      recommendedRegime: 'OLD' as const,
      formType: "ITR-1",
      savings: 18500,
      status: "Filed"
    }
  ], []);

  const activeHistory = isDemoMode || filingHistory.length > 0 ? (isDemoMode ? demoHistory : filingHistory.map(item => ({
    ...item,
    savings: item.recommendedRegime === 'NEW' ? 51480 : 38000,
    status: 'Filed'
  }))) : [];

  // Computed Stats
  const yearsFiledCount = activeHistory.length;
  const totalSavedValue = activeHistory.reduce((acc, item) => acc + (item.savings || 0), 0) || (isDemoMode ? 247890 : 0);
  const returnsCount = activeHistory.length + 1; // Including drafts/in-progress
  const lastFilingLabel = activeHistory.length > 0 ? activeHistory[0].id.replace("Filing ", "") : "None";

  const chartData = React.useMemo(() => {
    return activeHistory.map(item => {
      let displayYear = item.id;
      if (item.id.startsWith("TXS")) {
        displayYear = "26/27";
      } else {
        displayYear = item.id.replace("Filing AY 20", "").replace("-", "/");
      }
      return {
        year: displayYear,
        savings: item.savings || 0,
        regime: item.recommendedRegime
      };
    }).reverse();
  }, [activeHistory]);

  // Filtering & Search
  const filteredHistory = React.useMemo(() => {
    return activeHistory.filter(item => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = item.id.toLowerCase().includes(query) || 
                            item.date.toLowerCase().includes(query) || 
                            item.recommendedRegime.toLowerCase().includes(query);
      
      if (activeFilter === 'ALL') return matchesSearch;
      if (activeFilter === 'NEW') return matchesSearch && item.recommendedRegime === 'NEW';
      if (activeFilter === 'OLD') return matchesSearch && item.recommendedRegime === 'OLD';
      if (activeFilter === 'Filed') return matchesSearch && item.status === 'Filed';
      return matchesSearch;
    });
  }, [activeHistory, searchQuery, activeFilter]);

  // Actions
  const handleDownloadMock = (fileName: string) => {
    alert(`Downloading ${fileName}...`);
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto text-slate-800 dark:text-slate-100 font-sans py-4">
      
      {/* 1. History Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/[0.03] pb-6">
        <div className="text-left space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Your Tax History</h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-450 leading-relaxed font-medium">
            Every filing securely archived. Track your savings, download previous returns, and revisit AI recommendations anytime.
          </p>
        </div>

        {/* Floating Quick Action Row */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          <button
            onClick={() => setActiveStep(3)}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-98"
          >
            Start New Filing
          </button>
          <button
            onClick={() => alert("Upload ITR JSON portal matches...")}
            className="h-10 px-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-98"
          >
            Import Previous Return
          </button>
        </div>
      </div>

      {/* Empty State / Dashboard split view */}
      {activeHistory.length === 0 ? (
        <div className="max-w-lg mx-auto bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.04] rounded-3xl p-10 text-center space-y-6 select-none my-12 shadow-xl dark:shadow-2xl">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.04] text-slate-500 rounded-full flex items-center justify-center mx-auto">
            <History className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No filings yet</h3>
            <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed font-semibold">
              Once you complete your first filing, TaxSense will build a complete tax history for you. You'll be able to compare savings, download previous returns, and review AI recommendations.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setActiveStep(3)}
              className="w-full sm:w-auto h-11 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-98"
            >
              Start Your First Filing
            </button>
            <button
              onClick={() => setIsDemoMode(true)}
              className="w-full sm:w-auto h-11 px-5 border border-slate-200 dark:border-slate-855 hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-98"
            >
              Explore Demo History
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
          
          {/* LEFT COLUMN: Stats, Chart, Timeline (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'Years Filed', val: yearsFiledCount },
                { title: 'Total Tax Saved', val: formatINR(totalSavedValue) },
                { title: 'Returns Generated', val: returnsCount },
                { title: 'Last Filing', val: lastFilingLabel }
              ].map((stat) => (
                <div key={stat.title} className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/[0.03] rounded-2xl p-4.5 space-y-1 shadow-sm backdrop-blur-md">
                  <span className="text-[9px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-bold block">{stat.title}</span>
                  <span className="text-sm md:text-base font-black text-slate-850 dark:text-slate-100 font-mono tracking-tight block">{stat.val}</span>
                </div>
              ))}
            </div>

            {/* SVG Chart Section */}
            <SavingsChart data={chartData} />

            {/* History table view or Timeline view */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.04] pb-3 select-none">
                <div className="flex items-center gap-4">
                  <h3 className="text-[11px] font-bold text-slate-550 dark:text-slate-500 uppercase tracking-widest">Filing Logs</h3>
                  <button
                    onClick={() => setIsTimelineView(!isTimelineView)}
                    className="text-[9.5px] font-bold uppercase text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Switch to {isTimelineView ? 'Grid View' : 'Timeline View'}
                  </button>
                </div>

                {/* Live Search & Filters Container */}
                <div className="flex items-center gap-2 relative">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Search by AY, regime..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06] rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Horizontal filter chips row */}
              <div className="flex flex-wrap items-center gap-1.5 select-none pb-2">
                {['ALL', 'Filed', 'New Regime', 'Old Regime'].map((chip) => {
                  const filterKey = chip === 'New Regime' ? 'NEW' : chip === 'Old Regime' ? 'OLD' : chip;
                  const isActive = activeFilter === filterKey;
                  return (
                    <button
                      key={chip}
                      onClick={() => setActiveFilter(filterKey)}
                      className={`px-3 py-1 text-[9.5px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-600/20' 
                          : 'bg-transparent text-slate-600 dark:text-slate-450 border-slate-200 dark:border-white/[0.04] hover:text-slate-900 dark:hover:text-slate-300'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>

              {isTimelineView ? (
                // TIMELINE VIEW
                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-850 before:border-dashed">
                  {filteredHistory.map((item) => (
                    <div key={item.id} className="relative space-y-2 group">
                      <div className="absolute -left-[20px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border border-white dark:border-slate-950 ring-4 ring-emerald-500/15 group-hover:scale-110 transition-transform" />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-805 dark:text-slate-100 text-xs font-mono">{item.id.replace("Filing ", "")}</span>
                          <span className="text-[9px] bg-blue-600/10 text-blue-605 dark:text-blue-400 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">{item.recommendedRegime}</span>
                        </div>
                        <span className="text-[10px] text-slate-550 dark:text-slate-500 font-bold">{item.date}</span>
                      </div>
                      
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/[0.03] rounded-2xl flex items-center justify-between text-xs hover:border-slate-300 dark:hover:border-white/[0.06] transition-all">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Savings</span>
                          <span className="font-mono text-emerald-400 font-bold">{formatINR(item.savings || 38000)}</span>
                        </div>
                        <button
                          onClick={() => handleDownloadMock(`${item.id}.pdf`)}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.04] hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                        >
                          Open Document
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // GRID VIEW (Premium cards)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredHistory.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.04] rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.08] hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono text-xs">{item.id}</span>
                          <span className="text-[8.5px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {item.status || 'Filed'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-550 dark:text-slate-450 font-bold">{item.date} • {item.recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime'}</div>
                        <div className="text-xs text-slate-700 dark:text-slate-400 font-medium pt-2 leading-relaxed">
                          Tax optimized and generated successfully. Total estimated tax savings: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatINR(item.savings || 38000)}</strong>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/[0.02] flex items-center justify-between select-none">
                        <button
                          onClick={() => handleDownloadMock(`${item.id}_ITR.pdf`)}
                          className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          Open Return
                        </button>

                        <div className="flex gap-2">
                          <button
                            title="Download JSON return file"
                            onClick={() => handleDownloadMock(`${item.id}.json`)}
                            className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.04] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: AI Insights, Archives, Security (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Insights Panel */}
            <div className="bg-white/40 dark:bg-slate-900/35 border border-slate-200/50 dark:border-white/[0.04] rounded-3xl p-6 backdrop-blur-md space-y-4">
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest block border-b border-slate-200/50 dark:border-white/[0.02] pb-2.5">AI Tax Insights</span>
              
              <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-400 font-semibold">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 dark:text-slate-500">Highest Savings:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">AY 2026-27 (₹51,480)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200/50 dark:border-white/[0.02] pt-2">
                  <span className="text-slate-500 dark:text-slate-500">Most Improved Year:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">+42%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200/50 dark:border-white/[0.02] pt-2">
                  <span className="text-slate-500 dark:text-slate-500">Average Savings:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-250">{formatINR(37200)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200/50 dark:border-white/[0.02] pt-2">
                  <span className="text-slate-500 dark:text-slate-500">Regime recommendation:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">New Regime (3 years)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/[0.02]">
                <button
                  onClick={() => setIsComparisonOpen(true)}
                  className="w-full py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.04] hover:bg-slate-100 dark:hover:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                >
                  <span>Compare Years</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Archived Documents Section */}
            <div className="bg-white/40 dark:bg-slate-900/35 border border-slate-200/50 dark:border-white/[0.04] rounded-3xl p-6 backdrop-blur-md space-y-4 select-none">
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest block border-b border-slate-200/50 dark:border-white/[0.02] pb-2.5">Archived Documents</span>
              
              <div className="space-y-3 font-semibold text-xs text-slate-700 dark:text-slate-300">
                {[
                  { name: 'ITR Return PDF', format: 'PDF Document' },
                  { name: 'AI Audit Report PDF', format: 'Verification Ledger' },
                  { name: 'Form 16 Snapshot', format: 'Form 16 Match' },
                  { name: 'Recommendation Summary', format: 'Exemption Blueprint' }
                ].map((doc) => (
                  <div key={doc.name} className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-205 dark:border-white/[0.02] rounded-xl hover:border-slate-300 dark:hover:border-white/[0.04] transition-colors">
                    <div>
                      <div className="text-[11px] font-bold text-slate-805 dark:text-slate-200">{doc.name}</div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-550">{doc.format}</div>
                    </div>
                    <button
                      onClick={() => handleDownloadMock(doc.name)}
                      className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.04] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Protected security card */}
            <div className="bg-white/40 dark:bg-slate-900/35 border border-slate-200/50 dark:border-white/[0.04] rounded-3xl p-6 backdrop-blur-md space-y-4">
              <span className="text-[10px] font-bold text-slate-805 dark:text-slate-200 uppercase tracking-widest block border-b border-slate-200/50 dark:border-white/[0.02] pb-2.5">Protected Archive</span>
              
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 font-semibold text-left">
                {[
                  'Encrypted locally',
                  'No filing shared automatically',
                  'AI audit preserved',
                  'Immutable filing log',
                  'Secure document vault'
                ].map((check) => (
                  <div key={check} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-450 shrink-0" />
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Expandable Year Comparison Side Sheet Drawer */}
      {createPortal(
        <AnimatePresence>
          {isComparisonOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsComparisonOpen(false)}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[200] transition-opacity"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-[#0A0D14] border-l border-slate-200 dark:border-white/[0.08] p-8 shadow-2xl z-[200] flex flex-col justify-between overflow-y-auto text-left"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Exemption Slabs Comparison</span>
                    </div>
                    <button
                      onClick={() => setIsComparisonOpen(false)}
                      className="p-2 hover:bg-slate-105 dark:hover:bg-white/[0.04] rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Slabs Comparison Table */}
                  <div className="pt-2">
                    <div className="overflow-x-auto border border-slate-200 dark:border-white/[0.04] rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
                      <table className="w-full text-left text-xs font-semibold">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/[0.04] text-slate-500 dark:text-slate-500 uppercase tracking-wider text-[9px]">
                            <th className="p-4">Year</th>
                            <th className="p-4">Salary</th>
                            <th className="p-4">Regime</th>
                            <th className="p-4">Savings</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-700 dark:text-slate-300 font-mono">
                          <tr className="border-b border-slate-150 dark:border-white/[0.02]">
                            <td className="p-4 font-bold text-slate-900 dark:text-slate-100">AY 2026-27</td>
                            <td className="p-4">₹14.5L</td>
                            <td className="p-4 text-blue-600 dark:text-blue-400 font-bold">NEW</td>
                            <td className="p-4 text-emerald-600 dark:text-emerald-450 font-bold">₹51,480</td>
                          </tr>
                          <tr className="border-b border-slate-150 dark:border-white/[0.02]">
                            <td className="p-4 font-bold text-slate-900 dark:text-slate-100">AY 2025-26</td>
                            <td className="p-4">₹11.8L</td>
                            <td className="p-4 text-blue-600 dark:text-blue-400 font-bold">NEW</td>
                            <td className="p-4 text-emerald-600 dark:text-emerald-450 font-bold">₹46,000</td>
                          </tr>
                          <tr className="border-b border-slate-150 dark:border-white/[0.02]">
                            <td className="p-4 font-bold text-slate-900 dark:text-slate-100">AY 2024-25</td>
                            <td className="p-4">₹9.2L</td>
                            <td className="p-4 text-blue-600 dark:text-blue-400 font-bold">NEW</td>
                            <td className="p-4 text-emerald-600 dark:text-emerald-450 font-bold">₹32,000</td>
                          </tr>
                          <tr>
                            <td className="p-4 font-bold text-slate-900 dark:text-slate-100">AY 2023-24</td>
                            <td className="p-4">₹7.5L</td>
                            <td className="p-4 text-amber-600 dark:text-amber-500 font-bold">OLD</td>
                            <td className="p-4 text-emerald-600 dark:text-emerald-450 font-bold">₹18,500</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* AI Explanation of comparison */}
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-500/[0.02] border border-blue-200 dark:border-blue-500/10 rounded-2xl flex items-start gap-2.5 text-xs text-slate-655 dark:text-slate-400 leading-relaxed mt-6">
                      <Sparkles className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 font-semibold">
                        <span className="text-blue-600 dark:text-blue-400 block text-[10px] uppercase tracking-wider">AI Comparative Audit</span>
                        <p>
                          Your savings increased because your employer NPS contributions increased under Section 80CCD(2). The AI recommended switching to the New Tax Regime beginning AY 2024-25, which yielded substantial benefits over standard Old exemptions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-900/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-550 dark:text-slate-500 font-bold uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-650" />
                    <span>Secure Local Database comparison</span>
                  </div>
                  <button
                    onClick={() => setIsComparisonOpen(false)}
                    className="h-10 px-5 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-98"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
});

export default HistoryArchive;
