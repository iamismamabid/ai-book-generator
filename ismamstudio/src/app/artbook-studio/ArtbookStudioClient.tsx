"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Sparkles, Loader2, ArrowLeft, LayoutDashboard, Paintbrush } from "lucide-react";
import { checkPremiumStatus } from "@/app/actions";

// Lazy-load the heavy studio component (canvas, jsPDF, localStorage)
const AiArtbookStudio = dynamic(
  () =>
    import("@/components/AiArtbookStudio").catch((err) => {
      if (typeof window !== "undefined" && !sessionStorage.getItem("retry_chunk_artbook")) {
        sessionStorage.setItem("retry_chunk_artbook", "1");
        window.location.reload();
      }
      throw err;
    }),
  { ssr: false }
);

export default function ArtbookStudioClient() {
  const { isSignedIn } = useAuth();
  const [isMounted, setIsMounted]     = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    async function loadPremium() {
      try {
        const res = await checkPremiumStatus();
        setPremiumStatus(res as any);
      } catch {
        setPremiumStatus({ checked: true, isPremium: false, plan: "free" });
      }
    }
    if (isSignedIn) loadPremium();
    else setPremiumStatus({ checked: true, isPremium: false, plan: "free" });
  }, [isSignedIn]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!isMounted || !premiumStatus.checked) {
    return (
      <div className="h-screen w-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" />
        <div className="flex-1 flex items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Loading Artbook Studio…</span>
        </div>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* ── Dedicated Header ─────────────────────────────────────────────── */}
      <header className="h-12 min-h-[48px] shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4 z-30 select-none">

        {/* Left: Logo + back */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Paintbrush className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight hidden sm:block">KDPage</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:block">·</span>
          <Link
            href="/studio"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Creator Studio
          </Link>
        </div>

        {/* Center: Title */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">AI Coloring Artbook Studio</span>
          <span className="hidden md:inline text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            BYOK
          </span>
        </div>

        {/* Right: Dashboard link */}
        <div className="flex items-center gap-2">
          {premiumStatus.isPremium && (
            <span className="hidden sm:inline text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Pro
            </span>
          )}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-wider"
          >
            <LayoutDashboard className="w-3 h-3" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      {/* ── Studio Workspace ─────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <AiArtbookStudio
          isPremium={premiumStatus.isPremium}
          isSignedIn={!!isSignedIn}
          isActive={true}
        />
      </main>
    </div>
  );
}
