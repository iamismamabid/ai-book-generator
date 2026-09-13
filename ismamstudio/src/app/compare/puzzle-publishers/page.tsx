import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Award,
  ChevronRight,
  HelpCircle,
  Layers,
  Grid3x3
} from "lucide-react";

export const metadata: Metadata = {
  title: "Best Puzzle Publishers Alternative (2026) — KDPage vs Puzzle Publishers",
  description:
    "Looking for a modern Puzzle Publishers alternative? Compare KDPage vs Puzzle Publishers. Discover why self-publishers choose KDPage's cloud-based vector puzzle suite over legacy desktop software.",
  alternates: {
    canonical: "https://www.kdpage.com/compare/puzzle-publishers",
  },
  keywords: [
    "puzzle publishers alternative",
    "best puzzle publishers alternative 2026",
    "kdpage vs puzzle publishers",
    "puzzle publishers review",
    "free puzzle publishers alternative",
    "amazon kdp puzzle maker software",
    "kdp puzzle book generator",
    "rob ten pas puzzle publishers"
  ],
  openGraph: {
    title: "Best Puzzle Publishers Alternative (2026) — KDPage vs Puzzle Publishers",
    description:
      "Detailed feature and pricing comparison between KDPage and Puzzle Publishers for Amazon KDP puzzle book creators.",
    url: "https://www.kdpage.com/compare/puzzle-publishers",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDPage vs Puzzle Publishers" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "KDPage vs Puzzle Publishers (2026 Comparison)",
    description: "Compare vector puzzle generation, full book compilation, and pricing.",
    images: ["/og-image.png"],
  },
};

const FAQ_ITEMS = [
  {
    q: "Why is KDPage the best alternative to Puzzle Publishers?",
    a: "Unlike Puzzle Publishers which relies on fragmented legacy tools and separate modules, KDPage is a unified, modern cloud platform. You can generate mathematically verified Word Searches, Sudokus, Mazes, Cryptograms, and Kakuro puzzles, format matching solution keys, and build wrap-around covers in one seamless workspace without installing clunky desktop software.",
  },
  {
    q: "How does KDPage pricing compare to Puzzle Publishers?",
    a: "Puzzle Publishers charges $27/month (or $297 for legacy access), whereas KDPage offers a comprehensive suite of 30+ free tools with no signup required, with affordable Pro plans starting at $11.99/mo that include full commercial publishing rights.",
  },
  {
    q: "Do I have to manually assemble puzzle pages with KDPage?",
    a: "No! With Puzzle Publishers, users often have to export individual images and manually copy-paste them into PowerPoint or Canva. KDPage automatically compiles complete 50 to 200-page interior PDFs with automated page numbering and answer keys appended at the back.",
  },
  {
    q: "Does KDPage guarantee single, unique solutions for puzzles?",
    a: "Yes. KDPage uses algorithmic backtracking solvers that evaluate and verify that every Sudoku, Maze, and Word Search has exactly one valid solution, protecting your Amazon KDP account from negative reviews caused by ambiguous clues.",
  },
  {
    q: "Can I use KDPage on Mac, Chromebook, and iPad?",
    a: "Yes. KDPage runs 100% in any modern web browser without downloads, installations, or OS restrictions, whereas older puzzle software often requires Windows virtual machines or desktop installations.",
  },
];

const COMPARISON_FEATURES = [
  {
    feature: "Cloud-Based Web App (Zero Installation)",
    kdpage: "100% browser-based (Mac, Windows, Chromebook, iPad)",
    puzzlePub: "Legacy desktop-style portal with fragmented tools",
    kdpageWins: true,
  },
  {
    feature: "All-in-One 100-Page Book Compiler",
    kdpage: "One-click export of 100+ page interior PDFs with solution keys",
    puzzlePub: "Outputs loose images; requires manual PowerPoint/Canva assembly",
    kdpageWins: true,
  },
  {
    feature: "300 DPI Native Vector Exports (SVG / PDF)",
    kdpage: "Crisp vector lines that never pixelate on Amazon print",
    puzzlePub: "Standard raster PNGs that risk blurriness when resized",
    kdpageWins: true,
  },
  {
    feature: "Automated Wrap-Around Cover & Spine Studio",
    kdpage: "Built-in dynamic spine thickness and bleed calculator",
    puzzlePub: "No cover designer; requires third-party software",
    kdpageWins: true,
  },
  {
    feature: "Mathematical Single-Solution Verification",
    kdpage: "Algorithmic backtracking ensures 100% unique, solvable grids",
    puzzlePub: "Basic generator without automated uniqueness verification",
    kdpageWins: true,
  },
  {
    feature: "Free Standalone KDP Tools (No Signup)",
    kdpage: "30+ free tools (Cover Creator, Puzzle Gen, Print Cost, Spine)",
    puzzlePub: "Zero free standalone web tools; locked behind $27/mo paywall",
    kdpageWins: true,
  },
  {
    feature: "Starting Price",
    kdpage: "$11.99 / month (or 100% free web tools)",
    puzzlePub: "$27 / month or $297 one-time legacy fee",
    kdpageWins: true,
  },
];

export default function PuzzlePublishersAlternativePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Best Puzzle Publishers Alternative (2026) — KDPage vs Puzzle Publishers",
        description: "In-depth comparison of KDPage vs Puzzle Publishers for Amazon KDP puzzle book creators.",
        url: "https://www.kdpage.com/compare/puzzle-publishers",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.kdpage.com" },
          { "@type": "ListItem", position: 2, name: "Compare", item: "https://www.kdpage.com/compare" },
          { "@type": "ListItem", position: 3, name: "Puzzle Publishers Alternative", item: "https://www.kdpage.com/compare/puzzle-publishers" },
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-4 sm:px-6 relative overflow-hidden font-sans">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-12 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/compare" className="hover:text-white transition">Compare</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400">Puzzle Publishers Alternative</span>
          </div>

          {/* Hero Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" /> Modern Cloud Architecture vs Legacy Tools
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Best <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Puzzle Publishers Alternative</span> in 2026
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              Tired of paying $27/month for fragmented, clunky puzzle generators? See why modern Amazon KDP publishers choose KDPage&apos;s all-in-one cloud studio to generate and publish bestselling books in minutes.
            </p>
          </div>

          {/* Core Highlights 3-Card Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white">All-in-One Cloud Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                No software downloads or fragmented tools. Generate puzzles, compile 100-page interior PDFs, and design wrap-around covers in one modern browser workspace.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-2xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white">Mathematical Solvability</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Every Sudoku, Word Search, and Maze is generated with backtracking solvers to ensure exactly one unique solution, preventing customer complaints on Amazon.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white">More Value, Lower Cost</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Start for free with 30+ standalone tools, or upgrade to Pro for $11.99/mo instead of paying $27/mo or $297 for legacy software.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 backdrop-blur-md shadow-2xl overflow-hidden">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                KDPage vs Puzzle Publishers: Feature Comparison
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                A side-by-side technical breakdown of capabilities, outputs, and pricing.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                    <th className="py-4 px-4">Feature / Capability</th>
                    <th className="py-4 px-4 bg-indigo-500/10 text-indigo-300 font-black rounded-t-xl">
                      KDPage Studio
                    </th>
                    <th className="py-4 px-4 text-slate-400 font-bold">
                      Puzzle Publishers
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {COMPARISON_FEATURES.map((row) => (
                    <tr key={row.feature} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-200">
                        {row.feature}
                      </td>
                      <td className="py-4 px-4 bg-indigo-500/5 text-slate-100 font-semibold border-x border-indigo-500/20">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{row.kdpage}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        <div className="flex items-start gap-2">
                          <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{row.puzzlePub}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Editorial Breakdown */}
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Why Amazon Publishers Are Moving from Puzzle Publishers to KDPage
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
                <span className="text-xs font-black uppercase text-amber-400">Advantage 1</span>
                <h3 className="text-lg font-black text-white">No More Manual Copy-Pasting in Canva</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  With legacy puzzle software, you have to download 100 loose image files and manually arrange them one by one into PowerPoint, Keynote, or Canva. KDPage compiles the entire interior book in 1 click, complete with page headers, margins, and solution keys at the back.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
                <span className="text-xs font-black uppercase text-indigo-400">Advantage 2</span>
                <h3 className="text-lg font-black text-white">Zero Bleed Rejection Errors on Covers</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Puzzle Publishers has no cover designer. KDPage includes an automated Cover Studio that calculates exact spine thickness (e.g. 120 pages $\times$ 0.002252&quot;) and 0.125&quot; bleed margins so your upload to Amazon KDP passes review on the first try.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 backdrop-blur-md">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Common questions about migrating from Puzzle Publishers to KDPage.
              </p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((faq) => (
                <div key={faq.q} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Conversion CTA */}
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-black uppercase tracking-wider">
                🚀 Upgrade Your KDP Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Ready to Experience Modern Puzzle Creation?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Join thousands of self-publishers creating 100-page puzzle books with automated covers and mathematical solution keys in under 5 minutes.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/studio"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
                >
                  <span>Launch KDPage Studio Free</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </Link>
                <Link
                  href="/tools/kdp-puzzle-generator"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 border border-slate-700"
                >
                  Try Free Puzzle Generator
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
