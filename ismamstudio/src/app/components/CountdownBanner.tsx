"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Copy, Check } from "lucide-react";

export default function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 17,
    minutes: 10,
    seconds: 19,
  });
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Persist or calculate target end date (4 days rolling countdown)
    const STORAGE_KEY = "kdpage_deal_end_time";
    let targetTime = 0;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        targetTime = parseInt(stored, 10);
      }
      // If expired or not set, create a new target 4 days, 17 hours from now
      if (!targetTime || targetTime <= Date.now()) {
        targetTime = Date.now() + (4 * 24 * 3600 + 17 * 3600 + 10 * 60 + 19) * 1000;
        localStorage.setItem(STORAGE_KEY, targetTime.toString());
      }
    } catch {
      targetTime = Date.now() + (4 * 24 * 3600 + 17 * 3600 + 10 * 60 + 19) * 1000;
    }

    const updateTimer = () => {
      const difference = targetTime - Date.now();
      if (difference <= 0) {
        // Reset rolling cycle
        targetTime = Date.now() + (4 * 24 * 3600 + 17 * 3600 + 10 * 60 + 19) * 1000;
        try {
          localStorage.setItem(STORAGE_KEY, targetTime.toString());
        } catch {}
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days: Math.max(0, d),
        hours: Math.max(0, h),
        minutes: Math.max(0, m),
        seconds: Math.max(0, s),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      navigator.clipboard.writeText("SWITCH50");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <aside 
      aria-label="Limited Time Offer"
      className="w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 py-1.5 sm:py-2 px-3 sm:px-4 z-50 shadow-md border-b border-amber-500/30 select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-4 lg:gap-6 flex-wrap text-xs font-black">
        
        {/* Deal Tagline */}
        <Link 
          href="/pricing"
          className="flex items-center gap-1.5 sm:gap-2 group hover:opacity-90 transition-opacity"
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm animate-pulse">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>LIMITED DEAL</span>
          </span>
          
          <span className="font-black text-slate-950 tracking-tight text-xs sm:text-sm whitespace-nowrap">
            50% OFF EVERY MONTH FOR LIFE
          </span>
        </Link>

        {/* Coupon Code Pill */}
        <button
          onClick={handleCopy}
          type="button"
          title="Click to copy coupon code"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/90 hover:bg-slate-950 text-amber-300 border border-amber-500/50 shadow-sm transition-all active:scale-95 cursor-pointer text-xs"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:inline">Coupon:</span>
          <span className="font-mono font-black tracking-wider text-amber-300 text-xs sm:text-sm">SWITCH50</span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-amber-400/80 hover:text-amber-300 shrink-0" />
          )}
        </button>

        {/* Countdown Timer Block (Self Publishing Titans Style) */}
        <Link
          href="/pricing"
          className="flex items-center gap-1 sm:gap-1.5 font-black text-slate-950 hover:opacity-90 transition-opacity"
        >
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-900 hidden sm:inline">
            Ends In
          </span>

          <div className="flex items-center gap-1 text-xs">
            {/* Days */}
            <div className="flex items-center gap-0.5">
              <span className="min-w-[22px] px-1 py-0.5 rounded bg-slate-950 text-amber-300 font-mono font-black text-center text-xs shadow-inner">
                {pad(timeLeft.days)}
              </span>
              <span className="text-[9px] font-extrabold uppercase text-slate-900">d</span>
            </div>
            <span className="font-black text-slate-900">:</span>

            {/* Hours */}
            <div className="flex items-center gap-0.5">
              <span className="min-w-[22px] px-1 py-0.5 rounded bg-slate-950 text-amber-300 font-mono font-black text-center text-xs shadow-inner">
                {pad(timeLeft.hours)}
              </span>
              <span className="text-[9px] font-extrabold uppercase text-slate-900">h</span>
            </div>
            <span className="font-black text-slate-900">:</span>

            {/* Minutes */}
            <div className="flex items-center gap-0.5">
              <span className="min-w-[22px] px-1 py-0.5 rounded bg-slate-950 text-amber-300 font-mono font-black text-center text-xs shadow-inner">
                {pad(timeLeft.minutes)}
              </span>
              <span className="text-[9px] font-extrabold uppercase text-slate-900">m</span>
            </div>
            <span className="font-black text-slate-900">:</span>

            {/* Seconds */}
            <div className="flex items-center gap-0.5">
              <span className="min-w-[22px] px-1 py-0.5 rounded bg-slate-950 text-amber-300 font-mono font-black text-center text-xs shadow-inner">
                {pad(timeLeft.seconds)}
              </span>
              <span className="text-[9px] font-extrabold uppercase text-slate-900">s</span>
            </div>
          </div>
        </Link>

        {/* CTA Button */}
        <Link
          href="/pricing"
          className="hidden md:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-950 hover:bg-slate-900 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-95 group shrink-0"
        >
          <span>Claim 50% Off</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>

      </div>
    </aside>
  );
}
