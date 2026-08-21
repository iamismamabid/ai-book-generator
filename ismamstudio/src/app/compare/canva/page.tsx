import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calculator,
  Grid3x3,
  Layers,
  ChevronRight,
  HelpCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Canva vs KDPage for Amazon KDP (2026 Comparison) — Why Canva Fails for KDP",
  description:
    "Comparing Canva vs KDPage for Amazon KDP book creation. Discover why Canva lacks automatic KDP spine calculations, bleed & gutter alignment, and automated puzzle generation — and why KDPage is built specifically for self-publishers.",
  alternates: {
    canonical: "https://www.kdpage.com/compare/canva",
  },
  keywords: [
    "canva for kdp",
    "canva vs kdpage",
    "canva kdp book creator",
    "canva kdp cover spine calculator",
    "canva amazon kdp puzzle book",
    "canva alternative for kdp",
    "best software for amazon kdp books",
    "kdp book design tools"
  ],
  openGraph: {
    title: "Canva vs KDPage for Amazon KDP (2026 Comparison)",
    description:
      "Why Canva struggles with Amazon KDP print requirements vs KDPage's dedicated self-publishing toolkit.",
    url: "https://www.kdpage.com/compare/canva",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Canva vs KDPage" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canva vs KDPage for Amazon KDP (2026)",
    description: "Compare Canva vs KDPage: Spine calculation, bleed margins, puzzle algorithms, and print PDF exports.",
    images: ["/og-image.png"],
  },
};

const FAQ_ITEMS = [
  {
    q: "Can I use Canva to make Amazon KDP books?",
    a: "Yes, but Canva is a general graphic design app, not a book publishing tool. Canva requires you to manually calculate complex spine widths, manually configure 0.125\" bleed margins, and manually lay out every single puzzle cell by hand — which takes days and often leads to Amazon print rejection errors.",
  },
  {
    q: "How does KDPage solve the KDP spine calculation problem that Canva has?",
    a: "In Canva, you have to find third-party formulas, calculate spine pixels, and manually drag guide lines. On KDPage, you simply type your page count and select paper type (White, Cream, Color). The Cover Studio dynamically recalculates and draws the exact wrap-around template with safety zones in real-time.",
  },
  {
    q: "Can Canva generate Sudoku, Mazes, and Word Searches automatically?",
    a: "No. Canva has no algorithmic puzzle engines or single-solution backtracking solvers. KDPage generates hundreds of unique puzzle pages and solution answer keys in seconds with 300 DPI vector clarity.",
  },
  {
    q: "Will Amazon reject Canva KDP interiors?",
    a: "Amazon frequently rejects Canva interiors due to margin cutoff errors, RGB color shift, or duplicate template bans when publishers use pre-made Canva templates shared by tens of thousands of other creators.",
  },
];

const COMPARISON_FEATURES = [
  {
    feature: "Automated KDP Spine Width Calculation",
    kdpage: "Instant dynamic calculation based on page count & paper stock",
    canva: "None (must be calculated externally and manually set)",
    kdpageWins: true,
  },
  {
    feature: "Algorithmic Puzzle & Maze Generation",
    kdpage: "1-click generation of Sudoku, Mazes, Word Search with solution keys",
    canva: "None (requires manual cell-by-cell drawing)",
    kdpageWins: true,
  },
  {
    feature: "Print-Ready KDP Bleed & Gutter Margins",
    kdpage: "Built-in 0.125\" bleed and gutter safety compliance",
    canva: "Generic bleed that often fails Amazon's strict binding checks",
    kdpageWins: true,
  },
  {
    feature: "Commercial Use Royalty-Free Rights",
    kdpage: "100% royalty-free commercial rights on all exported books",
    canva: "Complex license terms for elements, fonts, and stock assets",
    kdpageWins: true,
  },
  {
    feature: "ISBN Barcode & KDP Checklist Integration",
    kdpage: "Built-in EAN-13 barcode generator & pre-flight PDF validator",
    canva: "Third-party plugin required or manual copy-paste",
    kdpageWins: true,
  },
  {
    feature: "300 DPI Vector PDF Export",
    kdpage: "Native vector PDF export at 300 DPI with CMYK compatibility",
    canva: "PDF Print requires Pro subscription; often downsamples vectors",
    kdpageWins: true,
  },
];

export default function CanvaComparisonPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Canva vs KDPage for Amazon KDP (2026 Comparison)",
        description: "Comprehensive comparison between Canva and KDPage for KDP publishers.",
        url: "https://www.kdpage.com/compare/canva",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.kdpage.com" },
          { "@type": "ListItem", position: 2, name: "Compare", item: "https://www.kdpage.com/compare" },
          { "@type": "ListItem", position: 3, name: "Canva vs KDPage", item: "https://www.kdpage.com/compare/canva" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href="/compare" className="hover:text-indigo-400 transition-colors">Compare</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200">Canva vs KDPage</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            General Design vs Dedicated KDP Toolkit
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Canva vs KDPage: <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Why Canva Fails for KDP</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            Canva is great for social media graphics, but struggles with KDP spine calculations, bleed tolerances, and algorithmic puzzle generation. See why KDPage is the dedicated publisher choice.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/studio"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Start in KDPage Studio (Free)
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tools/spine-calculator"
              className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition-all"
            >
              Free KDP Spine Calculator
            </Link>
          </div>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-b from-indigo-950/50 to-slate-900/80 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-black text-white flex items-center gap-2">
                <span>KDPage</span>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950">Built for KDP</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">100% Print-Ready</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm font-medium mb-6">
              Tailored specifically for Amazon KDP print specifications, automated spine calculations, 300 DPI vector interiors, and puzzle generation.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Live spine calculation and wrap-around canvas guides</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1-Click algorithmic Sudoku, Mazes, Word Search generation</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Pre-flight KDP file validator to prevent Amazon upload rejections</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 30+ free standalone publisher tools</li>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-black text-slate-300">Canva</div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1 rounded-full">General Graphic Design</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mb-6">
              General graphics suite built for social media banners, presentations, and flyers — lacks book publishing and algorithmic tools.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> No automatic spine calculator for wrap-around book covers</li>
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> No puzzle generators (requires manual cell drawing)</li>
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> High risk of Amazon rejection from manual bleed mistakes</li>
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> Shared template packs cause duplicate content flags</li>
            </ul>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-white">Feature Comparison: Canva vs KDPage</h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
              Why KDP self-publishers save hours every week by choosing purpose-built software.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-4">Publishing Requirement</th>
                  <th className="py-4 px-4 text-cyan-400 font-black">KDPage</th>
                  <th className="py-4 px-4 text-slate-400">Canva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {COMPARISON_FEATURES.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-white max-w-xs">{item.feature}</td>
                    <td className="py-4 px-4 text-cyan-200">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item.kdpage}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{item.canva}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Canva vs KDPage FAQs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {FAQ_ITEMS.map((faq, index) => (
              <div key={index} className="bg-slate-800/40 border border-slate-800/80 rounded-2xl p-6 space-y-2">
                <h3 className="text-base font-bold text-white">{faq.q}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-cyan-950/80 via-indigo-950/80 to-slate-900 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Stop Fighting With Generic Design Tools
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Create 100% compliant Amazon KDP book covers and interiors in minutes with automated spine sizing and vector exports.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/studio"
              className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              Open KDPage Studio Free
            </Link>
            <Link
              href="/tools"
              className="px-8 py-4 rounded-2xl bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-400/30 text-white font-bold text-sm transition-all"
            >
              Explore Free KDP Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
