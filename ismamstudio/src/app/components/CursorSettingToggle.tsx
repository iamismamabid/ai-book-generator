"use client";

import React, { useState, useEffect } from "react";
import { MousePointer2 } from "lucide-react";

export default function CursorSettingToggle() {
  // Mirrors GlowSettingToggle's localStorage + CustomEvent pattern, but
  // inverted default: the stylish circle cursor is KDPage's existing default
  // look, so "standard" only turns on when a user explicitly opts in.
  const [standard, setStandard] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kdpageStandardCursor");
      setStandard(saved === "true");
    }
  }, []);

  const handleToggle = () => {
    const nextState = !standard;
    setStandard(nextState);
    localStorage.setItem("kdpageStandardCursor", nextState ? "true" : "false");
    window.dispatchEvent(
      new CustomEvent("kdpageCursorToggle", { detail: { standard: nextState } })
    );
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
        standard
          ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm"
          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
      }`}
      title="Switch between KDPage's stylish cursor and your standard OS cursor (Default: KDPage Style)"
    >
      <MousePointer2 className={`w-3.5 h-3.5 ${standard ? "text-indigo-400" : "text-slate-500"}`} />
      <span>Cursor: <strong className={standard ? "text-indigo-400" : "text-slate-500"}>{standard ? "Standard" : "KDPage Style"}</strong></span>
    </button>
  );
}
