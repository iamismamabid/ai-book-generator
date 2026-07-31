"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, ArrowLeft, BookOpen, Calculator, Search, CheckCircle2,
  HelpCircle, Settings, FileText, Layout, Copy, Check, ChevronRight, X,
  BookMarked, PenTool, Hash, RefreshCw, BarChart2, ShieldAlert, Loader2, AlertTriangle
} from "lucide-react";
import type { PdfValidationReport } from "@/lib/pdfValidator";

// jsPDF (pdfFormatter), pdf-lib (pdfValidator) and JSZip (epubExport) together
// added ~380 KB to the initial /tools bundle even though most visitors never
// open the PDF/EPUB tools. They are now loaded on demand via dynamic import()
// inside the click handlers below, keeping them out of first-load JS. The two
// tiny helpers below are copied locally so the JSX render path (getGutterMargin)
// and the download buttons never have to pull in those heavy modules.

// Mirrors getGutterMargin in lib/pdfFormatter.ts — kept intentionally in sync.
function getGutterMargin(pageCount: number): number {
  if (pageCount <= 150) return 0.375;
  if (pageCount <= 300) return 0.5;
  if (pageCount <= 500) return 0.625;
  if (pageCount <= 700) return 0.75;
  return 0.875;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

interface ToolItem {
  id: string;
  name: string;
  badge?: string;
  category: "Design" | "Writing" | "Formatting" | "Marketing";
  description: string;
  features: string[];
  keywords?: string[];
  link?: string;
  isInteractive?: boolean;
}

export default function FreeToolsHub() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  // Widget States: eBook Formatter (EPUB)
  const [epubTitle, setEpubTitle] = useState("");
  const [epubAuthor, setEpubAuthor] = useState("");
  const [epubSuccess, setEpubSuccess] = useState(false);
  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [isGeneratingEpub, setIsGeneratingEpub] = useState(false);
  const [epubError, setEpubError] = useState<string | null>(null);
  const [epubResult, setEpubResult] = useState<{ blob: Blob; chapterCount: number } | null>(null);

  // Widget States: PDF Formatter
  const [pdfTrimSize, setPdfTrimSize] = useState<"6x9" | "8.5x11" | "5x8">("6x9");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfAuthor, setPdfAuthor] = useState("");
  const [pdfFontFamily, setPdfFontFamily] = useState<"times" | "helvetica" | "courier">("times");
  const [pdfFontSize, setPdfFontSize] = useState<number>(11);
  const [pdfLineSpacing, setPdfLineSpacing] = useState<number>(1.25);
  const [pdfPageNumbers, setPdfPageNumbers] = useState<boolean>(true);
  const [pdfRunningHeaders, setPdfRunningHeaders] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfResult, setPdfResult] = useState<{ blob: Blob; pageCount: number } | null>(null);
  const [pdfValidationReport, setPdfValidationReport] = useState<PdfValidationReport | null>(null);
  const [isValidatingPdf, setIsValidatingPdf] = useState(false);

  const handleTriggerCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Reads the uploaded manuscript (.txt or .docx), splits it into chapters, and
  // compiles a real, spec-valid EPUB entirely in the browser — no upload to a server.
  const handleGenerateEpub = async () => {
    if (!epubFile) return;
    setEpubError(null);
    setEpubResult(null);
    setIsGeneratingEpub(true);

    try {
      let rawText: string;
      if (epubFile.name.toLowerCase().endsWith(".docx")) {
        const mammoth = await import("mammoth");
        const arrayBuffer = await epubFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        rawText = result.value;
      } else {
        rawText = await epubFile.text();
      }

      if (!rawText || rawText.trim().length === 0) {
        throw new Error("Couldn't find any readable text in that file.");
      }

      const { splitManuscriptIntoChapters, generateEpub } = await import("@/lib/epubExport");
      const chapters = splitManuscriptIntoChapters(rawText);
      const finalTitle = epubTitle.trim() || epubFile.name.replace(/\.[^/.]+$/, "");
      const finalAuthor = epubAuthor.trim() || "Self-Publisher";

      const blob = await generateEpub({ title: finalTitle, author: finalAuthor, chapters });
      setEpubResult({ blob, chapterCount: chapters.length });
      setEpubSuccess(true);
    } catch (err) {
      console.error("EPUB generation failed:", err);
      setEpubError(err instanceof Error ? err.message : "Failed to generate EPUB. Please check your file and try again.");
    } finally {
      setIsGeneratingEpub(false);
    }
  };

  const handleDownloadEpub = () => {
    if (!epubResult) return;
    const finalTitle = epubTitle.trim() || epubFile?.name.replace(/\.[^/.]+$/, "") || "Book";
    downloadBlob(epubResult.blob, `${finalTitle.replace(/\s+/g, "_")}-Kindle.epub`);
  };

  const handleGeneratePdf = async () => {
    if (!pdfFile) return;
    setPdfError(null);
    setPdfResult(null);
    setIsGeneratingPdf(true);

    try {
      let rawText: string;
      if (pdfFile.name.toLowerCase().endsWith(".docx")) {
        const mammoth = await import("mammoth");
        const arrayBuffer = await pdfFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        rawText = result.value;
      } else {
        rawText = await pdfFile.text();
      }

      if (!rawText || rawText.trim().length === 0) {
        throw new Error("Couldn't find any readable text in that file.");
      }

      const finalTitle = pdfTitle.trim() || pdfFile.name.replace(/\.[^/.]+$/, "");
      const finalAuthor = pdfAuthor.trim() || "Self-Publisher";

      const { generateInteriorPdf } = await import("@/lib/pdfFormatter");
      const res = await generateInteriorPdf({
        title: finalTitle,
        author: finalAuthor,
        rawText,
        trimSize: pdfTrimSize,
        fontFamily: pdfFontFamily,
        fontSize: pdfFontSize,
        lineSpacing: pdfLineSpacing,
        pageNumbers: pdfPageNumbers,
        runningHeaders: pdfRunningHeaders
      });

      setPdfResult({ blob: res.blob, pageCount: res.pageCount });
    } catch (err) {
      console.error("PDF generation failed:", err);
      setPdfError(err instanceof Error ? err.message : "Failed to format PDF. Please verify your document structure.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfResult) return;
    const finalTitle = pdfTitle.trim() || pdfFile?.name.replace(/\.[^/.]+$/, "") || "KDP_Interior";
    downloadBlob(pdfResult.blob, `${finalTitle.replace(/\s+/g, "_")}-${pdfTrimSize}.pdf`);
  };

  const handlePdfUpload = async (file: File) => {
    setPdfFile(file);
    setPdfResult(null);
    setPdfError(null);
    setPdfValidationReport(null);

    const nameLower = file.name.toLowerCase();
    
    if (nameLower.endsWith(".pdf")) {
      setIsValidatingPdf(true);
      try {
        const buffer = await file.arrayBuffer();
        const { validatePdfLayout } = await import("@/lib/pdfValidator");
        const report = await validatePdfLayout(buffer);
        setPdfValidationReport(report);
      } catch (err) {
        console.error("PDF validation failed:", err);
        setPdfError("Could not parse the PDF file. Please ensure it is not password protected.");
      } finally {
        setIsValidatingPdf(false);
      }
    } else {
      if (!pdfTitle) {
        setPdfTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
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
    // 1. Puzzle & Interior Generators
    {
      id: "maze-generator",
      name: "Free Shape-Masked Maze Studio",
      badge: "Popular",
      category: "Design",
      description: "Create labyrinths and shape-masked mazes (hearts, stars, circles) with KDP bleed compliance.",
      features: ["Heart & circle masks", "Bleed & gutter safety", "Vector PDF export"],
      keywords: ["maze", "mazes", "labyrinth", "shaped maze", "heart maze", "puzzle", "interior"],
      link: "/maze"
    },
    {
      id: "word-search-generator",
      name: "Free KDP Word Search Builder",
      badge: "Popular",
      category: "Design",
      description: "Build custom word search puzzle books using your own word lists or niche topics.",
      features: ["Custom CSV word lists", "Large print options", "Answer key grid export"],
      keywords: ["word search", "wordsearch", "find words", "word puzzle", "puzzle", "interior"],
      link: "/tools/word-search"
    },
    {
      id: "crossword-generator",
      name: "Free KDP Crossword Generator",
      badge: "New",
      category: "Design",
      description: "Design custom crossword puzzle grids and compile high-contrast vector PDF worksheets for KDP interiors.",
      features: ["Custom grid sizing (10x10 to 20x20)", "Live KDP safe area preview", "Instant answers sheets"],
      keywords: ["crossword", "crosswords", "word puzzle", "grid puzzle", "clues", "puzzle"],
      link: "/studio/crossword"
    },
    {
      id: "cryptogram-generator",
      name: "Free Cryptogram & Cipher Studio",
      badge: "New",
      category: "Design",
      description: "Create crypto-quote and encrypted text cipher puzzle interiors with hint indexes.",
      features: ["Custom quote banks", "Letter substitution cipher", "Hint keys index"],
      keywords: ["cryptogram", "cryptograms", "crypto quote", "cipher", "secret code", "puzzle"],
      link: "/studio/cryptogram"
    },
    {
      id: "word-scramble-generator",
      name: "Free Word Scramble Studio",
      badge: "New",
      category: "Design",
      description: "Generate word jumble and anagram puzzle worksheets with solution keys.",
      features: ["Niche word list import", "Custom clue hints", "Print-ready PDF layout"],
      keywords: ["word scramble", "scramble", "anagram", "jumble", "scrambled words", "puzzle"],
      link: "/studio/word-scramble"
    },
    {
      id: "kakuro-generator",
      name: "Free Kakuro Cross-Sums Generator",
      badge: "New",
      category: "Design",
      description: "Generate Kakuro (number cross-sum) math logic puzzles with verified single solutions.",
      features: ["Cross-sum logic grids", "Difficulty levels", "Answer key pages"],
      keywords: ["kakuro", "cross sums", "math grid", "number puzzle", "logic puzzle", "puzzle"],
      link: "/studio/kakuro"
    },
    {
      id: "math-puzzle-generator",
      name: "Free Math Puzzle Builder",
      badge: "New",
      category: "Design",
      description: "Create arithmetic equation grids, number searches, and math workbooks for kids & adults.",
      features: ["Addition/Subtraction/Multiplication", "Custom difficulty", "Answer pages"],
      keywords: ["math", "math puzzle", "arithmetic grid", "equation puzzle", "number search", "workbook", "puzzle"],
      link: "/studio/math-puzzle"
    },
    // 2. Cover & Spine Tools
    {
      id: "spine-calculator",
      name: "Free Spine Width & Cover Calculator",
      badge: "Essential",
      category: "Design",
      description: "Get exact spine thickness and full cover dimensions for paperback & hardcover based on paper stock.",
      features: ["Amazon official formulas", "Cream/white/color papers", "Precision calculations"],
      keywords: ["spine", "spine calculator", "cover calculator", "spine width", "bleed", "page count", "dimensions"],
      link: "/tools/spine-calculator"
    },
    {
      id: "isbn-generator",
      name: "Free ISBN Barcode Generator",
      badge: "Essential",
      category: "Design",
      description: "Generate 300 DPI vector EAN-13 ISBN barcodes compliant with KDP print specifications.",
      features: ["300 DPI vector PNG/SVG", "Price extension code support", "Amazon KDP compliant"],
      keywords: ["isbn", "barcode", "barcodes", "ean-13", "book barcode", "barcode generator"],
      link: "/tools/isbn-generator"
    },
    // 3. Keyword & Marketing Tools
    {
      id: "keyword-research",
      name: "Free KDP Keyword & Niche Spy",
      badge: "Popular",
      category: "Marketing",
      description: "Research low-competition KDP keywords, search volume, and 7 backend keyword slots.",
      features: ["Search volume estimates", "Competition score", "Backend keyword optimizer"],
      keywords: ["keyword", "keywords", "keyword research", "niche hunter", "amazon keywords", "seo", "search volume", "niche"],
      link: "/tools/keyword-research"
    },
    {
      id: "royalty-estimator",
      name: "KDP Royalty & Market Viability Estimator",
      badge: "New",
      category: "Marketing",
      description: "Analyze printing costs, promo discounts, Kindle Unlimited reads, advertising PPC, and category competition.",
      features: ["PPC Marketing Simulator", "Category competition index", "Spine width calculator included"],
      keywords: ["royalty", "royalty calculator", "printing cost", "kdp calculator", "profit", "earnings"],
      link: "/tools/royalty-estimator"
    },
    {
      id: "bulk-generator",
      name: "KDP Bulk Book Batch Studio",
      badge: "Popular",
      category: "Formatting",
      description: "Queue dozens of puzzle book interiors, import configurations via CSV, and compile ready-to-upload files in bulk.",
      features: ["CSV configuration upload", "Sequenced background builder", "Multi-book download list"],
      keywords: ["bulk", "bulk generator", "batch creator", "csv import", "mass generation"],
      link: "/tools/bulk-generator"
    },
    {
      id: "bulk-listing-generator",
      name: "Bulk KDP Listing Generator",
      badge: "New",
      category: "Marketing",
      description: "Paste a batch of book titles or concepts and get an AI-written Amazon title, subtitle, description, 7 backend keywords, and category suggestions for each — ready to paste into KDP.",
      features: ["AI title & description writer", "7 backend keyword slots per book", "CSV export for bulk upload"],
      keywords: ["listing", "listing generator", "kdp listing", "amazon description", "book description generator", "bulk listing", "keywords", "metadata"],
      link: "/tools/bulk-listing-generator"
    },
    // 4. Formatting & Utility Tools
    {
      id: "epub-formatter",
      name: "Free eBook Formatter (EPUB)",
      badge: "New",
      category: "Formatting",
      description: "Upload your Word or text manuscript and get a Kindle-ready EPUB package — chapters, table of contents, and title page.",
      features: ["Compliant structure", "Instant chapter generator", "Table of contents builder"],
      keywords: ["epub", "ebook", "kindle", "epub formatter", "convert docx to epub"],
      isInteractive: true
    },
    {
      id: "pdf-formatter",
      name: "Free KDP Interior PDF Formatter",
      badge: "New",
      category: "Formatting",
      description: "Upload your manuscript, choose a trim size, validate formatting, and export a KDP-ready interior PDF.",
      features: ["Auto margins", "Bleed validation helper", "Standard trim sizing"],
      keywords: ["pdf", "pdf formatter", "interior pdf", "margins", "trim size"],
      isInteractive: true
    },
    {
      id: "pdf-compressor",
      name: "Free PDF Compressor",
      badge: "New",
      category: "Formatting",
      description: "Reduce PDF file size while maintaining print resolution. Perfect for meeting KDP file size limits.",
      features: ["Lossless or image modes", "Before/after size report", "100% in-browser"],
      keywords: ["pdf compress", "pdf compressor", "reduce pdf size", "shrink pdf", "kdp upload limit"],
      link: "/tools/pdf-compressor"
    },
    {
      id: "kdp-file-validator",
      name: "Free KDP File & Margin Validator",
      badge: "New",
      category: "Formatting",
      description: "Validate your PDF files for KDP compliance. Check dimensions, font embedding, and bleed margins.",
      features: ["Trim size matching", "Page consistency check", "Pass/warn/fail report"],
      keywords: ["validator", "pdf validator", "margin checker", "bleed validator", "kdp error fix"],
      link: "/tools/kdp-file-validator"
    },
    {
      id: "title-generator",
      name: "Free Book Title Generator",
      badge: "Popular",
      category: "Writing",
      description: "Generate catchy, marketable book titles for any genre. 10 unique KDP-optimized ideas per batch.",
      features: ["SEO metadata titles", "10 suggestions", "Non-fiction & fiction modes"],
      keywords: ["title", "title generator", "book title", "ideas"],
      isInteractive: true
    },
    {
      id: "desc-generator",
      name: "Free Book Description Generator",
      badge: "New",
      category: "Writing",
      description: "Write conversion-optimized book descriptions with Amazon HTML formatting included.",
      features: ["Amazon HTML tags", "Sales pitch triggers", "Copy-paste output"],
      keywords: ["description", "book description", "amazon html", "blurb"],
      isInteractive: true
    },
    {
      id: "copyright-page-generator",
      name: "Free Copyright Page Generator",
      badge: "New",
      category: "Writing",
      description: "Create professional copyright pages for your books with all required legal text.",
      features: ["Fiction/non-fiction wording", "6x9 PDF export", "Copy or download .txt"],
      keywords: ["copyright", "legal page", "disclaimer", "front matter"],
      link: "/tools/copyright-page-generator"
    },
    {
      id: "trademark-checker",
      name: "Free Trademark Checker",
      badge: "New",
      category: "Marketing",
      description: "Check if your book title or keywords contain trademarked terms that could cause account issues.",
      features: ["70+ term screening list", "USPTO & TMview links", "Generic term guidance"],
      keywords: ["trademark", "tm check", "brand safety", "title check"],
      link: "/tools/trademark-checker"
    },
    {
      id: "book-planner",
      name: "Free Book Planner & Outline Studio",
      badge: "New",
      category: "Writing",
      description: "Plan your book with chapters, characters, and outlines. Use templates and track word count.",
      features: ["Novel/non-fiction templates", "Autosaves in browser", "Word-count progress bar"],
      keywords: ["book planner", "outline", "chapter planner", "character sheet", "writing progress"],
      link: "/tools/book-planner"
    },
    {
      id: "background-remover",
      name: "Free Background Remover",
      badge: "New",
      category: "Design",
      description: "Remove solid or simple backgrounds from images instantly to create transparent PNGs for covers.",
      features: ["Auto edge detection", "Click-to-pick color mode", "100% in-browser"],
      keywords: ["background", "bg remover", "transparent png", "cutout", "image edit"],
      link: "/tools/background-remover"
    },
    {
      id: "image-resizer",
      name: "Free Mass Image Resizer",
      badge: "New",
      category: "Design",
      description: "Bulk resize up to 50 images at once with KDP cover presets and ZIP download.",
      features: ["50 images at once", "KDP & social presets", "Bulk ZIP download"],
      keywords: ["image resize", "batch resize", "zip download", "photo resizer"],
      link: "/tools/image-resizer"
    },
    {
      id: "photo-to-line-art",
      name: "Free Photo to Line Art Converter",
      badge: "New",
      category: "Design",
      description: "Convert photos into clean line art perfect for coloring books. Adjust line thickness and detail.",
      features: ["Adjustable detail level", "Coloring-book ready", "Instant PNG export"],
      keywords: ["coloring book", "line art", "photo to sketch", "coloring page", "outline art"],
      link: "/tools/photo-to-line-art"
    },
    {
      id: "pattern-generator",
      name: "Free Seamless Pattern Generator",
      badge: "New",
      category: "Design",
      description: "Create seamless geometric patterns for book covers and endpapers.",
      features: ["12 pattern styles", "Seamless tile export", "300 DPI print sizes"],
      keywords: ["pattern", "seamless tile", "background pattern", "cover texture"],
      link: "/tools/pattern-generator"
    },
    {
      id: "stock-images",
      name: "Free Stock Images Search",
      badge: "New",
      category: "Design",
      description: "Search and download royalty-free stock images for your book covers.",
      features: ["Unsplash powered", "Commercial use OK", "No attribution required"],
      keywords: ["stock images", "unsplash", "free photos", "cover graphics"],
      link: "/tools/stock-images"
    },
    {
      id: "ocr-scanner",
      name: "Free OCR Text Extractor",
      badge: "New",
      category: "Formatting",
      description: "Extract text from images, scanned manuscript pages, and PDFs using OCR.",
      features: ["6 languages supported", "Copy or download .txt", "100% in-browser"],
      keywords: ["ocr", "image to text", "scan text", "photo to text"],
      link: "/tools/ocr-scanner"
    },
    {
      id: "interior-templates",
      name: "Free KDP Interior Templates",
      badge: "New",
      category: "Formatting",
      description: "Download ready-to-use interior PDF templates for journals, planners, and notebooks.",
      features: ["10 template styles", "Standard KDP trims", "Custom page counts"],
      keywords: ["templates", "journal interior", "planner pdf", "lined pages", "blank book"],
      link: "/tools/interior-templates"
    },
    {
      id: "qr-code-generator",
      name: "Free QR Code Generator",
      badge: "New",
      category: "Marketing",
      description: "Generate QR codes for author websites, social media links, and book promotional pages.",
      features: ["Custom colors", "Up to 2048px export", "Print-safe error correction"],
      keywords: ["qr code", "qr generator", "author link", "marketing qr"],
      link: "/tools/qr-code-generator"
    },
    {
      id: "word-cloud",
      name: "Free Word Cloud Generator",
      badge: "New",
      category: "Design",
      description: "Create custom word clouds from manuscript text or keywords with PNG export.",
      features: ["6 color schemes", "PNG export", "Stopword filtering"],
      keywords: ["word cloud", "word art", "tag cloud", "visual words"],
      link: "/tools/word-cloud"
    },
    {
      id: "kenp-calculator",
      name: "KENP Payout Calculator",
      badge: "New",
      category: "Marketing",
      description: "Estimate earnings from Kindle Unlimited KENP page reads across global marketplaces.",
      features: ["Global rate calculator", "Historical payouts", "Royalty breakdown"],
      keywords: ["kenp", "kindle unlimited", "page reads", "ku royalty"],
      link: "/tools/kenp-calculator"
    },
    {
      id: "ads-roi-calculator",
      name: "KDP Amazon Ads ROI Calculator",
      badge: "New",
      category: "Marketing",
      description: "Calculate Amazon PPC advertising ACoS, break-even CPC, and net profit per book.",
      features: ["ACoS & ACoV calculations", "Break-even CPC", "Net profit per sale"],
      keywords: ["amazon ads", "ppc", "ad roi", "acos", "advertising"],
      link: "/tools/ads-roi-calculator"
    },
    {
      id: "ebook-royalty-calculator",
      name: "Kindle eBook Royalty Calculator",
      badge: "New",
      category: "Marketing",
      description: "Calculate 70% vs 35% Kindle eBook royalties including Amazon file delivery fees.",
      features: ["File delivery fee deduction", "70% vs 35% comparison", "Multi-currency support"],
      keywords: ["ebook royalty", "kindle pricing", "70% royalty", "35% royalty"],
      link: "/tools/ebook-royalty-calculator"
    },
    {
      id: "grammar-checker",
      name: "Free Grammar & Proofreader",
      badge: "New",
      category: "Writing",
      description: "Proofread book titles, descriptions, and manuscript passages for grammar & punctuation.",
      features: ["Instant feedback", "Readability score", "100% browser-based"],
      keywords: ["grammar", "spell check", "proofread", "writing check"],
      link: "/tools/grammar-checker"
    },
    {
      id: "print-cost-calculator",
      name: "KDP Print Cost Calculator",
      badge: "New",
      category: "Marketing",
      description: "Calculate exact Amazon KDP printing costs for black & white and color paperbacks & hardcovers.",
      features: ["US/UK/EU rates", "Paper type options", "Trim size cost breakdown"],
      keywords: ["print cost", "paperback cost", "hardcover cost", "printing price"],
      link: "/tools/print-cost-calculator"
    },
    {
      id: "readability-calculator",
      name: "Free Readability Analyzer",
      badge: "New",
      category: "Writing",
      description: "Analyze Flesch-Kincaid grade level and reading ease for your book manuscript.",
      features: ["Flesch Reading Ease score", "Target grade level", "Word statistics"],
      keywords: ["readability", "flesch kincaid", "grade level", "text analysis"],
      link: "/tools/readability-calculator"
    },
    {
      id: "reading-time-calculator",
      name: "Free Reading Time Estimator",
      badge: "New",
      category: "Writing",
      description: "Estimate average reading time for your book based on word count and reading speed.",
      features: ["Word count analyzer", "Adult/child speed presets", "Chapter breakdown"],
      keywords: ["reading time", "word count", "minutes to read"],
      link: "/tools/reading-time-calculator"
    },
    {
      id: "keyword-density",
      name: "Free Keyword Density Analyzer",
      badge: "New",
      category: "Marketing",
      description: "Analyze keyword frequency and density in book descriptions to optimize for Amazon search.",
      features: ["Keyword frequency count", "Stopword exclusion", "1-word & 2-word phrase analysis"],
      keywords: ["keyword density", "seo text", "word frequency"],
      link: "/tools/keyword-density"
    }
  ];

  const filteredTools = toolsList.filter((t) => {
    const q = searchQuery.trim().toLowerCase();

    // If typing a search query, ignore active category tab so matching tools aren't hidden
    const matchesCategory = !q && activeCategory !== "All" ? t.category === activeCategory : true;
    if (!q) return matchesCategory;

    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.features.some((f) => f.toLowerCase().includes(q)) ||
      (t.keywords && t.keywords.some((k) => k.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-stone-900 py-24 px-6 relative overflow-hidden">
      {/* 📖 Left-side Crease/Binding Shadow */}
      <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-stone-900/[0.06] via-stone-900/[0.02] to-transparent pointer-events-none z-20" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[140px] translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-rose-500/[0.03] rounded-full blur-[160px] -translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 mb-6">
          <Link href="/" className="hover:text-amber-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-stone-700">Free Tools</span>
        </nav>

        {/* Navigation & Header */}
        <div className="mb-16 border-b border-stone-200 pb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200/60 text-amber-800 text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> {toolsList.length}+ Free KDP Tools — No Signup
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tight">
              Free KDP Tools for <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 bg-clip-text text-transparent">Smarter Publishing</span>
            </h1>
            <p className="text-stone-600 text-base md:text-lg max-w-2xl font-semibold leading-relaxed">
              Royalty and print cost calculators, cover and interior design generators, SEO and readability analyzers, PDF utilities, and print-ready templates — everything an Amazon KDP self-publisher needs, completely free with no registration.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-black text-stone-500 hover:text-amber-700 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </Link>
        </div>

        {/* Search Bar & Category Filter Toolbar */}
        <div className="mb-12 pb-8 border-b border-stone-200 space-y-6">

          {/* ✨ Premium Instant Search Bar */}
          <div className="relative max-w-2xl group">
            {/* Animated glow ring on focus */}
            <div className="absolute -inset-0.5 rounded-[1.25rem] bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 opacity-0 group-focus-within:opacity-100 blur-sm transition-all duration-500 pointer-events-none" />

            <div className="relative flex items-center bg-white rounded-[1.1rem] border border-stone-200 group-focus-within:border-transparent shadow-sm group-focus-within:shadow-amber-500/10 group-focus-within:shadow-lg transition-all duration-300">

              {/* Search icon with gradient bg */}
              <div className="pl-4 pr-2.5 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm shadow-amber-500/25 group-focus-within:scale-110 transition-transform duration-300">
                  <Search className="w-4 h-4 text-white" />
                </div>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 40+ free KDP tools — Maze, Spine, Barcode, PDF, Keyword..."
                className="flex-1 py-4 pr-3 bg-transparent text-stone-900 placeholder-stone-400 font-semibold text-sm focus:outline-none"
              />

              {/* Live match pill */}
              {!searchQuery && (
                <div className="hidden sm:flex items-center gap-1 px-3 py-1 mr-3 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 text-[10px] font-black uppercase tracking-wider shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  40+ tools
                </div>
              )}

              {/* Clear button */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mr-3 w-7 h-7 rounded-lg bg-stone-100 hover:bg-red-50 hover:border-red-200 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-red-500 transition-all shrink-0"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Buttons + Match Counter */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2.5">
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

            <div className="text-xs font-bold text-stone-500">
              Showing <span className="text-amber-700 font-black">{filteredTools.length}</span> of {toolsList.length} tools
            </div>
          </div>
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

          {filteredTools.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white/80 border border-stone-200/80 rounded-[2rem] p-8 shadow-sm">
              <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-stone-800 mb-2 font-sans">
                No tools found matching "{searchQuery}"
              </h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto mb-6 font-medium">
                Try searching for keywords like "spine", "pdf", "barcode", "royalty", "cover", or "word".
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95"
              >
                Clear Search & Show All Tools
              </button>
            </div>
          )}
        </div>

        {/* FAQ — real indexable content for search intent beyond the tool cards themselves */}
        <div className="mt-24 pt-16 border-t border-stone-200 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-600" /> Frequently Asked Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {[
              {
                q: "Are these KDP tools really free forever?",
                a: "Yes — every tool on this page is 100% free with no account, credit card, or trial limit. They're built to support the same self-publishers who use KDPage's paid book-creation studio.",
              },
              {
                q: "Do I need to create an account to use them?",
                a: "No signup is required for any tool here — click \"Open Tool\" or \"Launch Interactive Tool\" and start immediately.",
              },
              {
                q: "Is my data private when I use these tools?",
                a: "Most tools — calculators, image editors, PDF utilities, OCR — run entirely in your browser and never upload your files or text to a server. A few that need external data, like Stock Images or Keyword Research, only send the specific search query you type.",
              },
              {
                q: "How many free KDP tools are on this page?",
                a: "Over 30, spanning royalty and print cost calculators, cover and interior design generators, SEO and readability analyzers, PDF utilities, and print-ready templates — all built specifically for Amazon KDP self-publishers.",
              },
            ].map((f) => (
              <div key={f.q} className="bg-white/80 border border-stone-200/60 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-stone-900 mb-2">{f.q}</h3>
                <p className="text-xs font-semibold text-stone-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Modals for Interactive Tools */}
        {activeInteractiveTool && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pt-28 bg-stone-950/40 backdrop-blur-sm">
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
                    setPdfFile(null);
                    setPdfTitle("");
                    setPdfAuthor("");
                    setPdfResult(null);
                    setPdfError(null);
                    setPdfValidationReport(null);
                    setIsGeneratingPdf(false);
                    setEpubFile(null);
                    setEpubError(null);
                    setEpubResult(null);
                    setIsGeneratingEpub(false);
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

                {/* 6. eBook Formatter (real, client-side EPUB compiler) */}
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
                        {epubFile ? `Selected: ${epubFile.name}` : "Select Word / Text manuscript"}
                      </span>
                      <span className="text-[9px] text-stone-500 block mb-3">Accepts .docx, .txt formats (max 10MB) &mdash; processed entirely in your browser</span>

                      <input
                        type="file"
                        id="epub-file-input"
                        accept=".docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEpubFile(file);
                            setEpubSuccess(false);
                            setEpubResult(null);
                            setEpubError(null);
                            if (!epubTitle) {
                              setEpubTitle(file.name.replace(/\.[^/.]+$/, ""));
                            }
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

                    {epubFile && !epubSuccess && (
                      <button
                        onClick={handleGenerateEpub}
                        disabled={isGeneratingEpub}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-black text-xs rounded-xl cursor-pointer shadow-sm transition"
                      >
                        {isGeneratingEpub ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Compiling EPUB...
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-4 h-4" /> Generate EPUB
                          </>
                        )}
                      </button>
                    )}

                    {epubError && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-rose-800">{epubError}</span>
                      </div>
                    )}

                    {epubSuccess && epubResult && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-black text-emerald-800 block">EPUB Compiled Successfully!</span>
                          <span className="text-[10px] text-stone-600 block mt-0.5">
                            {epubResult.chapterCount} chapter{epubResult.chapterCount !== 1 ? "s" : ""} detected. Title page, table of contents, and Kindle-ready structure are built into the file.
                          </span>
                          <button
                            onClick={handleDownloadEpub}
                            className="mt-3 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-[10px] rounded-lg uppercase tracking-wider cursor-pointer shadow-sm"
                          >
                            Download EPUB
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. PDF Interior Formatter & Validator */}
                {activeInteractiveTool === "pdf-formatter" && (
                  <div className="space-y-4">
                    {/* File Upload Box */}
                    <div className="border border-dashed border-stone-300 rounded-2xl p-6 text-center bg-stone-50">
                      <Layout className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                      <span className="text-xs text-stone-800 font-bold block mb-1">
                        {pdfFile ? `Selected: ${pdfFile.name}` : "Upload manuscript file"}
                      </span>
                      <span className="text-[9px] text-stone-500 block mb-3">
                        Accepts .docx, .txt (for typesetting) or .pdf (for compliance validation)
                      </span>
                      
                      <input 
                        type="file" 
                        id="pdf-file-input" 
                        accept=".pdf,.docx,.txt" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePdfUpload(file);
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          document.getElementById("pdf-file-input")?.click();
                        }}
                        className="px-4 py-1.5 bg-white hover:bg-stone-50 border border-stone-250 rounded-xl text-xs font-black text-stone-700 cursor-pointer shadow-sm"
                      >
                        Select File
                      </button>
                    </div>

                    {/* PDF Layout Validation Report */}
                    {isValidatingPdf && (
                      <div className="flex items-center justify-center gap-2 py-6 text-stone-600 text-xs">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> Analysing PDF structure...
                      </div>
                    )}

                    {pdfValidationReport && (
                      <div className="space-y-3 p-4 bg-white border border-stone-200 rounded-2xl shadow-sm">
                        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-wider">KDP Layout Validation Report</h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="p-2 bg-stone-50 rounded-lg">
                            <span className="text-[9px] text-stone-500 block">Trim Size Detected</span>
                            <span className="font-bold text-stone-850">{pdfValidationReport.detectedTrimSize}</span>
                          </div>
                          <div className="p-2 bg-stone-50 rounded-lg">
                            <span className="text-[9px] text-stone-500 block">Total Pages</span>
                            <span className="font-bold text-stone-850">{pdfValidationReport.pageCount} pages</span>
                          </div>
                        </div>

                        {pdfValidationReport.errors.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-black text-red-650 block uppercase">Critical Errors ({pdfValidationReport.errors.length}):</span>
                            {pdfValidationReport.errors.map((err, i) => (
                              <div key={i} className="flex gap-2 text-xs text-red-700 bg-red-50 border border-red-100 p-2 rounded-lg items-start">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                                <span>{err}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {pdfValidationReport.warnings.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-black text-amber-700 block uppercase">Warnings ({pdfValidationReport.warnings.length}):</span>
                            {pdfValidationReport.warnings.map((warn, i) => (
                              <div key={i} className="flex gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-150 p-2 rounded-lg items-start">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                                <span>{warn}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {pdfValidationReport.errors.length === 0 && (
                          <div className="flex gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 p-2 rounded-lg items-start">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>PDF structure looks KDP compliant. Required binding gutter: {pdfValidationReport.requiredGutterInches} in.</span>
                          </div>
                        )}

                        <div className="text-[10px] text-stone-500 bg-stone-50 p-2.5 rounded-lg leading-relaxed">
                          <strong>KDP Recommendation:</strong> {pdfValidationReport.recommendation}
                        </div>
                      </div>
                    )}

                    {/* Word / TXT Typesetting Form */}
                    {pdfFile && !pdfFile.name.toLowerCase().endsWith(".pdf") && !pdfResult && (
                      <div className="space-y-4 bg-white p-4 border border-stone-200/60 rounded-2xl shadow-sm">
                        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Configure PDF Typesetting</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-stone-500 block mb-1">Book Title</label>
                            <input
                              type="text"
                              value={pdfTitle}
                              onChange={(e) => setPdfTitle(e.target.value)}
                              placeholder="Title page heading"
                              className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-stone-500 block mb-1">Author Name</label>
                            <input
                              type="text"
                              value={pdfAuthor}
                              onChange={(e) => setPdfAuthor(e.target.value)}
                              placeholder="Author name"
                              className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-stone-500 block mb-1">Trim Size</label>
                            <select
                              value={pdfTrimSize}
                              onChange={(e) => setPdfTrimSize(e.target.value as any)}
                              className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850"
                            >
                              <option value="6x9">6" x 9" (Standard Novel)</option>
                              <option value="8.5x11">8.5" x 11" (Puzzle/Kids)</option>
                              <option value="5x8">5" x 8" (Compact)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-stone-500 block mb-1">Font Theme</label>
                            <select
                              value={pdfFontFamily}
                              onChange={(e) => setPdfFontFamily(e.target.value as any)}
                              className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850"
                            >
                              <option value="times">Serif (Times)</option>
                              <option value="helvetica">Sans-Serif (Helvetica)</option>
                              <option value="courier">Monospace (Courier)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-stone-500 block mb-1">Font Size & Spacing</label>
                            <div className="flex gap-1.5">
                              <select
                                value={pdfFontSize}
                                onChange={(e) => setPdfFontSize(parseInt(e.target.value))}
                                className="flex-1 bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850"
                              >
                                <option value="10">10pt</option>
                                <option value="11">11pt</option>
                                <option value="12">12pt</option>
                              </select>
                              <select
                                value={pdfLineSpacing}
                                onChange={(e) => setPdfLineSpacing(parseFloat(e.target.value))}
                                className="flex-1 bg-white border border-stone-200 p-2 rounded-xl text-xs text-stone-850"
                              >
                                <option value="1.15">1.15x</option>
                                <option value="1.25">1.25x</option>
                                <option value="1.5">1.5x</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 items-center pt-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-600 font-bold">
                            <input
                              type="checkbox"
                              checked={pdfPageNumbers}
                              onChange={(e) => setPdfPageNumbers(e.target.checked)}
                              className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                            />
                            Include Page Numbers
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-600 font-bold">
                            <input
                              type="checkbox"
                              checked={pdfRunningHeaders}
                              onChange={(e) => setPdfRunningHeaders(e.target.checked)}
                              className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                            />
                            Include Running Headers
                          </label>
                        </div>

                        <button
                          onClick={handleGeneratePdf}
                          disabled={isGeneratingPdf}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-black text-xs rounded-xl cursor-pointer shadow-sm transition mt-2"
                        >
                          {isGeneratingPdf ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Laying out PDF manuscript...
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-4 h-4" /> Typeset & Export PDF
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* PDF Generation Success Block */}
                    {pdfResult && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-black text-emerald-800 block">PDF Typeset Complete!</span>
                          <span className="text-[10px] text-stone-600 block mt-0.5">
                            Total page count: {pdfResult.pageCount}. Includes standard Title page, Copyright disclaimer, Table of Contents, and KDP-compliant margins (Gutter: {getGutterMargin(pdfResult.pageCount)}").
                          </span>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={handleDownloadPdf}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-[10px] rounded-lg uppercase tracking-wider cursor-pointer shadow-sm"
                            >
                              Download KDP Interior
                            </button>
                            <button
                              onClick={() => {
                                setPdfFile(null);
                                setPdfResult(null);
                                setPdfError(null);
                              }}
                              className="px-3 py-1.5 bg-white border border-stone-250 hover:bg-stone-50 text-stone-700 font-black text-[10px] rounded-lg uppercase tracking-wider cursor-pointer shadow-sm"
                            >
                              Upload New File
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {pdfError && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-rose-800">{pdfError}</span>
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
                    setPdfFile(null);
                    setPdfValidationReport(null);
                    setPdfResult(null);
                    setPdfError(null);
                    setEpubFile(null);
                    setEpubError(null);
                    setEpubResult(null);
                    setIsGeneratingEpub(false);
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
