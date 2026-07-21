import Link from "next/link";
import { ArrowLeft, Check, X, Shield, Sparkles, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.kdpage.com/compare" },
  title: "Compare Plans & Features | KDPage Matrix",
  description: "View our detailed feature matrix. Compare Free, Starter, Pro, and Publisher Agency features side-by-side to find the right toolkit for your Amazon KDP self-publishing business.",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> View Pricing Cards
          </Link>
        </div>

        {/* Comparison Console */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8">
          
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Specs Comparison
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Detailed Plan Matrix
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-1">
              Compare features, usage limits, and commercial rights options side-by-side.
            </p>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-4">Core Capabilities</th>
                  <th className="py-4 px-4 text-center">Free Tier</th>
                  <th className="py-4 px-4 text-center">Starter</th>
                  <th className="py-4 px-4 text-center">Pro Studio</th>
                  <th className="py-4 px-4 text-center">Agency</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 font-semibold">
                <tr className="border-b border-slate-900 hover:bg-slate-900/10 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">Commercial Rights</td>
                  <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-indigo-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-amber-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-slate-900 hover:bg-slate-900/10 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">Watermark-Free Exports</td>
                  <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-indigo-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-amber-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-slate-900 hover:bg-slate-900/10 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">Trim Size Adjustments</td>
                  <td className="py-4 px-4 text-center">Basic (8.5x11)</td>
                  <td className="py-4 px-4 text-center">Standard sizes</td>
                  <td className="py-4 px-4 text-center">All sizes + Custom</td>
                  <td className="py-4 px-4 text-center">All + Custom + SVGs</td>
                </tr>
                <tr className="border-b border-slate-900 hover:bg-slate-900/10 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">Sudoku Puzzle Difficulty</td>
                  <td className="py-4 px-4 text-center">Easy Only</td>
                  <td className="py-4 px-4 text-center">Easy & Medium</td>
                  <td className="py-4 px-4 text-center">All (Easy, Med, Hard)</td>
                  <td className="py-4 px-4 text-center">All + Custom solutions</td>
                </tr>
                <tr className="border-b border-slate-900 hover:bg-slate-900/10 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">Maze Layout Shapes</td>
                  <td className="py-4 px-4 text-center">Square Only</td>
                  <td className="py-4 px-4 text-center">Square Only</td>
                  <td className="py-4 px-4 text-center">Square, Circle, Heart</td>
                  <td className="py-4 px-4 text-center">All + custom masking</td>
                </tr>
                <tr className="border-b border-slate-900 hover:bg-slate-900/10 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">Novel Chapter Limits</td>
                  <td className="py-4 px-4 text-center">1 Outline/mo</td>
                  <td className="py-4 px-4 text-center">5 Chapters/mo</td>
                  <td className="py-4 px-4 text-center">Unlimited</td>
                  <td className="py-4 px-4 text-center">Unlimited (Priority)</td>
                </tr>
                <tr className="border-b border-slate-900 hover:bg-slate-900/10 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">Pen-names / Brands</td>
                  <td className="py-4 px-4 text-center">1</td>
                  <td className="py-4 px-4 text-center">3</td>
                  <td className="py-4 px-4 text-center">Unlimited</td>
                  <td className="py-4 px-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-900 hover:bg-slate-900/10 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">Team seats</td>
                  <td className="py-4 px-4 text-center">1 Seat</td>
                  <td className="py-4 px-4 text-center">1 Seat</td>
                  <td className="py-4 px-4 text-center">1 Seat</td>
                  <td className="py-4 px-4 text-center">Up to 3 Seats</td>
                </tr>
                <tr className="hover:bg-slate-900/10 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">Customer Support</td>
                  <td className="py-4 px-4 text-center">Community</td>
                  <td className="py-4 px-4 text-center">Email (48h)</td>
                  <td className="py-4 px-4 text-center">Priority (&lt; 12h)</td>
                  <td className="py-4 px-4 text-center">Dedicated manager</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/studio"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-xl text-center shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5 hover:opacity-90"
            >
              Start Free Trial <Zap className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
