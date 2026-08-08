"use client";

import { useState, useEffect } from "react";
import { Monitor, X } from "lucide-react";

const STORAGE_KEY = "kdp-desktop-recommended-dismissed";

// Canvas/grid-heavy editors (Cover Studio's drag-and-drop canvas, dense
// puzzle grids in Book Builder) are genuinely hard to use precisely on a
// phone screen. This shows once on small screens as a heads-up, not a
// block -- dismissing it anywhere sets the same flag everywhere so it
// doesn't nag across both surfaces.
export default function DesktopRecommendedBanner({ message }: { message: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const alreadyDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setVisible(!alreadyDismissed && window.innerWidth < 768);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="md:hidden flex items-start gap-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 shrink-0">
      <Monitor className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="flex-1 text-xs font-semibold leading-snug">{message}</span>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-amber-600 hover:text-amber-800 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
