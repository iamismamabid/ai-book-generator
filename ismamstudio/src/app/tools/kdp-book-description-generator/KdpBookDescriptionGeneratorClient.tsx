"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Eye,
  Code,
  FileText,
  AlertTriangle,
  Star,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  ShoppingBag,
  Share2,
  Sliders,
  Type,
  List,
  ListOrdered,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3
} from "lucide-react";

interface DescriptionTemplate {
  id: string;
  name: string;
  category: string;
  html: string;
}

const TEMPLATES: DescriptionTemplate[] = [
  {
    id: "nonfiction",
    name: "Non-Fiction / Self-Help",
    category: "Business & Education",
    html: `<h2><b>Stop Guessing and Start Dominating Amazon KDP Today!</b></h2>
<p>Are you tired of uploading books that get buried under thousands of competitors? Do you want to build a dependable, passive self-publishing income without spending months on guesswork?</p>
<p>In this comprehensive, step-by-step masterclass, you will uncover the exact blueprint top-earning independent publishers use to produce and scale bestselling low- and medium-content books.</p>
<h3><b>Inside this game-changing guide, you will discover:</b></h3>
<ul>
  <li><b>The 3-Minute Keyword Spy Method:</b> Find golden, high-demand niches before anyone else.</li>
  <li><b>Automated Cover & Interior Systems:</b> Create professional, print-ready files in minutes.</li>
  <li><b>Amazon Algorithm Triggers:</b> How to get your book featured on page 1 of search results.</li>
  <li><b>Bulletproof Pricing Strategies:</b> Maximize your 60% royalty without sacrificing sales volume.</li>
</ul>
<p>Whether you are publishing your very first notebook or scaling a 100-book catalog, this practical roadmap gives you the tools, formulas, and confidence to succeed.</p>
<hr>
<p><b>Don't let your ideas sit on the shelf. Scroll up and click 'Buy Now' to launch your publishing journey today!</b></p>`,
  },
  {
    id: "fiction",
    name: "Fiction / Mystery Thriller",
    category: "Fiction & Novels",
    html: `<h2><b>A buried secret. A stolen identity. And a countdown to a murder that should never have happened.</b></h2>
<p>When investigative journalist Clara Vance receives an encrypted audio file from an anonymous source, she assumes it is just another internet hoax. But when the voice on the recording mentions her sister's classified military disappearance—from twelve years ago—the mystery turns personal.</p>
<p>Every clue leads deeper into a web of corruption spanning the foggy docks of Boston to the highest corridors of political power. Someone powerful will stop at nothing to keep the truth submerged.</p>
<h3><b>Praise for Clara Vance Mysteries:</b></h3>
<ul>
  <li><i>"An adrenaline-fueled, unputdownable thriller with twists that left me breathless!"</i> — <b>Crime Fiction Weekly</b></li>
  <li><i>"Masterfully plotted with characters you will root for until the very last page."</i> — <b>Mystery Guild Reviews</b></li>
</ul>
<p>As the clock ticks down, Clara must decide: how much is the truth really worth when the price of uncovering it is her own life?</p>
<hr>
<p><b>Fans of Dan Brown and Gillian Flynn will love this fast-paced mystery. Grab your copy now and prepare to stay up all night!</b></p>`,
  },
  {
    id: "puzzle",
    name: "Puzzle / Activity Book",
    category: "Puzzles & Games",
    html: `<h2><b>Unwind, Relax, and Sharpen Your Mind with 100 Large-Print Puzzles!</b></h2>
<p>Looking for a fun, screen-free way to stimulate your brain, boost memory, and relieve everyday stress? This beautifully curated puzzle collection provides hours of relaxing entertainment for adults, seniors, and teens!</p>
<h3><b>Why You Will Love This Puzzle Collection:</b></h3>
<ul>
  <li><b>Extra-Large 18pt+ Font:</b> Clean, high-contrast grids that are easy on the eyes with zero squinting.</li>
  <li><b>Carefully Crafted Themes:</b> Explore inspiring puzzles themed around nature, travel, world history, and retro nostalgia.</li>
  <li><b>Guaranteed Single Solutions:</b> Mathematically verified layouts so you never get stuck on ambiguous clues.</li>
  <li><b>Complete Answer Keys Included:</b> Full solution grids formatted clearly at the back of the book.</li>
  <li><b>Spacious 8.5" x 11" Format:</b> Generous margins give you plenty of room to write and work comfortably.</li>
</ul>
<hr>
<p><b>The perfect gift for parents, grandparents, and puzzle enthusiasts alike. Add to cart today and start solving!</b></p>`,
  },
  {
    id: "children",
    name: "Children's / Coloring Book",
    category: "Kids & Activity",
    html: `<h2><b>Spark Your Child's Creativity with Hours of Magical Fun!</b></h2>
<p>Ignite your little one's imagination with this delightful, screen-free activity book packed with adorable illustrations, playful animals, and captivating adventures designed specifically for kids ages 4–8!</p>
<h3><b>What Makes This Book Special:</b></h3>
<ul>
  <li><b>50+ Unique Hand-Drawn Designs:</b> Whimsical characters and cute scenes that kids will fall in love with.</li>
  <li><b>Single-Sided Pages:</b> Every image is printed on its own sheet to prevent color bleed-through from markers.</li>
  <li><b>Skill-Building Activities:</b> Helps develop fine motor skills, hand-eye coordination, and creative focus.</li>
  <li><b>Durable Large 8.5" x 11" Trim:</b> Big, easy-to-color spaces perfect for little toddler hands and crayons.</li>
</ul>
<p>Whether for rainy afternoon entertainment, long car road trips, or bedtime quiet time, this book is an absolute family favorite!</p>
<hr>
<p><b>Give the gift of pure creative joy! Scroll up and click 'Buy Now' to treat your child today!</b></p>`,
  },
];

export default function KdpBookDescriptionGeneratorClient() {
  const [htmlContent, setHtmlContent] = useState<string>(TEMPLATES[0]!.html);
  const [activeTab, setActiveTab] = useState<"visual" | "html">("visual");
  const [copied, setCopied] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Mockup Settings
  const [bookTitle, setBookTitle] = useState<string>("The Ultimate Amazon KDP Blueprint 2026");
  const [authorName, setAuthorName] = useState<string>("Sarah Jenkins");
  const [selectedFormat, setSelectedFormat] = useState<"paperback" | "kindle" | "hardcover">("paperback");
  const [bookPrice, setBookPrice] = useState<string>("$9.99");

  // Character stats
  const charCount = htmlContent.length;
  const wordCount = htmlContent.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const charLimit = 4000;
  const charsRemaining = charLimit - charCount;
  const isOverLimit = charCount > charLimit;

  // Insert tag helper into visual editor
  const insertTag = (openTag: string, closeTag: string, defaultText: string = "Sample Text") => {
    setHtmlContent((prev) => `${prev}\n${openTag}${defaultText}${closeTag}`);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const loadTemplate = (tpl: DescriptionTemplate) => {
    setHtmlContent(tpl.html);
  };

  const cleanSanitizeHtml = () => {
    // Basic sanitizer: remove unsafe tags while preserving Amazon allowed tags
    let cleaned = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<div\b[^>]*>/gi, "<p>")
      .replace(/<\/div>/gi, "</p>")
      .replace(/<span\b[^>]*>/gi, "")
      .replace(/<\/span>/gi, "");
    setHtmlContent(cleaned);
  };

  const faqs = [
    {
      q: "What HTML tags are officially allowed by Amazon KDP?",
      a: "Amazon strictly permits: <h2>, <h3>, <h4>, <h5>, <h6>, <b>, <strong>, <i>, <em>, <u>, <s>, <strike>, <ol>, <ul>, <li>, <p>, <br>, <sub>, and <sup>. All unapproved tags (such as <div>, <span>, or inline styling) are stripped by Amazon.",
    },
    {
      q: "What is the Amazon KDP description character limit?",
      a: "Amazon limits descriptions to 4,000 characters total. This character count INCLUDES all HTML tags (<p>, <b>, <ul>, etc.), spaces, and punctuation. Our real-time counter warns you if you approach or exceed 4,000 characters.",
    },
    {
      q: "Why does my book description look like a giant wall of text on Amazon?",
      a: "Amazon's listing editor strips standard line breaks from plain text. To create paragraphs, headlines, and bullet lists, you MUST wrap your text in valid HTML tags like <h2> for headlines, <p> for paragraphs, and <ul><li> for bullet points.",
    },
    {
      q: "Can I use emojis in my Amazon KDP book blurb?",
      a: "Yes! High-converting emojis like ⭐, 🏆, ✅, 🚀, and 🎁 are supported and help catch readers' eyes while scanning. However, use them tastefully—overusing emojis looks spammy and can trigger automated review flags.",
    },
    {
      q: "Where do I paste this HTML code in Amazon KDP?",
      a: "Go to your KDP Dashboard, click 'Create' or 'Edit Book Details', and find the 'Description' field in the Paperback/Kindle Details tab. Simply paste this generated HTML directly into that box.",
    },
    {
      q: "Does Amazon KDP support H1 tags?",
      a: "No. Amazon reserves the <h1> tag for your official book title at the top of the product page. For your description headlines, use <h2> (Large Headline) and <h3> (Sub-headline) to ensure correct rendering.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header Breadcrumb & Titles */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> 100% Free Amazon KDP Formatter
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            KDP Book Description <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Generator</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
            Format clean, Amazon-compliant HTML with bolding, headlines, and bullet points. Test with real-time Amazon product page preview and 4,000-character protection.
          </p>
        </div>

        {/* Template Selector Bar */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-wider">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>1-Click Templates:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => loadTemplate(tpl)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/40 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <span>{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Work Area: Editor Left, Live Mockup Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Rich Editor & Formatting Controls (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-xl">
              {/* Editor Header & Tab Switcher */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("visual")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "visual"
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Visual Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("html")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "html"
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" /> HTML Code
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cleanSanitizeHtml}
                    title="Strip disallowed HTML tags"
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Clean</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHtmlContent("")}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => insertTag("<h2><b>", "</b></h2>", "Your Major Headline Here")}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs transition cursor-pointer"
                  title="Large Headline (H2)"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<h3><b>", "</b></h3>", "Sub-headline Here")}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs transition cursor-pointer"
                  title="Sub-headline (H3)"
                >
                  H3
                </button>
                <span className="w-px h-4 bg-slate-800 mx-1" />
                <button
                  type="button"
                  onClick={() => insertTag("<b>", "</b>", "Bold Text")}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Bold (<b>)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<i>", "</i>", "Italic Text")}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Italic (<i>)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<u>", "</u>", "Underlined Text")}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Underline (<u>)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<s>", "</s>", "Strikethrough Text")}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Strikethrough (<s>)"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
                <span className="w-px h-4 bg-slate-800 mx-1" />
                <button
                  type="button"
                  onClick={() => insertTag("<ul>\n  <li><b>Key Benefit:</b> Explanation</li>\n  <li><b>Second Feature:</b> Details</li>\n</ul>", "")}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Bullet List (<ul><li>)"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<ol>\n  <li><b>Step 1:</b> Start here</li>\n  <li><b>Step 2:</b> Next phase</li>\n</ol>", "")}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Numbered List (<ol><li>)"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<hr>", "")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-xs transition cursor-pointer"
                  title="Divider Line (<hr>)"
                >
                  HR
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<p>⭐ ⭐ ⭐ ⭐ ⭐ <i>\"Best guide on the topic!\"</i> — Verified Buyer</p>", "")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition cursor-pointer"
                  title="Review Quote Snippet"
                >
                  ⭐ Quote
                </button>
              </div>

              {/* Textarea Input */}
              <div className="relative">
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Paste or write your Amazon book description here..."
                  rows={14}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-2xl p-4 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
                />
              </div>

              {/* Character Counter Progress Bar */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Character Limit:</span>
                    <span className={`font-mono font-black ${isOverLimit ? "text-rose-400" : charCount > 3500 ? "text-amber-400" : "text-emerald-400"}`}>
                      {charCount} / {charLimit}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span>{wordCount} words</span>
                    <span>{charsRemaining >= 0 ? `${charsRemaining} left` : `${Math.abs(charsRemaining)} over!`}</span>
                  </div>
                </div>

                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isOverLimit
                        ? "bg-rose-500"
                        : charCount > 3500
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, (charCount / charLimit) * 100)}%` }}
                  />
                </div>

                {isOverLimit && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>
                      <strong>Warning:</strong> Amazon strictly rejects descriptions exceeding 4,000 characters. Please trim your text by {Math.abs(charsRemaining)} characters.
                    </span>
                  </div>
                )}
              </div>

              {/* 1-Click Copy Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  disabled={isOverLimit}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition cursor-pointer ${
                    copied
                      ? "bg-emerald-500 text-slate-950"
                      : isOverLimit
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20 hover:scale-[1.02] active:scale-95"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-slate-950" />
                      <span>Copied Amazon HTML!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 text-slate-950" />
                      <span>Copy Amazon HTML Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Amazon Product Page Mockup (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-400 ml-2">Amazon.com Product Preview</span>
                </div>
                <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Live View
                </span>
              </div>

              {/* Mockup Customizer Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Book Title</label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">List Price</label>
                  <input
                    type="text"
                    value={bookPrice}
                    onChange={(e) => setBookPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Realistic Amazon Product Box */}
              <div className="bg-white text-[#0F1111] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
                {/* Amazon Category Breadcrumbs */}
                <div className="text-[11px] text-[#565959] flex items-center gap-1.5 font-sans">
                  <span>Books</span>
                  <span>›</span>
                  <span>Self-Publishing &amp; Computers</span>
                  <span>›</span>
                  <span>Author Guides</span>
                </div>

                {/* Title & Author */}
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F1111] leading-snug">
                    {bookTitle || "Your Book Title Here"}
                  </h2>
                  <p className="text-xs text-[#007185] font-medium">
                    by <span className="hover:underline cursor-pointer">{authorName || "Author Name"}</span> (Author)
                  </p>
                </div>

                {/* Star Ratings Mockup */}
                <div className="flex items-center gap-2 text-xs text-[#007185] pb-2 border-b border-slate-200">
                  <div className="flex items-center text-[#FFA41C]">
                    <Star className="w-4 h-4 fill-[#FFA41C]" />
                    <Star className="w-4 h-4 fill-[#FFA41C]" />
                    <Star className="w-4 h-4 fill-[#FFA41C]" />
                    <Star className="w-4 h-4 fill-[#FFA41C]" />
                    <Star className="w-4 h-4 fill-[#FFA41C]" />
                  </div>
                  <span className="font-bold text-[#0F1111]">4.9 out of 5</span>
                  <span className="text-[#565959]">|</span>
                  <span className="hover:underline cursor-pointer">184 ratings</span>
                </div>

                {/* Format Tabs (Kindle, Paperback, Hardcover) */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedFormat("kindle"); setBookPrice("$2.99"); }}
                    className={`px-4 py-2 rounded-lg border text-left cursor-pointer transition ${
                      selectedFormat === "kindle"
                        ? "border-[#E77600] bg-[#FFF8F0]"
                        : "border-slate-300 hover:border-slate-400 bg-white"
                    }`}
                  >
                    <span className="block text-[11px] font-bold text-[#0F1111]">Kindle</span>
                    <span className="block text-xs font-black text-[#B12704]">$2.99</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedFormat("paperback"); setBookPrice("$9.99"); }}
                    className={`px-4 py-2 rounded-lg border text-left cursor-pointer transition ${
                      selectedFormat === "paperback"
                        ? "border-[#E77600] bg-[#FFF8F0]"
                        : "border-slate-300 hover:border-slate-400 bg-white"
                    }`}
                  >
                    <span className="block text-[11px] font-bold text-[#0F1111]">Paperback</span>
                    <span className="block text-xs font-black text-[#B12704]">{bookPrice}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedFormat("hardcover"); setBookPrice("$19.99"); }}
                    className={`px-4 py-2 rounded-lg border text-left cursor-pointer transition ${
                      selectedFormat === "hardcover"
                        ? "border-[#E77600] bg-[#FFF8F0]"
                        : "border-slate-300 hover:border-slate-400 bg-white"
                    }`}
                  >
                    <span className="block text-[11px] font-bold text-[#0F1111]">Hardcover</span>
                    <span className="block text-xs font-black text-[#B12704]">$19.99</span>
                  </button>
                </div>

                {/* Amazon "Product Description" Header */}
                <div className="pt-2 border-t border-slate-200">
                  <h3 className="text-base font-bold text-[#0F1111] mb-3">
                    Product Description
                  </h3>

                  {/* Amazon Typography Styling */}
                  <style>{`
                    .amazon-preview-content h2 { font-size: 1.15rem; font-weight: 700; color: #C45500; margin-top: 0.75rem; margin-bottom: 0.5rem; line-height: 1.3; }
                    .amazon-preview-content h3 { font-size: 1.05rem; font-weight: 700; color: #0F1111; margin-top: 0.75rem; margin-bottom: 0.35rem; line-height: 1.3; }
                    .amazon-preview-content p { margin-bottom: 0.75rem; line-height: 1.5; color: #333333; }
                    .amazon-preview-content ul { list-style-type: disc !important; margin-left: 1.5rem !important; margin-bottom: 0.75rem !important; }
                    .amazon-preview-content ol { list-style-type: decimal !important; margin-left: 1.5rem !important; margin-bottom: 0.75rem !important; }
                    .amazon-preview-content li { margin-bottom: 0.35rem !important; line-height: 1.45 !important; }
                    .amazon-preview-content b, .amazon-preview-content strong { font-weight: 700; color: #0F1111; }
                    .amazon-preview-content i, .amazon-preview-content em { font-style: italic; }
                    .amazon-preview-content u { text-decoration: underline; }
                    .amazon-preview-content s, .amazon-preview-content strike { text-decoration: line-through; }
                    .amazon-preview-content hr { border: 0; border-top: 1px solid #E7E7E7; margin: 1rem 0; }
                  `}</style>

                  {/* Rendered HTML Container exactly matching Amazon Ember typography */}
                  <div
                    className="amazon-preview-content text-[13px] leading-[1.5] text-[#333333] space-y-3 max-h-[420px] overflow-y-auto pr-2"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    style={{
                      fontFamily: '"Amazon Ember", Arial, sans-serif'
                    }}
                  />
                </div>

                {/* Buy Box Mockup Footer */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> In Stock
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-1.5 rounded-full bg-[#FFD814] border border-[#FCD200] text-[#0F1111] font-bold text-xs shadow-sm">
                      Add to Cart
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-[#FFA41C] border border-[#FF8F00] text-[#0F1111] font-bold text-xs shadow-sm">
                      Buy Now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Official Amazon KDP HTML Rules */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="space-y-2 max-w-3xl">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
              Amazon KDP Guidelines
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Official Allowed HTML Tags for Amazon Book Descriptions (2026)
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
              Amazon uses an automated filter that strips any unapproved styling, CSS classes, or modern tags. To guarantee your formatting never breaks, stick strictly to these validated elements:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-mono font-black text-amber-400">&lt;h2&gt; and &lt;h3&gt;</span>
              <h4 className="text-sm font-bold text-white">Headlines &amp; Hooks</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Creates high-impact headline banners. Amazon does not support &lt;h1&gt; in descriptions.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-mono font-black text-indigo-400">&lt;b&gt; &amp; &lt;strong&gt;</span>
              <h4 className="text-sm font-bold text-white">Bold Keyword Emphasis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Highlights key features and benefits so skimming readers catch your value proposition in seconds.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-mono font-black text-emerald-400">&lt;ul&gt; &amp; &lt;li&gt;</span>
              <h4 className="text-sm font-bold text-white">Bulleted Lists</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Breaks down book features, chapter summaries, or bonuses into easily digestible points.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-mono font-black text-rose-400">&lt;i&gt; &amp; &lt;em&gt;</span>
              <h4 className="text-sm font-bold text-white">Italics &amp; Quotes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ideal for book reviews, customer testimonials, thought dialogs, or book titles.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-mono font-black text-purple-400">&lt;p&gt; &amp; &lt;br&gt;</span>
              <h4 className="text-sm font-bold text-white">Paragraph Spacing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prevents your text from collapsing into a giant unreadable block on mobile devices.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-mono font-black text-yellow-400">&lt;hr&gt;</span>
              <h4 className="text-sm font-bold text-white">Horizontal Dividers</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Separates your main body copy from your final Call to Action (CTA) or editorial reviews.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: 4-Part High-Converting Blurb Formula */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
              Copywriting Mastery
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              The 4-Part Formula for Bestselling Amazon Book Blurbs
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Top 1% KDP publishers follow this proven sales framework to convert casual searchers into buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-amber-400 font-mono text-xs font-black uppercase">Part 1</span>
              <h4 className="text-base font-bold text-white">The Bold Hook</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                An emotional 1-sentence headline wrapped in &lt;h2&gt;&lt;b&gt; tags that stops the reader from scrolling past.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-indigo-400 font-mono text-xs font-black uppercase">Part 2</span>
              <h4 className="text-base font-bold text-white">The Pain / Curiosity</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                2 short paragraphs describing the core conflict or the specific problem your book solves for the reader.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-emerald-400 font-mono text-xs font-black uppercase">Part 3</span>
              <h4 className="text-base font-bold text-white">The Bulleted Benefits</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                3–5 scannable bullet points highlighting features, secrets revealed, or puzzle specs with bold labels.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-rose-400 font-mono text-xs font-black uppercase">Part 4</span>
              <h4 className="text-base font-bold text-white">The Direct CTA</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                A clear, urgent command: <i>"Scroll up and click 'Buy Now' to claim your copy today!"</i>
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: FAQ Accordion */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions About KDP Descriptions
            </h2>
            <p className="text-slate-400 text-sm">
              Everything you need to know about Amazon HTML formatting and character rules.
            </p>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-black text-sm sm:text-base text-white flex items-center justify-between gap-4 cursor-pointer hover:text-amber-400 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      openFaq === idx ? "rotate-180 text-amber-400" : "text-slate-400"
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Cross-Tool Conversion Bridge */}
        <section className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-black uppercase tracking-wider">
              🚀 Complete Your KDP Book Setup
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Build the Rest of Your Book in 5 Minutes
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Pair your high-converting description with professional automated covers and algorithmic puzzle interiors:
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tools/kdp-cover-creator"
                className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-400/20 flex items-center gap-2"
              >
                <span>Automated Cover Creator</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tools/kdp-puzzle-generator"
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 border border-slate-700"
              >
                KDP Puzzle Generator
              </Link>
              <Link
                href="/tools/print-cost-calculator"
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 border border-slate-700"
              >
                Print Cost &amp; Royalty Calculator
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
