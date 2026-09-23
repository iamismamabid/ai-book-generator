"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Tag,
  Copy,
  Check,
  Globe,
  Layers,
  DollarSign,
  Download,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2,
  ExternalLink,
  Flame,
  HelpCircle
} from "lucide-react";
import {
  generateKdpMetadata,
  KdpMetadataResult,
  KdpBookLanguage
} from "@/app/utils/bookMetadataGenerator";

export default function KdpListingSheetClient() {
  const [selectedLang, setSelectedLang] = useState<KdpBookLanguage>("en");
  const [customTitle, setCustomTitle] = useState("The Ultimate Variety Puzzle Book for Adults");
  const [customSubtitle, setCustomSubtitle] = useState("Large Print Brain Games with Complete Solutions Included");
  const [customAuthor, setCustomAuthor] = useState("KDPage Publishing");
  const [pageCount, setPageCount] = useState(100);
  const [trimLabel, setTrimLabel] = useState('8.5" x 11"');
  const [activeDescTab, setActiveDescTab] = useState<"preview" | "html">("preview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const trimDimensions = useMemo(() => {
    if (trimLabel.includes("8.5 x 8.5")) return { w: 8.5, h: 8.5 };
    if (trimLabel.includes("6 x 9")) return { w: 6, h: 9 };
    if (trimLabel.includes("5.5 x 8.5")) return { w: 5.5, h: 8.5 };
    return { w: 8.5, h: 11 };
  }, [trimLabel]);

  const metadata: KdpMetadataResult = useMemo(() => {
    return generateKdpMetadata({
      bookPages: Array(pageCount).fill({ type: "puzzle" }),
      title: customTitle,
      subtitle: customSubtitle,
      author: customAuthor,
      trimSize: { label: trimLabel, ...trimDimensions },
      language: selectedLang,
    });
  }, [pageCount, customTitle, customSubtitle, customAuthor, trimLabel, trimDimensions, selectedLang]);

  const [editableKeywords, setEditableKeywords] = useState<string[]>([]);

  React.useEffect(() => {
    if (metadata.keywords) {
      setEditableKeywords(metadata.keywords.slice(0, 7));
    }
  }, [metadata]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(prev => (prev === key ? null : prev));
    }, 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([metadata.cheatsheetText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = (customTitle || "kdp-book").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `kdp-listing-sheet-${safeTitle}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Tools</span>
          </Link>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-white tracking-wide">KDP Listing &amp; Keyword Sheet</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              100% Free
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/studio"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Launch Studio</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 space-y-8">
        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5" />
            Amazon Bookshelf 1-Click Publishing Sheet
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Amazon KDP 7-Backend Keywords &amp; Copy Sheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Format your title, subtitle, 7 backend keywords (<span className="text-amber-300 font-bold">&lt;50 characters</span>, no commas, deduplicated), BISAC categories, and KDP-compliant HTML description in seconds.
          </p>
        </div>

        {/* Global Settings Configuration Box */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              Marketplace Language
            </label>
            <select
              value={selectedLang}
              onChange={e => setSelectedLang(e.target.value as KdpBookLanguage)}
              className="w-full text-xs font-bold py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 outline-none"
            >
              <option value="en">English (Amazon.com / .co.uk)</option>
              <option value="es">Spanish (Español - Amazon.es / .com)</option>
              <option value="de">German (Deutsch - Amazon.de)</option>
              <option value="fr">French (Français - Amazon.fr)</option>
              <option value="it">Italian (Italiano - Amazon.it)</option>
              <option value="pt">Portuguese (Português - Amazon.com.br)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Paperback Trim Size
            </label>
            <select
              value={trimLabel}
              onChange={e => setTrimLabel(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 outline-none"
            >
              <option value='8.5" x 11"'>8.5&quot; x 11&quot; (Letter / Puzzles)</option>
              <option value='8.5" x 8.5"'>8.5&quot; x 8.5&quot; (Square)</option>
              <option value='6" x 9"'>6&quot; x 9&quot; (Trade Novel)</option>
              <option value='5.5" x 8.5"'>5.5&quot; x 8.5&quot; (Digest)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Page Count</span>
              <span className="text-slate-500 font-bold">{pageCount}p</span>
            </label>
            <input
              type="number"
              min={24}
              max={1000}
              value={pageCount}
              onChange={e => setPageCount(Math.max(24, parseInt(e.target.value, 10) || 24))}
              className="w-full text-xs font-bold py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Est. Profit / Copy (60%)
            </label>
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs flex flex-col justify-center">
              <div className="flex items-center justify-between text-slate-300">
                <span>Print cost:</span>
                <span className="font-bold text-slate-200">${metadata.printingCostUsd.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-black text-emerald-400">
                <span>Royalty:</span>
                <span>${metadata.estimatedRoyaltyUsd.toFixed(2)} / sale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Book Details */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-black">1</span>
              Amazon Book Details
            </h2>
            <button
              onClick={() => handleCopy(`${customTitle}\n${customSubtitle}\nAuthor: ${customAuthor}`, "details")}
              className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copiedKey === "details" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === "details" ? "Copied" : "Copy Title & Subtitle"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                <span>Book Title (Max 200 chars)</span>
                <span className={customTitle.length > 200 ? "text-rose-400 font-black" : "text-slate-500"}>
                  {customTitle.length}/200
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Enter book title"
                  className="w-full text-xs font-semibold py-2.5 pl-3 pr-16 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white outline-none"
                />
                <button
                  onClick={() => handleCopy(customTitle, "title")}
                  className="absolute right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "title" ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copiedKey === "title" ? "Done" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                <span>Subtitle</span>
                <span className="text-slate-500">{customSubtitle.length} chars</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customSubtitle}
                  onChange={e => setCustomSubtitle(e.target.value)}
                  placeholder="Enter descriptive subtitle"
                  className="w-full text-xs font-semibold py-2.5 pl-3 pr-16 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white outline-none"
                />
                <button
                  onClick={() => handleCopy(customSubtitle, "subtitle")}
                  className="absolute right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "subtitle" ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copiedKey === "subtitle" ? "Done" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 7 KDP Backend Keywords */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-black">2</span>
                The 7 KDP Backend Keywords (Max 50 Characters Each)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Paste these into your 7 Amazon Bookshelf keyword boxes. Avoid repeating words from your title.
              </p>
            </div>
            <button
              onClick={() => handleCopy(editableKeywords.join("\n"), "all-kw")}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {copiedKey === "all-kw" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "all-kw" ? "All 7 Copied!" : "Copy All 7 Keywords"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {editableKeywords.map((kw, idx) => {
              const charLen = kw.length;
              const isOver = charLen > 50;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all ${
                    isOver ? "bg-rose-950/30 border-rose-600/70" : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Keyword Box #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black ${isOver ? "text-rose-400 font-extrabold" : "text-slate-500"}`}>
                        {charLen}/50
                      </span>
                      <button
                        onClick={() => handleCopy(kw, `kw-${idx}`)}
                        className="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedKey === `kw-${idx}` ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                        <span>{copiedKey === `kw-${idx}` ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={kw}
                    onChange={e => {
                      const next = [...editableKeywords];
                      next[idx] = e.target.value;
                      setEditableKeywords(next);
                    }}
                    className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Recommended Amazon Categories */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-black">3</span>
              Recommended Amazon BISAC Categories
            </h2>
            <button
              onClick={() => handleCopy(metadata.categories.join("\n"), "all-cat")}
              className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copiedKey === "all-cat" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === "all-cat" ? "Copied" : "Copy Categories"}</span>
            </button>
          </div>

          <div className="space-y-2">
            {metadata.categories.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
              >
                <span className="font-bold">{cat}</span>
                <button
                  onClick={() => handleCopy(cat, `cat-${idx}`)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedKey === `cat-${idx}` ? (
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                  <span>{copiedKey === `cat-${idx}` ? "Copied" : "Copy"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: KDP-Compliant HTML Description */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-black">4</span>
                Amazon KDP HTML Description
              </h2>
              <div className="flex bg-slate-950 rounded-xl p-0.5 border border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => setActiveDescTab("preview")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeDescTab === "preview" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveDescTab("html")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeDescTab === "html" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Raw HTML
                </button>
              </div>
            </div>
            <button
              onClick={() => handleCopy(metadata.htmlDescription, "desc")}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {copiedKey === "desc" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "desc" ? "HTML Copied!" : "Copy HTML for KDP"}</span>
            </button>
          </div>

          {activeDescTab === "preview" ? (
            <div
              className="p-5 rounded-2xl bg-white text-slate-900 text-xs leading-relaxed max-h-72 overflow-y-auto space-y-2 border border-slate-700 shadow-inner"
              dangerouslySetInnerHTML={{ __html: metadata.htmlDescription }}
            />
          ) : (
            <textarea
              readOnly
              value={metadata.htmlDescription}
              rows={9}
              className="w-full text-xs font-mono p-4 rounded-2xl bg-slate-950 border border-slate-800 text-amber-200/90 outline-none resize-none leading-relaxed"
            />
          )}
        </div>

        {/* Master Copy & Download Bar */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Publish in Seconds
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy the complete formatted publishing sheet or download the .txt document.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDownloadTxt}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download .txt</span>
            </button>
            <button
              onClick={() => handleCopy(metadata.cheatsheetText, "master")}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            >
              {copiedKey === "master" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "master" ? "Entire Sheet Copied!" : "Copy Complete Sheet"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
