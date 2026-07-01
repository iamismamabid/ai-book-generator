"use client";

import React, { useState, useEffect } from "react";
import { X, Settings2, FileDown, AlertTriangle, Loader2 } from "lucide-react";

interface ExportInteriorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: {
    includeCover: boolean;
    coverState: any;
    includeSolutions: boolean;
    trimSize: "6x9" | "8.5x11" | "5x8";
    hasBleed: boolean;
    showGuides: boolean;
  }) => void | Promise<void>;
  defaultTrimSize?: "6x9" | "8.5x11" | "5x8";
  showSolutionsToggle?: boolean;
}

export default function ExportInteriorModal({
  isOpen,
  onClose,
  onExport,
  defaultTrimSize = "8.5x11",
  showSolutionsToggle = true,
}: ExportInteriorModalProps) {
  const [includeCover, setIncludeCover] = useState(false);
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [trimSize, setTrimSize] = useState<"6x9" | "8.5x11" | "5x8">(defaultTrimSize);
  const [hasBleed, setHasBleed] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [coverState, setCoverState] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load cover state from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("kdp-cover-draft");
      if (saved) {
        try {
          setCoverState(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading cover draft", e);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActionExport = async () => {
    if (includeCover && !coverState) {
      alert("Please design a cover in the Cover Studio first, or uncheck the Cover option.");
      return;
    }
    setIsExporting(true);
    try {
      await onExport({
        includeCover,
        coverState,
        includeSolutions,
        trimSize,
        hasBleed,
        showGuides,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const hasSavedCover = !!coverState;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-650/10 rounded-xl flex items-center justify-center text-indigo-600">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase">Export Book Interior</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configure layouts and covers</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Cover Integration Option */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <label className="text-xs font-black text-slate-800 block cursor-pointer select-none" htmlFor="includeCoverCheck">
                  Include Front & Back Cover
                </label>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Compile designs from Cover Studio</span>
              </div>
              <input
                type="checkbox"
                id="includeCoverCheck"
                checked={includeCover}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>
            
            {includeCover && !hasSavedCover && (
              <div className="flex gap-2 items-center bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-xl text-[10px] font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No saved cover found! Create a cover in the Cover Studio to use this feature.</span>
              </div>
            )}
          </div>

          {/* Trim Size Select */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <label className="text-xs font-black text-slate-800 block mb-2 uppercase">KDP Trim Size</label>
            <select
              value={trimSize}
              onChange={(e) => setTrimSize(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-650"
            >
              <option value="6x9">6″ × 9″ (Standard Novel)</option>
              <option value="8.5x11">8.5″ × 11″ (Large Print / Puzzle Book)</option>
              <option value="5x8">5″ × 8″ (Pocket Booklet)</option>
            </select>
          </div>

          {/* Solution toggle (Conditional) */}
          {showSolutionsToggle && (
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <div>
                <label className="text-xs font-black text-slate-800 block cursor-pointer select-none" htmlFor="includeSolutionsCheck">
                  Include Answer Keys
                </label>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Append solution grids at the end</span>
              </div>
              <input
                type="checkbox"
                id="includeSolutionsCheck"
                checked={includeSolutions}
                onChange={(e) => setIncludeSolutions(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>
          )}

          {/* Layout Checklist Guides & Bleed */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
            <label className="text-xs font-black text-slate-800 block uppercase">KDP Specifications</label>
            
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-650 select-none">
              <input
                type="checkbox"
                checked={hasBleed}
                onChange={(e) => setHasBleed(e.target.checked)}
                className="rounded accent-indigo-650 text-slate-900"
              />
              Bleed (+0.125″ KDP edges)
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-650 select-none">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="rounded accent-indigo-650 text-slate-900"
              />
              Show Safe Margins Guide
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={handleActionExport}
            disabled={isExporting || (includeCover && !hasSavedCover)}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-black hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Compiling Interior...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Export Interior PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
