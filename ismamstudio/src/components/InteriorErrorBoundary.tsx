"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Sparkles } from "lucide-react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class InteriorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("InteriorErrorBoundary caught an interior render error:", error, errorInfo);
    const msg = error?.message || "";
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      msg.includes("Loading chunk") ||
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("CSS chunk");

    if (isChunkError && typeof window !== "undefined") {
      const lockKey = "kdpage_chunk_reload_interior";
      const lastReload = sessionStorage.getItem(lockKey);
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 12000) {
        sessionStorage.setItem(lockKey, now.toString());
        window.location.reload();
      }
    }
  }

  handleReset = () => {
    const msg = this.state.error?.message || "";
    const isChunkError =
      this.state.error?.name === "ChunkLoadError" ||
      msg.includes("Loading chunk") ||
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("CSS chunk");

    if (isChunkError && typeof window !== "undefined") {
      window.location.reload();
      return;
    }

    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleClearCorruptCacheAndReload = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("kdp-book-draft");
        try {
          const { clearBookDraftFromIndexedDB } = await import("@/lib/indexedDbStorage");
          await clearBookDraftFromIndexedDB();
        } catch (e) {
          console.warn("Failed to clear IndexedDB draft:", e);
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
      const msg = this.state.error?.message || "";
      const isChunkError =
        this.state.error?.name === "ChunkLoadError" ||
        msg.includes("Loading chunk") ||
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("CSS chunk");

      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 text-white select-none">
          <div className="max-w-md w-full bg-slate-800/90 border border-indigo-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl backdrop-blur-xl">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
              isChunkError
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {isChunkError ? <Sparkles className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                {isChunkError ? "New Version Deployed" : "Book Interior Builder Paused"}
              </h2>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                {isChunkError
                  ? "A new update of KDPage was just released. Your book draft and settings are safely stored in your browser."
                  : "An issue occurred while rendering this book page. Your overall book configuration and other pages are safely preserved."}
              </p>
              {this.state.error?.message && (
                <p className="mt-2 text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 overflow-hidden text-ellipsis whitespace-pre-wrap break-all text-left max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> {isChunkError ? "Update & Reload Studio" : "Reload Book Interior"}
              </button>
              {!isChunkError && (
                <button
                  onClick={this.handleClearCorruptCacheAndReload}
                  className="w-full py-2.5 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 text-slate-300 font-semibold text-xs rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Reset Interior Draft &amp; Reload
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
