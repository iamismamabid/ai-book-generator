"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Eye,
  Download,
  Trash2,
  Sparkles,
  Plus,
  X,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Flower2,
  Heart,
  Sun,
  Circle,
  Gem,
  CheckCircle2,
  FileText,
  Sliders,
  Palette
} from "lucide-react";
import Link from "next/link";
import { PresetItem, PRESETS, drawColoringPattern } from "@/lib/coloringBookPatterns";

export interface ColoringBookProject {
  id: string;
  title: string;
  description: string;
  templateId: string;
  templateName: string;
  pageCount: number;
  trimSize: string;
  trimW: number;
  trimH: number;
  createdAt: string;
  status: "Ready" | "Draft" | "Published";
  presetId: string;
  includeIntro: boolean;
  generateMetadata: boolean;
  autoCover: boolean;
  metadata?: {
    subtitle: string;
    description: string;
    keywords: string[];
    categories: string[];
  };
}

const TEMPLATES = [
  {
    id: "floral",
    name: "Floral & Botanical",
    desc: "Large print flowers, vines, gardens & bouquets",
    icon: Flower2,
    presetId: "tropical_palms",
    defaultPages: 10,
    sampleTitle: "Blooming Serenity: A Large Floral Coloring Book",
  },
  {
    id: "mandalas",
    name: "Mandalas & Sacred Geometry",
    desc: "Geometric mandalas, zen patterns & circular motifs",
    icon: Sparkles,
    presetId: "mandala_classic",
    defaultPages: 25,
    sampleTitle: "Zen Mandalas: Meditative Patterns for Stress Relief",
  },
  {
    id: "animals",
    name: "Animals & Wildlife",
    desc: "Cute animals, woodland creatures & safari scenes",
    icon: Heart,
    presetId: "underwater_coral",
    defaultPages: 25,
    sampleTitle: "Wild Wonders: Majestic Animals Adult Coloring Book",
  },
  {
    id: "stained_glass",
    name: "Stained Glass & Scenic",
    desc: "Stained glass, landscapes, celestial & gothic architecture",
    icon: Sun,
    presetId: "stained_glass_rose",
    defaultPages: 25,
    sampleTitle: "Luminous Windows: Stained Glass Art Coloring Book",
  },
  {
    id: "kids",
    name: "Kids Fun & Easy",
    desc: "Simple outlines, bold thick lines for children & beginners",
    icon: Circle,
    presetId: "spring_blossoms",
    defaultPages: 10,
    sampleTitle: "My First Big Coloring Book: Fun & Easy Shapes",
  },
  {
    id: "custom",
    name: "Custom (Build from Scratch)",
    desc: "Build completely from scratch with custom AI line art prompts",
    icon: Gem,
    presetId: "art_deco_geometric",
    defaultPages: 25,
    sampleTitle: "Custom Illustrated Coloring Collection",
  },
];

const INITIAL_BOOKS: ColoringBookProject[] = [
  {
    id: "book-1",
    title: "Blooming Serenity: A Large Floral Adult Coloring Book",
    description: "Relax and unwind with 10 exquisite large-print floral illustrations designed for stress relief, mindful meditation, and creative relaxation.",
    templateId: "floral",
    templateName: "Floral & Botanical",
    pageCount: 10,
    trimSize: '8" × 10"',
    trimW: 8,
    trimH: 10,
    createdAt: "May 19",
    status: "Ready",
    presetId: "tropical_palms",
    includeIntro: true,
    generateMetadata: true,
    autoCover: true,
    metadata: {
      subtitle: "50 Beautiful Flower Patterns for Relaxation and Stress Relief",
      description: `<h3>Experience the Calming Power of Botanical Art</h3>
<p>Immerse yourself in a peaceful garden of tranquility with <strong>Blooming Serenity</strong>. Specially designed with clean, bold lines and generous spacing, each page offers an effortless coloring journey for adults, seniors, and beginners alike.</p>
<ul>
  <li><strong>Large Print &amp; Clean Outlines:</strong> Easy on the eyes with zero bleed-through stress.</li>
  <li><strong>Single-Sided Pages:</strong> Perfect for markers, colored pencils, and gel pens.</li>
  <li><strong>Stress Relief &amp; Mindfulness:</strong> Scientifically proven to calm anxiety and boost creativity.</li>
</ul>`,
      keywords: [
        "adult coloring book flowers",
        "large print coloring book for seniors",
        "botanical coloring book relaxation",
        "stress relief coloring books for adults",
        "easy flower patterns coloring",
        "mindfulness coloring book nature",
        "gift for mom coloring book"
      ],
      categories: ["CRAFTS & HOBBIES / Coloring Books", "ART / Subjects & Themes / Plants & Animals"],
    },
  },
  {
    id: "book-2",
    title: "Large Print Flowers",
    description: "Simple, elegant botanical designs featuring roses, lilies, daisies, and botanical flourishes.",
    templateId: "floral",
    templateName: "Floral & Botanical",
    pageCount: 5,
    trimSize: '8.5" × 11"',
    trimW: 8.5,
    trimH: 11,
    createdAt: "May 19",
    status: "Ready",
    presetId: "spring_blossoms",
    includeIntro: true,
    generateMetadata: true,
    autoCover: true,
    metadata: {
      subtitle: "Easy & Relaxing Floral Designs for Beginners and Seniors",
      description: `<p>A delightful collection of large print floral illustrations crafted for relaxation and effortless coloring.</p>`,
      keywords: [
        "large print flowers coloring",
        "simple floral coloring book",
        "easy coloring book for adults",
        "senior coloring book large print",
        "beginner coloring book flowers",
        "relaxing botanical coloring",
        "spring flowers coloring pages"
      ],
      categories: ["CRAFTS & HOBBIES / Coloring Books", "NATURE / Flowers"],
    },
  },
  {
    id: "book-3",
    title: "Large Print Lotus & Nature",
    description: "Serene aquatic scenes with water lilies, lotus blooms, and graceful dragonflies on peaceful ponds.",
    templateId: "stained_glass",
    templateName: "Stained Glass & Scenic",
    pageCount: 5,
    trimSize: '8.5" × 11"',
    trimW: 8.5,
    trimH: 11,
    createdAt: "May 19",
    status: "Ready",
    presetId: "underwater_coral",
    includeIntro: true,
    generateMetadata: true,
    autoCover: true,
    metadata: {
      subtitle: "Peaceful Water Lilies and Dragonfly Landscapes",
      description: `<p>Find inner peace coloring gorgeous lotus blossoms and dragonflies over tranquil summer waters.</p>`,
      keywords: [
        "lotus coloring book",
        "water lilies coloring book",
        "dragonfly coloring pages",
        "zen pond coloring book",
        "serene nature coloring for adults",
        "meditation coloring book",
        "aquatic botanical coloring"
      ],
      categories: ["CRAFTS & HOBBIES / Coloring Books", "SELF-HELP / Meditations"],
    },
  },
];

interface ColoringBookLibraryProps {
  onSelectBook: (book: ColoringBookProject) => void;
  onExportBook: (book: ColoringBookProject) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export default function ColoringBookLibrary({
  onSelectBook,
  onExportBook,
  isCreateModalOpen,
  setIsCreateModalOpen,
}: ColoringBookLibraryProps) {
  const [books, setBooks] = useState<ColoringBookProject[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kdpage_coloring_books");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_BOOKS;
  });

  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [sortOrder, setSortOrder] = useState<string>("Newest First");
  const [metadataModalBook, setMetadataModalBook] = useState<ColoringBookProject | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Book Form States
  const [selectedTemplate, setSelectedTemplate] = useState<string>("floral");
  const [bookTitle, setBookTitle] = useState<string>("");
  const [bookDescription, setBookDescription] = useState<string>("");
  const [chapterLength, setChapterLength] = useState<string>("Medium");
  const [pageCountOption, setPageCountOption] = useState<number>(25);
  const [trimSizeChoice, setTrimSizeChoice] = useState<{ label: string; w: number; h: number }>({
    label: '8.5" × 11"',
    w: 8.5,
    h: 11,
  });
  const [includeIntro, setIncludeIntro] = useState<boolean>(true);
  const [generateKdpMetadata, setGenerateKdpMetadata] = useState<boolean>(true);
  const [autoCover, setAutoCover] = useState<boolean>(true);

  // Sync books to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("kdpage_coloring_books", JSON.stringify(books));
    } catch {}
  }, [books]);

  // Handle template switch in modal
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = TEMPLATES.find((t) => t.id === templateId);
    if (tmpl && !bookTitle) {
      setBookTitle(tmpl.sampleTitle);
      setBookDescription(tmpl.desc);
    }
  };

  // AI Prompt Enhancement for Book Title & Description
  const handleEnhanceWithAi = () => {
    const tmpl = TEMPLATES.find((t) => t.id === selectedTemplate);
    const currentBase = bookTitle.trim() || tmpl?.sampleTitle || "Coloring Book";
    const enhanced = `${currentBase.replace(/ Adult Coloring Book.*$/i, "")}: An Adult Coloring Book with 50+ Relaxing Designs for Stress Relief`;
    setBookTitle(enhanced.slice(0, 200));

    if (!bookDescription.trim()) {
      setBookDescription(
        `Discover deep tranquility and artistic joy with this hand-crafted coloring book. Featuring crisp high-contrast outlines, single-sided printing, and soothing patterns engineered for maximum relaxation and effortless coloring.`
      );
    }
  };

  // Create Book
  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    const tmpl = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];
    const finalTitle = bookTitle.trim() || tmpl.sampleTitle;
    const finalDesc = bookDescription.trim() || tmpl.desc;

    const newBook: ColoringBookProject = {
      id: `book-${Date.now()}`,
      title: finalTitle,
      description: finalDesc,
      templateId: tmpl.id,
      templateName: tmpl.name,
      pageCount: pageCountOption,
      trimSize: trimSizeChoice.label,
      trimW: trimSizeChoice.w,
      trimH: trimSizeChoice.h,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      status: "Ready",
      presetId: tmpl.presetId,
      includeIntro,
      generateMetadata: generateKdpMetadata,
      autoCover,
      metadata: {
        subtitle: `${pageCountOption} Beautiful ${tmpl.name} Illustrations for Relaxation and Stress Relief`,
        description: `<h3>${finalTitle}</h3><p>${finalDesc}</p><ul><li>Large Print Format (${trimSizeChoice.label})</li><li>Single-sided pages prevent bleed-through</li><li>Hours of mindfulness and creative stress relief</li></ul>`,
        keywords: [
          `${tmpl.name.toLowerCase()} coloring book`,
          "adult coloring book stress relief",
          "large print coloring for adults",
          "relaxing coloring book",
          "easy coloring patterns",
          "mindfulness coloring",
          "coloring book gift"
        ],
        categories: ["CRAFTS & HOBBIES / Coloring Books", "ART / General"],
      },
    };

    setBooks((prev) => [newBook, ...prev]);
    setIsCreateModalOpen(false);

    // Reset form
    setBookTitle("");
    setBookDescription("");

    // Automatically load into studio
    onSelectBook(newBook);
  };

  // Delete Book
  const handleDeleteBook = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this coloring book project?")) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter & Sort
  const filteredBooks = books
    .filter((b) => {
      if (statusFilter === "All Status") return true;
      return b.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortOrder === "Newest First") return b.id.localeCompare(a.id);
      if (sortOrder === "Oldest First") return a.id.localeCompare(b.id);
      if (sortOrder === "Title A-Z") return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar Matching User Screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Coloring Books Library
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                {books.length} Books
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Manage your KDP coloring books, interiors, metadata, and wrap-around covers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All Status">All Status</option>
            <option value="Ready">Ready</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sort Order"
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Newest First">Newest First</option>
            <option value="Oldest First">Oldest First</option>
            <option value="Title A-Z">Title A-Z</option>
          </select>

          {/* Create New Book Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Book
          </button>
        </div>
      </div>

      {/* Book Cards Grid Matching User Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => {
          const preset = PRESETS.find((p) => p.id === book.presetId) || PRESETS[0];

          return (
            <div
              key={book.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* Card Image Preview Container */}
              <div className="relative w-full aspect-[4/3] bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
                {/* Visual SVG Pattern Representation */}
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full p-4 object-contain transition-transform duration-300 group-hover:scale-105"
                >
                  <rect width="200" height="200" fill="transparent" />
                  <g stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {/* Artistic coloring pattern preview */}
                    <circle cx="100" cy="100" r="70" strokeDasharray="6,4" />
                    <circle cx="100" cy="100" r="45" />
                    <circle cx="100" cy="100" r="20" />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                      <g key={deg} transform={`rotate(${deg} 100 100)`}>
                        <path d="M100,30 Q115,65 100,100 Q85,65 100,30" fill="rgba(168, 85, 247, 0.05)" />
                        <circle cx="100" cy="20" r="6" fill="rgba(16, 185, 129, 0.1)" />
                      </g>
                    ))}
                  </g>
                </svg>

                {/* Status Dot (Top-Right) */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-full shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {book.status}
                  </span>
                </div>

                {/* Save / Quick Action Overlay on Hover */}
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                  <button
                    onClick={() => onSelectBook(book)}
                    className="bg-white/95 text-slate-800 text-[11px] font-black px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 hover:bg-white hover:text-purple-600 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Open in Studio
                  </button>
                </div>
              </div>

              {/* Card Details Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 line-clamp-1 leading-snug group-hover:text-purple-600 transition-colors">
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      {book.pageCount} pages
                    </span>
                    <span>•</span>
                    <span>{book.trimSize}</span>
                    <span>•</span>
                    <span>{book.createdAt}</span>
                  </div>
                </div>

                {/* Primary Action Buttons (View & Export) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onSelectBook(book)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    View
                  </button>
                  <button
                    onClick={() => onExportBook(book)}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </button>
                </div>

                {/* Secondary Action Links Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <Link
                    href={`/studio?tab=cover&title=${encodeURIComponent(book.title)}&pages=${book.pageCount}&trim=${book.trimW}x${book.trimH}`}
                    className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    Generate Cover
                  </Link>

                  <button
                    onClick={() => setMetadataModalBook(book)}
                    className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    KDP Metadata
                  </button>

                  <button
                    onClick={(e) => handleDeleteBook(book.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🚀 CREATE NEW COLORING BOOK MODAL Matching User Screenshots 2 & 3 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Create New Coloring Book
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Choose a template and customize your book
              </p>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-6">
              {/* Section 1: Book Template Grid (Screenshot 3) */}
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-3">
                  <BookOpen className="w-4 h-4 text-purple-600" /> Book Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TEMPLATES.map((tmpl) => {
                    const Icon = tmpl.icon;
                    const isSelected = selectedTemplate === tmpl.id;
                    return (
                      <button
                        type="button"
                        key={tmpl.id}
                        onClick={() => handleSelectTemplate(tmpl.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[105px] ${
                          isSelected
                            ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-600/30 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <Icon className={`w-5 h-5 ${isSelected ? "text-purple-600" : "text-slate-500"}`} />
                        <div>
                          <div className="text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1">
                            {tmpl.name}
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                            {tmpl.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Book Details (Screenshot 3) */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Book Details
                </label>

                {/* Book Title */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">Book Title *</span>
                    <button
                      type="button"
                      onClick={handleEnhanceWithAi}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-purple-500" /> Enhance Prompt with AI
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="Enter your book title..."
                    maxLength={200}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-400 text-right mt-1">
                    {bookTitle.length} / 200 characters (KDP limit)
                  </div>
                </div>

                {/* Book Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Book Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={bookDescription}
                    onChange={(e) => setBookDescription(e.target.value)}
                    placeholder="Describe what your book will cover, the target audience, and key topics..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 3: Chapter Length / Page Count Options (Screenshot 2) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Chapter Length / Page Count
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { label: "Short", pages: 10, credit: "" },
                    { label: "Medium", pages: 25, credit: "" },
                    { label: "Long", pages: 50, credit: "+5 credits" },
                    { label: "Extra Long", pages: 75, credit: "+5 credits" },
                    { label: "Full Length", pages: 100, credit: "+5 credits" },
                  ].map((len) => {
                    const isSelected = chapterLength === len.label;
                    return (
                      <button
                        type="button"
                        key={len.label}
                        onClick={() => {
                          setChapterLength(len.label);
                          setPageCountOption(len.pages);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-black ring-1 ring-purple-600"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs">{len.label}</span>
                        {len.credit && (
                          <span className="text-[9px] text-purple-500 font-semibold mt-0.5">
                            {len.credit}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Book Structure & Toggles (Screenshot 2) */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-600" /> Book Structure
                </label>

                {/* Number of Chapters / Pages */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Number of Pages
                  </label>
                  <select
                    value={pageCountOption}
                    onChange={(e) => setPageCountOption(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={10}>10 Pages (Short &amp; Sweet)</option>
                    <option value={25}>25 Pages (Standard KDP Single-Sided)</option>
                    <option value={50}>50 Pages (Bestseller Length)</option>
                    <option value={75}>75 Pages (Deluxe Edition)</option>
                    <option value={100}>100 Pages (Ultimate Collection)</option>
                  </select>
                </div>

                {/* Trim Size */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Trim Size
                  </label>
                  <select
                    value={trimSizeChoice.label}
                    onChange={(e) => {
                      if (e.target.value.startsWith("8.5")) setTrimSizeChoice({ label: '8.5" × 11"', w: 8.5, h: 11 });
                      else if (e.target.value.startsWith("8 x 10")) setTrimSizeChoice({ label: '8" × 10"', w: 8, h: 10 });
                      else setTrimSizeChoice({ label: '8.25" × 8.25"', w: 8.25, h: 8.25 });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value='8.5" × 11"'>8.5" × 11" (Standard Amazon Coloring Book)</option>
                    <option value='8" × 10"'>8" × 10" (Portrait)</option>
                    <option value='8.25" × 8.25"'>8.25" × 8.25" (Square Mandalas)</option>
                  </select>
                </div>

                {/* Toggles from Screenshot 2 */}
                <div className="space-y-3 pt-2">
                  {/* Include Introduction Toggle */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Include Introduction
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Add a title page, copyright notice &amp; color test page (+2 credits)
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeIntro}
                      onChange={(e) => setIncludeIntro(e.target.checked)}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Generate KDP Metadata Toggle */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Generate KDP Metadata
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Create an optimized title, subtitle, description, and 7 keywords for Amazon KDP
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={generateKdpMetadata}
                      onChange={(e) => setGenerateKdpMetadata(e.target.checked)}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Auto-Generate Book Cover Toggle */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Auto-Generate Book Cover <span className="text-purple-600 font-bold">(+5 credits)</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Automatically create a book cover when generation completes
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoCover}
                      onChange={(e) => setAutoCover(e.target.checked)}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                Create Coloring Book
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📋 KDP METADATA MODAL */}
      {metadataModalBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setMetadataModalBook(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Amazon KDP Metadata
                </h3>
                <p className="text-xs text-slate-500">
                  Optimized keywords, subtitle, and HTML description for {metadataModalBook.title}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Subtitle */}
              <div>
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Subtitle</span>
                  <button
                    onClick={() => handleCopy(metadataModalBook.metadata?.subtitle || "", "sub")}
                    className="text-purple-600 hover:underline flex items-center gap-1 font-bold text-[11px]"
                  >
                    {copiedKey === "sub" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "sub" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200">
                  {metadataModalBook.metadata?.subtitle}
                </div>
              </div>

              {/* 7 KDP Search Keywords */}
              <div>
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>7 Amazon Search Keywords (Exact Match)</span>
                  <button
                    onClick={() =>
                      handleCopy(metadataModalBook.metadata?.keywords.join("\n") || "", "kw")
                    }
                    className="text-purple-600 hover:underline flex items-center gap-1 font-bold text-[11px]"
                  >
                    {copiedKey === "kw" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "kw" ? "Copied All" : "Copy All"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {metadataModalBook.metadata?.keywords.map((kw, i) => (
                    <div
                      key={i}
                      className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between font-mono text-[11px]"
                    >
                      <span className="text-slate-700 dark:text-slate-300">{kw}</span>
                      <button
                        onClick={() => handleCopy(kw, `kw-${i}`)}
                        className="text-slate-400 hover:text-purple-600 ml-1"
                      >
                        {copiedKey === `kw-${i}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* KDP Description HTML */}
              <div>
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Formatted Description (HTML)</span>
                  <button
                    onClick={() => handleCopy(metadataModalBook.metadata?.description || "", "desc")}
                    className="text-purple-600 hover:underline flex items-center gap-1 font-bold text-[11px]"
                  >
                    {copiedKey === "desc" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "desc" ? "Copied" : "Copy HTML"}
                  </button>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] max-h-36 overflow-y-auto text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {metadataModalBook.metadata?.description}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <Link
                  href={`/studio?tab=cover&title=${encodeURIComponent(metadataModalBook.title)}&pages=${metadataModalBook.pageCount}&trim=${metadataModalBook.trimW}x${metadataModalBook.trimH}`}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-3 rounded-xl text-center transition flex items-center justify-center gap-1.5"
                >
                  <Palette className="w-4 h-4" /> Open in Cover Studio
                </Link>
                <button
                  onClick={() => setMetadataModalBook(null)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
