"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, X, Copy, Check, ArrowRight, ShieldCheck, Tag, Gift } from "lucide-react";

const STORAGE_KEY = "kdpage_exit_intent_seen_forever";

export default function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const couponCode = "LAUNCH30";

  const closeModal = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    } catch {
      // Fallback if clipboard API unavailable
      setHasCopied(true);
    }
  };

  useEffect(() => {
    // Check if the user has EVER seen or dismissed this modal on this browser
    try {
      if (
        localStorage.getItem(STORAGE_KEY) === "true" ||
        sessionStorage.getItem(STORAGE_KEY) === "true"
      ) {
        return;
      }
    } catch {
      return;
    }

    let minTimeElapsed = false;
    // Don't trigger until user has spent at least 15 seconds on the site
    const timer = setTimeout(() => {
      minTimeElapsed = true;
    }, 15000);

    const handleMouseLeave = (e: MouseEvent) => {
      try {
        if (localStorage.getItem(STORAGE_KEY) === "true") return;
      } catch {}

      // Trigger when cursor moves toward top browser bar (leaving the page)
      if (minTimeElapsed && e.clientY <= 10) {
        setIsOpen(true);
        // Mark as permanently seen right when it opens so it NEVER appears again
        try {
          localStorage.setItem(STORAGE_KEY, "true");
          sessionStorage.setItem(STORAGE_KEY, "true");
        } catch {}
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#0b0f19] border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Glow ambient effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer border border-slate-800"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-wider">
          <Gift className="w-3.5 h-3.5 text-amber-400" /> Exclusive Creator Discount
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h2
            id="exit-intent-title"
            className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight"
          >
            Wait! Ready to Launch Your Bestselling KDP Book?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Don&apos;t spend hours formatting manually. Claim an exclusive <strong>30% OFF</strong> your first month of KDPage Pro and generate complete 100-page books in 60 seconds.
          </p>
        </div>

        {/* Coupon Box */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-left">
            <Tag className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Promo Code (30% Off):
              </span>
              <span className="text-lg font-mono font-black text-amber-400 tracking-wider">
                {couponCode}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyCoupon}
            className="px-4 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Feature Highlights */}
        <ul className="grid grid-cols-2 gap-2 text-left text-[11px] text-slate-300 font-semibold">
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>100-Page Bulk Book Exports</span>
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Full Wrap-Around Cover Studio</span>
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Commercial Rights Included</span>
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>All 7 Algorithmic Puzzle Engines</span>
          </li>
        </ul>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            href={`/pricing?coupon=${couponCode}`}
            onClick={closeModal}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-95 text-center"
          >
            <span>Claim 30% Discount &amp; Upgrade</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>

          <button
            type="button"
            onClick={closeModal}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            No thanks, I prefer building books manually
          </button>
        </div>
      </div>
    </div>
  );
}
