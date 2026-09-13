import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  ChevronRight,
  HelpCircle,
  Search,
  BookOpen
} from "lucide-react";

export const metadata: Metadata = {
  title: "Best Publisher Rocket Alternative (2026) — KDPage vs Publisher Rocket",
  description:
    "Comparing KDPage vs Publisher Rocket? Learn the key differences between $199 keyword-only software and KDPage's all-in-one cloud studio for KDP interior creation, cover design, and niche research.",
  alternates: {
    canonical: "https://www.kdpage.com/compare/publisher-rocket",
  },
  keywords: [
    "publisher rocket alternative",
    "best publisher rocket alternative 2026",
    "kdpage vs publisher rocket",
    "free publisher rocket alternative",
    "publisher rocket review",
    "amazon kdp keyword tool",
    "kdp book creator vs publisher rocket",
    "dave chesson publisher rocket"
  ],
  openGraph: {
    title: "Best Publisher Rocket Alternative (2026) — KDPage vs Publisher Rocket",
    description:
      "Detailed comparison: Keyword-only desktop software vs KDPage's all-in-one cloud book studio with built-in research tools.",
    url: "https://www.kdpage.com/compare/publisher-rocket",
    siteName: "KDPage",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDPage vs Publisher Rocket" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "KDPage vs Publisher Rocket (2026 Comparison)",
    description: "Compare creation studio capabilities, keyword analytics, and pricing.",
    images: ["/og-image.png"],
  },
};

const FAQ_ITEMS = [
  {
    q: "Can Publisher Rocket generate book interiors or covers?",
    a: "No. Publisher Rocket is strictly a market research and keyword tool for finding Amazon categories and AMS ad keywords. It does not contain any book interior generators, puzzle creators, cover builders, or PDF export engines. You still have to purchase separate software to create your books.",
  },
  {
    q: "Does KDPage include keyword research tools?",
    a: "Yes! KDPage includes built-in Amazon Keyword Research, Keyword Density Analyzer, Trademark Infringement Checker, Royalty Estimator, and KENP Calculator right inside the web platform—completely accessible without paying $199 upfront.",
  },
  {
    q: "How does KDPage pricing compare to Publisher Rocket?",
    a: "Publisher Rocket requires a steep $199 one-time payment upfront with no free tier. KDPage offers 30+ completely free standalone web tools with no signup required, and full Pro Studio access starting at just $11.99/mo for complete end-to-end book generation.",
  },
  {
    q: "Can I use KDPage on any device?",
    a: "Yes. KDPage is 100% cloud-based and runs in any modern browser on Mac, Windows, Chromebook, or iPad. Publisher Rocket is a desktop application that must be downloaded and installed on Mac or PC.",
  },
  {
    q: "Should I buy Publisher Rocket or KDPage for Low-Content and Medium-Content books?",
    a: "If you publish low-content or medium-content books (puzzle books, journals, workbooks, coloring books), KDPage is by far the superior choice because it provides the complete creation engine (puzzles, covers, interior compilation) alongside essential niche research tools.",
  },
];

const COMPARISON_FEATURES = [
  {
    feature: "Book Interior & 100-Page PDF Compiler",
    kdpage: "Built-in: compile complete 100+ page interiors with solutions in 1 click",
    pubRocket: "None (Must purchase separate interior software)",
    kdpageWins: true,
  },
  {
    feature: "Automated KDP Cover Studio & Spine Calculator",
    kdpage: "Exact spine width + 0.125\" bleed calculation with Fabric.js design canvas",
    pubRocket: "None (No cover design or spine calculation tools)",
    kdpageWins: true,
  },
  {
    feature: "Algorithmic Puzzle Generators (12+ Varieties)",
    kdpage: "Word Search, Sudoku, Mazes, Cryptograms, Kakuro with backtracking solvers",
    pubRocket: "None (Zero puzzle creation capabilities)",
    kdpageWins: true,
  },
  {
    feature: "Amazon Keyword & Niche Research",
    kdpage: "Included: search volume, relevance scoring, and density analysis",
    pubRocket: "Comprehensive keyword, competitor, and category research database",
    kdpageWins: false,
  },
  {
    feature: "Trademark & Safe Listing Checker",
    kdpage: "Built-in real-time USPTO trademark lookup for titles and subtitles",
    pubRocket: "Not included (separate manual check required)",
    kdpageWins: true,
  },
  {
    feature: "Zero-Installation Cloud Architecture",
    kdpage: "100% browser-based on Mac, Windows, iPad, Chromebook",
    pubRocket: "Desktop application install required",
    kdpageWins: true,
  },
  {
    feature: "Starting Price & Free Access",
    kdpage: "30+ free tools with no signup; Pro studio from $11.99/mo",
    pubRocket: "$199 upfront one-time payment (no free version)",
    kdpageWins: true,
  },
];

export default function PublisherRocketAlternativePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Best Publisher Rocket Alternative (2026) — KDPage vs Publisher Rocket",
        description: "In-depth feature and price comparison between KDPage and Publisher Rocket for Amazon KDP publishers.",
        url: "https://www.kdpage.com/compare/publisher-rocket",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.kdpage.com" },
          { "@type": "ListItem", position: 2, name: "Compare", item: "https://www.kdpage.com/compare" },
          { "@type": "ListItem", position: 3, name: "Publisher Rocket Alternative", item: "https://www.kdpage.com/compare/publisher-rocket" },
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
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-12 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/compare" className="hover:text-white transition">Compare</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-indigo-400">Publisher Rocket Alternative</span>
          </div>

          {/* Hero Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-400/10 border border-indigo-400/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" /> All-in-One Creation vs Keyword-Only Tool
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Best <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">Publisher Rocket Alternative</span> in 2026
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              Publisher Rocket costs $199 upfront but cannot create a single book page or cover. See why KDP authors choose KDPage to research, generate, format, and publish profitable books without breaking the bank.
            </p>
          </div>

          {/* Core Highlights 3-Card Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-2xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white">Full Book Generation</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Unlike Publisher Rocket, KDPage actually creates your books. Generate complete 100-page puzzle books, lined interiors, and wrap-around covers in minutes.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white">Built-in Niche Research</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Includes keyword research, density analysis, trademark checks, and royalty calculators so you don&apos;t need an expensive standalone keyword app.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white">Zero Upfront Barrier</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Skip the $199 fee. Enjoy 30+ free standalone web tools right now, or get unlimited Pro studio exports starting at just $11.99/month.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 backdrop-blur-md shadow-2xl overflow-hidden">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                KDPage vs Publisher Rocket: Head-to-Head Comparison
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Compare creation capabilities, research depth, and total cost of ownership.
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
                      Publisher Rocket
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
                          {row.kdpageWins ? (
                            <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          ) : (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          <span>{row.pubRocket}</span>
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
              Why KDP Authors Choose KDPage Over Publisher Rocket
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
                <span className="text-xs font-black uppercase text-indigo-400">The Problem with Keyword-Only Tools</span>
                <h3 className="text-lg font-black text-white">Keywords Don&apos;t Generate Books</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Even after spending $199 on Publisher Rocket, you still have an empty desk. You still need separate software for interiors, another tool for covers, and another program to generate puzzles. KDPage handles the entire pipeline in one unified tab.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
                <span className="text-xs font-black uppercase text-cyan-400">Safety & Compliance</span>
                <h3 className="text-lg font-black text-white">Built-in Trademark & Bleed Validation</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Publisher Rocket doesn&apos;t prevent Amazon account bans from trademark infringement or file formatting errors. KDPage integrates live USPTO trademark checks and automated KDP bleed-calculation algorithms so your uploads never get rejected.
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
                Everything you need to know about choosing between KDPage and Publisher Rocket.
              </p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((faq) => (
                <div key={faq.q} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
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
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-400/10 border border-indigo-400/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
                🚀 All-in-One KDP Self-Publishing
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Stop Paying $199 Just to Search Keywords
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Create complete 100-page interior PDFs, design wrap-around print covers, and research profitable niches with KDPage Studio today.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/studio"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-sm uppercase tracking-wider transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <span>Launch KDPage Studio Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/tools/keyword-research"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 border border-slate-700"
                >
                  Try Free Keyword Tool
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
