"use client";

import posthog from "posthog-js";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, BookOpen, Settings, Type, Layout, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import ExportButton from "@/components/ExportButton";
import ChapterButton from "./ChapterButton";
import EditableChapter from "./EditableChapter";
import { updateBookTitleAndSubtitle } from "../../actions";

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Book {
  id: string;
  title: string;
  subtitle?: string | null;
  content: string;
  chapters: Chapter[];
}

interface BookReaderProps {
  book: Book;
  pages: string[];
}

export default function BookReader({ book, pages }: BookReaderProps) {
  // E-Reader Configuration States
  const [theme, setTheme] = useState<"white" | "cream" | "dark" | "custom">("cream");
  const [fontFamily, setFontFamily] = useState<"georgia" | "garamond" | "sans" | "courier">("georgia");
  const [fontSize, setFontSize] = useState<number>(18); // px (slider 14px to 26px)
  const [lineHeight, setLineHeight] = useState<number>(1.8); // spacing (slider 1.4 to 2.4)
  const [isTocOpen, setIsTocOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Custom colors state
  const [customBgColor, setCustomBgColor] = useState("#FAF6EE");
  const [customTextColor, setCustomTextColor] = useState("#433422");

  // Title & Subtitle editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(book.title);
  const [editedSubtitle, setEditedSubtitle] = useState(book.subtitle || "A Creative Journey");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const handleSaveTitle = async () => {
    setIsSavingTitle(true);
    try {
      await updateBookTitleAndSubtitle(book.id, editedTitle, editedSubtitle);
      posthog.capture("book_title_edited", { book_id: book.id });
    } catch (err) {
      posthog.captureException(err);
    }
    setIsEditingTitle(false);
    setIsSavingTitle(false);
  };

  // Convert font family state to PDF font name
  const getPdfFontName = () => {
    switch (fontFamily) {
      case "sans":
        return "helvetica";
      case "courier":
        return "courier";
      default:
        return "times";
    }
  };

  // Resolve custom styles for the pages
  const getPageStyle = () => {
    const themeColors = {
      white: { bg: "#ffffff", text: "#1e293b", border: "#e2e8f0" },
      cream: { bg: "#FAF6EE", text: "#433422", border: "#EADFC9" },
      dark: { bg: "#141b27", text: "#e2e8f0", border: "#222c3c" },
    };

    const colors = theme === "custom" 
      ? { bg: customBgColor, text: customTextColor, border: `${customTextColor}25` } 
      : themeColors[theme];

    return {
      backgroundColor: colors.bg,
      color: colors.text,
      borderColor: colors.border,
      fontFamily: getFontFamilyStyle(),
      fontSize: `${fontSize}px`,
      lineHeight: lineHeight,
    };
  };

  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case "georgia":
        return "Georgia, serif";
      case "garamond":
        return "Garamond, Georgia, serif";
      case "sans":
        return "Inter, system-ui, sans-serif";
      case "courier":
        return "'Courier New', Courier, monospace";
      default:
        return "Georgia, serif";
    }
  };

  const bodyThemeMap = {
    white: "bg-slate-50 text-slate-900",
    cream: "bg-[#F3EFE4] text-[#382E1E]",
    dark: "bg-[#0b0f19] text-slate-100",
    custom: "bg-slate-100",
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "custom" ? `bg-slate-100` : bodyThemeMap[theme]}`}>
      {/* ── STICKY CONTROL HEADER ───────────────────────────────── */}
      <nav className="print:hidden sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-900/50 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-all font-sans font-bold text-sm shrink-0">
            <ArrowLeft className="w-4 h-4" /> <span>Library</span>
          </Link>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />
          <h2 className="text-sm font-black text-slate-800 dark:text-white truncate hidden sm:block">
            {book.title}
          </h2>
        </div>

        {/* E-Reader Toolbar Controls */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {/* Toggle Sidebar TOC */}
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className={`p-2 rounded-xl border transition-all ${
              isTocOpen 
                ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            title="Toggle Chapters Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Toggle Style Settings Panel */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl border transition-all ${
              isSettingsOpen 
                ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            title="E-Reader Style Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <ExportButton 
            title={editedTitle} 
            subtitle={editedSubtitle} 
            content={book.content} 
            chapters={book.chapters} 
            customFont={getPdfFontName()}
            customFontSize={fontSize}
            customLineSpacing={lineHeight}
            customTextColor={theme === "custom" ? customTextColor : theme === "dark" ? "#e2e8f0" : "#1e293b"}
          />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-sans font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95">
            <CreditCard className="w-4 h-4" /> Publish & Sell
          </button>
        </div>
      </nav>

      {/* ── CUSTOM STYLE CONTROL PANEL ───────────────────────────── */}
      {isSettingsOpen && (
        <div className="print:hidden max-w-4xl mx-auto mt-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl flex flex-col gap-6 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Font Family Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Font Family</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "georgia", label: "Georgia", fontClass: "font-serif" },
                  { id: "garamond", label: "Garamond", fontClass: "font-serif" },
                  { id: "sans", label: "Inter Sans", fontClass: "font-sans" },
                  { id: "courier", label: "Courier", fontClass: "font-mono" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${f.fontClass} ${
                      fontFamily === f.id
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-400"
                        : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size & Spacing */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Font Size</label>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="26"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Line Spacing</label>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{lineHeight}</span>
                </div>
                <input
                  type="range"
                  min="1.4"
                  max="2.4"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* Color Mode */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Page Color Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "white", label: "Pure White" },
                  { id: "cream", label: "Soft Cream" },
                  { id: "dark", label: "Slate Dark" },
                  { id: "custom", label: "Custom Hex" },
                ].map((tm) => (
                  <button
                    key={tm.id}
                    onClick={() => setTheme(tm.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      theme === tm.id
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-400"
                        : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {tm.label}
                  </button>
                ))}
              </div>

              {theme === "custom" && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0 overflow-hidden"
                    />
                    <span className="text-[9px] font-black uppercase text-slate-400">Paper Bg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customTextColor}
                      onChange={(e) => setCustomTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0 overflow-hidden"
                    />
                    <span className="text-[9px] font-black uppercase text-slate-400">Ink Color</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTAINER ───────────────────────────── */}
      <div className="max-w-[1600px] mx-auto flex items-start gap-8 px-6 pt-8 pb-20 relative">
        {/* 📚 LEFT FLOATING TABLE OF CONTENTS (TOC) */}
        {isTocOpen && (
          <aside className="print:hidden w-64 shrink-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 sticky top-28 h-[calc(100vh-140px)] overflow-y-auto space-y-6">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Book Navigation</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleScrollTo("title-page")}
                    className="w-full text-left text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate py-1.5 px-3 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                  >
                    📖 Title Page
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleScrollTo("intro-page")}
                    className="w-full text-left text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate py-1.5 px-3 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                  >
                    📖 Introduction
                  </button>
                </li>
              </ul>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Chapters</h3>
              <ul className="space-y-2">
                {book.chapters.map((chapter, index) => (
                  <li key={chapter.id}>
                    <button
                      onClick={() => handleScrollTo(`chapter-${chapter.id}`)}
                      className="w-full text-left text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate py-1.5 px-3 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 flex items-start gap-1.5"
                    >
                      <span className="text-indigo-500">C{index + 1}</span>
                      <span className="truncate">{chapter.title.replace(/Chapter \d+:\s*/i, "")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

        {/* 📖 CENTER READING PREVIEW CONTAINER */}
        <div className="flex-grow flex flex-col items-center max-w-4xl mx-auto space-y-12">
          {/* 1. Title Page Section */}
          <section
            id="title-page"
            style={getPageStyle()}
            className="relative min-h-[1100px] w-full pb-28 rounded-sm flex flex-col items-center justify-center p-20 text-center border border-l-[12px] border-indigo-600 transition-colors duration-300 group"
          >
            {/* Book Crease Shadow (Right Side) */}
            <div className="absolute top-0 bottom-0 right-0 w-[30px] bg-gradient-to-l from-black/[0.06] dark:from-black/30 via-black/[0.01] to-transparent pointer-events-none z-10" />

            {isEditingTitle ? (
              <div className="w-full max-w-lg space-y-5 z-20 font-sans">
                <div className="text-left">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Book Title</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full mt-1.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-serif text-xl focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div className="text-left">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={editedSubtitle}
                    onChange={(e) => setEditedSubtitle(e.target.value)}
                    className="w-full mt-1.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-sm focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={handleSaveTitle}
                    disabled={isSavingTitle}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition"
                  >
                    {isSavingTitle ? "Saving..." : "Save Title"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditedTitle(book.title);
                      setEditedSubtitle(book.subtitle || "A Creative Journey");
                    }}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-lg hover:text-indigo-600 transition-all z-20 pointer-events-auto"
                  title="Edit Title & Subtitle"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <h1 className="text-5xl font-black mb-6 leading-tight">{editedTitle}</h1>
                <div className="w-20 h-1 bg-indigo-600 mb-6 mx-auto"></div>
                <p className="text-base text-slate-500 font-sans tracking-widest uppercase">{editedSubtitle}</p>
              </>
            )}
          </section>

          {/* 2. Introduction Pages Section */}
          <div id="intro-page" className="w-full space-y-12">
            {pages.map((pageContent, index) => (
              <section
                key={index}
                style={getPageStyle()}
                className="relative min-h-[1100px] w-full pb-28 p-16 md:p-24 border rounded-sm overflow-hidden transition-colors duration-300"
              >
                {/* Book Crease Shadow (Right Side) */}
                <div className="absolute top-0 bottom-0 right-0 w-[30px] bg-gradient-to-l from-black/[0.06] dark:from-black/30 via-black/[0.01] to-transparent pointer-events-none z-10" />

                {index === 0 && (
                  <h3 className="text-2xl font-black mb-6 pb-3 border-b border-slate-200/50">Introduction</h3>
                )}

                <div>
                  <div className="whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-indigo-600">
                    {pageContent}
                  </div>
                </div>

                <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 font-sans text-xs font-bold uppercase tracking-wider">
                  — Page {index + 1} —
                </span>
              </section>
            ))}
          </div>

          {/* 3. Generated Chapters Section */}
          {book.chapters.map((chapter, idx) => (
            <section
              key={chapter.id}
              id={`chapter-${chapter.id}`}
              style={getPageStyle()}
              className="relative min-h-[1100px] w-full pb-28 p-16 md:p-24 border rounded-sm overflow-hidden transition-colors duration-300"
            >
              {/* Book Crease Shadow (Right Side) */}
              <div className="absolute top-0 bottom-0 right-0 w-[30px] bg-gradient-to-l from-black/[0.06] dark:from-black/30 via-black/[0.01] to-transparent pointer-events-none z-10" />

              <h2 className="text-3xl font-black mb-6 leading-tight border-b pb-4 border-slate-200/50">
                {chapter.title}
              </h2>

              <div>
                <EditableChapter chapter={chapter} />
              </div>

              <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 font-sans text-xs font-bold uppercase tracking-wider">
                — Page {pages.length + idx + 1} —
              </span>
            </section>
          ))}

          {/* 4. End Page */}
          <section className="w-full h-64 bg-slate-200/20 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
            <BookOpen className="w-10 h-10 mb-4 opacity-30" />
            <p className="font-sans font-black italic text-sm">The End of {book.title}</p>
          </section>

          {/* 5. Additional Creation Buttons */}
          <div className="print:hidden flex flex-col items-center justify-center w-full gap-6">
            <ChapterButton
              bookId={book.id}
              outline={book.content}
              title={book.title}
              currentCount={book.chapters.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
