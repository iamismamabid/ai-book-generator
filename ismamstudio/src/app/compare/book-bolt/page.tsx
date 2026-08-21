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
  Star,
  Award,
  ChevronRight,
  HelpCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Best Book Bolt Alternative (2026) — KDPage vs Book Bolt Comparison",
  description:
    "Looking for a Book Bolt alternative? Compare KDPage vs Book Bolt. See how KDPage delivers deterministic unique puzzle generation, 300 DPI vector PDF exports, automatic spine calculations, and better pricing with zero duplicate content ban risk.",
  alternates: {
    canonical: "https://www.kdpage.com/compare/book-bolt",
  },
  keywords: [
    "book bolt alternative",
    "kdpage vs book bolt",
    "best book bolt alternative 2026",
    "book bolt review",
    "book bolt discount alternative",
    "kdp puzzle book generator alternative",
    "amazon kdp software comparison",
    "free book bolt alternatives",
    "low content book creator"
  ],
  openGraph: {
    title: "Best Book Bolt Alternative (2026) — KDPage vs Book Bolt",
    description:
      "Detailed feature and pricing comparison between KDPage and Book Bolt for Amazon KDP self-publishers.",
    url: "https://www.kdpage.com/compare/book-bolt",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDPage vs Book Bolt" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "KDPage vs Book Bolt (2026 Comparison)",
    description: "Compare features, pricing, puzzle algorithms, and print-ready PDF exports.",
    images: ["/og-image.png"],
  },
};

const FAQ_ITEMS = [
  {
    q: "Why is KDPage considered the best alternative to Book Bolt?",
    a: "Unlike Book Bolt which relies on static pre-rendered puzzle templates that hundreds of publishers share, KDPage uses deterministic backtracking algorithms. Every Sudoku, shape-masked maze, and word search is mathematically synthesized with unique seed coordinates, eliminating the risk of Amazon KDP duplicate content account flags.",
  },
  {
    q: "How does KDPage pricing compare to Book Bolt?",
    a: "Book Bolt starts at $19.99/mo (Pro tier required for puzzle generator), whereas KDPage offers a comprehensive 30+ free tools directory, a $11.99/mo Starter tier, and lifetime deals with commercial rights included.",
  },
  {
    q: "Can I export 300 DPI print-ready vector PDFs on KDPage?",
    a: "Yes! All KDPage puzzle interiors and wrap-around covers export directly in 300 DPI vector format with automated bleed and gutter margin compliance tailored to Amazon KDP print specs.",
  },
  {
    q: "Does KDPage include an automated KDP spine calculator?",
    a: "Yes. KDPage includes real-time automatic spine calculation for paperback and hardcover books using Amazon's official paper thickness formulas (white, cream, and color paper) directly inside the Cover Studio.",
  },
];

const COMPARISON_FEATURES = [
  {
    feature: "Deterministic Algorithmic Puzzle Generation",
    kdpage: "100% mathematically unique puzzles with custom seeds & single-solution solvers",
    bookbolt: "Standard static/semi-static puzzle grids",
    kdpageWins: true,
  },
  {
    feature: "Duplicate Content Ban Protection",
    kdpage: "Guaranteed unique interiors per export",
    bookbolt: "Shared template library used by thousands of publishers",
    kdpageWins: true,
  },
  {
    feature: "Shape-Masked Maze Studio",
    kdpage: "Vector mazes masked in Hearts, Stars, Circles, Custom SVGs",
    bookbolt: "Rectangular / basic grids only",
    kdpageWins: true,
  },
  {
    feature: "Wrap-Around Cover Designer with Live Spine Calc",
    kdpage: "Built-in live spine calculation by page count & paper type",
    bookbolt: "Separate cover designer requiring manual dimensions",
    kdpageWins: true,
  },
  {
    feature: "Free Publishing Tools Available",
    kdpage: "30+ free standalone tools (no signup required)",
    bookbolt: "3-day trial only; all features gated behind paywall",
    kdpageWins: true,
  },
  {
    feature: "High-Resolution Vector PDF Export (300 DPI)",
    kdpage: "Native vector paths with exact KDP trim & bleed",
    bookbolt: "Raster / standard PDF downloads",
    kdpageWins: true,
  },
  {
    feature: "Entry Price / Monthly Cost",
    kdpage: "$11.99 / mo (or 30+ free tools forever)",
    bookbolt: "$19.99 / mo (for puzzle generation access)",
    kdpageWins: true,
  },
];

export default function BookBoltAlternativePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Best Book Bolt Alternative (2026) — KDPage vs Book Bolt",
        description: "In-depth comparison of KDPage vs Book Bolt for Amazon KDP self-publishers.",
        url: "https://www.kdpage.com/compare/book-bolt",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.kdpage.com" },
          { "@type": "ListItem", position: 2, name: "Compare", item: "https://www.kdpage.com/compare" },
          { "@type": "ListItem", position: 3, name: "Book Bolt Alternative", item: "https://www.kdpage.com/compare/book-bolt" },
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

      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href="/compare" className="hover:text-indigo-400 transition-colors">Compare</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200">KDPage vs Book Bolt</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            2026 KDP Software Comparison
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            The #1 <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Book Bolt Alternative</span> for KDP Creators
          </h1>

          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            Discover why self-publishers are switching from Book Bolt to KDPage. Create mathematically unique puzzle books, shape-masked mazes, and print-ready covers with zero duplicate content risk.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/studio"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Try KDPage Studio Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tools"
              className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition-all"
            >
              Explore 30+ Free KDP Tools
            </Link>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-black text-white flex items-center gap-2">
                <span>KDPage</span>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-indigo-500 text-white">Recommended</span>
              </div>
              <span className="text-2xl font-black text-indigo-400">From $11.99<span className="text-xs text-slate-400 font-normal">/mo</span></span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm font-medium mb-6">
              Purpose-built publishing engine with deterministic algorithm solvers, shape-masked mazes, live spine calculations, and 30+ free standalone utilities.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Guaranteed 100% unique algorithmic puzzles</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Shape-masked mazes (hearts, circles, custom SVGs)</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Live spine calculation in wrap-around Cover Studio</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 30+ free tools with no signup or credit card</li>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-black text-slate-300">Book Bolt</div>
              <span className="text-2xl font-black text-slate-300">$19.99<span className="text-xs text-slate-400 font-normal">/mo (Pro)</span></span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mb-6">
              General low-content book generator with keyword search and basic puzzle builders.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> Risk of identical puzzle templates across users</li>
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> Limited to standard rectangular maze grids</li>
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> Higher monthly cost to access puzzle generation</li>
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> 3-day trial only, no permanent free tools</li>
            </ul>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-white">Side-by-Side Feature Breakdown</h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
              Detailed technical differences between KDPage and Book Bolt for self-publishers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-4">Feature / Capability</th>
                  <th className="py-4 px-4 text-indigo-400 font-black">KDPage</th>
                  <th className="py-4 px-4 text-slate-400">Book Bolt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {COMPARISON_FEATURES.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-white max-w-xs">{item.feature}</td>
                    <td className="py-4 px-4 text-indigo-200">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item.kdpage}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{item.bookbolt}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section with Schema Markup */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Book Bolt vs KDPage FAQs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {FAQ_ITEMS.map((faq, index) => (
              <div key={index} className="bg-slate-800/40 border border-slate-800/80 rounded-2xl p-6 space-y-2">
                <h3 className="text-base font-bold text-white">{faq.q}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/70 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Build Bestselling KDP Books in Minutes?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Join thousands of KDP authors and publishers creating unique, high-converting puzzle books and covers with KDPage.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/studio"
              className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              Launch Studio Now (Free)
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-400/30 text-white font-bold text-sm transition-all"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
