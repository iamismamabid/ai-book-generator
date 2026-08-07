"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Download, RefreshCw, AlertCircle, FileText, CheckCircle2, Sliders, Type, BookOpen
} from "lucide-react";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import ExportInteriorModal from "@/components/ExportInteriorModal";

const DEFAULT_QUOTES = [
  "THE ONLY LIMIT TO OUR REALIZATION OF TOMORROW WILL BE OUR DOUBTS OF TODAY.",
  "SUCCESS IS NOT FINAL, FAILURE IS NOT FATAL: IT IS THE COURAGE TO CONTINUE THAT COUNTS.",
  "BE THE CHANGE THAT YOU WISH TO SEE IN THE WORLD.",
  "IN THE MIDDLE OF DIFFICULTY LIES OPPORTUNITY.",
  "IMAGINATION IS MORE IMPORTANT THAN KNOWLEDGE. KNOWLEDGE IS LIMITED. IMAGINATION ENCIRCLES THE WORLD.",
  "DO NOT GO WHERE THE PATH MAY LEAD, GO INSTEAD WHERE THERE IS NO PATH AND LEAVE A TRAIL.",
  "THE FUTURE BELONGS TO THOSE WHO BELIEVE IN THE BEAUTY OF THEIR DREAMS."
];

const TRIM_SIZES = [
  { id: "6x9", label: "6\" x 9\" (Novel)", w: 6, h: 9 },
  { id: "8.5x11", label: "8.5\" x 11\" (Large Print)", w: 8.5, h: 11 },
  { id: "5x8", label: "5\" x 8\" (Compact)", w: 5, h: 8 }
];

export default function CryptogramGenerator() {
  const router = useRouter();

  // Inputs & configs
  const [inputText, setInputText] = useState(DEFAULT_QUOTES.join("\n"));
  const [quotes, setQuotes] = useState<string[]>(DEFAULT_QUOTES);
  
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [fontSizeType, setFontSizeType] = useState<"normal" | "large">("normal");
  const [puzzlesPerPage, setPuzzlesPerPage] = useState<1 | 2 | 3>(2);
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(true);
  const [hasBleed, setHasBleed] = useState<boolean>(false);
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [includeCover, setIncludeCover] = useState<boolean>(false);

  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });

  // Fetches plan status fresh rather than trusting whatever `premiumStatus`
  // happened to hold at render time. The initial useEffect below populates it
  // for the UI label, but relying on that same state to gate generation had a
  // race: clicking Generate before the async load resolved (or before a
  // newly-redeemed plan reflected) silently fell back to the free-tier
  // default and capped a genuinely premium account at 7.
  const getFreshPremiumStatus = async () => {
    try {
      const { checkPremiumStatus } = await import("@/app/actions");
      const res = await checkPremiumStatus();
      setPremiumStatus(res as any);
      return res as any;
    } catch (err) {
      console.error(err);
      return premiumStatus;
    }
  };

  useEffect(() => {
    getFreshPremiumStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateBulkQuotes = async (count: number) => {
    const baseQuotes = [
      "THE ONLY LIMIT TO OUR REALIZATION OF TOMORROW WILL BE OUR DOUBTS OF TODAY.",
      "SUCCESS IS NOT FINAL, FAILURE IS NOT FATAL: IT IS THE COURAGE TO CONTINUE THAT COUNTS.",
      "BE THE CHANGE THAT YOU WISH TO SEE IN THE WORLD.",
      "IN THE MIDDLE OF DIFFICULTY LIES OPPORTUNITY.",
      "IMAGINATION IS MORE IMPORTANT THAN KNOWLEDGE. KNOWLEDGE IS LIMITED. IMAGINATION ENCIRCLES THE WORLD.",
      "DO NOT GO WHERE THE PATH MAY LEAD, GO INSTEAD WHERE THERE IS NO PATH AND LEAVE A TRAIL.",
      "THE FUTURE BELONGS TO THOSE WHO BELIEVE IN THE BEAUTY OF THEIR DREAMS.",
      "WHAT LIES BEHIND US AND WHAT LIES BEFORE US ARE TINY MATTERS COMPARED TO WHAT LIES WITHIN US.",
      "IT IS DURING OUR DARKEST MOMENTS THAT WE MUST FOCUS TO SEE THE LIGHT.",
      "DO NOT WATCH THE CLOCK; DO WHAT IT DOES. KEEP GOING.",
      "YOU DEFINE YOUR OWN LIFE. DON'T LET OTHER PEOPLE WRITE YOUR SCRIPT.",
      "YOU ARE NEVER TOO OLD TO SET ANOTHER GOAL OR TO DREAM A NEW DREAM.",
      "SPREAD LOVE EVERYWHERE YOU GO. LET NO ONE EVER COME TO YOU WITHOUT LEAVING HAPPIER.",
      "BELIEVE YOU CAN AND YOU'RE HALFWAY THERE.",
      "LIFE IS WHAT HAPPENS WHEN YOU'RE BUSY MAKING OTHER PLANS.",
      "STAY HUNGRY, STAY FOOLISH.",
      "YOUR TIME IS LIMITED, SO DON'T WASTE IT LIVING SOMEONE ELSE'S LIFE.",
      "TURN YOUR WOUNDS INTO WISDOM.",
      "HAPPINESS DEPENDS UPON OURSELVES.",
      "SIMPLICITY IS THE ULTIMATE SOPHISTICATION."
    ];

    const freshStatus = await getFreshPremiumStatus();
    const maxCount = freshStatus.isPremium ? count : Math.min(count, 7);
    const generated: string[] = [];
    for (let i = 0; i < maxCount; i++) {
      const base = baseQuotes[i % baseQuotes.length];
      if (i < baseQuotes.length) {
        generated.push(base);
      } else {
        generated.push(`${base} (PUZZLE #${i + 1})`);
      }
    }

    const text = generated.join("\n");
    setInputText(text);
  };

  // Substitution mapping states
  const [cipherMap, setCipherMap] = useState<Record<string, string>>({});
  const [puzzles, setPuzzles] = useState<Array<{
    index: number;
    original: string;
    encrypted: string;
  }>>([]);

  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // 1. Generate Cipher Substitution Key
  const generateCipherMapping = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const shuffled = alphabet.split("").sort(() => 0.5 - Math.random());
    const mapping: Record<string, string> = {};
    for (let i = 0; i < alphabet.length; i++) {
      mapping[alphabet[i]] = shuffled[i];
    }
    setCipherMap(mapping);
    return mapping;
  };

  const scrambleText = (text: string, mapping: Record<string, string>) => {
    return text
      .toUpperCase()
      .split("")
      .map((char) => {
        if (char >= "A" && char <= "Z") {
          return mapping[char] || char;
        }
        return char;
      })
      .join("");
  };

  const parseAndGeneratePuzzles = async () => {
    setIsGenerating(true);
    const mapping = generateCipherMapping();
    const rawLines = inputText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (rawLines.length === 0) {
      alert("Please add some quotes or phrases first.");
      setIsGenerating(false);
      return;
    }

    // The "Free Limit: 7" / "Premium: Max 1,000" label above the textarea is
    // only true if it's enforced here too -- the quick-fill buttons already
    // capped themselves, but someone pasting quotes directly bypassed both
    // the free-tier limit and the 1,000 safety ceiling entirely. Fetched
    // fresh (not the possibly-stale `premiumStatus` state) so a premium
    // account isn't capped just because this ran before the initial status
    // load resolved.
    const freshStatus = await getFreshPremiumStatus();
    const maxAllowed = freshStatus.isPremium ? 1000 : 7;
    const lines = rawLines.slice(0, maxAllowed);
    if (rawLines.length > maxAllowed) {
      alert(
        freshStatus.isPremium
          ? `Capped at ${maxAllowed} puzzles per book. Generated the first ${maxAllowed} of your ${rawLines.length} phrases.`
          : `Free plan is limited to ${maxAllowed} puzzles. Generated the first ${maxAllowed} of your ${rawLines.length} phrases -- upgrade for up to 1,000.`
      );
    }

    setQuotes(lines);

    const list = lines.map((original, index) => {
      const encrypted = scrambleText(original, mapping);
      return { index: index + 1, original, encrypted };
    });

    setPuzzles(list);
    setActivePreviewIndex(0);
    setIsGenerating(false);
  };

  const handleResetMapping = () => {
    const newMapping = generateCipherMapping();
    const list = quotes.map((original, index) => {
      const encrypted = scrambleText(original, newMapping);
      return { index: index + 1, original, encrypted };
    });
    setPuzzles(list);
    setActivePreviewIndex(0);
  };

  // Adjust preview page layout dynamically on tabs change
  useEffect(() => {
    if (puzzles.length > 0) {
      setActivePreviewIndex(0);
    }
  }, [puzzlesPerPage]);

  // PDF Compilation
  const handleExportPDF = async (options: {
    includeCover: boolean;
    coverState: any;
    includeSolutions: boolean;
    trimSize: "6x9" | "8.5x11" | "5x8";
    hasBleed: boolean;
    showGuides: boolean;
    isPremium?: boolean;
  }) => {
    if (puzzles.length === 0) return;
    setIsDownloading(true);
    const { includeCover: incCover, coverState, includeSolutions: incSol, trimSize: finalTrim, hasBleed: finalBleed, showGuides: finalGuides, isPremium } = options;

    setTimeout(async () => {
      let finalW = 8.5;
      let finalH = 11;
      if (finalTrim === "6x9") {
        finalW = 6;
        finalH = 9;
      } else if (finalTrim === "5x8") {
        finalW = 5;
        finalH = 8;
      }

      const bleed = 0.125;
      const pageW = finalBleed ? finalW + bleed * 2 : finalW;
      const pageH = finalBleed ? finalH + bleed * 2 : finalH;

      const [{ jsPDF }, { drawCoverPagePart, drawWatermark, drawMarginGuides }] = await Promise.all([
        import("jspdf"),
        import("@/app/utils/pdfExportService"),
      ]);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [pageW, pageH]
      });

      const marginL = 0.75;
      const marginR = 0.5;
      const marginT = 0.75;
      const marginB = 0.75;

      const contentW = pageW - marginL - marginR;
      
      // Calculate packaging
      const itemsPerPage = puzzlesPerPage;

      // Font sizing configuration
      const charBoxW = fontSizeType === "large" ? 0.28 : 0.22;
      const charBoxH = fontSizeType === "large" ? 0.32 : 0.26;
      const charSpacing = fontSizeType === "large" ? 0.08 : 0.05;
      const wordSpacing = fontSizeType === "large" ? 0.32 : 0.24;
      const lineStepY = fontSizeType === "large" ? 0.85 : 0.7;

      // 1. Draw Front Cover if integrated
      let firstPageAdded = false;
      if (incCover && coverState) {
        await drawCoverPagePart(doc, coverState, 'front', pageW, pageH);
        firstPageAdded = true;
      }

      // 1. Draw Puzzles dynamically with height checks to prevent overlap/footer clipping
      let pageIdx = 0;
      const drawPageHeaderAndFooter = (idx: number) => {
        // Header Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text("Cryptogram Puzzles", marginL + contentW / 2, marginT + 0.3, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text(
          "Decode the cipher substitution. Each letter represents another letter of the alphabet.",
          marginL + contentW / 2,
          marginT + 0.55,
          { align: "center" }
        );

        doc.setLineWidth(0.015);
        doc.setDrawColor(226, 232, 240);
        doc.line(marginL, marginT + 0.7, marginL + contentW, marginT + 0.7);

        if (finalGuides) {
          drawMarginGuides(doc, marginL, marginR, marginT, marginB, pageW, pageH);
        }

        // Page Number Footer
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${idx + 1}`, marginL + contentW / 2, pageH - marginB + 0.4, { align: "center" });
      };

      if (firstPageAdded) {
        doc.addPage();
      }
      firstPageAdded = true;
      drawPageHeaderAndFooter(pageIdx);

      let curY = marginT + 1.1;
      let puzzlesOnCurrentPage = 0;

      puzzles.forEach((puzzle) => {
        // Calculate the height this puzzle needs based on word wrap rows
        let tempX = marginL;
        let rowsCount = 1;
        const wordsList = puzzle.encrypted.split(" ");
        
        wordsList.forEach((word) => {
          const wordLen = word.length;
          const wordWidthInches = wordLen * charBoxW + (wordLen - 1) * charSpacing;
          if (tempX + wordWidthInches > marginL + contentW - 0.2) {
            tempX = marginL;
            rowsCount++;
          }
          tempX += wordWidthInches + wordSpacing;
        });

        const estimatedHeight = 0.45 + (rowsCount * lineStepY) + 0.4;

        // Trigger page break if we exceed vertical height limits or exceed item count limit
        if (puzzlesOnCurrentPage > 0 && (curY + estimatedHeight > pageH - marginB || puzzlesOnCurrentPage >= itemsPerPage)) {
          doc.addPage();
          pageIdx++;
          drawPageHeaderAndFooter(pageIdx);
          curY = marginT + 1.1;
          puzzlesOnCurrentPage = 0;
        }

        const puzzleStartY = curY;

        // Draw Puzzle Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(79, 70, 229);
        doc.text(`Puzzle #${puzzle.index}`, marginL, puzzleStartY);

        // Word-wrapped rendering of letters with boxes
        let curX = marginL;
        let curBoxY = puzzleStartY + 0.4;

        wordsList.forEach((word) => {
          // Calculate word width
          const wordLen = word.length;
          const wordWidthInches = wordLen * charBoxW + (wordLen - 1) * charSpacing;

          // Wrap to next line if word exceeds right boundary
          if (curX + wordWidthInches > marginL + contentW - 0.2) {
            curX = marginL;
            curBoxY += lineStepY;
          }

          // Draw letters of the word
          for (let i = 0; i < wordLen; i++) {
            const char = word[i];
            const isLetter = /[A-Z]/.test(char);

            if (isLetter) {
              // Write-in Box
              doc.setDrawColor(148, 163, 184); // slate-400
              doc.setLineWidth(0.008);
              doc.rect(curX, curBoxY, charBoxW, charBoxH);

              // Cipher Letter (Bottom)
              doc.setFont("courier", "bold");
              doc.setFontSize(fontSizeType === "large" ? 13 : 11);
              doc.setTextColor(15, 23, 42); // slate-900
              doc.text(char, curX + charBoxW / 2, curBoxY + charBoxH + 0.16, { align: "center" });
            } else {
              // Non-alphabetic character (e.g. punctuation, comma, dot)
              doc.setFont("courier", "bold");
              doc.setFontSize(fontSizeType === "large" ? 13 : 11);
              doc.setTextColor(15, 23, 42);
              doc.text(char, curX + charBoxW / 2, curBoxY + charBoxH - 0.05, { align: "center" });
            }

            curX += charBoxW + charSpacing;
          }

          // Word Space
          curX += wordSpacing;
        });

        curY = curBoxY + lineStepY + 0.5; // Update curY for the next puzzle, adding space below
        puzzlesOnCurrentPage++;
      });

      // 2. Renders Answers Key at the end
      if (incSol) {
        doc.addPage();
        const ansPageIdx = pageIdx + 2;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text("Answer Key", marginL + contentW / 2, marginT + 0.3, { align: "center" });

        doc.setLineWidth(0.015);
        doc.setDrawColor(226, 232, 240);
        doc.line(marginL, marginT + 0.6, marginL + contentW, marginT + 0.6);

        if (finalGuides) {
          drawMarginGuides(doc, marginL, marginR, marginT, marginB, pageW, pageH);
        }

        // A. Print Cipher Key alphabet mapping
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(79, 70, 229);
        doc.text("SUBSTITUTION KEY:", marginL, marginT + 1.0);

        doc.setFont("courier", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);

        // Draw alphabet row and matching cipher row
        const alphaStr = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z";
        const cipherStr = alphaStr
          .split(" ")
          .map(l => cipherMap[l] || "_")
          .join(" ");

        doc.text(`Original: ${alphaStr}`, marginL, marginT + 1.25);
        doc.text(`Cipher:   ${cipherStr}`, marginL, marginT + 1.45);

        doc.setDrawColor(226, 232, 240);
        doc.line(marginL, marginT + 1.65, marginL + contentW, marginT + 1.65);

        // B. Print Decrypted Solutions List
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(79, 70, 229);
        doc.text("DECRYPTED PUZZLES:", marginL, marginT + 1.95);

        let ansY = marginT + 2.25;

        puzzles.forEach((puzzle) => {
          if (ansY + 1.0 > pageH - marginB) {
            doc.addPage();
            ansY = marginT + 0.5;
            if (finalGuides) {
              drawMarginGuides(doc, marginL, marginR, marginT, marginB, pageW, pageH);
            }
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          doc.text(`Puzzle #${puzzle.index}:`, marginL, ansY);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(71, 85, 105);

          // Wrap solution string inside the margins
          const wrappedSol = doc.splitTextToSize(puzzle.original, contentW - 0.2);
          doc.text(wrappedSol, marginL + 0.2, ansY + 0.2);
          ansY += 0.25 + wrappedSol.length * 0.18;
        });

        // Footer page index for answer page
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${ansPageIdx}`, marginL + contentW / 2, pageH - marginB + 0.4, { align: "center" });
      }

      // 3. Draw Back Cover if integrated
      if (incCover && coverState) {
        doc.addPage();
        await drawCoverPagePart(doc, coverState, 'back', pageW, pageH);
      }

      // Apply watermark to all interior pages if not premium
      if (isPremium === false) {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          const isFrontCover = incCover && coverState && i === 1;
          const isBackCover = incCover && coverState && i === totalPages;
          if (!isFrontCover && !isBackCover) {
            doc.setPage(i);
            drawWatermark(doc, pageW, pageH);
          }
        }
      }

      doc.save(`cryptogram-${fontSizeType}-${puzzles.length}puzzles.pdf`);
      setIsDownloading(false);
    }, 50);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 animate-in fade-in duration-500" style={{ boxShadow: "var(--shadow-soft-lg)" }}>

      {/* 🔮 Left Sidebar Panels */}
      <div className="w-80 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 z-10">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <button 
            onClick={() => router.push("/")} 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4"/> Back to Home
          </button>
          <div className="flex items-center gap-2 text-amber-500 font-black text-xs uppercase bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Sliders className="w-3.5 h-3.5"/> Cipher
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quotes textarea */}
          <div className="space-y-2">
            <div className="flex justify-between items-center flex-wrap gap-1">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Phrases / Quotes</label>
              <span className="text-[10px] font-bold text-amber-400">
                {premiumStatus.isPremium ? "Premium: Max 1,000 Puzzles" : "Free Limit: 7"}
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter phrases, one per line..."
              className="w-full h-36 bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs font-semibold focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-slate-200 resize-none font-mono"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button 
                onClick={() => setInputText(DEFAULT_QUOTES.join("\n"))}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg text-[10px] font-bold transition"
              >
                Defaults (7)
              </button>
              <button
                onClick={() => generateBulkQuotes(50)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition"
              >
                50 Quotes
              </button>
              <button
                onClick={() => generateBulkQuotes(100)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition"
              >
                100 Quotes
              </button>
              <button
                onClick={() => generateBulkQuotes(1000)}
                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-black transition"
              >
                ⚡ 1,000 Puzzles
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* Reset mapping */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">Cipher Mapping</label>
            <button
              onClick={handleResetMapping}
              className="btn-premium w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 normal-case"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
              Regenerate Substitution Cipher
            </button>
          </div>

          {/* Sizing options */}
          <div className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Book Trim Size</label>
              <select
                value={trimSize.id}
                onChange={(e) => {
                  const size = TRIM_SIZES.find(s => s.id === e.target.value);
                  if (size) setTrimSize(size);
                }}
                className="w-full text-xs font-bold bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-white outline-none focus:border-indigo-500 transition-colors duration-200"
              >
                {TRIM_SIZES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Font Size</label>
                <select
                  value={fontSizeType}
                  onChange={(e) => setFontSizeType(e.target.value as any)}
                  className="w-full text-xs font-bold bg-slate-900 border border-slate-800 p-2 rounded-2xl text-white outline-none focus:border-indigo-500 transition-colors duration-200"
                >
                  <option value="normal">Normal</option>
                  <option value="large">Large Print</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Puzzles/Page</label>
                <select
                  value={puzzlesPerPage}
                  onChange={(e) => setPuzzlesPerPage(Number(e.target.value) as any)}
                  className="w-full text-xs font-bold bg-slate-900 border border-slate-800 p-2 rounded-2xl text-white outline-none focus:border-indigo-500 transition-colors duration-200"
                >
                  <option value={1}>1 puzzle</option>
                  <option value={2}>2 puzzles</option>
                  <option value={3}>3 puzzles</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* Settings options checkboxes */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">Document Settings</label>
            
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Include Answer Key Page
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Include Cover Pages (Add Front & Back cover)
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={hasBleed}
                onChange={(e) => setHasBleed(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Bleed (+0.125" KDP edges)
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="rounded accent-amber-500 text-slate-900"
              />
              Show Safe Margins Guide
            </label>
          </div>

        </div>

        {/* Action Panel */}
        <div className="p-6 border-t border-slate-800 space-y-3 bg-slate-950/40">
          <button
            onClick={() => parseAndGeneratePuzzles()}
            disabled={isGenerating}
            className="btn-premium w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 normal-case"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin"/> : "Generate Cryptogram"}
          </button>

           <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={isDownloading || puzzles.length === 0}
            className="btn-premium w-full bg-amber-500 hover:bg-amber-600 text-slate-950 normal-case hover:-translate-y-0.5"
            style={{ boxShadow: "0 8px 24px rgba(245, 158, 11, 0.18)" }}
          >
            {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
            Download Print PDF
          </button>

          <CoverStudioCTA trimSize={trimSize.id} />
        </div>
      </div>

      {/* Preview Panel Workspace */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 flex flex-col overflow-hidden transition-colors duration-300">

        {/* Pagination bar */}
        <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Active Preview:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs">
              {puzzles.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                    activePreviewIndex === idx ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  P#{idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Trim Size: {trimSize.label} | Puzzles: {puzzles.length}
          </div>
        </div>

        {/* Preview desk canvas */}
        <div className="flex-1 p-10 overflow-y-auto flex items-center justify-center relative bg-slate-100/60 dark:bg-slate-950/40 transition-colors duration-300">

          {puzzles.length > 0 && puzzles[activePreviewIndex] ? (
            <div
              className="relative bg-white rounded-2xl border border-slate-200/80 flex flex-col p-12 overflow-hidden cursor-default transition-all duration-300"
              style={{
                boxShadow: "var(--shadow-soft-lg)",
                width: "480px", // proportional scaling for viewing
                height: `${480 * (trimSize.h / trimSize.w)}px`,
                paddingTop: "40px",
                paddingBottom: "40px",
                paddingLeft: "45px",
                paddingRight: "30px"
              }}
            >
              {showGuides && (
                <>
                  <div className="absolute top-0 bottom-0 left-0 border-r border-dashed border-rose-400/40 pointer-events-none" style={{ width: "45px" }} />
                  <div className="absolute top-0 bottom-0 right-0 border-l border-dashed border-rose-400/40 pointer-events-none" style={{ width: "30px" }} />
                  <div className="absolute left-0 right-0 top-0 border-b border-dashed border-rose-400/40 pointer-events-none" style={{ height: "40px" }} />
                  <div className="absolute left-0 right-0 bottom-0 border-t border-dashed border-rose-400/40 pointer-events-none" style={{ height: "40px" }} />
                  <span className="absolute bottom-1 right-2 text-[8px] font-black text-rose-500 opacity-60">SAFE PRINT AREA</span>
                </>
              )}

              {/* Preview Layout content wrapper */}
              <div className="flex flex-col h-full justify-between">
                
                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">
                    Cryptogram Puzzles
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    Substitution Puzzle Preview
                  </p>
                  <div className="h-px bg-slate-100 my-3" />
                </div>

                {/* Encrypted Puzzle block */}
                <div className="flex-1 flex flex-col justify-start pt-4 space-y-4">
                  <h4 className="text-xs font-black text-indigo-600 uppercase">Puzzle #{puzzles[activePreviewIndex].index}</h4>
                  
                  {/* Grid wrap simulation */}
                  <div className="flex flex-wrap gap-x-2 gap-y-4 items-start select-none w-full">
                    {puzzles[activePreviewIndex].encrypted.split(" ").map((word, wordIdx) => (
                      <div key={wordIdx} className="flex gap-x-[3px] items-center mb-1">
                        {word.split("").map((char, charIdx) => {
                          const isLetter = /[A-Z]/.test(char);
                          return (
                            <div key={charIdx} className="flex flex-col items-center">
                              {isLetter ? (
                                <>
                                  {/* Empty top write-in grid slot */}
                                  <div className="interactive-cell w-[15px] h-[17px] border border-slate-300 bg-slate-50/50 rounded-sm flex items-center justify-center text-[9px] font-bold text-slate-700"/>
                                  {/* Cipher bottom letter */}
                                  <span className="font-mono text-[9px] font-bold text-slate-900 mt-1">{char}</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-[15px] h-[17px] flex items-end justify-center">
                                    <span className="font-mono text-[9px] font-black text-slate-900">{char}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center text-[9px] text-slate-300 font-bold tracking-widest pt-2 border-t border-slate-100">
                  PAGE PREVIEW ONLY
                </div>

              </div>

            </div>
          ) : (
            <div className="surface-card flex flex-col items-center justify-center p-12 max-w-sm text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="font-black text-slate-700 dark:text-slate-200 text-lg mb-1">No puzzle generated</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold leading-relaxed">
                Add some phrases in the left panel and click "Generate Cryptogram" to preview.
              </p>
            </div>
          )}

        </div>

      </div>

      <ExportInteriorModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultTrimSize="8.5x11"
        onExport={handleExportPDF}
      />
    </div>
  );
}
