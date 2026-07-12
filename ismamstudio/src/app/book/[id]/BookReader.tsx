"use client";

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
  const [theme, setTheme] = useState<"white" | "cream" | "dark">("cream");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [isTocOpen, setIsTocOpen] = useState(true);

  // Title & Subtitle editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(book.title);
  const [editedSubtitle, setEditedSubtitle] = useState(book.subtitle || "An AI Generated Journey");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const handleSaveTitle = async () => {
    setIsSavingTitle(true);
    await updateBookTitleAndSubtitle(book.id, editedTitle, editedSubtitle);
    setIsEditingTitle(false);
    setIsSavingTitle(false);
  };

  const fullContent = [
    book.content,
    ...book.chapters.map((c) => `\n\n${c.title}\n\n${c.content}`),
  ].join("\n");

  // Dynamic Theme mappings for the pages
  const themeClassMap = {
    white: "bg-white text-slate-800 border-slate-200/60 shadow-xl shadow-black/5",
    cream: "bg-[#FAF6EE] text-[#433422] border-[#EADFC9]/50 shadow-xl shadow-[#382E1E]/5",
    dark: "bg-[#141b27] text-slate-200 border-[#222c3c] shadow-xl shadow-black/30",
  };

  const bodyThemeMap = {
    white: "bg-slate-50 text-slate-900",
    cream: "bg-[#F3EFE4] text-[#382E1E]",
    dark: "bg-[#0b0f19] text-slate-100",
  };

  // Font family mappings
  const fontClassMap = {
    serif: "font-serif tracking-normal font-medium",
    sans: "font-sans tracking-wide font-normal",
  };

  // Font size mappings
  const fontSizeClassMap = {
    sm: "text-sm md:text-base leading-[1.6]",
    md: "text-base md:text-lg leading-[1.8]",
    lg: "text-lg md:text-xl leading-[1.9]",
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bodyThemeMap[theme]}`}>
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

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Theme Buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-850">
            <button
              onClick={() => setTheme("white")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                theme === "white" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              White
            </button>
            <button
              onClick={() => setTheme("cream")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                theme === "cream" ? "bg-[#FAF6EE] text-[#433422] shadow-sm" : "text-[#705c45] hover:text-[#5a4833]"
              }`}
            >
              Cream
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                theme === "dark" ? "bg-[#141b27] text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sepia
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Font Family Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-850">
            <button
              onClick={() => setFontFamily("serif")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all font-serif ${
                fontFamily === "serif" ? "bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
              }`}
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily("sans")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all font-sans ${
                fontFamily === "sans" ? "bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
              }`}
            >
              Sans
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Font Size Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-850">
            {(["sm", "md", "lg"] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setFontSize(sz)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  fontSize === sz ? "bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <ExportButton title={editedTitle} subtitle={editedSubtitle} content={book.content} chapters={book.chapters} />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-sans font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95">
            <CreditCard className="w-4 h-4" /> Publish & Sell
          </button>
        </div>
      </nav>

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
            className={`relative min-h-[1100px] w-full pb-28 rounded-sm flex flex-col items-center justify-center p-20 text-center border-l-[12px] border-indigo-600 transition-colors duration-300 group ${themeClassMap[theme]}`}
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
                      setEditedSubtitle(book.subtitle || "An AI Generated Journey");
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
                <h1 className="text-5xl font-black mb-6 leading-tight font-serif">{editedTitle}</h1>
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
                className={`relative min-h-[1100px] w-full pb-28 p-16 md:p-24 border rounded-sm overflow-hidden transition-colors duration-300 ${themeClassMap[theme]}`}
              >
                {/* Book Crease Shadow (Right Side) */}
                <div className="absolute top-0 bottom-0 right-0 w-[30px] bg-gradient-to-l from-black/[0.06] dark:from-black/30 via-black/[0.01] to-transparent pointer-events-none z-10" />

                {index === 0 && (
                  <h3 className="text-2xl font-black font-serif mb-6 pb-3 border-b border-slate-200/50">Introduction</h3>
                )}

                <div className={`${fontClassMap[fontFamily]} ${fontSizeClassMap[fontSize]}`}>
                  <div className="whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-indigo-600 leading-[1.8]">
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
              className={`relative min-h-[1100px] w-full pb-28 p-16 md:p-24 border rounded-sm overflow-hidden transition-colors duration-300 ${themeClassMap[theme]}`}
            >
              {/* Book Crease Shadow (Right Side) */}
              <div className="absolute top-0 bottom-0 right-0 w-[30px] bg-gradient-to-l from-black/[0.06] dark:from-black/30 via-black/[0.01] to-transparent pointer-events-none z-10" />

              <h2 className="text-3xl font-black mb-6 leading-tight border-b pb-4 border-slate-200/50 font-serif">
                {chapter.title}
              </h2>

              <div className={`${fontClassMap[fontFamily]} ${fontSizeClassMap[fontSize]}`}>
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
