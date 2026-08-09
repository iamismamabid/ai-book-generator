"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Joyride, EVENTS, type EventData, type Step } from "react-joyride";
import { markTourSeen } from "@/app/actions";
import { Sparkles } from "lucide-react";

const TOUR_KEY = "bookBuilder";

const STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome to Book Builder",
    content:
      "This is where you'll create your KDP puzzle books. Let's take a 60-second look at the core loop: add pages, auto-build solutions, export a print-ready PDF.",
  },
  {
    target: '[data-tour="add-page-btn"]',
    title: "1. Add a page",
    content:
      "Start here. Click 'Add New Page' to choose a puzzle type — Sudoku, Crossword, Word Search, Maze, and more — and configure its settings.",
  },
  {
    target: '[data-tour="solutions-settings"]',
    title: "2. Choose your answer-key layout",
    content:
      "For each puzzle type, pick how many solutions get packed onto a single answer-key page — 1, 2, or 4 per page.",
  },
  {
    target: '[data-tour="auto-solutions-btn"]',
    title: "3. Auto-build every solution",
    content:
      "One click generates a complete, correctly-ordered answer-key section for every puzzle currently in your book — no manual solution pages to build.",
  },
  {
    target: '[data-tour="outline-panel"]',
    title: "Your book, in order",
    content:
      "Every page you add appears here. Drag to reorder, duplicate, or delete any page — the whole book stays in sync.",
  },
  {
    target: '[data-tour="export-section"]',
    title: "4. Export",
    content:
      "When you're happy with it, export a print-ready, KDP-compliant interior PDF right here — trim size, bleed, and margins are handled for you.",
  },
  {
    target: "body",
    placement: "center",
    title: "That's the whole loop",
    content:
      "Add pages → auto-build solutions → export. Go ahead and add your first page — you've got this.",
  },
];

export default function BookBuilderTour() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !isLoaded || !isSignedIn) return;
    const seenTours = (user?.publicMetadata as any)?.seenTours || {};
    if (!seenTours[TOUR_KEY]) setRun(true);
  }, [mounted, isLoaded, isSignedIn, user]);

  const finishTour = () => {
    setRun(false);
    markTourSeen(TOUR_KEY).catch((err) => console.error("Failed to save tour status:", err));
    user?.reload().catch(() => {});
  };

  const handleEvent = (data: EventData) => {
    if (data.type === EVENTS.TOUR_END) finishTour();
  };

  if (!mounted || !isSignedIn) return null;

  return (
    <>
      <Joyride
        steps={STEPS}
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
      {/* Manual restart in attractive Golden Box Pill */}
      <button
        onClick={() => setRun(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/60"
        title="Replay interactive studio walkthrough tour"
      >
        <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" />
        <span>Replay Tour</span>
      </button>
    </>
  );
}
