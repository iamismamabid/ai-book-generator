"use client";

import Link from "next/link";
import { Palette, ArrowRight, BookOpen } from "lucide-react";

interface CoverStudioCTAProps {
  /** "banner" = full-width card; "inline" = compact sidebar card */
  variant?: "banner" | "inline";
  /** Optionally pre-select trim size in Cover Studio (e.g. "6x9", "8.5x11") */
  trimSize?: string;
}

export default function CoverStudioCTA({
  variant = "inline",
  trimSize,
}: CoverStudioCTAProps) {
  const href = `/studio?tab=cover${trimSize ? `&trim=${trimSize}` : ""}`;

  if (variant === "banner") {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 backdrop-blur-md shadow-2xl shadow-indigo-500/10 p-8 mt-8">
        {/* Ambient glow blobs */}
        <div className="absolute -top-8 -left-8 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Accent top line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-t-[2rem]" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Icon */}
          <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Palette className="w-7 h-7 text-white" />
          </div>

          {/* Copy */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">
              Next Step
            </p>
            <h3 className="text-xl font-black text-white leading-tight">
              Design Your Book Cover
            </h3>
            <p className="text-sm text-slate-400 font-semibold mt-1 leading-relaxed">
              Your interior is ready — now create a professional front &amp; back
              cover in the Cover Studio. Full bleed, spine calculator &amp;
              KDP-ready export included.
            </p>
          </div>

          {/* CTA Button */}
          <Link
            href={href}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98] whitespace-nowrap"
          >
            <Palette className="w-4 h-4" />
            Open Cover Studio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── INLINE variant (compact sidebar card) ────────────────────────────────
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 to-purple-950/60 backdrop-blur-sm p-4">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-t-2xl" />

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="shrink-0 w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 mt-0.5">
          <BookOpen className="w-4 h-4 text-white" />
        </div>

        {/* Copy + button stacked */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">
            Complete Your Book
          </p>
          <p className="text-xs font-bold text-white leading-snug mb-2.5">
            Design a matching front &amp; back cover in the Cover Studio
          </p>
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-[11px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-px active:scale-[0.98]"
          >
            <Palette className="w-3 h-3" />
            Cover Studio
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
