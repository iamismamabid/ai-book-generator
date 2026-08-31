"use client";

import React, { useState, useEffect } from "react";
import { X, Settings2, FileDown, AlertTriangle, Loader2, Lock, Sparkles, ShieldCheck, Ticket, Info } from "lucide-react";
import { checkPremiumStatus, redeemAppSumoCode } from "@/app/actions";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { createPortal } from "react-dom";
import { checkCoverImageResolution, ImageResolutionCheck } from "@/lib/pdfValidator";
import { BORDER_THEMES, BorderThemeId } from "@/lib/borderThemes";

// Physical trim dimensions for the standard KDP trim-size values used across
// the standalone puzzle tools -- needed to turn a cover image's raw pixel
// size into an effective print DPI.
const TRIM_DIMENSIONS_IN: Record<string, [number, number]> = {
  "6x9": [6, 9],
  "8.5x11": [8.5, 11],
  "5x8": [5, 8],
};

export interface TrimSizeOption<T extends string> {
  value: T;
  label: string;
  /** Minimum plan tier required to select this trim size. */
  tier: "free" | "starter" | "pro";
}

const DEFAULT_TRIM_OPTIONS: TrimSizeOption<"6x9" | "8.5x11" | "5x8">[] = [
  { value: "8.5x11", label: '8.5″ × 11″ (Large Print / Puzzle Book)', tier: "free" },
  { value: "6x9", label: '6″ × 9″ (Novel / Workbook)', tier: "starter" },
  { value: "5x8", label: '5″ × 8″ (Pocket Book)', tier: "starter" },
];

const TIER_RANK = { free: 0, starter: 1, pro: 2 } as const;

interface ExportInteriorModalProps<T extends string = "6x9" | "8.5x11" | "5x8"> {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: {
    includeCover: boolean;
    coverState: any;
    includeSolutions: boolean;
    trimSize: T;
    hasBleed: boolean;
    showGuides: boolean;
    includePageNumbers?: boolean;
    isPremium?: boolean;
    borderTheme?: BorderThemeId;
  }) => void | Promise<void>;
  defaultTrimSize?: T;
  showSolutionsToggle?: boolean;
  /** Override the selectable trim sizes. Defaults to the standard 3-size KDP set. */
  trimSizeOptions?: TrimSizeOption<T>[];
  /** Hide the decorative page-border picker -- irrelevant for prose/manuscript exports. */
  showBorderThemePicker?: boolean;
}

export default function ExportInteriorModal<T extends string = "6x9" | "8.5x11" | "5x8">({
  isOpen,
  onClose,
  onExport,
  defaultTrimSize = "8.5x11" as T,
  showSolutionsToggle = true,
  trimSizeOptions,
  showBorderThemePicker = true,
}: ExportInteriorModalProps<T>) {
  const trimOptions = (trimSizeOptions ?? DEFAULT_TRIM_OPTIONS) as unknown as TrimSizeOption<T>[];
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [includeCover, setIncludeCover] = useState(false);
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [trimSize, setTrimSize] = useState<T>(defaultTrimSize);
  const [hasBleed, setHasBleed] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [borderTheme, setBorderTheme] = useState<BorderThemeId>("none");
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [coverState, setCoverState] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Subscription/AppSumo status checking
  const [premiumStatus, setPremiumStatus] = useState<{
    checked: boolean;
    isPremium: boolean;
    plan?: string;
    isTrial?: boolean;
    daysRemaining?: number;
    reason?: string;
  }>({
    checked: false,
    isPremium: false,
  });

  // Redemption state
  const [appsumoCode, setAppsumoCode] = useState("");
  const [redemptionError, setRedemptionError] = useState<string | null>(null);
  const [redemptionSuccess, setRedemptionSuccess] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Check premium status on mount or when modal opens
  const fetchPremiumStatus = async () => {
    if (!userId) return;
    try {
      const res = await checkPremiumStatus();
      setPremiumStatus({
        checked: true,
        isPremium: res.isPremium,
        plan: res.plan,
        isTrial: (res as any).isTrial || false,
        daysRemaining: (res as any).daysRemaining,
        reason: (res as any).reason,
      });
    } catch (e) {
      console.error("Failed to check premium status:", e);
      // Distinct from a genuine free-tier user -- this is a client-side
      // failure to even reach checkPremiumStatus, not a status it returned.
      setPremiumStatus({ checked: true, isPremium: false, reason: "status_check_failed" });
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchPremiumStatus();
    } else if (isOpen && isLoaded && !isSignedIn) {
      setPremiumStatus({ checked: true, isPremium: false });
    }
  }, [isOpen, userId, isLoaded, isSignedIn]);

  const userTierRank = premiumStatus.plan === "free" || !premiumStatus.plan
    ? TIER_RANK.free
    : premiumStatus.plan === "starter"
    ? TIER_RANK.starter
    : TIER_RANK.pro;

  useEffect(() => {
    if (!premiumStatus.checked) return;
    const current = trimOptions.find((o) => o.value === trimSize);
    const currentRank = current ? TIER_RANK[current.tier] : TIER_RANK.free;
    if (currentRank > userTierRank) {
      const fallback = trimOptions.find((o) => TIER_RANK[o.tier] <= userTierRank) ?? trimOptions[0];
      setTrimSize(fallback.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premiumStatus.checked, premiumStatus.plan]);

  // Load cover state from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("kdp-cover-draft");
      if (saved) {
        try {
          setCoverState(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading cover draft", e);
        }
      }
    }
  }, [isOpen]);

  // KDP Compliance: auto-check raster cover image resolution whenever a
  // cover is included. Puzzle grids themselves are pure vector (resolution
  // independent) so this only ever applies to Cover Studio images.
  const [coverDpiChecks, setCoverDpiChecks] = useState<ImageResolutionCheck[]>([]);
  useEffect(() => {
    const dims = TRIM_DIMENSIONS_IN[trimSize];
    if (!isOpen || !includeCover || !coverState || !dims) {
      setCoverDpiChecks([]);
      return;
    }
    let cancelled = false;
    checkCoverImageResolution(coverState, dims[0], dims[1]).then((results) => {
      if (!cancelled) setCoverDpiChecks(results);
    });
    return () => { cancelled = true; };
  }, [isOpen, includeCover, coverState, trimSize]);

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appsumoCode.trim()) return;

    setIsRedeeming(true);
    setRedemptionError(null);
    setRedemptionSuccess(null);

    try {
      const res = await redeemAppSumoCode(appsumoCode.trim());
      if (res.success) {
        setRedemptionSuccess("AppSumo Code redeemed successfully! Downloads unlocked.");
        await fetchPremiumStatus();
        setAppsumoCode("");
      } else {
        setRedemptionError(res.error || "Failed to redeem code. Please try again.");
      }
    } catch (err: any) {
      setRedemptionError(err.message || "Failed to redeem code. Please try again.");
    } finally {
      setIsRedeeming(false);
    }
  };

  if (!isOpen) return null;

  const handleActionExport = async () => {
    if (includeCover && !coverState) {
      alert("Please design a cover in the Cover Studio first, or uncheck the Cover option.");
      return;
    }
    setIsExporting(true);
    try {
      await onExport({
        includeCover,
        coverState,
        includePageNumbers,
        includeSolutions,
        trimSize,
        hasBleed,
        showGuides,
        isPremium: premiumStatus.isPremium,
        borderTheme,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const hasSavedCover = !!coverState;

  if (!isOpen) return null;

  const modalContent = (
    <>
      {!premiumStatus.checked ? (
        <div className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-sm w-full flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Checking Account Access...</span>
          </div>
        </div>
      ) : (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 pt-28"
          onClick={onClose}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 max-w-md w-full max-h-[calc(100vh-140px)] overflow-y-auto shadow-2xl p-6 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Export Book Interior</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configure layouts and covers</p>
              </div>
            </div>

            {/* Account Status Check Failed -- distinct from genuinely being on
                the free plan, so a paying customer isn't told they're on
                free tier just because a status check failed transiently. */}
            {!premiumStatus.isPremium && premiumStatus.reason === "status_check_failed" && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-[11px] font-semibold mb-4 space-y-2">
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-slate-900 block">Couldn&apos;t Verify Your Account</span>
                    <p className="text-slate-600 text-[10px] leading-relaxed mt-0.5">
                      We couldn&apos;t confirm your plan due to a temporary connection issue -- this is not a reflection of your actual plan. Please retry before exporting.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-rose-200/50 flex justify-end">
                  <button
                    type="button"
                    onClick={fetchPremiumStatus}
                    className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-500 cursor-pointer"
                  >
                    Retry Check →
                  </button>
                </div>
              </div>
            )}

            {/* 7-Day Trial Mode Paywall Banner */}
            {!premiumStatus.isPremium && premiumStatus.isTrial && (
              <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-amber-500/40 shadow-lg shadow-amber-950/30 space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-400 text-xs uppercase tracking-wide">
                        7-Day Free Trial Active
                      </span>
                      {premiumStatus.daysRemaining !== undefined && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-extrabold">
                          {premiumStatus.daysRemaining} Days Left
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-[11px] font-medium leading-relaxed mt-1">
                      You have full access to test all studio features. To export and download watermark-free 300 DPI print-ready vector PDFs, please activate your paid plan.
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                  <Link
                    href="/pricing"
                    target="_blank"
                    className="flex-1 text-center py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
                  >
                    ⚡ Activate Paid Plan to Download →
                  </Link>
                </div>
              </div>
            )}

            {/* Free Plan (Non-Trial) Paywall Banner */}
            {!premiumStatus.isPremium && !premiumStatus.isTrial && premiumStatus.reason !== "status_check_failed" && (
              <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-indigo-500/30 shadow-lg shadow-indigo-950/30 space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="font-black text-white text-xs block uppercase tracking-wide">
                      Your 300 DPI KDP Book is Ready!
                    </span>
                    <p className="text-slate-300 text-[11px] font-medium leading-relaxed mt-1">
                      Full studio creation is 100% free. Unlock instant print-ready 300 DPI vector PDF download to publish on Amazon KDP today.
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-indigo-500/20 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                  <Link
                    href="/pricing"
                    target="_blank"
                    className="flex-1 text-center py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
                  >
                    ⚡ Unlock Instant Download ($11.99/mo) →
                  </Link>
                </div>
              </div>
            )}

            {/* 300 DPI Resolution Indicator */}
            <div className="p-3 bg-indigo-50/80 border border-indigo-200/70 text-indigo-950 rounded-2xl text-[11px] font-semibold mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white tracking-wide">
                  300 DPI
                </span>
                <span className="font-bold text-slate-800 text-[11px]">
                  Print-Ready Vector PDF Output (Amazon KDP & IngramSpark Compliant)
                </span>
              </div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider shrink-0">
                Max Quality
              </span>
            </div>

            {/* Premium Activated Indicator */}
            {premiumStatus.isPremium && (
              <div className="p-4 bg-emerald-50 border border-emerald-200/50 text-emerald-950 rounded-2xl text-[11px] font-semibold mb-4 space-y-2">
                <div className="flex gap-2 items-start">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-slate-900 block">
                      Premium Plan Active
                    </span>
                    <p className="text-slate-600 text-[10px] leading-relaxed mt-0.5">
                      High-res 300 DPI watermark-free vector PDF exports are fully unlocked!
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-200/50 flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                  <Link href="/pricing" target="_blank" className="text-indigo-600 hover:text-indigo-600">
                    Manage Plans &amp; Billing →
                  </Link>
                </div>
              </div>
            )}

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {/* Cover Integration Option */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <label className="text-xs font-black text-slate-800 block cursor-pointer select-none" htmlFor="includeCoverCheck">
                      Include Front & Back Cover
                    </label>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Compile designs from Cover Studio</span>
                  </div>
                  <input
                    type="checkbox"
                    id="includeCoverCheck"
                    checked={includeCover}
                    onChange={(e) => setIncludeCover(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>
                
                {includeCover && !hasSavedCover && (
                  <div className="flex gap-2 items-center bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-xl text-[10px] font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>No saved cover found! Create a cover in the Cover Studio to use this feature.</span>
                  </div>
                )}

                {includeCover && hasSavedCover && (
                  <div className="flex gap-2 items-start bg-indigo-50 border border-indigo-200 text-indigo-900 p-2.5 rounded-xl text-[10px] font-semibold leading-normal">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>KDP Notice:</strong> Amazon KDP requires uploading the <strong>Interior</strong> and <strong>Cover</strong> as two separate PDF files. Including the cover here is only for digital reading/e-book layout. For KDP paperback publishing, export your cover separately from the All-In-One Studio.
                    </span>
                  </div>
                )}

                {includeCover && coverDpiChecks.length > 0 && (
                  <div className="space-y-1.5">
                    {coverDpiChecks.map((check, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2 items-center p-2 rounded-lg text-[9px] font-semibold ${
                          check.isLowRes
                            ? 'bg-amber-50 border border-amber-200 text-amber-800'
                            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        }`}
                      >
                        {check.isLowRes ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <span>
                          {check.label}: ~{check.effectiveDpi} DPI
                          {check.isLowRes ? " — below KDP's 300 DPI minimum, may print blurry. Use a higher-resolution image." : " — meets KDP's 300 DPI minimum."}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trim Size Select */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <label className="text-xs font-black text-slate-800 block mb-2 uppercase">KDP Trim Size</label>
                <select
                  value={trimSize}
                  onChange={(e) => setTrimSize(e.target.value as T)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  {trimOptions.map((opt) => {
                    const locked = TIER_RANK[opt.tier] > userTierRank;
                    return (
                      <option key={opt.value} value={opt.value} disabled={locked}>
                        {opt.label} {locked && "🔒"}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Advanced Margin Setup */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-black text-slate-800 block">Include Page Numbers</label>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Add index footers to puzzle pages</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includePageNumbers}
                    onChange={(e) => setIncludePageNumbers(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="h-px bg-slate-200" />

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-black text-slate-800 block">Add Print Bleed</label>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Extends page 0.125" for edge-to-edge images</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasBleed}
                    onChange={(e) => setHasBleed(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="h-px bg-slate-200" />

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-black text-slate-800 block">Show Alignment Guidelines</label>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Visual guides for margins/safe zones</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showGuides}
                    onChange={(e) => setShowGuides(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Decorative Page Border Theme */}
              {showBorderThemePicker && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <label className="text-xs font-black text-slate-800 block mb-1">Page Border Theme</label>
                <span className="text-[9px] font-bold text-slate-400 block uppercase mb-3">Decorative frame around each page, content area stays untouched</span>
                <div className="grid grid-cols-5 gap-2">
                  {BORDER_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setBorderTheme(theme.id)}
                      title={theme.name}
                      className={`aspect-square rounded-xl border-2 flex items-center justify-center transition cursor-pointer ${
                        borderTheme === theme.id ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-200 hover:border-slate-300"
                      }`}
                      style={theme.id === "none" ? { background: "#fff" } : { background: theme.swatch }}
                    >
                      {theme.id === "none" && <span className="text-[9px] font-black text-slate-400 uppercase">None</span>}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] font-bold text-slate-500 block mt-2">
                  {BORDER_THEMES.find((t) => t.id === borderTheme)?.name}
                </span>
              </div>
              )}

              {/* Solution Keys option if applicable */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex justify-between items-center">
                <div>
                  <label className="text-xs font-black text-slate-800 block">Include Solution Keys</label>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Appends puzzles keys at the end</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeSolutions}
                  onChange={(e) => setIncludeSolutions(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* License / LTD Redemption Section inside modal */}
              {!premiumStatus.isPremium && (
                <form onSubmit={handleRedeemCode} className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-indigo-950 uppercase tracking-wide">
                    <Ticket className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Redeem Lifetime License / Code</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    Have a lifetime deal or license code? Enter your code below to unlock instant 300 DPI downloads!
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. DEALFUEL-XXXX-XXXX or License Key"
                      value={appsumoCode}
                      onChange={(e) => setAppsumoCode(e.target.value)}
                      className="flex-grow bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 placeholder-slate-400 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isRedeeming}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2 rounded-xl transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isRedeeming ? "..." : "Unlock"}
                    </button>
                  </div>
                  {redemptionError && (
                    <div className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-lg leading-normal">
                      {redemptionError}
                    </div>
                  )}
                  {redemptionSuccess && (
                    <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-lg leading-normal">
                      {redemptionSuccess}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-5">
              {premiumStatus.isPremium ? (
                <button
                  onClick={handleActionExport}
                  disabled={isExporting || (includeCover && !hasSavedCover)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Compiling 300 DPI Vector PDF...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      Export 300 DPI Print-Ready PDF
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href="/pricing"
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-orange-500/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-95 text-center uppercase tracking-wider"
                >
                  <Lock className="w-4 h-4" />
                  {premiumStatus.isTrial ? "Activate Paid Plan to Download 300 DPI PDF →" : "Unlock Pro to Download 300 DPI PDF →"}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
