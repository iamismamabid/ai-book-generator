"use client";

import React, { useState, useEffect } from "react";
import { X, Settings2, FileDown, AlertTriangle, Loader2, Lock, Sparkles, ShieldCheck, Ticket, Info } from "lucide-react";
import { checkPremiumStatus, redeemAppSumoCode } from "@/app/actions";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { createPortal } from "react-dom";

export interface TrimSizeOption<T extends string> {
  value: T;
  label: string;
  /** Minimum plan tier required to select this trim size. */
  tier: "free" | "starter" | "pro";
}

const DEFAULT_TRIM_OPTIONS: TrimSizeOption<"6x9" | "8.5x11" | "5x8">[] = [
  { value: "8.5x11", label: '8.5″ × 11″ (Large Print / Puzzle Book)', tier: "free" },
  { value: "6x9", label: '6″ × 9″ (Novel / Workbook)', tier: "starter" },
  { value: "5x8", label: '5″ × 8″ (Pocket Book)', tier: "pro" },
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
  }) => void | Promise<void>;
  defaultTrimSize?: T;
  showSolutionsToggle?: boolean;
  /** Override the selectable trim sizes. Defaults to the standard 3-size KDP set. */
  trimSizeOptions?: TrimSizeOption<T>[];
}

export default function ExportInteriorModal<T extends string = "6x9" | "8.5x11" | "5x8">({
  isOpen,
  onClose,
  onExport,
  defaultTrimSize = "8.5x11" as T,
  showSolutionsToggle = true,
  trimSizeOptions,
}: ExportInteriorModalProps<T>) {
  const trimOptions = (trimSizeOptions ?? DEFAULT_TRIM_OPTIONS) as unknown as TrimSizeOption<T>[];
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [includeCover, setIncludeCover] = useState(false);
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [trimSize, setTrimSize] = useState<T>(defaultTrimSize);
  const [hasBleed, setHasBleed] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
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
      });
    } catch (e) {
      console.error("Failed to check premium status:", e);
      setPremiumStatus({ checked: true, isPremium: false });
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
        setPremiumStatus({ checked: true, isPremium: true });
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
        <div className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
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

            {/* Free Plan Warning Banner */}
            {!premiumStatus.isPremium && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-[11px] font-semibold mb-4 space-y-2">
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-slate-900 block">Free Account Sample Warning</span>
                    <p className="text-slate-600 text-[10px] leading-relaxed mt-0.5">
                      Exported KDP interior compile files will include a light diagonal **"SAMPLE - KDPAGE"** watermark on all pages. 
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-amber-200/50 flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                  <Link href="/pricing" target="_blank" className="text-indigo-600 hover:text-indigo-500">
                    Upgrade to Remove Watermark →
                  </Link>
                </div>
              </div>
            )}

            {/* Premium Activated Indicator */}
            {premiumStatus.isPremium && (
              <div className="p-4 bg-emerald-50 border border-emerald-200/50 text-emerald-950 rounded-2xl text-[11px] font-semibold mb-4 space-y-2">
                <div className="flex gap-2 items-start">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-slate-900 block">Premium Export Mode Activated</span>
                    <p className="text-slate-600 text-[10px] leading-relaxed mt-0.5">
                      You have <span className="font-black text-emerald-600">{premiumStatus.daysRemaining} days remaining</span>. High-res watermark-free vector PDF exports are fully unlocked!
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-200/50 flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                  <Link href="/pricing" target="_blank" className="text-indigo-600 hover:text-indigo-600">
                    View Pricing Plans & LTDs →
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

              {/* AppSumo Redemption Section inside modal */}
              {!premiumStatus.isPremium && (
                <form onSubmit={handleRedeemCode} className="p-4 bg-indigo-50/50 border border-indigo-200/60 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-950 uppercase tracking-wide">
                    <Ticket className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Redeem AppSumo Code</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold leading-normal">
                    Purchased an AppSumo LTD code? Paste your redemption license key below to unlock all high-res features instantly.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. active-XXXXX"
                      value={appsumoCode}
                      onChange={(e) => setAppsumoCode(e.target.value)}
                      className="flex-grow bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="submit"
                      disabled={isRedeeming}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2 rounded-xl transition disabled:opacity-50"
                    >
                      {isRedeeming ? "..." : "Redeem"}
                    </button>
                  </div>
                  {redemptionError && (
                    <div className="text-[9px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-lg leading-normal">
                      {redemptionError}
                    </div>
                  )}
                  {redemptionSuccess && (
                    <div className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-lg leading-normal">
                      {redemptionSuccess}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-5">
              <button
                onClick={handleActionExport}
                disabled={isExporting || (includeCover && !hasSavedCover)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-black hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 transition cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Compiling Interior...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    {premiumStatus.isPremium ? "Export Interior PDF" : "Download Watermarked PDF"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
