"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Palette,
  Calculator,
  Grid3X3,
  FileText,
  ShieldCheck,
  Layers,
  CheckCircle2,
  BookOpen
} from "lucide-react";

interface NextStepWorkflowLoopProps {
  /** Optional override for contextual category: 'interior' | 'cover' | 'listing' | 'pricing' */
  category?: "interior" | "cover" | "listing" | "pricing";
  /** Optional flag if triggered immediately after a user download */
  justDownloaded?: boolean;
  onDismissCelebration?: () => void;
}

export default function NextStepWorkflowLoop({
  category,
  justDownloaded = false,
  onDismissCelebration,
}: NextStepWorkflowLoopProps) {
  const pathname = usePathname() || "";

  // Determine context category from pathname if not explicitly passed
  const resolvedCategory = React.useMemo(() => {
    if (category) return category;
    if (
      pathname.includes("puzzle") ||
      pathname.includes("interior") ||
      pathname.includes("sudoku") ||
      pathname.includes("maze") ||
      pathname.includes("word-search") ||
      pathname.includes("coloring") ||
      pathname.includes("pattern")
    ) {
      return "interior";
    }
    if (pathname.includes("cover") || pathname.includes("spine")) {
      return "cover";
    }
    if (
      pathname.includes("description") ||
      pathname.includes("keyword") ||
      pathname.includes("trademark") ||
      pathname.includes("isbn")
    ) {
      return "listing";
    }
    if (pathname.includes("cost") || pathname.includes("royalty") || pathname.includes("kenp")) {
      return "pricing";
    }
    return "interior";
  }, [category, pathname]);

  // Define tailored next steps based on user's current workflow stage
  const workflowConfig = React.useMemo(() => {
    switch (resolvedCategory) {
      case "interior":
        return {
          badge: "Publishing Workflow — Step 2 of 4",
          heading: "Got Your Interior? Design the Matching Cover Next",
          subheading:
            "Amazon KDP requires an exact wrap-around cover with dynamic spine thickness and 0.125\" bleed margins. Complete your book now:",
          steps: [
            {
              stepNum: "01",
              title: "Automated KDP Cover Creator",
              desc: "Auto-calculates spine width from page count, paper type, and bleed so your cover passes Amazon print check.",
              href: "/tools/kdp-cover-creator",
              cta: "Create Cover Blueprint",
              icon: <Palette className="w-5 h-5 text-amber-400" />,
              accent: "border-amber-500/30 hover:border-amber-400 bg-amber-500/5",
              btnAccent: "bg-amber-400 hover:bg-amber-300 text-slate-950",
              tag: "Recommended Next Step",
            },
            {
              stepNum: "02",
              title: "Amazon Print Cost & Royalty Calculator",
              desc: "Verify your manufacturing print cost and discover your minimum retail list price to maximize 60% royalties.",
              href: "/tools/print-cost-calculator",
              cta: "Calculate Royalty",
              icon: <Calculator className="w-5 h-5 text-emerald-400" />,
              accent: "border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/5",
              btnAccent: "bg-emerald-500 hover:bg-emerald-400 text-white",
              tag: "Pricing & Profit",
            },
            {
              stepNum: "03",
              title: "KDP Description HTML Formatter",
              desc: "Format approved Amazon HTML (<h2>, <b>, <ul>) with character counters and live Amazon product page mockup.",
              href: "/tools/kdp-book-description-generator",
              cta: "Format Description",
              icon: <FileText className="w-5 h-5 text-indigo-400" />,
              accent: "border-indigo-500/30 hover:border-indigo-400 bg-indigo-500/5",
              btnAccent: "bg-indigo-600 hover:bg-indigo-500 text-white",
              tag: "Listing Optimization",
            },
          ],
        };

      case "cover":
        return {
          badge: "Publishing Workflow — Step 2 of 4",
          heading: "Cover Ready? Pair It with Unique Interiors & Safe Metadata",
          subheading:
            "A great cover needs a compelling, high-quality interior to earn 5-star reviews on Amazon. Explore your next publishing steps:",
          steps: [
            {
              stepNum: "01",
              title: "KDP Puzzle Generator (12+ Types)",
              desc: "Generate mathematically unique Word Searches, Sudokus, Mazes, and Cryptograms with automatic answer keys.",
              href: "/tools/kdp-puzzle-generator",
              cta: "Generate Free Puzzles",
              icon: <Grid3X3 className="w-5 h-5 text-amber-400" />,
              accent: "border-amber-500/30 hover:border-amber-400 bg-amber-500/5",
              btnAccent: "bg-amber-400 hover:bg-amber-300 text-slate-950",
              tag: "Interior Creator",
            },
            {
              stepNum: "02",
              title: "Trademark Infringement Checker",
              desc: "Safeguard your Amazon KDP account by verifying your book title and subtitle against live USPTO trademark databases.",
              href: "/tools/trademark-checker",
              cta: "Scan Title Trademarks",
              icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
              accent: "border-rose-500/30 hover:border-rose-400 bg-rose-500/5",
              btnAccent: "bg-rose-500 hover:bg-rose-400 text-white",
              tag: "Account Protection",
            },
            {
              stepNum: "03",
              title: "KDP Print Cost & Minimum Price",
              desc: "Calculate Amazon's exact printing costs across US, UK, and EU to ensure healthy profit margins on your book.",
              href: "/tools/print-cost-calculator",
              cta: "Check Print Pricing",
              icon: <Calculator className="w-5 h-5 text-emerald-400" />,
              accent: "border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/5",
              btnAccent: "bg-emerald-500 hover:bg-emerald-400 text-white",
              tag: "Financial Planning",
            },
          ],
        };

      case "listing":
        return {
          badge: "Publishing Workflow — Step 3 of 4",
          heading: "Listing Ready? Prepare Your Interior & Cover Files",
          subheading:
            "Ensure your manuscript files and wrap-around cover pass Amazon's automated previewer inspection on the first try:",
          steps: [
            {
              stepNum: "01",
              title: "Automated KDP Cover Creator",
              desc: "Get pixel-perfect 300 DPI cover blueprints with automated spine widths and 0.125\" bleed margins.",
              href: "/tools/kdp-cover-creator",
              cta: "Design Book Cover",
              icon: <Palette className="w-5 h-5 text-amber-400" />,
              accent: "border-amber-500/30 hover:border-amber-400 bg-amber-500/5",
              btnAccent: "bg-amber-400 hover:bg-amber-300 text-slate-950",
              tag: "Essential Step",
            },
            {
              stepNum: "02",
              title: "KDP File & Bleed Validator",
              desc: "Pre-flight inspect your interior PDF dimensions, page counts, and safety margins before submitting to Amazon.",
              href: "/tools/kdp-file-validator",
              cta: "Validate PDF",
              icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
              accent: "border-cyan-500/30 hover:border-cyan-400 bg-cyan-500/5",
              btnAccent: "bg-cyan-500 hover:bg-cyan-400 text-slate-950",
              tag: "Pre-Flight Check",
            },
            {
              stepNum: "03",
              title: "Free Interior Templates Library",
              desc: "Download lined journals, Cornell notes, daily planners, and habit trackers pre-sized to standard KDP trims.",
              href: "/tools/interior-templates",
              cta: "Download Interiors",
              icon: <BookOpen className="w-5 h-5 text-indigo-400" />,
              accent: "border-indigo-500/30 hover:border-indigo-400 bg-indigo-500/5",
              btnAccent: "bg-indigo-600 hover:bg-indigo-500 text-white",
              tag: "Instant PDF Downloads",
            },
          ],
        };

      case "pricing":
      default:
        return {
          badge: "Publishing Workflow — Next Steps",
          heading: "Numbers Look Profitable? Start Creating Your Book Now",
          subheading:
            "Turn your calculated margins into a published paperback or hardcover. Follow this streamlined workflow:",
          steps: [
            {
              stepNum: "01",
              title: "KDP Puzzle Generator",
              desc: "Generate high-demand puzzle interiors with automatic answer keys and 100% single-solution guarantees.",
              href: "/tools/kdp-puzzle-generator",
              cta: "Create Puzzles Free",
              icon: <Grid3X3 className="w-5 h-5 text-amber-400" />,
              accent: "border-amber-500/30 hover:border-amber-400 bg-amber-500/5",
              btnAccent: "bg-amber-400 hover:bg-amber-300 text-slate-950",
              tag: "Interior Creator",
            },
            {
              stepNum: "02",
              title: "Automated KDP Cover Creator",
              desc: "Calculate exact spine thickness for your page count and generate print-ready full-wrap cover blueprints.",
              href: "/tools/kdp-cover-creator",
              cta: "Create Cover",
              icon: <Palette className="w-5 h-5 text-indigo-400" />,
              accent: "border-indigo-500/30 hover:border-indigo-400 bg-indigo-500/5",
              btnAccent: "bg-indigo-600 hover:bg-indigo-500 text-white",
              tag: "Cover Designer",
            },
            {
              stepNum: "03",
              title: "KDPage Studio (All-in-One)",
              desc: "Compile complete 100-page manuscripts with custom covers, pagination, and vector exports in 1 click.",
              href: "/studio",
              cta: "Open Studio Free",
              icon: <Layers className="w-5 h-5 text-emerald-400" />,
              accent: "border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/5",
              btnAccent: "bg-emerald-500 hover:bg-emerald-400 text-white",
              tag: "All-in-One Engine",
            },
          ],
        };
    }
  }, [resolvedCategory]);

  return (
    <div className="w-full my-12 space-y-6">
      {/* Optional Post-Download Celebration Banner */}
      {justDownloaded && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 relative shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  🎉 Download Started Successfully!
                </div>
                <h3 className="text-lg font-black text-white">
                  What is your next step to publish this on Amazon?
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Don&apos;t stop now. Complete your book cover, check Amazon print specifications, and get ready to earn royalties.
                </p>
              </div>
            </div>

            {onDismissCelebration && (
              <button
                type="button"
                onClick={onDismissCelebration}
                className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition shrink-0"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Next Steps Section */}
      <section className="bg-slate-900/50 border border-slate-800/90 rounded-[2.5rem] p-6 sm:p-10 space-y-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              {workflowConfig.badge}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {workflowConfig.heading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {workflowConfig.subheading}
            </p>
          </div>

          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider border border-slate-700 transition hover:border-indigo-400/40 shrink-0 shadow-sm"
          >
            <span>Or Open KDPage Studio</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          </Link>
        </div>

        {/* Next Step 3-Card Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {workflowConfig.steps.map((step) => (
            <div
              key={step.title}
              className={`rounded-2xl border p-6 flex flex-col justify-between space-y-4 transition-all hover:scale-[1.01] hover:shadow-xl ${step.accent}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800">
                    Step {step.stepNum}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                    {step.tag}
                  </span>
                  <h3 className="text-base font-black text-white leading-snug">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>

              <Link
                href={step.href}
                className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md active:scale-95 ${step.btnAccent}`}
              >
                <span>{step.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Fast-Track Bar */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All tools include 100% commercial publishing rights for Amazon KDP &amp; Etsy.</span>
          </div>
          <Link
            href="/tools"
            className="hover:text-white transition flex items-center gap-1 text-slate-300"
          >
            Explore all 30+ Free KDP Tools →
          </Link>
        </div>
      </section>
    </div>
  );
}
