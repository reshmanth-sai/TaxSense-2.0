import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldCheck, RefreshCw, LayoutDashboard } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime exception in React tree:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-white/[0.04] rounded-3xl p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-at-t from-emerald-500/5 via-transparent to-transparent opacity-70 pointer-events-none" />
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 flex items-center justify-center mx-auto animate-pulse">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2 relative z-10">
              <h2 className="text-lg font-black tracking-tight text-white">System Recovery Console</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                We ran into an unexpected problem while processing your document or loading the workspace.
              </p>
              <p className="text-[10px] bg-slate-955 border border-slate-850 rounded-xl p-3 text-red-400 font-mono text-left leading-normal break-all max-h-32 overflow-y-auto">
                {this.state.error?.toString() || 'Unknown runtime exception'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2 relative z-10">
              <button
                onClick={() => {
                  // Purge cache and retry
                  localStorage.removeItem('taxsense_session_cache');
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Session & Retry</span>
              </button>
              
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.04] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
