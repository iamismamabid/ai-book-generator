"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class CoverStudioErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CoverStudio ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleClearCorruptCacheAndReload = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("kdp-cover-draft");
        if (window.indexedDB) {
          window.indexedDB.deleteDatabase("KDPageStudioDB");
        }
        window.location.reload();
      }
    } catch {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0b0f19] text-white select-none">
          <div className="max-w-md w-full bg-slate-900/80 border border-rose-500/20 rounded-3xl p-8 text-center space-y-5 shadow-2xl backdrop-blur-xl">
            <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 border border-rose-500/20 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Cover Studio Canvas Paused
              </h2>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                An issue occurred while rendering the canvas layout. Your saved design elements and settings are safely stored.
              </p>
              {this.state.error?.message && (
                <p className="mt-2 text-[11px] font-mono text-rose-400/80 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/30 overflow-hidden text-ellipsis whitespace-pre-wrap break-all text-left max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" /> Reload Studio Canvas
              </button>
              <button
                onClick={this.handleClearCorruptCacheAndReload}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all duration-200"
              >
                Reset Saved Draft Cache &amp; Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
