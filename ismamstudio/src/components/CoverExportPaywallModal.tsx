"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, ShieldCheck, Ticket, Loader2, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { checkPremiumStatus, redeemAppSumoCode } from "@/app/actions";

interface CoverExportPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockedAndExport: () => void;
  coverSpecs?: {
    trimWidth: number;
    trimHeight: number;
    pageCount: number;
    fullWidthInches: number;
    fullHeightInches: number;
  };
}

export default function CoverExportPaywallModal({
  isOpen,
  onClose,
  onUnlockedAndExport,
  coverSpecs,
}: CoverExportPaywallModalProps) {
  const [code, setCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [trialStatus, setTrialStatus] = useState<{ isTrial: boolean; daysRemaining?: number }>({ isTrial: false });

  React.useEffect(() => {
    if (isOpen) {
      checkPremiumStatus()
        .then((st: any) => {
          if (st?.isTrial) {
            setTrialStatus({ isTrial: true, daysRemaining: st.daysRemaining });
          } else {
            setTrialStatus({ isTrial: false });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsRedeeming(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await redeemAppSumoCode(code.trim());
      if (res.success) {
        setSuccess("License code redeemed successfully! Unlocking your 300 DPI Cover PDF...");
        const status = await checkPremiumStatus();
        if (status.isPremium) {
          setTimeout(() => {
            onClose();
            onUnlockedAndExport();
          }, 800);
        }
      } else {
        setError(res.error || "Invalid license code. Please verify and try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify license code.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1">
              <Lock className="w-3 h-3" /> {trialStatus.isTrial ? "7-Day Free Trial Active" : "Pro Export Feature"}
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {trialStatus.isTrial ? "Activate Paid Plan to Export" : "Your 300 DPI Cover is Ready!"}
            </h3>
          </div>
        </div>

        <p className="text-slate-300 text-xs font-medium leading-relaxed mb-5">
          {trialStatus.isTrial
            ? "You have full access to design covers in the studio. To download high-resolution watermark-free 300 DPI vector PDF covers for Amazon KDP, please activate your paid plan."
            : "Designing covers in KDPage Studio is 100% free. Unlock instant high-resolution 300 DPI vector PDF export formatted for immediate Amazon KDP upload."}
        </p>

        {/* Cover Specs Card */}
        {coverSpecs && (
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 mb-5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-bold">KDP Trim Size:</span>
              <span className="text-white font-black">{coverSpecs.trimWidth}&quot; × {coverSpecs.trimHeight}&quot; ({coverSpecs.pageCount} Pages)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-bold">Full Wraparound Layout:</span>
              <span className="text-amber-400 font-black">{coverSpecs.fullWidthInches.toFixed(3)}&quot; × {coverSpecs.fullHeightInches.toFixed(3)}&quot; (300 DPI)</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60 text-[10px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Includes precise spine width, 0.125&quot; bleed &amp; Amazon barcode safe zone</span>
            </div>
          </div>
        )}

        {/* Direct Upgrade Button */}
        <div className="mb-5">
          <Link
            href="/pricing"
            target="_blank"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>{trialStatus.isTrial ? "⚡ Activate Paid Plan to Download Cover ($11.99/mo)" : "Unlock Pro & Download 300 DPI Cover ($11.99/mo)"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* License Key Redemption Section */}
        <form onSubmit={handleRedeem} className="p-4 bg-slate-950/60 border border-indigo-500/20 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-indigo-300 uppercase tracking-wide">
            <Ticket className="w-4 h-4 text-indigo-400" />
            <span>Already have a lifetime deal code?</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Paste your license key below to unlock lifetime 300 DPI exports instantly:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. DEALFUEL-XXXX-XXXX or License Key"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              disabled={isRedeeming || !code.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-5 py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock"}
            </button>
          </div>
          {error && (
            <div className="text-[10px] font-semibold text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2 rounded-lg leading-normal">
              {error}
            </div>
          )}
          {success && (
            <div className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 p-2 rounded-lg leading-normal">
              {success}
            </div>
          )}
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
