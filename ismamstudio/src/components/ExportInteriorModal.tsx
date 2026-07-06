"use client";

import React, { useState, useEffect } from "react";
import { X, Settings2, FileDown, AlertTriangle, Loader2, Lock, Sparkles, ShieldCheck, Ticket, Info } from "lucide-react";
import { checkPremiumStatus, redeemAppSumoCode } from "@/app/actions";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface ExportInteriorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: {
    includeCover: boolean;
    coverState: any;
    includeSolutions: boolean;
    trimSize: "6x9" | "8.5x11" | "5x8";
    hasBleed: boolean;
    showGuides: boolean;
  }) => void | Promise<void>;
  defaultTrimSize?: "6x9" | "8.5x11" | "5x8";
  showSolutionsToggle?: boolean;
}

export default function ExportInteriorModal({
  isOpen,
  onClose,
  onExport,
  defaultTrimSize = "8.5x11",
  showSolutionsToggle = true,
}: ExportInteriorModalProps) {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [includeCover, setIncludeCover] = useState(false);
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [trimSize, setTrimSize] = useState<"6x9" | "8.5x11" | "5x8">(defaultTrimSize);
  const [hasBleed, setHasBleed] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [coverState, setCoverState] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  useEffect(() => {
    if (premiumStatus.checked) {
      if (premiumStatus.plan === "free") {
        setTrimSize("8.5x11");
      } else if (premiumStatus.plan === "starter" && trimSize === "5x8") {
        setTrimSize("8.5x11");
      }
    }
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

  // loading state
  if (!premiumStatus.checked) {
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-sm w-full flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-650 mb-3" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Checking Account Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-indigo-650/10 rounded-xl flex items-center justify-center text-indigo-600">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase">Export Book Interior</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configure layouts and covers</p>
          </div>
        </div>

        {/* Free Plan Warning Banner */}
        {!premiumStatus.isPremium && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-850 rounded-2xl text-[11px] font-semibold mb-4 space-y-2">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-slate-850 block">Free Account Sample Warning</span>
                <p className="text-slate-600 text-[10px] leading-relaxed mt-0.5">
                  Exported KDP interior compile files will include a light diagonal **"SAMPLE - ISMAM STUDIO"** watermark on all pages. 
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

        {/* Free Trial Active Banner */}
        {premiumStatus.isTrial && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-2xl text-[11px] font-semibold mb-4 space-y-2">
            <div className="flex gap-2 items-start">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-slate-850 block">7-Day Premium Trial Active!</span>
                <p className="text-slate-600 text-[10px] leading-relaxed mt-0.5">
                  You have <span className="font-black text-emerald-650">{premiumStatus.daysRemaining} days remaining</span>. High-res watermark-free vector PDF exports are fully unlocked!
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-emerald-200/50 flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
              <Link href="/pricing" target="_blank" className="text-indigo-600 hover:text-indigo-550">
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
              <div className="flex gap-2 items-start bg-indigo-50 border border-indigo-200 text-indigo-850 p-2.5 rounded-xl text-[10px] font-semibold leading-normal">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>KDP Notice:</strong> Amazon KDP requires uploading the <strong>Interior</strong> and <strong>Cover</strong> as two separate PDF files. Including the cover here is only for digital reading/e-book layout. For KDP paperback publishing, export your cover separately from the Book & Cover Studio.
                </span>
              </div>
            )}
          </div>

          {/* Trim Size Select */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <label className="text-xs font-black text-slate-800 block mb-2 uppercase">KDP Trim Size</label>
            <select
              value={trimSize}
              onChange={(e) => setTrimSize(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-650"
            >
              <option value="8.5x11">8.5″ × 11″ (Large Print / Puzzle Book)</option>
              <option 
                value="6x9" 
                disabled={premiumStatus.plan === "free"}
              >
                6″ × 9″ {premiumStatus.plan === "free" ? "(Locked - Upgrade to Starter/Pro)" : "(Standard Novel)"}
              </option>
              <option 
                value="5x8" 
                disabled={premiumStatus.plan === "free" || premiumStatus.plan === "starter"}
              >
                5″ × 8″ {premiumStatus.plan === "free" || premiumStatus.plan === "starter" ? "(Locked - Upgrade to Pro)" : "(Pocket Booklet)"}
              </option>
            </select>
          </div>

          {/* Solution toggle (Conditional) */}
          {showSolutionsToggle && (
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <div>
                <label className="text-xs font-black text-slate-800 block cursor-pointer select-none" htmlFor="includeSolutionsCheck">
                  Include Answer Keys
                </label>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Append solution grids at the end</span>
              </div>
              <input
                type="checkbox"
                id="includeSolutionsCheck"
                checked={includeSolutions}
                onChange={(e) => setIncludeSolutions(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>
          )}

          {/* Layout Checklist Guides & Bleed */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
            <label className="text-xs font-black text-slate-800 block uppercase">KDP Specifications</label>
            
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-650 select-none">
              <input
                type="checkbox"
                checked={hasBleed}
                onChange={(e) => setHasBleed(e.target.checked)}
                className="rounded accent-indigo-650 text-slate-900"
              />
              Bleed (+0.125″ KDP edges)
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-650 select-none">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="rounded accent-indigo-650 text-slate-900"
              />
              Show Safe Margins Guide
            </label>
          </div>

          {/* Inline AppSumo Redemption Box for Free users */}
          {!premiumStatus.isPremium && (
            <form onSubmit={handleRedeemCode} className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-3">
              <div>
                <label htmlFor="modalAppSumoCode" className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5 cursor-pointer">
                  <Ticket className="w-4 h-4 text-emerald-600" /> Unlock Watermark-Free Downloads?
                </label>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Redeem AppSumo code directly to remove watermark</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="modalAppSumoCode"
                  placeholder="e.g. SUMO-XXXX-XXXX"
                  value={appsumoCode}
                  onChange={(e) => setAppsumoCode(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  disabled={isRedeeming || !appsumoCode.trim()}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer flex items-center justify-center min-w-[80px]"
                >
                  {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
                </button>
              </div>

              {redemptionError && (
                <div className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                  {redemptionError}
                </div>
              )}
              {redemptionSuccess && (
                <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
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
  );
}
