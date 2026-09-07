"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Joyride, EVENTS, type EventData, type Step } from "react-joyride";
import { markTourSeen } from "@/app/actions";
import { Sparkles } from "lucide-react";

const QUICK_TOUR_KEY = "quickStartTour";
const LOCAL_STORAGE_KEY = "kdpage_quick_tour_seen";

const QUICK_STEPS: Step[] = [
  {
    target: '[data-tour="quick-trim-size"]',
    title: "1. Pick Trim Size",
    content:
      "Select your Amazon KDP paperback trim size (8.5\" × 11\", 6\" × 9\", or 5.5\" × 8.5\"). All interior puzzle grids, borders, and margins adapt dynamically to your selected book dimensions.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="quick-add-page"]',
    title: "2. Generate Interior",
    content:
      "Click 'Add New Page' to generate Sudoku, Word Search, Crosswords, Mazes, Coloring pages, or custom KDP activity templates. You can customize difficulty and auto-build solutions with 1 click.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="quick-export-pdf"]',
    title: "3. Export Print-Ready PDF",
    content:
      "Export your complete interior as a 300 DPI, KDP-compliant PDF with automatic answer keys, page numbers, and gutter margins—ready for direct upload to Amazon KDP.",
    disableBeacon: true,
  },
];

interface QuickStartTourProps {
  className?: string;
  buttonLabel?: string;
}

export default function QuickStartTour({ className, buttonLabel = "Quick Tour" }: QuickStartTourProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if user or guest has already completed the quick start tour
    const seenLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!seenLocal) {
      // Small timeout to allow canvas/DOM elements to settle into view
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // For signed-in users, also check Clerk metadata
    if (isLoaded && isSignedIn && user) {
      const seenTours = (user?.publicMetadata as any)?.seenTours || {};
      if (!seenTours[QUICK_TOUR_KEY] && !seenLocal) {
        setRun(true);
      }
    }
  }, [mounted, isLoaded, isSignedIn, user]);

  const finishTour = () => {
    setRun(false);
    localStorage.setItem(LOCAL_STORAGE_KEY, "true");
    if (isSignedIn) {
      markTourSeen(QUICK_TOUR_KEY).catch((err) =>
        console.error("Failed to save quick start tour status:", err)
      );
      user?.reload().catch(() => {});
    }
  };

  const handleEvent = (data: EventData) => {
    if (data.type === EVENTS.TOUR_END || data.action === "close") {
      finishTour();
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Joyride
        steps={QUICK_STEPS}
        run={run}
        continuous
        scrollToFirstStep
        showProgress
        onEvent={handleEvent}
        locale={{ last: "Got it! Start Creating 🚀", skip: "Skip Tour" }}
        options={{
          primaryColor: "#4f46e5",
          backgroundColor: "#0f172a",
          textColor: "#f8fafc",
          arrowColor: "#0f172a",
          overlayColor: "rgba(2, 6, 23, 0.75)",
          showProgress: true,
          skipBeacon: true,
          buttons: ["back", "skip", "primary"],
          zIndex: 100000,
        }}
        styles={{
          tooltip: {
            borderRadius: 20,
            padding: "20px 24px",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          },
          tooltipTitle: {
            fontWeight: 900,
            fontSize: 15,
            letterSpacing: "-0.01em",
            color: "#ffffff",
            marginBottom: 8,
          },
          tooltipContent: {
            fontSize: 13,
            lineHeight: 1.6,
            color: "#cbd5e1",
          },
          buttonPrimary: {
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 12,
            padding: "8px 16px",
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            border: "none",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
          },
          buttonBack: {
            color: "#94a3b8",
            fontSize: 12,
            fontWeight: 700,
            marginRight: 8,
          },
          buttonSkip: {
            color: "#64748b",
            fontSize: 11,
            fontWeight: 700,
          },
        }}
      />

      {/* Quick Tour Replay Button */}
      <button
        type="button"
        onClick={() => setRun(true)}
        className={
          className ||
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/80 shrink-0 whitespace-nowrap"
        }
        title="Replay 3-Step Quick Start Onboarding Tour"
      >
        <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" />
        <span>{buttonLabel}</span>
      </button>
    </>
  );
}
