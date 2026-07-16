"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Printer, BookOpen, Layers, Shield, Key } from "lucide-react";
export default function KdpChecklistPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden print:bg-white print:text-black print:p-0">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 print:hidden" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-black flex items-center gap-2 transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print Checklist (PDF)
          </button>
        </div>

        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8 print:border-0 print:shadow-none print:p-0 print:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 print:hidden">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white print:text-black">The Ultimate KDP Bestseller Checklist</h1>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1 print:text-slate-600">KDPage Publishing Guide</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 print:bg-black" />

          {/* Guidelines info */}
          <div className="space-y-8 text-slate-300 text-sm font-medium leading-relaxed print:text-black">
            
            {/* Step 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-white print:text-black border-b border-slate-900 pb-2 print:border-slate-300">
                <Key className="w-5 h-5 text-indigo-400 print:text-black shrink-0" />
                <h3>Phase 1: Niche Validation & Keywords</h3>
              </div>
              <ul className="space-y-3 pl-6 list-disc text-slate-400 print:text-slate-900">
                <li><strong>Confirm Demand:</strong> Search Amazon in an Incognito tab and check if the BSR (Best Seller Rank) of the top 3 organic search results is under 100,000.</li>
                <li><strong>Verify Competition:</strong> Target keywords with fewer than 3,000 total search results to ensure high organic visibility.</li>
                <li><strong>Backend Keywords:</strong> Populate all 7 KDP backend keyword boxes. Do not repeat words from your title or subtitle; use phrases like "logic games for seniors" or "activity book for travel".</li>
              </ul>
            </section>

            {/* Step 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-white print:text-black border-b border-slate-900 pb-2 print:border-slate-300">
                <Layers className="w-5 h-5 text-indigo-400 print:text-black shrink-0" />
                <h3>Phase 2: Interior Layout & Margins</h3>
              </div>
              <ul className="space-y-3 pl-6 list-disc text-slate-400 print:text-slate-900">
                <li><strong>Trim Sizing:</strong> Standardize on 8.5" x 11" for large puzzles (e.g. Word Search, Mazes) and 6" x 9" for compact pocket puzzle books.</li>
                <li><strong>Gutter Buffer Check:</strong> Ensure inside gutters are at least 0.375" (for 24-150 pages) or 0.5" (for 151-300 pages) so grids don't disappear in the binding.</li>
                <li><strong>Bleed Verification:</strong> If your graphics extend to the page edge, set bleed options to "Yes" on KDP and add 0.125" to your width and 0.25" to your page height.</li>
              </ul>
            </section>

            {/* Step 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-white print:text-black border-b border-slate-900 pb-2 print:border-slate-300">
                <Shield className="w-5 h-5 text-indigo-400 print:text-black shrink-0" />
                <h3>Phase 3: Barcode & Wrap Cover</h3>
              </div>
              <ul className="space-y-3 pl-6 list-disc text-slate-400 print:text-slate-900">
                <li><strong>Spine Calculations:</strong> Calculate your exact cover wraps width: `Front Cover + Back Cover + Spine Width + 0.25" bleed`.</li>
                <li><strong>Barcode White Area:</strong> Leave a completely blank 2" wide × 1.2" high solid white rectangle in the bottom-right corner of the back cover.</li>
                <li><strong>Safety Clearance:</strong> Ensure the barcode placeholder is placed at least 0.25" away from the trim borders and spine fold lines.</li>
              </ul>
            </section>

            {/* Step 4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-white print:text-black border-b border-slate-900 pb-2 print:border-slate-300">
                <BookOpen className="w-5 h-5 text-indigo-400 print:text-black shrink-0" />
                <h3>Phase 4: Metadata & Launch</h3>
              </div>
              <ul className="space-y-3 pl-6 list-disc text-slate-400 print:text-slate-900">
                <li><strong>Subtitle Optimization:</strong> Keep your main title short, but use the subtitle to describe your target audience and exact specs (e.g. "100 Puzzles for Seniors, Large Print").</li>
                <li><strong>A+ Content:</strong> Set up Amazon A+ Content showcasing page mockups, puzzle samples, and solution pages.</li>
                <li><strong>Author Central:</strong> Register on Amazon Author Central and write an engaging bio to improve search ranking.</li>
              </ul>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-900 text-center print:hidden">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black rounded-xl text-sm hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/10 transition-all active:scale-95 shrink-0"
            >
              Start Creating Now (Free)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
