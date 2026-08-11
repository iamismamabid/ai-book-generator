import type { Metadata } from "next";
import Link from "next/link";
import {
  Palette,
  Grid3x3,
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Layers,
  Calculator,
  Hash,
  QrCode,
  Scissors,
  Package,
  ScanText,
  BookOpen,
  LayoutTemplate,
  Star,
  Paintbrush,
  Shuffle
} from "lucide-react";

import HomeArcadeWalkthrough from "./components/HomeArcadeWalkthrough";
import HomeNewsletterForm from "./components/HomeNewsletterForm";
import HomeTrustpilotLazy from "./components/HomeTrustpilotLazy";
// Direct static imports — both components handle their own internal Suspense
// boundary, so wrapping them in dynamic() only adds an extra <!--$?--> shell
// that confuses automated SEO crawlers into seeing an empty homepage.
import UserReviewsSection from "./components/UserReviewsSection";
import PricingSection from "../components/PricingSection";

export const metadata: Metadata = {
  title: "KDPage | KDP Book Creator: Puzzle Interiors, Covers & Free Tools",
  description:
    "Create print-ready Amazon KDP books in minutes — Sudoku, mazes, word searches, crosswords, full manuscripts, and covers. Free KDP tools included: spine calculator, ISBN barcode generator, and keyword research.",
  alternates: {
    canonical: "https://www.kdpage.com",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden relative">

      {/* Ambient background glow accents */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[700px] h-[700px] bg-purple-100/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-3xl translate-y-1/3 pointer-events-none" />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 px-6 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-6 text-left space-y-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-indigo-700 text-xs font-black uppercase tracking-[0.2em] shadow-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  The Ultimate Publishing Suite for KDP Self-Publishers
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Create 10 Unique <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">KDP Puzzle Books</span> in 5 Minutes
              </h1>

              <p className="text-slate-700 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                The ultimate all-in-one publishing suite. Generate mathematically unique puzzles, custom shape-masked mazes, and print-ready covers designed for instant Amazon KDP upload.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/studio"
                  className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-lg hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 ease-in-out hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                  aria-label="Start creating KDP books now in Studio"
                >
                  Start Creating Now
                  <ArrowRight className="w-5 h-5 text-white" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/80 text-xs font-bold text-slate-600">
                <span className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Quick Jump:</span>
                <Link href="/pricing" className="hover:text-indigo-600 hover:underline transition-colors">Pricing Plans</Link>
                <span>•</span>
                <a href="#tools" className="hover:text-indigo-600 hover:underline transition-colors">Puzzle Engines</a>
                <span>•</span>
                <a href="#reviews" className="hover:text-indigo-600 hover:underline transition-colors">User Reviews</a>
                <span>•</span>
                <Link href="/about" className="hover:text-indigo-600 hover:underline transition-colors">About Us</Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mr-1">Best For:</span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                  KDP Self-Publishers
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                  Activity &amp; Puzzle Authors
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  Low-Content Creators
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Etsy Sellers &amp; Agencies
                </span>
              </div>
            </div>

            {/* Right Column: Micro-Client Arcade Walkthrough Component */}
            <div className="lg:col-span-6 relative">
              <div className="absolute inset-0 bg-indigo-100/40 rounded-[3rem] blur-3xl" />
              <HomeArcadeWalkthrough />
            </div>

          </div>
        </div>
      </section>

      {/* Real-time Interior Previews (Marquee) */}
      <section className="relative z-10 w-full overflow-hidden py-10 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Live KDP Vector Templates</span>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-0.5 font-sans">High-converting low-content &amp; puzzle layouts</h2>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 self-start">Hover to Pause</span>
          </div>
        </div>
        <div className="relative w-full overflow-hidden flex">
          <div className="animate-marquee flex gap-6">
            {[
              { label: "Heart Labyrinth", type: "Maze", desc: "Perfect for Valentine KDP niches", emoji: "💖" },
              { label: "Sudoku Grid", type: "Math Logic", desc: "100% compliant trim sizing", emoji: "🔢" },
              { label: "Word Search", type: "Puzzle", desc: "Vocabulary & clue layout builder", emoji: "🔍" },
              { label: "Daily Planner", type: "Low-Content", desc: "Schedule, priorities & water logging", emoji: "☀️" },
              { label: "Lined Journal", type: "Low-Content", desc: "Classic horizontal writing lines", emoji: "📖" },
              { label: "Cryptogram", type: "Quotes", desc: "Shuffled letter decryption keys", emoji: "🔐" },
              { label: "Math sums", type: "Arithmetic", desc: "Sums, grid puzzle fill sheets", emoji: "➕" }
            ].concat([
              { label: "Heart Labyrinth", type: "Maze", desc: "Perfect for Valentine KDP niches", emoji: "💖" },
              { label: "Sudoku Grid", type: "Math Logic", desc: "100% compliant trim sizing", emoji: "🔢" },
              { label: "Word Search", type: "Puzzle", desc: "Vocabulary & clue layout builder", emoji: "🔍" },
              { label: "Daily Planner", type: "Low-Content", desc: "Schedule, priorities & water logging", emoji: "☀️" },
              { label: "Lined Journal", type: "Low-Content", desc: "Classic horizontal writing lines", emoji: "📖" },
              { label: "Cryptogram", type: "Quotes", desc: "Shuffled letter decryption keys", emoji: "🔐" },
              { label: "Math sums", type: "Arithmetic", desc: "Sums, grid puzzle fill sheets", emoji: "➕" }
            ]).map((item, idx) => (
              <div key={idx} className="shrink-0 w-72 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:border-indigo-300 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-sm">
                  {item.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">{item.label}</span>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{item.type}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 block mt-0.5">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Studio Showcase Grid */}
      <section id="tools" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider">
            <Compass className="w-4 h-4 text-indigo-600" />
            100% Commercial Use Rights
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Engineered for <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">KDP Bestsellers</span>
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Generate unlimited vector interiors and full-bleed covers ready for Amazon KDP upload.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Coloring Book Studio", desc: "Coloring & color-by-number pages -- mandalas, stained glass, flags, cars, and blank canvas.", href: "/tools/coloring-book-generator", icon: Paintbrush, badge: "67+ Presets & Blank Canvas" },
            { title: "Labyrinth & Maze Engine", desc: "Square, Heart, and Circle shape-masked mazes with single-solution paths and KDP-safe margins.", href: "/maze", icon: Compass, badge: "Custom Shape Mask" },
            { title: "Sudoku Studio", desc: "Bulk Sudoku grids, Easy to Hard, each verified for exactly one unique solution.", href: "/sudoku", icon: Grid3x3, badge: "300 DPI Vector" },
            { title: "Word Search Studio", desc: "Import a word list or CSV, build the grid, export the interior sheet with clue layouts.", href: "/tools/word-search", icon: Sparkles, badge: "CSV Import" },
            { title: "Crossword Studio", desc: "Custom crosswords, 10x10 to 20x20, up to 1,000+ pages, with auto-intersecting clues.", href: "/studio/crossword", icon: LayoutTemplate, badge: "Auto-Generate" },
            { title: "Cryptogram Studio", desc: "Substitution-cipher worksheets from your own quotes, up to 1,000+ pages with solution keys.", href: "/studio/cryptogram", icon: Hash, badge: "Cipher Engine" },
            { title: "Math Puzzle Builder", desc: "Arithmetic and logic-grid sheets for kids, seniors, and KDP activity workbooks.", href: "/studio/math-puzzle", icon: Calculator, badge: "Arithmetic Grid" },
            { title: "Word Scramble Studio", desc: "Scramble your word list into activity worksheets, ready for instant export.", href: "/studio/word-scramble", icon: Shuffle, badge: "Vocabulary Builder" },
            { title: "Kakuro Generator", desc: "Number-sum logic grids, 4x4 to 9x17, Easy to Expert with solution answer keys.", href: "/studio/kakuro", icon: Grid3x3, badge: "Number Sum Logic" },
            { title: "All-In-One Studio", desc: "Wrap-around full-bleed covers, interior manuscript assembly, and complete KDP book builder.", href: "/studio", icon: BookOpen, badge: "Full KDP Publisher" },
          ].map((tool) => (
            <div key={tool.title} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{tool.title}</h3>
                <p className="text-slate-600 text-sm font-semibold leading-relaxed">{tool.desc}</p>
              </div>
              <Link
                href={tool.href}
                className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-700 group-hover:text-indigo-800 transition-colors pt-2"
                aria-label={`Open ${tool.title}`}
              >
                Launch Studio Engine <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Free Tools Spotlight Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-200">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 30+ Tools — No Signup Required
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Free KDP Tools Every Publisher Needs
          </h2>
          <p className="text-slate-600 text-sm font-semibold max-w-2xl mx-auto">
            Calculators, generators, and utilities for every stage of publishing — completely free, no account required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { href: "/tools/print-cost-calculator", icon: Calculator, name: "Free Print Cost Calculator", desc: "Paperback & hardcover printing costs" },
            { href: "/tools/ebook-royalty-calculator", icon: Calculator, name: "Free eBook Royalty Calculator", desc: "35% vs 70% Kindle plans" },
            { href: "/tools/kenp-calculator", icon: BookOpen, name: "Free KENP Royalty Calculator", desc: "Kindle Unlimited earnings estimator" },
            { href: "/tools/readability-calculator", icon: Hash, name: "Free Readability Calculator", desc: "Flesch-Kincaid, Gunning Fog & more" },
            { href: "/tools/qr-code-generator", icon: QrCode, name: "Free QR Code Generator", desc: "High-res QR codes for marketing" },
            { href: "/tools/background-remover", icon: Scissors, name: "Free Background Remover", desc: "Transparent PNGs for covers" },
            { href: "/tools/pdf-compressor", icon: Package, name: "Free PDF Compressor", desc: "Shrink files for KDP upload limits" },
            { href: "/tools/ocr-scanner", icon: ScanText, name: "Free OCR Scanner", desc: "Extract text from scanned pages" },
            { href: "/tools/book-planner", icon: BookOpen, name: "Free Book Planner", desc: "Chapters, characters & progress" },
            { href: "/tools/interior-templates", icon: LayoutTemplate, name: "Free Interior Templates", desc: "Journals, planners & notebooks" },
            { href: "/tools/pattern-generator", icon: Palette, name: "Free Pattern Generator", desc: "Seamless covers & endpapers" },
            { href: "/tools/image-resizer", icon: Layers, name: "Free Mass Image Resizer", desc: "Bulk resize with KDP presets" },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              aria-label={tool.name}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                <tool.icon className="w-4.5 h-4.5 text-indigo-700" />
              </div>
              <div>
                <span className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors block">
                  {tool.name}
                </span>
                <span className="text-xs font-semibold text-slate-600">{tool.desc}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            aria-label="See all 30 free tools"
          >
            See All 30+ Free Tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 💬 User Reviews */}
      <UserReviewsSection />

      {/* 🌟 Official Trustpilot Rating & Technical Product Guarantees */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
        <div className="text-center mb-16 space-y-4">
          <Link 
            href="https://www.trustpilot.com/review/kdpage.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-black uppercase tracking-widest shadow-sm transition-all hover:scale-105"
            aria-label="Check live reviews on Trustpilot"
          >
            <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            Check Our Live Reviews on Trustpilot
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Built for Bestselling <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">KDP Authors</span>
          </h2>
          <p className="text-slate-700 text-base md:text-lg max-w-xl mx-auto font-medium">
            3 technical foundations built into every book you create with KDPage.
          </p>
          <HomeTrustpilotLazy />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Guarantee 1 */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-black">
                🛡️
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">KDP-Spec Formatting</h3>
              <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                Automatic gutter margins (0.375" - 0.5") based on total page count, calculated to meet Amazon KDP's bleed and safety-margin specifications.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Bleed &amp; Safety</span>
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Spec-Compliant</span>
            </div>
          </div>

          {/* Guarantee 2 */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center text-xl font-black">
                🔢
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Single-Solution Uniqueness</h3>
              <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                Our backtracking solver evaluates <code className="text-xs font-bold bg-purple-50 text-purple-800 px-1 py-0.5 rounded">countSolutions(grid, 2)</code> to mathematically guarantee exactly 1 unique solution per grid.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Sudoku &amp; Logic</span>
              <span className="text-[9px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">Mathematically Verified</span>
            </div>
          </div>

          {/* Guarantee 3 */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center text-xl font-black">
                🎨
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Fabric.js Cover Math</h3>
              <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                Calculates exact spine thickness <code className="text-xs font-bold bg-amber-50 text-amber-800 px-1 py-0.5 rounded">pageCount * 0.002252"</code> for crisp, professional wrap-around covers.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cover Studio</span>
              <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Zero Trim Shift</span>
            </div>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-500 font-semibold mt-8 max-w-2xl mx-auto">
          Final approval remains subject to Amazon KDP's own review process and content policies.
        </p>
      </section>

      {/* Pricing & FAQ Section */}
      <PricingSection />

      {/* Lead Generation Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white border border-slate-200 shadow-sm rounded-[3rem] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in">
          <div className="absolute inset-0 bg-indigo-50/40 pointer-events-none" />

          <div className="max-w-xl space-y-4 relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider">
              🎁 Free KDP Checklist
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Get the Ultimate KDP Bestseller Checklist
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              Not ready to join? Download our free step-by-step formatting guidelines, bleed/gutter cheat sheet, and 50 low-competition puzzle keywords to start making sales.
            </p>
          </div>

          <HomeNewsletterForm />
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-200">
        <div className="bg-white border border-slate-200 shadow-sm rounded-[3rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-indigo-700 text-xs font-black uppercase tracking-[0.25em] mb-4">
              <Shield className="w-4 h-4" /> Secure &amp; Compliant
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Designed for Amazon KDP Specs</h2>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              All PDF exports automatically include precise gutters, safety bleed buffers, standard book sizes (6"x9", 8.5"x11"), and optimized vector paths ready for printing.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/studio"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl transition-all duration-300 ease-in-out hover:-translate-y-1 shadow-md shadow-indigo-600/15 hover:shadow-lg hover:shadow-indigo-600/20 flex items-center gap-2"
              aria-label="Create KDP books now"
            >
              Create Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
