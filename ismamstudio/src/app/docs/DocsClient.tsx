"use client";

import { useState } from "react";
import Link from "next/link";
import { getYouTubeEmbedUrl } from "@/lib/videoConfig";
import { AI_FEATURES_ENABLED } from "@/lib/features";
import {
  Search,
  BookOpen,
  Sparkles,
  HelpCircle,
  Key,
  Grid3x3,
  Palette,
  Printer,
  FileText,
  Sliders,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Mail,
  Zap,
  ShieldCheck,
  Compass,
  FileCode,
  Download
} from "lucide-react";

interface HelpArticle {
  id: string;
  category: "getting-started" | "puzzle-engines" | "cover-formatting" | "publishing";
  categoryLabel: string;
  title: string;
  summary: string;
  readTime: string;
  icon: string;
  content: string[];
  steps?: string[];
  tips?: string[];
}

const ARTICLES: HelpArticle[] = [
  // Getting Started
  {
    id: "quickstart-5-min-book",
    category: "getting-started",
    categoryLabel: "Getting Started",
    title: "Quickstart: Create Your First KDP Puzzle Book in 5 Minutes",
    summary: "A step-by-step walkthrough from launching the Creator Studio to downloading a print-ready 100-page KDP interior PDF.",
    readTime: "3 min read",
    icon: "Rocket",
    content: [
      "Welcome to KDPage! Creating a 100% KDP-compliant puzzle book takes under 5 minutes when using our Creator Studio.",
      "KDPage handles all margin calculations, gutter allowances, and solution key generation automatically, so you never have to worry about Amazon KDP review rejections."
    ],
    steps: [
      "Log into your KDPage account and navigate to 'Creator Studio' (/studio).",
      "Choose your target Trim Size (e.g., 8.5\" x 11\" for Large Print or 6\" x 9\" for Novels).",
      "Select a puzzle engine from the left sidebar: Sudoku, Word Search, Maze, Crossword, or Math Puzzles.",
      "Adjust your difficulty level, grid size, and quantity of pages.",
      "Click 'Build Book Interior' — our engine will generate all puzzle pages with solution keys appended at the end.",
      "Preview your book layout and click 'Export PDF' to download your 300 DPI vector PDF file."
    ],
    tips: [
      "Always select 8.5\" x 11\" for Sudoku and Word Search books aimed at seniors or kids for maximum legibility.",
      "Check the 'Include Solution Pages' option to ensure KDP buyers get answer keys at the back."
    ]
  },
  {
    id: "redeeming-appsumo-license",
    category: "getting-started",
    categoryLabel: "Getting Started",
    title: "How to Redeem & Stack AppSumo License Codes",
    summary: "Complete guide on redeeming 1, 2, or 3 AppSumo codes on KDPage to unlock Starter, Pro, or Agency Tier lifetime access.",
    readTime: "2 min read",
    icon: "Key",
    content: [
      "Redeeming your AppSumo purchase is fast and automatic. You can redeem via the 1-click button on AppSumo or manually on our redemption page.",
      "Code Stacking Tiers:",
      "• 1 Code ($49) = Starter Creator Plan (Commercial License, Standard Trim Sizes, 25 Line Art Credits/mo)",
      "• 2 Codes ($79) = Pro Studio Plan (All 8 Puzzle Engines, Shaped Mazes, Custom Sizes, 100 Line Art Credits/mo)",
      "• 3 Codes ($149) = Publisher Agency Plan (Everything in Pro + 300 Line Art Credits/mo, 3 Team Seats, 25 Brand Profiles, Bulk Batch Studio)",
      "• 4 Codes ($249) = Agency Plus Plan (Everything in Tier 3 + 5,000 Exports/mo, 50 Brand Profiles, Priority Support)",
      "• 5 Codes ($399) = Agency Max Plan (Everything in Tier 4 + 10,000 Exports/mo, 100 Brand Profiles, 1-on-1 Account Manager)"
    ],
    steps: [
      "Log in to your KDPage account (or create a free account at /sign-up).",
      "Go to the Redemption Page at: https://www.kdpage.com/redeem",
      "Paste your AppSumo License Key (e.g., KDPAGE-XXXX-XXXX) into the input box.",
      "Click 'Redeem License Code'. Your account plan will immediately upgrade!",
      "To stack multiple codes for higher tiers, simply repeat the process with your second or third code."
    ],
    tips: [
      "If you click 'Redeem' directly inside AppSumo, your code will be pre-filled automatically on the redemption page.",
      "Need help with your code? Contact us anytime at support@kdpage.com."
    ]
  },
  {
    id: "understanding-kdp-margins-bleed",
    category: "getting-started",
    categoryLabel: "Getting Started",
    title: "Understanding KDP Trim Sizes, Bleed, and Safety Margins",
    summary: "Learn how KDP bleed, gutter margins, and safe zones work so your interiors pass Amazon's automated review on the first try.",
    readTime: "4 min read",
    icon: "Printer",
    content: [
      "One of the biggest reasons Amazon KDP rejects submitted manuscripts is incorrect page margins or missing bleed.",
      "KDPage eliminates this problem by building all grid layouts with built-in safety margins compliant with Amazon's official KDP Publishing Guidelines."
    ],
    steps: [
      "No-Bleed (Recommended for Puzzles): Puzzles, Sudokus, and text pages should stay inside the safe zone (at least 0.375\" from outer edges).",
      "Bleed (For Full-Page Images/Backgrounds): If your graphics touch the edge of the physical page, select 'Bleed' on KDP and add 0.125\" to the width and 0.25\" to the height.",
      "Gutter Margin (Inside Edge): The inside margin where pages are bound together. Larger page counts (200+ pages) require a wider gutter margin (up to 0.75\")."
    ],
    tips: [
      "When using KDPage Creator Studio, choose 'No-Bleed' for 99% of puzzle books.",
      "KDPage's PDF exporter automatically applies the correct gutter margin based on your page count."
    ]
  },
  {
    id: "account-subscription-management",
    category: "getting-started",
    categoryLabel: "Getting Started",
    title: "Account Settings, Billing, and Commercial License Rights",
    summary: "Everything you need to know about user profiles, commercial usage rights, and managing your plan.",
    readTime: "2 min read",
    icon: "ShieldCheck",
    content: [
      "When you upgrade to any paid tier (Starter, Pro, Agency, or AppSumo LTD), you receive 100% Commercial Usage Rights for all generated interiors, puzzles, and covers.",
      "You keep 100% of all royalties earned on Amazon KDP, Etsy, IngramSpark, or your own store."
    ],
    steps: [
      "Go to your User Dashboard (/dashboard) to view your active plan, line art credits, and saved projects.",
      "To update your email or password, click on your Profile Avatar in the top-right corner.",
      "AppSumo Lifetime Deal users never expire and have no recurring subscription fees."
    ]
  },

  // Puzzle Engines
  {
    id: "sudoku-generator-guide",
    category: "puzzle-engines",
    categoryLabel: "Puzzle Engines",
    title: "Sudoku Studio: Generating Single-Solution Grids",
    summary: "How to generate 9x9 Sudoku puzzles from Easy to Hard with guaranteed mathematical100% single-solution uniqueness.",
    readTime: "3 min read",
    icon: "Grid3x3",
    content: [
      "KDPage's Sudoku engine uses a backtracking solver algorithm that guarantees every generated grid has EXACTLY one valid solution.",
      "You can generate 1-up (1 puzzle per page), 2-up, or 4-up solution grids at the back of the book."
    ],
    steps: [
      "Open Creator Studio (/studio) or the standalone Sudoku Tool (/sudoku).",
      "Choose difficulty level: Easy, Medium, or Hard.",
      "Set your grid font style (Standard, Bold, Large Print).",
      "Select your solution layout: 4-in-1 (4 solutions per page) is the most popular for saving page count on KDP."
    ]
  },
  {
    id: "word-search-studio-guide",
    category: "puzzle-engines",
    categoryLabel: "Puzzle Engines",
    title: "Word Search Studio: Custom Word Lists & CSV Upload",
    summary: "Build theme-based Word Search books using custom vocabulary lists or CSV file imports.",
    readTime: "4 min read",
    icon: "FileText",
    content: [
      "Word Search books are among the highest-selling low-content books on Amazon. KDPage lets you enter your own word lists or upload CSV files in bulk."
    ],
    steps: [
      "Open Word Search Studio in Creator Studio or /tools/word-search.",
      "Type or paste your word list (e.g., Title: 'Forest Animals', Words: 'Bear, Wolf, Deer, Fox, Eagle').",
      "Or click 'Import CSV' to load 50+ puzzle word lists at once.",
      "Choose grid size: 15x15 (Standard) or 20x20 (Hard/Adults).",
      "Select word directions: Horizontal, Vertical, Diagonal, and Reverse Words for higher difficulty."
    ]
  },
  {
    id: "shape-masked-maze-designer",
    category: "puzzle-engines",
    categoryLabel: "Puzzle Engines",
    title: "Shaped Labyrinth Designer: Heart, Circle & Custom Mazes",
    summary: "Create eye-catching, non-rectangular mazes that stand out in KDP search results.",
    readTime: "3 min read",
    icon: "Compass",
    content: [
      "Standard square mazes are common, but shaped mazes (Heart, Circle, Star, Diamond) command higher prices on Amazon and Etsy.",
      "KDPage's Labyrinth engine masks maze paths into intricate geometric shapes while maintaining a 100% solvable path."
    ],
    steps: [
      "Go to /maze or select 'Labyrinth' inside Creator Studio.",
      "Choose your Mask Shape: Square, Circle, Heart, or Diamond.",
      "Adjust wall thickness and cell size for kids (large paths) or adults (intricate, dense paths).",
      "Generate solution keys alongside each maze page."
    ]
  },
  {
    id: "crossword-cryptogram-kakuro-guide",
    category: "puzzle-engines",
    categoryLabel: "Puzzle Engines",
    title: "Crossword, Cryptogram, Kakuro & Math Puzzles",
    summary: "Guide to advanced logic puzzles including Crosswords, Cryptogram quotes, Kakuro sums, and Math equation grids.",
    readTime: "4 min read",
    icon: "Sliders",
    content: [
      "KDPage includes 8 distinct puzzle engines so you can publish mixed-activity books or specialized niche books."
    ],
    steps: [
      "Crossword Studio (/studio/crossword): Build 10x10 to 20x20 crossword grids with custom Across and Down clues.",
      "Cryptogram Studio (/studio/cryptogram): Convert famous quotes, jokes, or bible verses into letter-substitution cipher puzzles (up to 1,000+ pages in bulk).",
      "Kakuro Engine (/studio/kakuro): Mathematical crossword-style number sum grids for brain-game enthusiasts.",
      "Math Puzzles (/studio/math-puzzle): Addition, Multiplication, and Number Fill-in grids in 1-box or 2-box per page layouts for kids' educational workbooks."
    ]
  },

  // Cover & Formatting
  {
    id: "cover-studio-full-wrap-guide",
    category: "cover-formatting",
    categoryLabel: "Cover & Formatting",
    title: "Cover Studio: Designing Print-Ready Full-Wrap KDP Covers",
    summary: "How to design front, back, and spine covers with real-time KDP safety guides, text tools, and image uploads.",
    readTime: "4 min read",
    icon: "Palette",
    content: [
      "Amazon KDP requires a single, continuous PDF file containing the Back Cover + Spine + Front Cover formatted to the exact millimeter.",
      "KDPage's Cover Studio calculates the exact spine width based on your page count and paper type (white vs cream) and draws official KDP safety guides on your canvas."
    ],
    steps: [
      "Click 'Cover Studio' tab inside /studio.",
      "Select your trim size (e.g., 8.5\" x 11\") and enter your total interior page count (e.g., 120 pages).",
      "Spine width will calculate automatically (e.g., 0.27 inches for 120 pages on white paper).",
      "Add title text, author name, background gradients, and uploaded artwork to the Front Cover canvas.",
      "Add back cover blurb, barcode box, and branding to the Back Cover canvas.",
      "Toggle 'Show KDP Guides' to verify text is safely inside pink margin lines.",
      "Export as a 300 DPI high-resolution PDF or PNG cover."
    ]
  },
  {
    id: "spine-calculator-guide",
    category: "cover-formatting",
    categoryLabel: "Cover & Formatting",
    title: "KDP Spine Width & Full Cover Dimension Calculator",
    summary: "Calculate exact wrap-around cover dimensions for paperback and hardcover books based on Amazon KDP formulas.",
    readTime: "2 min read",
    icon: "Printer",
    content: [
      "Use our free Spine Calculator (/tools/spine-calculator) to get exact pixel and inch dimensions before designing in Photoshop, Canva, or KDPage Cover Studio.",
      "Page Thickness Multipliers:",
      "• White Paper Paperback = Page Count × 0.002252 inches",
      "• Cream Paper Paperback = Page Count × 0.0025 inches",
      "• Premium Color Paper = Page Count × 0.002347 inches"
    ]
  },
  {
    id: "isbn-barcode-generator-guide",
    category: "cover-formatting",
    categoryLabel: "Cover & Formatting",
    title: "Free ISBN Barcode Generator & KDP Placement Rules",
    summary: "How to generate a 300 DPI vector EAN-13 ISBN barcode with price extension for your KDP back cover.",
    readTime: "2 min read",
    icon: "FileCode",
    content: [
      "Every KDP paperback requires an ISBN barcode on the lower-right corner of the back cover.",
      "KDPage includes a 100% free ISBN Barcode Generator (/tools/isbn-generator) that exports vector SVGs and 300 DPI PNGs."
    ],
    steps: [
      "Navigate to /tools/isbn-generator.",
      "Enter your 13-digit ISBN number (provided free by KDP or purchased from Bowker).",
      "Optionally add a 5-digit price extension (e.g., 50999 for $9.99 USD).",
      "Download the PNG/SVG and place it in the bottom-right corner of your back cover, leaving 0.25\" margin from edges."
    ]
  },

  // AI & Publishing
  {
    id: "ai-book-generator-guide",
    category: "publishing",
    categoryLabel: "KDP Publishing",
    title: "AI Book Generator: Writing Chapter Outlines & Story Text",
    summary: "Use OpenAI-powered prompts to generate chapter structures, non-fiction guides, and fiction story outlines.",
    readTime: "3 min read",
    icon: "Sparkles",
    content: [
      "KDPage's AI Book Generator (/generate) helps you write introduction pages, chapter outlines, puzzle instructions, and story text for medium-content books."
    ],
    steps: [
      "Go to /generate.",
      "Select Genre (e.g., Self-Help, Fantasy, Puzzle Guide) and Tone.",
      "Type a brief prompt describing your book topic.",
      "Click 'Generate Outline & Chapters' — the AI will write a structured chapter-by-chapter manuscript.",
      "Click 'Save to My Notebook' to store your manuscript in your KDPage account."
    ]
  },
  {
    id: "kdp-keyword-niche-spy-guide",
    category: "publishing",
    categoryLabel: "KDP Publishing",
    title: "KDP Niche Hunter & Keyword Research Guide",
    summary: "Find low-competition, high-profit KDP niches and optimize your 7 backend keyword slots on Amazon.",
    readTime: "3 min read",
    icon: "Search",
    content: [
      "Ranking on Page 1 of Amazon search results depends heavily on your 7 KDP backend keyword slots and title keywords.",
      "Use our KDP Keyword Explorer (/tools/keyword-research) to analyze search volume, competition scores, and top-ranking titles."
    ]
  },
  {
    id: "exporting-uploading-to-amazon-kdp",
    category: "publishing",
    categoryLabel: "KDP Publishing",
    title: "Final Checklist: Exporting & Uploading to Amazon KDP",
    summary: "Pre-flight checklist to guarantee 100% approval when uploading your manuscript PDF to KDP Book Shelf.",
    readTime: "2 min read",
    icon: "Download",
    content: [
      "Before uploading your files to kdp.amazon.com, run through this quick 5-point verification checklist:"
    ],
    steps: [
      "1. Interior PDF: Exported from KDPage in 300 DPI vector format with correct page count.",
      "2. Trim Size Match: Interior trim size (e.g. 8.5\" x 11\") matches the KDP bookshelf selection exactly.",
      "3. Bleed Setting: Set to 'No Bleed' unless graphics touch the outer page edges.",
      "4. Cover PDF: Full-wrap PDF file uploaded to KDP Cover Creator (do not upload front cover only).",
      "5. Previewer Check: Open Amazon KDP's Print Previewer and verify zero red error boxes appear on text or margins."
    ]
  }
];

export default function DocsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>("quickstart-5-min-book");

  const filteredArticles = ARTICLES.filter((article) => {
    // Hide docs for the AI Book Generator while that feature is turned off.
    if (!AI_FEATURES_ENABLED && article.id === "ai-book-generator-guide") return false;

    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", label: "All Help Articles" },
    { id: "getting-started", label: "🚀 Getting Started" },
    { id: "puzzle-engines", label: "🧩 Puzzle Engines" },
    { id: "cover-formatting", label: "🎨 Cover & Formatting" },
    { id: "publishing", label: "📚 KDP Publishing" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-50 py-16 px-4 sm:px-6 relative overflow-hidden">

      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Back Link */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Header Hero */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider shadow-sm">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            KDPage Knowledge Base &amp; Documentation
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            How can we <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">help you publish?</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Browse 14+ step-by-step guides covering KDP puzzle generation, cover design, margin compliance, and AppSumo code redemption.
          </p>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-indigo-500/5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Search articles... (e.g. 'AppSumo', 'Sudoku', 'Spine width', 'KDP Margin')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 px-4 bg-transparent text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Official YouTube Walkthrough Card */}
          <div className="max-w-4xl mx-auto pt-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-left space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">Official Video Tutorial</span>
                </div>
                <span className="text-xs font-bold text-slate-400">Complete Demo &amp; Walkthrough</span>
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                <iframe
                  src={getYouTubeEmbedUrl()}
                  title="KDPage Full Video Walkthrough"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-800"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Article Accordion List */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredArticles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">No articles found matching &quot;{searchQuery}&quot;</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try searching for broader terms like &quot;puzzle&quot;, &quot;cover&quot;, &quot;KDP&quot;, or &quot;redeem&quot;. Or contact our support team directly.
              </p>
              <a
                href="mailto:support@kdpage.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-500 transition-colors"
              >
                <Mail className="w-4 h-4" /> Contact Support Team
              </a>
            </div>
          ) : (
            filteredArticles.map((article) => {
              const isExpanded = expandedArticleId === article.id;
              return (
                <div
                  key={article.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl transition-all duration-300 overflow-hidden ${isExpanded
                      ? "border-indigo-500/50 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-500/30"
                      : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                    }`}
                >
                  {/* Article Header (Clickable Accordion) */}
                  <button
                    onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                    className="w-full text-left p-6 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl shrink-0 ${isExpanded
                          ? "bg-indigo-600 text-white"
                          : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900"
                        }`}>
                        <BookOpen className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-md">
                            {article.categoryLabel}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {article.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                          {article.summary}
                        </p>
                      </div>
                    </div>

                    <div className={`p-2 rounded-xl border shrink-0 transition-transform duration-300 ${isExpanded
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 rotate-180"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800"
                      }`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  {/* Expanded Body Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-6">

                      {/* Description Paragraphs */}
                      <div className="space-y-3">
                        {article.content.map((p, idx) => (
                          <p key={idx} className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                            {p}
                          </p>
                        ))}
                      </div>

                      {/* Step-by-Step List (If Available) */}
                      {article.steps && article.steps.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Step-by-Step Instructions:
                          </h4>
                          <ol className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {article.steps.map((step, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </span>
                                <span className="flex-1 leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Pro Tips (If Available) */}
                      {article.tips && article.tips.length > 0 && (
                        <div className="bg-amber-50/80 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Pro Tips:
                          </h4>
                          <ul className="space-y-1.5 text-xs font-medium text-amber-900 dark:text-amber-300">
                            {article.tips.map((tip, tIdx) => (
                              <li key={tIdx} className="flex items-start gap-2">
                                <span>•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Quick CTA Shortcuts */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <span className="text-[11px] text-slate-400 font-semibold">Was this article helpful?</span>
                        <div className="flex items-center gap-2">
                          <Link
                            href="/studio"
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                          >
                            Open Creator Studio <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Support Banner */}
        <div className="mt-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <h3 className="text-2xl font-black">Still have questions or need human support?</h3>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto font-medium leading-relaxed">
              Our support team is active 24/7. Whether you need help with an AppSumo code redemption or a custom KDP interior layout, we are here for you.
            </p>
            <div className="pt-2">
              <a
                href="mailto:support@kdpage.com"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
              >
                <Mail className="w-4 h-4" /> Contact support@kdpage.com
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
