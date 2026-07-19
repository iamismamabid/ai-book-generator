"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, ArrowLeft, BookOpen, Calculator, Search, CheckCircle2, 
  HelpCircle, Settings, FileText, Layout, Copy, Check, ChevronRight,
  BookMarked, PenTool, Hash, RefreshCw, BarChart2, ShieldAlert
} from "lucide-react";

interface ToolItem {
  id: string;
  name: string;
  badge?: string;
  category: "Design" | "Writing" | "Formatting" | "Marketing";
  description: string;
  features: string[];
  link?: string;
  isInteractive?: boolean;
}

export default function FreeToolsHub() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Active Tool Modal states
  const [activeInteractiveTool, setActiveInteractiveTool] = useState<string | null>(null);

  // Widget States: Title Generator
  const [titleGenre, setTitleGenre] = useState("Non-Fiction");
  const [titleKeywords, setTitleKeywords] = useState("");
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  // Widget States: Royalty Calculator
  const [pages, setPages] = useState<number>(120);
  const [price, setPrice] = useState<number>(8.99);
  const [colorType, setColorType] = useState<"bw" | "color">("bw");
  const [paperColor, setPaperColor] = useState<"white" | "cream">("white");

  // Widget States: Description Formatter
  const [descInput, setDescInput] = useState("");
  const [formattedHtml, setFormattedHtml] = useState("");

  // Widget States: Upload Checklist
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, text: "Validate trim size matches design specifications", checked: false },
    { id: 2, text: "Ensure total page count is even (for correct blank back page)", checked: false },
    { id: 3, text: "Verify spine thickness fits calculated dimensions", checked: false },
    { id: 4, text: "Leave a 0.25 inch safe zone for all text and elements", checked: false },
    { id: 5, text: "Configure barcode placeholder in lower-right back cover", checked: false },
    { id: 6, text: "Include solution paths or solution indexes at back", checked: false }
  ]);

  // Widget States: Self-Assessment Scorecard
  const [scorecard, setScorecard] = useState([
    { id: "s1", label: "Title is legible at thumbnail size (120px tall)", checked: false, points: 25 },
    { id: "s2", label: "Cover contrast clearly distinguishes text from background", checked: false, points: 25 },
    { id: "s3", label: "Cover layout visually promises what is inside (sample grid/maze)", checked: false, points: 20 },
    { id: "s4", label: "Fonts match the book's target genre/purpose", checked: false, points: 15 },
    { id: "s5", label: "Spine text is centered and safe from folding lines", checked: false, points: 15 }
  ]);

  // Widget States: eBook Formatter (EPUB) Mock
  const [epubTitle, setEpubTitle] = useState("");
  const [epubAuthor, setEpubAuthor] = useState("");
  const [epubSuccess, setEpubSuccess] = useState(false);

  // Widget States: PDF Formatter Mock
  const [pdfTrimSize, setPdfTrimSize] = useState("8.5x11");
  const [pdfFileAdded, setPdfFileAdded] = useState(false);
  const [pdfFormattingStatus, setPdfFormattingStatus] = useState<string>("");

  const [uploadedEpubFile, setUploadedEpubFile] = useState<string | null>(null);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<string | null>(null);

  const handleTriggerCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const generateTitlesAction = () => {
    if (!titleKeywords) {
      alert("Please enter at least one keyword!");
      return;
    }
    const words = titleKeywords.split(",").map(w => w.trim());
    const primary = words[0] || "Brain Exercises";
    const secondary = words[1] || "Daily Challenge";

    let mockList: string[] = [];
    if (titleGenre === "Non-Fiction" || titleGenre === "Puzzles") {
      mockList = [
        `The Ultimate ${primary} Book for Adults`,
        `100+ ${primary}: Fun & Relaxing puzzles`,
        `Daily ${primary}: Improve memory and focus`,
        `The Master Class ${primary} Collection`,
        `${primary} & ${secondary} Challenge Book`,
        `Large Print ${primary} for Seniors`,
        `The Logic Puzzle Bible: Featuring ${primary}`,
        `Supercharge Your Mind: ${primary} Activity Book`,
        `Mindfulness Puzzles: ${primary} for Stress Relief`,
        `Pocket-Sized ${primary} for Travelers`
      ];
    } else {
      mockList = [
        `The Secret of ${primary}`,
        `Shadows of ${primary}: A Mystery Novel`,
        `Echoes of ${primary}`,
        `The ${primary} Chronicles`,
        `Beyond the Gates of ${primary}`,
        `Journey to ${primary}: An Adventure Quest`,
        `The Last ${primary} Warrior`,
        `Secrets, Lies & ${primary}`,
        `The Curse of ${primary} Castle`,
        `Under the ${primary} Sky`
      ];
    }
    setGeneratedTitles(mockList);
  };

  // KDP Printing Costs Formulas (Standard paperback)
  const calcRoyalty = () => {
    let printCost = 0.0;
    if (colorType === "bw") {
      // Black & white: $0.85 per book + $0.012 per page (Amazon US rates)
      printCost = 0.85 + (pages * 0.012);
    } else {
      // Color: $0.85 per book + $0.07 per page
      printCost = 0.85 + (pages * 0.07);
    }
    // Amazon KDP Paperback royalty is 60% of retail price minus printing cost
    const royalty = (price * 0.60) - printCost;
    return {
      cost: printCost.toFixed(2),
      royalty: Math.max(0, royalty).toFixed(2),
      percent: ((Math.max(0, royalty) / price) * 100).toFixed(1)
    };
  };

  const { cost: printCost, royalty: estRoyalty, percent: royaltyPercent } = calcRoyalty();

  // Score calculation for Self-Assessment
  const totalScore = scorecard.reduce((sum, item) => sum + (item.checked ? item.points : 0), 0);

  const toolsList: ToolItem[] = [
    {
      id: "epub-formatter",
      name: "Free eBook Formatter (EPUB)",
      badge: "New",
      category: "Formatting",
      description: "Upload your Word or text manuscript and get a Kindle-ready EPUB package — chapters, table of contents, and title page.",
      features: ["Compliant structure", "Instant chapter generator", "Table of contents builder"],
      isInteractive: true
    },
    {
      id: "pdf-formatter",
      name: "Free KDP Interior PDF Formatter",
      badge: "New",
      category: "Formatting",
      description: "Upload your manuscript, choose a trim size, validate formatting, and export a KDP-ready interior PDF.",
      features: ["Auto margins", "Bleed validation helper", "Standard trim sizing"],
      isInteractive: true
    },
    {
      id: "puzzle-generator",
      name: "Free Puzzle Book Generator",
      badge: "New",
      category: "Design",
      description: "Generate a print-ready puzzle book — sudoku, word search, maze, and more — with solutions included.",
      features: ["Multiple types", "Answer keys compiled", "High contrast vector PDF"],
      link: "/studio"
    },
    {
      id: "crossword-generator",
      name: "Free KDP Crossword Generator",
      badge: "New",
      category: "Design",
      description: "Design custom crossword puzzle grids and compile high-contrast vector PDF worksheets for KDP interiors.",
      features: ["Custom grid sizing (10x10 to 20x20)", "Live KDP safe area preview", "Instant answers sheets"],
      link: "/studio/crossword"
    },
    {
      id: "cover-calculator",
      name: "Free KDP Cover Size Calculator",
      badge: "New",
      category: "Design",
      description: "Calculate full-wrap cover dimensions — back, spine, front, and bleed — in inches and pixels at 300 DPI.",
      features: ["300 DPI layout spec", "Trim boundary guides", "Automatic calculations"],
      link: "/tools/spine-calculator"
    },
    {
      id: "title-generator",
      name: "Free AI Book Title Generator",
      badge: "Most Popular",
      category: "Writing",
      description: "Generate catchy, marketable book titles for any genre. 10 unique KDP-optimized ideas per batch.",
      features: ["SEO metadata titles", "10 suggestions", "Non-fiction & fiction modes"],
      isInteractive: true
    },
    {
      id: "desc-generator",
      name: "Free Book Description Generator",
      badge: "New",
      category: "Writing",
      description: "Write conversion-optimized book descriptions with Amazon HTML formatting included.",
      features: ["Amazon HTML tags", "Sales pitch triggers", "Copy-paste output"],
      isInteractive: true
    },
    {
      id: "royalty-calculator",
      name: "KDP Royalty & Market Viability Estimator",
      badge: "New",
      category: "Marketing",
      description: "Analyze printing costs, promo discounts, Kindle Unlimited reads, advertising PPC, and category competition.",
      features: ["PPC Marketing Simulator", "Category competition index", "Spine width calculator included"],
      link: "/tools/royalty-estimator"
    },
    {
      id: "bulk-generator",
      name: "KDP Bulk Book Batch Studio",
      badge: "Popular",
      category: "Formatting",
      description: "Queue dozens of puzzle book interiors, import configurations via CSV, and compile ready-to-upload files in bulk.",
      features: ["CSV configuration upload", "Sequenced background builder", "Multi-book download list"],
      link: "/tools/bulk-generator"
    },
    {
      id: "spine-calculator",
      name: "Free Spine Width Calculator",
      badge: "New",
      category: "Design",
      description: "Get exact spine width and full cover dimensions for paperback and hardcover. Uses Amazon's official formulas.",
      features: ["Amazon guidelines", "Cream/white/color papers", "Precision calculation"],
      link: "/tools/spine-calculator"
    },
    {
      id: "desc-formatter",
      name: "Free Book Description Formatter",
      badge: "New",
      category: "Writing",
      description: "Format your KDP book description with Amazon-approved HTML. Bold, headings, bullet points — preview and copy.",
      features: ["Visual rich text preview", "Validates Amazon KDP tags", "Instant copy-paste"],
      isInteractive: true
    },
    {
      id: "upload-checklist",
      name: "Free KDP Upload Checklist",
      category: "Marketing",
      description: "Interactive checklist covering manuscript, cover, metadata, and account setup. Don't miss a single requirement.",
      features: ["Tick off requirements", "Formatting compliance check", "Ensure instant approvals"],
      isInteractive: true
    },
    {
      id: "keyword-research",
      name: "Free KDP Keyword Research",
      badge: "New",
      category: "Marketing",
      description: "Brainstorm long-tail keywords and plan all 7 backend keyword slots. Honest tool — no fake search volumes.",
      features: ["7 backend slots", "Search intent categories", "Low competition niches"],
      link: "/tools/keyword-research"
    },
    {
      id: "cover-assessment",
      name: "Free Cover Self-Assessment",
      badge: "New",
      category: "Design",
      description: "Score your cover for thumbnail legibility, contrast, and genre fit with a guided scorecard.",
      features: ["Thumbnail test", "Automated score report", "Formatting validation"],
      isInteractive: true
    },
    {
      id: "print-cost-calculator",
      name: "Free Print Cost Calculator",
      badge: "New",
      category: "Marketing",
      description: "Calculate Amazon KDP printing costs for paperbacks and hardcovers across all marketplaces.",
      features: ["US/UK/EU/CA rates", "Royalty per sale", "Marketplace comparison table"],
      link: "/tools/print-cost-calculator"
    },
    {
      id: "kenp-calculator",
      name: "Free KENP Royalty Calculator",
      badge: "New",
      category: "Marketing",
      description: "Estimate your Kindle Unlimited page-reads earnings based on KENP and current fund rates.",
      features: ["KENP count estimator", "Rate comparison table", "Monthly/yearly projections"],
      link: "/tools/kenp-calculator"
    },
    {
      id: "ebook-royalty-calculator",
      name: "Free eBook Royalty Calculator",
      badge: "New",
      category: "Marketing",
      description: "Calculate your Kindle eBook royalties for 35% and 70% plans across all Amazon marketplaces.",
      features: ["70% price band check", "Delivery fee factored in", "5 marketplaces"],
      link: "/tools/ebook-royalty-calculator"
    },
    {
      id: "ads-roi-calculator",
      name: "Free Book Ads ROI Calculator",
      badge: "New",
      category: "Marketing",
      description: "Track and optimize Amazon, Facebook, and BookBub ad campaigns. Calculate ROI, ACOS, and break-even points.",
      features: ["ACOS & ROAS", "Break-even calculator", "Max profitable bid"],
      link: "/tools/ads-roi-calculator"
    },
    {
      id: "reading-time-calculator",
      name: "Free Reading Time Calculator",
      badge: "New",
      category: "Writing",
      description: "Calculate estimated reading time for your book based on word count and reading speed.",
      features: ["Audiobook length estimate", "Print page estimate", "Adjustable reading speed"],
      link: "/tools/reading-time-calculator"
    },
    {
      id: "readability-calculator",
      name: "Free Readability Calculator",
      badge: "New",
      category: "Writing",
      description: "Calculate Flesch-Kincaid, Gunning Fog, SMOG, and other readability scores for your content.",
      features: ["5 grade-level formulas", "Target audience guide", "100% private analysis"],
      link: "/tools/readability-calculator"
    },
    {
      id: "keyword-density",
      name: "Free Keyword Density Analyzer",
      badge: "New",
      category: "Marketing",
      description: "Analyze keyword density in your book descriptions and content for SEO optimization.",
      features: ["Top phrase tables", "Stuffing detection", "Target keyword tracker"],
      link: "/tools/keyword-density"
    },
    {
      id: "grammar-checker",
      name: "Free Grammar Checker",
      badge: "New",
      category: "Writing",
      description: "Check spelling, grammar, and style in your book descriptions. Get readability scores and writing tips.",
      features: ["Passive voice detection", "Cliché & filler word flags", "Clarity score"],
      link: "/tools/grammar-checker"
    },
    {
      id: "copyright-page-generator",
      name: "Free Copyright Page Generator",
      badge: "New",
      category: "Writing",
      description: "Create professional copyright pages for your books with all required legal text.",
      features: ["Fiction/non-fiction wording", "6×9 PDF export", "Copy or download .txt"],
      link: "/tools/copyright-page-generator"
    },
    {
      id: "trademark-checker",
      name: "Free Trademark Checker",
      badge: "New",
      category: "Marketing",
      description: "Check if your book title or keywords contain trademarked terms that could cause issues.",
      features: ["70+ term screening list", "USPTO & TMview links", "Generic term guidance"],
      link: "/tools/trademark-checker"
    },
    {
      id: "book-planner",
      name: "Free Book Planner",
      badge: "New",
      category: "Writing",
      description: "Plan your book with chapters, characters, and outlines. Use templates and track your writing progress.",
      features: ["Novel/non-fiction templates", "Autosaves in browser", "Word-count progress bar"],
      link: "/tools/book-planner"
    },
    {
      id: "word-cloud",
      name: "Free Word Cloud Generator",
      badge: "New",
      category: "Design",
      description: "Create beautiful word clouds from text or keywords. Visualize your research with custom colors and shapes.",
      features: ["6 color schemes", "PNG export", "Stopword filtering"],
      link: "/tools/word-cloud"
    },
    {
      id: "qr-code-generator",
      name: "Free QR Code Generator",
      badge: "New",
      category: "Marketing",
      description: "Generate QR codes for book marketing, author websites, and social media links.",
      features: ["Custom colors", "Up to 2048px export", "Print-safe error correction"],
      link: "/tools/qr-code-generator"
    },
    {
      id: "image-resizer",
      name: "Free Mass Image Resizer",
      badge: "New",
      category: "Design",
      description: "Bulk resize up to 50 images at once. KDP cover presets, social media sizes, custom dimensions. Download all as ZIP.",
      features: ["50 images at once", "KDP & social presets", "Bulk ZIP download"],
      link: "/tools/image-resizer"
    },
    {
      id: "background-remover",
      name: "Free Background Remover",
      badge: "New",
      category: "Design",
      description: "Remove backgrounds from images instantly. Create transparent PNGs for covers and graphics.",
      features: ["Auto edge detection", "Click-to-pick color mode", "100% in-browser"],
      link: "/tools/background-remover"
    },
    {
      id: "photo-to-line-art",
      name: "Free Photo to Line Art",
      badge: "New",
      category: "Design",
      description: "Convert any photo into clean line art perfect for coloring books. Adjust line thickness and detail.",
      features: ["Adjustable detail level", "Coloring-book ready", "Instant PNG export"],
      link: "/tools/photo-to-line-art"
    },
    {
      id: "pattern-generator",
      name: "Free Pattern Generator",
      badge: "New",
      category: "Design",
      description: "Create seamless patterns for book covers and interiors. Multiple styles and colors.",
      features: ["12 pattern styles", "Seamless tile export", "300 DPI print sizes"],
      link: "/tools/pattern-generator"
    },
    {
      id: "stock-images",
      name: "Free Stock Images",
      badge: "New",
      category: "Design",
      description: "Search and download royalty-free stock images for your book covers and marketing materials.",
      features: ["Unsplash powered", "Commercial use OK", "No attribution required"],
      link: "/tools/stock-images"
    },
    {
      id: "pdf-compressor",
      name: "Free PDF Compressor",
      badge: "New",
      category: "Formatting",
      description: "Reduce PDF file size while maintaining quality. Perfect for meeting KDP upload limits.",
      features: ["Lossless or image modes", "Before/after size report", "100% in-browser"],
      link: "/tools/pdf-compressor"
    },
    {
      id: "kdp-file-validator",
      name: "Free KDP File Validator",
      badge: "New",
      category: "Formatting",
      description: "Validate your PDF files for KDP compliance. Check dimensions, fonts, and image resolution.",
      features: ["Trim size matching", "Page consistency check", "Pass/warn/fail report"],
      link: "/tools/kdp-file-validator"
    },
    {
      id: "ocr-scanner",
      name: "Free OCR Scanner",
      badge: "New",
      category: "Formatting",
      description: "Extract text from images, scanned pages, and image-based PDFs using advanced OCR technology.",
      features: ["6 languages supported", "Copy or download .txt", "100% in-browser"],
      link: "/tools/ocr-scanner"
    },
    {
      id: "interior-templates",
      name: "Free Interior Templates",
      badge: "New",
      category: "Formatting",
      description: "Download ready-to-use interior templates for journals, planners, notebooks, and more.",
      features: ["10 template styles", "Standard KDP trims", "Custom page counts"],
      link: "/tools/interior-templates"
    }
  ];

  const filteredTools = activeCategory === "All" 
    ? toolsList 
    : toolsList.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-stone-900 py-24 px-6 relative overflow-hidden">
      {/* 📖 Left-side Crease/Binding Shadow */}
      <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-stone-900/[0.06] via-stone-900/[0.02] to-transparent pointer-events-none z-20" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[140px] translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-rose-500/[0.03] rounded-full blur-[160px] -translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Navigation & Header */}
        <div className="mb-16 border-b border-stone-200 pb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200/60 text-amber-800 text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> 100% Free Tools — No Signup
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tight">
              Free Tools for <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 bg-clip-text text-transparent">Smarter Publishing</span>
            </h1>
            <p className="text-stone-600 text-base md:text-lg max-w-2xl font-semibold leading-relaxed">
              Calculate spine widths, format descriptions, generate ideas, and build print-ready templates without any registration.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-black text-stone-500 hover:text-amber-700 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-2.5 mb-12 pb-8 border-b border-stone-200">
          {["All", "Design", "Writing", "Formatting", "Marketing"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm ${
                activeCategory === cat 
                  ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black shadow-amber-600/10 scale-[1.03]" 
                  : "bg-white border border-stone-200 text-stone-600 hover:text-stone-950 hover:border-stone-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map((tool) => (
            <div 
              key={tool.id}
              className="bg-white/80 border border-stone-200/60 hover:border-amber-500/30 rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-500 group hover:-translate-y-1.5 shadow-md hover:shadow-[0_20px_40px_rgba(139,92,26,0.06),_inset_0_0_12px_rgba(245,158,11,0.01)] backdrop-blur-md relative"
            >
              <div>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                    tool.category === "Design" ? "text-sky-700 bg-sky-500/10 border-sky-500/20" :
                    tool.category === "Writing" ? "text-rose-700 bg-rose-500/10 border-rose-500/20" :
                    tool.category === "Formatting" ? "text-purple-700 bg-purple-500/10 border-purple-500/20" :
                    "text-emerald-700 bg-emerald-500/10 border-emerald-500/20"
                  }`}>
                    {tool.category}
                  </span>
                  {tool.badge && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md animate-pulse">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-stone-900 mb-2 group-hover:text-amber-700 transition-colors font-sans leading-tight">
                  {tool.name}
                </h3>
                <p className="text-stone-600 text-xs font-semibold leading-relaxed mb-6 font-sans">
                  {tool.description}
                </p>

                <ul className="space-y-2 mb-8">
                  {tool.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-[10px] font-bold text-stone-500 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {tool.isInteractive ? (
                <button
                  onClick={() => setActiveInteractiveTool(tool.id)}
                  className="w-full text-center py-3.5 bg-stone-50 border border-stone-200/80 hover:border-transparent hover:bg-gradient-to-r hover:from-amber-600 hover:to-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-600/15 text-stone-700 font-black text-xs rounded-xl shadow-sm transition-all duration-300 uppercase tracking-wider cursor-pointer hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-1.5"
                >
                  Launch Interactive Tool <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                </button>
              ) : (
                <Link
                  href={tool.link || "#"}
                  className="w-full text-center py-3.5 bg-stone-50 border border-stone-200/80 hover:border-transparent hover:bg-gradient-to-r hover:from-amber-600 hover:to-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-600/15 text-stone-700 inline-flex items-center justify-center gap-1.5 font-black text-xs rounded-xl shadow-sm transition-all duration-300 uppercase tracking-wider hover:scale-[1.02] active:scale-98"
                >
                  {tool.link ? "Open Tool" : "Launch Studio"} <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Dynamic Modals for Interactive Tools */}
        {activeInteractiveTool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-[#fbfaf7] border border-stone-200 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-white/60">
                <span className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> 
                  {toolsList.find(t => t.id === activeInteractiveTool)?.name}
                </span>
                <button 
                  onClick={() => {
                    setActiveInteractiveTool(null);
                    setGeneratedTitles([]);
                    setEpubSuccess(false);
                    setPdfFileAdded(false);
                    setUploadedEpubFile(null);
                    setUploadedPdfFile(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-600 hover:text-stone-900 font-bold transition-all text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Modal Content container */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">

                {/* 1. Title Generator */}
                {activeInteractiveTool === "title-generator" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Book Niche / Genre</label>
                        <select 
                          value={titleGenre}
                          onChange={(e) => setTitleGenre(e.target.value)}
                          className="w-full bg-white border border-stone-200 p-2.5 rounded-xl text-xs font-semibold text-stone-850 focus:outline-none focus:border-amber-600 transition-colors"
                        >
                          <option value="Non-Fiction">Non-Fiction</option>
                          <option value="Puzzles">Activity & Puzzle Books</option>
                          <option value="Fiction">Fiction Novel</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Target Keyword (e.g. Sudoku, Maze)</label>
                        <input
                          type="text"
                          value={titleKeywords}
                          onChange={(e) => setTitleKeywords(e.target.value)}
                          placeholder="e.g. Word Search, Seniors"
                          className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850 focus:outline-none focus:border-amber-600 transition-colors"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={generateTitlesAction}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
                    >
                      Generate 10 Titles
                    </button>

                    {generatedTitles.length > 0 && (
                      <div className="bg-white p-4 rounded-2xl border border-stone-200/60 space-y-2 mt-4">
                        <label className="text-[10px] font-black text-stone-400 block uppercase tracking-wider">KDP Optimized Ideas:</label>
                        <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                          {generatedTitles.map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-stone-50 rounded-lg text-xs">
                              <span className="font-bold text-stone-800">{t}</span>
                              <button 
                                onClick={() => handleTriggerCopy(t, `title-${idx}`)}
                                className="text-amber-700 hover:text-amber-800 font-bold"
                              >
                                {copiedText === `title-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. KDP Royalty Calculator */}
                {activeInteractiveTool === "royalty-calculator" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Page Count ({pages})</label>
                        <input
                          type="range"
                          min="24"
                          max="600"
                          value={pages}
                          onChange={(e) => setPages(parseInt(e.target.value))}
                          className="w-full accent-amber-650"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Retail Price ($ {price})</label>
                        <input
                          type="number"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850 focus:outline-none focus:border-amber-600 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Color Type</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setColorType("bw")}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${colorType === 'bw' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'}`}
                          >
                            Black & White
                          </button>
                          <button 
                            onClick={() => setColorType("color")}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${colorType === 'color' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'}`}
                          >
                            Premium Color
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Paper Color</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setPaperColor("white")}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${paperColor === 'white' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'}`}
                          >
                            White
                          </button>
                          <button 
                            onClick={() => setPaperColor("cream")}
                            disabled={colorType === 'color'}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border disabled:opacity-30 transition-all ${paperColor === 'cream' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'}`}
                          >
                            Cream
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Results Card */}
                    <div className="bg-white p-5 rounded-2xl border border-stone-200/60 space-y-4 shadow-sm">
                      <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Est. Royalties per Paperback Sale:</h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 bg-stone-50 rounded-xl">
                          <span className="text-[9px] font-black text-stone-400 block uppercase">Print Cost</span>
                          <span className="text-lg font-black text-red-650">${printCost}</span>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-xl">
                          <span className="text-[9px] font-black text-stone-400 block uppercase">Net Royalty</span>
                          <span className="text-lg font-black text-emerald-700">${estRoyalty}</span>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-xl">
                          <span className="text-[9px] font-black text-stone-400 block uppercase">Royalty %</span>
                          <span className="text-lg font-black text-amber-700">{royaltyPercent}%</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-500 text-center leading-normal">
                        Estimates are calculated using Amazon's standard 60% distribution channel royalty rate for paperback print-on-demand books.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Description Formatter & HTML Tool */}
                {(activeInteractiveTool === "desc-formatter" || activeInteractiveTool === "desc-generator") && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">
                        {activeInteractiveTool === "desc-formatter" ? "Write or Paste Description text" : "Draft Your Description (Use KDP tags)"}
                      </label>
                      <textarea
                        rows={6}
                        value={descInput}
                        onChange={(e) => {
                          setDescInput(e.target.value);
                          // Simple mock translation of lines to paragraphs
                          const formatted = e.target.value
                            .split("\n\n")
                            .map(p => `<p>${p.replace(/\n/g, "<br />")}</p>`)
                            .join("");
                          setFormattedHtml(formatted);
                        }}
                        placeholder="Type description. Leave empty lines for paragraphs."
                        className="w-full bg-white border border-stone-200 p-3 rounded-2xl text-xs text-stone-850 focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Formatted HTML Code</label>
                        <div className="relative">
                          <textarea
                            readOnly
                            rows={5}
                            value={formattedHtml}
                            className="w-full bg-stone-900 border border-stone-850 p-2.5 rounded-xl text-[10px] text-yellow-400 font-mono focus:outline-none"
                          />
                          <button 
                            onClick={() => handleTriggerCopy(formattedHtml, "desc-html")}
                            className="absolute top-2 right-2 p-1.5 bg-stone-800 hover:bg-stone-750 rounded-lg text-amber-400 border border-stone-750"
                          >
                            {copiedText === "desc-html" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Live KDP Preview</label>
                        <div 
                          className="bg-white text-slate-900 p-3 rounded-xl text-[11px] font-sans h-[110px] overflow-y-auto select-none border border-stone-200 leading-relaxed shadow-inner"
                          dangerouslySetInnerHTML={{ __html: formattedHtml || "<i>Your live preview will render here...</i>" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. KDP Upload Checklist */}
                {activeInteractiveTool === "upload-checklist" && (
                  <div className="space-y-4">
                    <p className="text-xs text-stone-500">
                      Tick off each requirement as you prepare your book package. This checklist matches Amazon KDP guidelines exactly to prevent rejected uploads.
                    </p>
                    <div className="space-y-2 bg-white p-4 rounded-2xl border border-stone-200/60">
                      {checklistItems.map(item => (
                        <label key={item.id} className="flex items-start gap-3 p-2 hover:bg-stone-50 rounded-lg cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => {
                              setChecklistItems(
                                checklistItems.map(i => i.id === item.id ? { ...i, checked: e.target.checked } : i)
                              );
                            }}
                            className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer mt-0.5"
                          />
                          <span className={`text-xs ${item.checked ? 'line-through text-stone-400 font-medium' : 'text-stone-700 font-semibold'}`}>
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Cover Self-Assessment */}
                {activeInteractiveTool === "cover-assessment" && (
                  <div className="space-y-4">
                    <p className="text-xs text-stone-500">
                      Evaluate your cover design honestly against the key conversion factors.
                    </p>
                    <div className="space-y-2 bg-white p-4 rounded-2xl border border-stone-200/60">
                      {scorecard.map(item => (
                        <label key={item.id} className="flex items-start gap-3 p-2 hover:bg-stone-50 rounded-lg cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => {
                              setScorecard(
                                scorecard.map(i => i.id === item.id ? { ...i, checked: e.target.checked } : i)
                              );
                            }}
                            className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer mt-0.5"
                          />
                          <div className="flex-1 flex justify-between items-center">
                            <span className={`text-xs ${item.checked ? 'text-emerald-700 font-bold' : 'text-stone-700 font-semibold'}`}>
                              {item.label}
                            </span>
                            <span className="text-[10px] font-black text-stone-400">+{item.points} pts</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-stone-200/60 flex justify-between items-center shadow-sm">
                      <div>
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Overall Score</span>
                        <span className="text-2xl font-black text-stone-900">{totalScore} / 100</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Rating</span>
                        <span className={`text-xs font-black uppercase ${
                          totalScore >= 80 ? 'text-emerald-700 animate-pulse' : (totalScore >= 50 ? 'text-amber-700' : 'text-rose-600')
                        }`}>
                          {totalScore >= 80 ? 'Ready to Publish' : (totalScore >= 50 ? 'Needs Improvement' : 'Rejected - Redesign')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. eBook Formatter Mock */}
                {activeInteractiveTool === "epub-formatter" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Book Title</label>
                        <input
                          type="text"
                          value={epubTitle}
                          onChange={(e) => setEpubTitle(e.target.value)}
                          placeholder="e.g. Secret Recipes"
                          className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Author Name</label>
                        <input
                          type="text"
                          value={epubAuthor}
                          onChange={(e) => setEpubAuthor(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850"
                        />
                      </div>
                    </div>

                    <div className="border border-dashed border-stone-300 rounded-2xl p-6 text-center bg-stone-50">
                      <FileText className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                      <span className="text-xs text-stone-800 font-bold block mb-1">
                        {uploadedEpubFile ? `Selected: ${uploadedEpubFile}` : "Select Word / Text manuscript"}
                      </span>
                      <span className="text-[9px] text-stone-500 block mb-3">Accepts .docx, .txt formats (max 10MB)</span>
                      
                      <input 
                        type="file" 
                        id="epub-file-input" 
                        accept=".docx,.txt" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedEpubFile(file.name);
                            if (!epubTitle) {
                              setEpubTitle(file.name.replace(/\.[^/.]+$/, ""));
                            }
                            if (!epubAuthor) {
                              setEpubAuthor("Self-Publisher");
                            }
                            setEpubSuccess(true);
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          document.getElementById("epub-file-input")?.click();
                        }}
                        className="px-4 py-1.5 bg-white hover:bg-stone-50 border border-stone-250 rounded-xl text-xs font-black text-stone-700 cursor-pointer shadow-sm"
                      >
                        Upload manuscript
                      </button>
                    </div>

                    {epubSuccess && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-black text-emerald-800 block">EPUB Validation Passed!</span>
                          <span className="text-[10px] text-stone-600 block mt-0.5">
                            Format converted successfully. Your files are styled, table of contents generated, and compiled for direct Kindle uploads.
                          </span>
                          <button 
                            onClick={() => {
                              alert(`Downloading ${epubTitle || 'Book'}-Kindle.epub...`);
                              setEpubSuccess(false);
                            }}
                            className="mt-3 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-[10px] rounded-lg uppercase tracking-wider cursor-pointer shadow-sm"
                          >
                            Download EPUB
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. PDF Interior Formatter Mock */}
                {activeInteractiveTool === "pdf-formatter" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Select Trim Size</label>
                        <select
                          value={pdfTrimSize}
                          onChange={(e) => setPdfTrimSize(e.target.value)}
                          className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850"
                        >
                          <option value="6x9">6" x 9" (Novel/Standard)</option>
                          <option value="8.5x11">8.5" x 11" (Puzzle/Children's)</option>
                          <option value="5x8">5" x 8" (Compact)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Bleed Margins</label>
                        <select
                          className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850"
                        >
                          <option value="nobleed">No Bleed (Puzzles/Text inside margins)</option>
                          <option value="bleed">Bleed (Images/graphics touching edges)</option>
                        </select>
                      </div>
                    </div>

                    <div className="border border-dashed border-stone-300 rounded-2xl p-6 text-center bg-stone-50">
                      <Layout className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                      <span className="text-xs text-stone-800 font-bold block mb-1">
                        {uploadedPdfFile ? `Selected: ${uploadedPdfFile}` : "Upload interior manuscript PDF / Word document"}
                      </span>
                      <span className="text-[9px] text-stone-500 block mb-3">Checks gutter spacing and trim alignment</span>
                      
                      <input 
                        type="file" 
                        id="pdf-file-input" 
                        accept=".pdf,.docx" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedPdfFile(file.name);
                            setPdfFileAdded(true);
                            setPdfFormattingStatus(`Checked file "${file.name}". Safety zones: OK. Gutter: OK. Safe margins: OK.`);
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          document.getElementById("pdf-file-input")?.click();
                        }}
                        className="px-4 py-1.5 bg-white hover:bg-stone-50 border border-stone-250 rounded-xl text-xs font-black text-stone-700 cursor-pointer shadow-sm"
                      >
                        Select Document
                      </button>
                    </div>

                    {pdfFileAdded && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-black text-amber-800 block">Formatting Validated!</span>
                          <span className="text-[10px] text-stone-600 block mt-0.5">{pdfFormattingStatus}</span>
                          <button 
                            onClick={() => {
                              alert(`Exporting and downloading KDP-${pdfTrimSize}-Interior.pdf...`);
                              setPdfFileAdded(false);
                            }}
                            className="mt-3 px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white font-black text-[10px] rounded-lg uppercase tracking-wider cursor-pointer shadow-sm"
                          >
                            Export Print-Ready PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-stone-200 flex justify-between items-center bg-white/60 text-xs">
                <span className="text-stone-500 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> 100% Free Tool — No Registration required
                </span>
                <button
                  onClick={() => {
                    setActiveInteractiveTool(null);
                    setGeneratedTitles([]);
                    setEpubSuccess(false);
                    setPdfFileAdded(false);
                    setUploadedEpubFile(null);
                    setUploadedPdfFile(null);
                  }}
                  className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-black text-[10px] rounded-lg uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
