"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Copy,
  Check,
  Tag,
  DollarSign,
  Layers,
  Globe,
  FileText,
  Sparkles,
  ExternalLink,
  BookOpen,
  Download,
  AlertCircle
} from "lucide-react";
import {
  generateKdpMetadata,
  KdpMetadataResult,
  KdpBookLanguage
} from "@/app/utils/bookMetadataGenerator";
import { BookCoverSyncData } from "@/components/FullBookPackagerModal";

interface KdpListingSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookMeta: BookCoverSyncData;
  bookPages?: any[];
  onUpdateMeta?: (meta: Partial<BookCoverSyncData>) => void;
}

export default function KdpListingSheetModal({
  isOpen,
  onClose,
  bookMeta,
  bookPages = [],
  onUpdateMeta,
}: KdpListingSheetModalProps) {
  const [selectedLang, setSelectedLang] = useState<KdpBookLanguage>(bookMeta.language || "en");
  const [customTitle, setCustomTitle] = useState(bookMeta.title || "");
  const [customSubtitle, setCustomSubtitle] = useState(bookMeta.subtitle || "");
  const [customAuthor, setCustomAuthor] = useState(bookMeta.author || "KDPage Publishing");
  const [activeDescTab, setActiveDescTab] = useState<"preview" | "html">("preview");

  // Copy status tracking: key can be "all", "desc", "cat-0", "kw-0", etc.
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync state if bookMeta changes when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCustomTitle(bookMeta.title || "");
      setCustomSubtitle(bookMeta.subtitle || "");
      setCustomAuthor(bookMeta.author || "KDPage Publishing");
      if (bookMeta.language) setSelectedLang(bookMeta.language);
    }
  }, [isOpen, bookMeta]);

  // Compute live KDP metadata
  const metadata: KdpMetadataResult = useMemo(() => {
    return generateKdpMetadata({
      bookPages: bookPages.length > 0 ? bookPages : Array(bookMeta.pageCount || 24).fill({ type: "puzzle" }),
      title: customTitle,
      subtitle: customSubtitle,
      author: customAuthor,
      trimSize: bookMeta.trimSize,
      language: selectedLang,
    });
  }, [bookPages, bookMeta.pageCount, bookMeta.trimSize, customTitle, customSubtitle, customAuthor, selectedLang]);

  // Editable keywords state initialized from metadata
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  Amazon KDP Listing &amp; Keyword Sheet
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  KDP Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1-Click copy helper for title, 7 backend keywords, categories, and HTML description.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Download text file with all publishing details"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download .txt</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Bar: Language & Fast Sync */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                Target Marketplace Language
              </label>
              <select
                value={selectedLang}
                onChange={e => {
                  const lang = e.target.value as KdpBookLanguage;
                  setSelectedLang(lang);
                  if (onUpdateMeta) onUpdateMeta({ language: lang });
                }}
                className="w-full text-xs font-bold py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-500 outline-none"
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
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Trim Size &amp; Length
              </label>
              <div className="text-xs font-semibold py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                {bookMeta.trimSize?.label || '8.5" x 11"'} · {metadata.pageCount} Pages
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Est. Royalty (60%)
              </label>
              <div className="text-xs font-bold py-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center justify-between">
                <span>Print: ${metadata.printingCostUsd.toFixed(2)}</span>
                <span className="font-black text-emerald-400">Profit: ${metadata.estimatedRoyaltyUsd.toFixed(2)} / sale</span>
              </div>
            </div>
          </div>

          {/* Section 1: Book Details (Title, Subtitle, Author) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>1. Book Details</span>
              </span>
              <button
                onClick={() => handleCopy(`${customTitle}\n${customSubtitle}\nAuthor: ${customAuthor}`, "details")}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {copiedKey === "details" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === "details" ? "Copied" : "Copy Details"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                  <span>Book Title (Max 200 chars)</span>
                  <span className={customTitle.length > 200 ? "text-rose-400 font-black" : "text-slate-500"}>
                    {customTitle.length}/200
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={e => {
                      setCustomTitle(e.target.value);
                      if (onUpdateMeta) onUpdateMeta({ title: e.target.value });
                    }}
                    placeholder="Enter book title"
                    className="w-full text-xs font-semibold py-2.5 pl-3 pr-16 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white outline-none"
                  />
                  <button
                    onClick={() => handleCopy(customTitle, "title")}
                    className="absolute right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "title" ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                    <span>{copiedKey === "title" ? "Done" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                  <span>Subtitle</span>
                  <span className="text-slate-500">{customSubtitle.length} chars</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={customSubtitle}
                    onChange={e => {
                      setCustomSubtitle(e.target.value);
                      if (onUpdateMeta) onUpdateMeta({ subtitle: e.target.value });
                    }}
                    placeholder="Optional descriptive subtitle"
                    className="w-full text-xs font-semibold py-2.5 pl-3 pr-16 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white outline-none"
                  />
                  <button
                    onClick={() => handleCopy(customSubtitle, "subtitle")}
                    className="absolute right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "subtitle" ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                    <span>{copiedKey === "subtitle" ? "Done" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 7 KDP Backend Keywords (CRITICAL FEATURE) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>2. 7 KDP Backend Search Keywords</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Amazon provides exactly 7 boxes (max 50 chars each). Do NOT repeat words from your title or use commas.
                </p>
              </div>
              <button
                onClick={() => {
                  const combined = editableKeywords.join("\n");
                  handleCopy(combined, "all-kw");
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
              >
                {copiedKey === "all-kw" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === "all-kw" ? "All 7 Copied!" : "Copy All 7 Keywords"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {editableKeywords.map((kw, idx) => {
                const charLen = kw.length;
                const isOverLimit = charLen > 50;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isOverLimit
                        ? "bg-rose-950/30 border-rose-600/60"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Box {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black ${
                            isOverLimit ? "text-rose-400 font-extrabold" : "text-slate-500"
                          }`}
                        >
                          {charLen}/50
                        </span>
                        <button
                          onClick={() => handleCopy(kw, `kw-${idx}`)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
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
                      className="w-full text-xs font-medium py-1 px-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-amber-500 text-slate-100 outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Recommended Amazon Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                3. Recommended Amazon BISAC Categories
              </span>
              <button
                onClick={() => handleCopy(metadata.categories.join("\n"), "all-cat")}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {copiedKey === "all-cat" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === "all-cat" ? "Copied" : "Copy Categories"}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {metadata.categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="font-semibold">{cat}</span>
                  <button
                    onClick={() => handleCopy(cat, `cat-${idx}`)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 transition-colors cursor-pointer shrink-0 ml-2"
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

          {/* Section 4: Amazon-Formatted HTML Description */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  4. Amazon KDP HTML Description
                </span>
                <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px] font-bold">
                  <button
                    onClick={() => setActiveDescTab("preview")}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      activeDescTab === "preview" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Live Preview
                  </button>
                  <button
                    onClick={() => setActiveDescTab("html")}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      activeDescTab === "html" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Raw HTML
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleCopy(metadata.htmlDescription, "desc")}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
              >
                {copiedKey === "desc" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "desc" ? "HTML Copied!" : "Copy HTML for KDP"}</span>
              </button>
            </div>

            {activeDescTab === "preview" ? (
              <div
                className="p-4 rounded-2xl bg-white text-slate-900 text-xs leading-relaxed max-h-60 overflow-y-auto space-y-2 border border-slate-700 shadow-inner"
                dangerouslySetInnerHTML={{ __html: metadata.htmlDescription }}
              />
            ) : (
              <textarea
                readOnly
                value={metadata.htmlDescription}
                rows={8}
                className="w-full text-xs font-mono p-3 rounded-2xl bg-slate-950 border border-slate-800 text-amber-200/90 outline-none resize-none leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/95 shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Paste directly into your Amazon KDP Bookshelf dashboard.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(metadata.cheatsheetText, "master")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            >
              {copiedKey === "master" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "master" ? "Entire Sheet Copied!" : "Copy Full Copy Sheet"}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
