"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Joyride, EVENTS, type EventData, type Step } from "react-joyride";
import { markTourSeen } from "@/app/actions";
import { Sparkles } from "lucide-react";

export type PuzzleTourType =
  | "coloringBook"
  | "wordSearch"
  | "sudoku"
  | "maze"
  | "crossword"
  | "cryptogram"
  | "kakuro"
  | "mathPuzzle"
  | "wordScramble";

export const PUZZLE_TOURS: Record<PuzzleTourType, { title: string; steps: Step[] }> = {
  coloringBook: {
    title: "Coloring Book Studio",
    steps: [
      {
        target: "body",
        placement: "center",
        title: "🎨 Welcome to Coloring Book Studio",
        content: "Create 300 DPI print-ready coloring pages and full KDP interior PDFs in seconds. This 45-second tour will show you every feature!",
      },
      {
        target: '[data-tour="select-template"]',
        title: "1. Pick a Template or Upload Your Photo",
        content: "Select from 67+ vector templates — mandalas, floral, stained glass, flags, clip-art — or upload your own PNG/JPG to auto-convert it to clean line art using the Sobel edge-detection filter.",
      },
      {
        target: '[data-tour="customization-controls"]',
        title: "2. Customization Controls",
        content: "Adjust line thickness, pattern complexity, border frame style (ornamental/circle/minimal/none), color-by-number overlay. Also select your KDP Trim Size (8.5×11, 8.5×8.5, 8×10, 6×9) and toggle Full Bleed export.",
      },
      {
        target: '[data-tour="interactive-coloring"]',
        title: "3. Interactive Coloring Canvas",
        content: "Color your page directly in-browser! Use Brush (B), Flood Fill (G), Eraser (E), Eyedropper (I), Text (T), Shape Stamp, Straight Line, and Freehand Path tools. Press [ / ] to resize brush. Ctrl+Z / Ctrl+Y to undo/redo.",
      },
      {
        target: '[data-tour="interactive-coloring"]',
        title: "4. Blank Canvas & KDP Sizes",
        content: "Click 'Create Blank Page' to start a 100% clean 300 DPI canvas with no preset pattern. Canvas aspect ratio updates automatically when you switch trim sizes — including Full Bleed dimensions.",
      },
      {
        target: '[data-tour="interactive-coloring"]',
        title: "5. Keyboard Shortcuts",
        content: "Power shortcuts: Ctrl+Z Undo · Ctrl+Y Redo · Ctrl+A Fill All · Ctrl+S Save Progress · [ / ] Brush Size · B Brush · E Eraser · G Fill · I Eyedropper · T Text Tool",
      },
      {
        target: '[data-tour="export-actions"]',
        title: "6. Export — PNG & KDP PDF",
        content: "Download a single 300 DPI PNG page, or generate a full multi-page KDP interior PDF. Free accounts: up to 30 pages. Premium: up to 500 pages. PDF includes KDP metadata (Creator, DPI, trim size) and optional bleed.",
      },
    ],
  },
  wordSearch: {
    title: "Word Search Studio",
    steps: [
      {
        target: "body",
        placement: "center",
        title: "🔍 Welcome to Word Search Studio",
        content: "Generate single-solution verified word search puzzles for Amazon KDP activity books.",
      },
      {
        target: '[data-tour="word-input"]',
        title: "1. Input Words or Pick Theme",
        content: "Type your custom word list or select from 50+ curated high-demand KDP themes (Animals, Sports, Holidays, Science).",
      },
      {
        target: '[data-tour="grid-settings"]',
        title: "2. Grid & Placement Settings",
        content: "Configure grid dimensions (10x10 to 20x20), difficulty levels, and allowed word directions (horizontal, vertical, diagonal).",
      },
      {
        target: '[data-tour="export-section"]',
        title: "3. Export PDF & Solution Key",
        content: "Export single high-res pages or compile an entire word search puzzle book with automated answer-key pages!",
      },
    ],
  },
  sudoku: {
    title: "Sudoku Studio",
    steps: [
      {
        target: "body",
        placement: "center",
        title: "🔢 Welcome to Sudoku Studio",
        content: "Generate mathematically unique, single-solution Sudoku puzzles for Amazon KDP publishing.",
      },
      {
        target: '[data-tour="difficulty-select"]',
        title: "1. Choose Difficulty & Size",
        content: "Select difficulty from Easy, Medium, Hard to Evil, or pick grid types (Standard 9x9, Mini 6x6, Monster 16x16).",
      },
      {
        target: '[data-tour="solution-layout"]',
        title: "2. Answer Key Layout",
        content: "Choose how many solution grids fit per answer-key page (1, 2, or 4 per page) for optimal book formatting.",
      },
      {
        target: '[data-tour="export-pdf"]',
        title: "3. Export Print-Ready PDF",
        content: "Export a single page or compile up to 100 Sudoku puzzle pages + answer keys in one KDP PDF bundle!",
      },
    ],
  },
  maze: {
    title: "Maze Studio",
    steps: [
      {
        target: "body",
        placement: "center",
        title: "🌀 Welcome to Maze Studio",
        content: "Design shape-masked labyrinths and path puzzles formatted to KDP print standards.",
      },
      {
        target: '[data-tour="maze-shape"]',
        title: "1. Select Maze Shape",
        content: "Choose between Rectangular, Circular, Heart, or Hexagonal labyrinth shapes.",
      },
      {
        target: '[data-tour="maze-complexity"]',
        title: "2. Adjust Path Density",
        content: "Set grid columns/rows, wall thickness, and solution algorithm complexity.",
      },
      {
        target: '[data-tour="export-pdf"]',
        title: "3. Export PDF with Solutions",
        content: "Export 300 DPI high-res maze interiors with matching solution path pages!",
      },
    ],
  },
  crossword: {
    title: "Crossword Studio",
    steps: [
      {
        target: "body",
        placement: "center",
        title: "✏️ Welcome to Crossword Studio",
        content: "Build publication-grade crossword puzzles with automated clue positioning and grid fitting.",
      },
      {
        target: '[data-tour="clue-input"]',
        title: "1. Input Words & Clues",
        content: "Enter your target word list with corresponding clues, or use automated vocabulary presets.",
      },
      {
        target: '[data-tour="export-section"]',
        title: "2. Export Crossword Book Interior",
        content: "Download print-ready crossword pages with formatted clues & complete solution keys!",
      },
    ],
  },
  cryptogram: {
    title: "Cryptogram Studio",
    steps: [
      {
        target: "body",
        placement: "center",
        title: "🔐 Welcome to Cryptogram Studio",
        content: "Generate encrypted quote and riddle puzzles with substitution ciphers.",
      },
      {
        target: '[data-tour="quote-input"]',
        title: "1. Add Quotes & Passages",
        content: "Type motivational quotes, historical passages, or funny riddles to encode.",
      },
      {
        target: '[data-tour="export-section"]',
        title: "2. Generate Cipher & Export",
        content: "Auto-generate letter substitution ciphers and frequency hint keys for your book interior!",
      },
    ],
  },
  kakuro: {
    title: "Kakuro Studio",
    steps: [
      {
        target: "body",
        placement: "center",
        title: "🧮 Welcome to Kakuro Studio",
        content: "Create cross-sum mathematical logic puzzles with verified single solutions.",
      },
      {
        target: '[data-tour="grid-size"]',
        title: "1. Grid Dimensions & Sums",
        content: "Select board dimensions and target clue sum difficulty ranges.",
      },
      {
        target: '[data-tour="export-section"]',
        title: "2. Export KDP Interior",
        content: "Download 300 DPI vector Kakuro puzzle pages and solution keys!",
      },
    ],
  },
  mathPuzzle: {
    title: "Math Puzzle Studio",
    steps: [
      {
        target: "body",
        placement: "center",
        title: "➕ Welcome to Math Puzzle Studio",
        content: "Build math activity books with addition, subtraction, multiplication, and magic square grids.",
      },
      {
        target: '[data-tour="math-op"]',
        title: "1. Operation & Difficulty",
        content: "Pick arithmetic operation types, number ranges, and target age group presets.",
      },
      {
        target: '[data-tour="export-section"]',
        title: "2. Export Activity Pages",
        content: "Export KDP print-ready math worksheets with step-by-step answer keys!",
      },
    ],
  },
  wordScramble: {
    title: "Word Scramble Studio",
    steps: [
      {
        target: "body",
        placement: "center",
        title: "🔤 Welcome to Word Scramble Studio",
        content: "Generate word jumble & anagram activity sheets for kids and adults.",
      },
      {
        target: '[data-tour="scramble-input"]',
        title: "1. Enter Words & Hints",
        content: "Input target words, add optional letter position hints, and scramble algorithms.",
      },
      {
        target: '[data-tour="export-section"]',
        title: "2. Export Worksheets",
        content: "Export clean KDP-ready word scramble pages with answer sheets!",
      },
    ],
  },
};

interface GenericStudioTourProps {
  tourKey: PuzzleTourType;
  className?: string;
}

export default function GenericStudioTour({ tourKey, className }: GenericStudioTourProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);

  const tourConfig = PUZZLE_TOURS[tourKey];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !isLoaded) return;
    if (!isSignedIn) {
      // Check localStorage for guests
      const seenLocal = localStorage.getItem(`kdpage_tour_${tourKey}`);
      if (!seenLocal) setRun(true);
      return;
    }
    const seenTours = (user?.publicMetadata as any)?.seenTours || {};
    if (!seenTours[tourKey]) setRun(true);
  }, [mounted, isLoaded, isSignedIn, user, tourKey]);

  const finishTour = () => {
    setRun(false);
    localStorage.setItem(`kdpage_tour_${tourKey}`, "true");
    if (isSignedIn) {
      markTourSeen(tourKey).catch((err) => console.error("Failed to save tour status:", err));
      user?.reload().catch(() => {});
    }
  };

  const handleEvent = (data: EventData) => {
    if (data.type === EVENTS.TOUR_END) finishTour();
  };

  if (!mounted || !tourConfig) return null;

  return (
    <>
      <Joyride
        steps={tourConfig.steps}
        run={run}
        continuous
        scrollToFirstStep
        onEvent={handleEvent}
        locale={{ last: "Got it!", skip: "Skip tour" }}
        options={{
          primaryColor: "#4f46e5",
          backgroundColor: "#0f172a",
          textColor: "#e2e8f0",
          arrowColor: "#0f172a",
          overlayColor: "rgba(2, 6, 23, 0.7)",
          showProgress: true,
          skipBeacon: true,
          buttons: ["back", "skip", "primary"],
          zIndex: 1000,
        }}
        styles={{
          tooltip: { borderRadius: 16 },
          tooltipTitle: { fontWeight: 900, textTransform: "uppercase", fontSize: 13, letterSpacing: "0.02em" },
          buttonPrimary: { borderRadius: 10, fontWeight: 700 },
          buttonBack: { color: "#94a3b8" },
        }}
      />
      <button
        onClick={() => setRun(true)}
        className={className || "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/60 shrink-0 whitespace-nowrap"}
        title={`Replay ${tourConfig.title} Walkthrough Tour`}
      >
        <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
        <span>Replay Tour</span>
      </button>
    </>
  );
}
