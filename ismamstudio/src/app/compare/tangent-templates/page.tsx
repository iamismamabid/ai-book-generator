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
  title: "Tangent Templates Alternative (2026) — KDPage vs Tangent Templates",
  description:
    "Looking for a modern Tangent Templates alternative? Compare KDPage vs Tangent Templates. See how KDPage delivers modern interactive studios, shape-masked mazes, dynamic wrap-around cover calculations, and 30+ free tools.",
  alternates: {
    canonical: "https://www.kdpage.com/compare/tangent-templates",
  },
  keywords: [
    "tangent templates alternative",
    "kdpage vs tangent templates",
    "best tangent templates alternative 2026",
    "tangent templates review",
    "kdp interior templates software",
    "amazon kdp low content creator",
    "tangent templates discount alternative"
  ],
  openGraph: {
    title: "Tangent Templates Alternative (2026) — KDPage vs Tangent Templates",
    description:
      "Modern feature and workflow comparison between KDPage and Tangent Templates for Amazon KDP creators.",
    url: "https://www.kdpage.com/compare/tangent-templates",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDPage vs Tangent Templates" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "KDPage vs Tangent Templates (2026 Comparison)",
    description: "Compare modern interactive studios, shape-masked mazes, cover design, and vector PDF exports.",
    images: ["/og-image.png"],
  },
};

const FAQ_ITEMS = [
  {
    q: "Why choose KDPage over Tangent Templates?",
    a: "While Tangent Templates provides static template downloads, KDPage is a full interactive cloud studio suite. KDPage features deterministic algorithmic puzzle solvers (Sudoku, Mazes, Cryptograms, Kakuro, Word Search), real-time shape masking (hearts, circles, custom SVGs), live spine-calculating cover design, and 30+ free standalone utilities.",
  },
  {
    q: "Can I generate shape-masked mazes in Tangent Templates?",
    a: "No. Tangent Templates only offers standard static or rectangular grids. KDPage features an advanced vector labyrinth studio that generates complex mazes masked into hearts, stars, triangles, circles, and custom geometric shapes with verified solutions.",
  },
  {
    q: "Does KDPage have a built-in cover designer with live spine calculations?",
    a: "Yes. KDPage includes a full-wrap Cover Canvas Studio that dynamically calculates spine width, bleed margins, and barcode placement based on your exact page count and paper type (White, Cream, Color).",
  },
  {
    q: "Do I get commercial rights with KDPage?",
    a: "Yes! All paid KDPage creators and AppSumo lifetime code holders receive 100% royalty-free commercial rights to publish and sell generated interiors and covers on Amazon KDP, Etsy, and IngramSpark.",
  },
];

const COMPARISON_FEATURES = [
  {
    feature: "Modern Interactive Cloud Studio UI",
    kdpage: "Fast, modern cloud studio with live vector editing & previews",
    tangent: "Dated web interface with limited interactivity",
    kdpageWins: true,
  },
  {
    feature: "Shape-Masked Maze Studio",
    kdpage: "Vector mazes in Hearts, Circles, Stars, and Custom SVGs",
    tangent: "Standard rectangular grids only",
    kdpageWins: true,
  },
  {
    feature: "Live Wrap-Around Cover Studio with Auto-Spine",
    kdpage: "Interactive visual canvas with real-time spine calculation",
    tangent: "Basic template dimension helper only",
    kdpageWins: true,
  },
  {
    feature: "Mathematical Sudoku with Backtracking Solvers",
    kdpage: "Guaranteed single-solution puzzles with progressive difficulty",
    tangent: "Basic static sudoku grids",
    kdpageWins: true,
  },
  {
    feature: "Free Standalone KDP Tool Suite",
    kdpage: "30+ free tools (Spine Calc, ISBN, Royalty Estimator, OCR, PDF Validator)",
    tangent: "No free standalone tool directory",
    kdpageWins: true,
  },
  {
    feature: "Coloring Book & Color-by-Number Studio",
    kdpage: "Interactive vector coloring pages (Mandalas, Botanical, Stained Glass)",
    tangent: "Not supported",
    kdpageWins: true,
  },
];

export default function TangentTemplatesAlternativePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Tangent Templates Alternative (2026) — KDPage vs Tangent Templates",
        description: "In-depth comparison between KDPage and Tangent Templates for KDP publishers.",
        url: "https://www.kdpage.com/compare/tangent-templates",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.kdpage.com" },
          { "@type": "ListItem", position: 2, name: "Compare", item: "https://www.kdpage.com/compare" },
          { "@type": "ListItem", position: 3, name: "Tangent Templates Alternative", item: "https://www.kdpage.com/compare/tangent-templates" },
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

      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href="/compare" className="hover:text-indigo-400 transition-colors">Compare</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200">KDPage vs Tangent Templates</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Next-Generation KDP Publishing Suite
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            The Modern <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-400 bg-clip-text text-transparent">Tangent Templates Alternative</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            Upgrade from static template downloads to an interactive, algorithmic cloud studio with live shape-masking, dynamic cover calculations, and vector PDF exports.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/studio"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Try KDPage Studio Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tools/interior-templates"
              className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition-all"
            >
              Free Interior Templates
            </Link>
          </div>
        </div>

        {/* Quick Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-b from-amber-950/40 via-slate-900/60 to-slate-900/80 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-black text-white flex items-center gap-2">
                <span>KDPage</span>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">Next-Gen Studio</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60">Algorithmic &amp; Vector</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm font-medium mb-6">
              Interactive design studio with dynamic algorithms, shape-masked labyrinths, wrap-around cover creation, and 30+ free tools.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Shape-masked mazes (Hearts, Stars, Circles, Custom SVGs)</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Interactive Cover Studio with real-time spine calculation</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Full suite of puzzle engines with verified solution keys</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 30+ standalone free tools with zero signup limits</li>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-black text-slate-300">Tangent Templates</div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1 rounded-full">Static Library</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mb-6">
              Traditional template download library with basic static grids and dated interface.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> No shape-masked mazes or vector custom pathing</li>
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> No live visual wrap-around cover designer</li>
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> Static layouts lack deterministic unique seed solvers</li>
              <li className="flex items-center gap-2.5"><X className="w-4 h-4 text-rose-400 shrink-0" /> No comprehensive free standalone tools hub</li>
            </ul>
          </div>
        </div>

        {/* Feature Table */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-white">Side-by-Side Capability Comparison</h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
              Detailed technical differences between KDPage and Tangent Templates.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-4">Capability</th>
                  <th className="py-4 px-4 text-amber-400 font-black">KDPage</th>
                  <th className="py-4 px-4 text-slate-400">Tangent Templates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {COMPARISON_FEATURES.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-white max-w-xs">{item.feature}</td>
                    <td className="py-4 px-4 text-amber-200">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item.kdpage}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{item.tangent}</span>
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
          <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Tangent Templates vs KDPage FAQs</h2>

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
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Elevate Your KDP Publishing Workflow
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Generate unique puzzle interiors, custom shape-masked mazes, and print-ready covers in minutes with KDPage.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/studio"
              className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              Start Creating Now (Free)
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-2xl bg-amber-600/30 hover:bg-amber-600/40 border border-amber-400/30 text-white font-bold text-sm transition-all"
            >
              Explore Pricing &amp; Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
