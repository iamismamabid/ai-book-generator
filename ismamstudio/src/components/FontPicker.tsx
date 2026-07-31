"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check, ChevronDown } from "lucide-react";
import { GOOGLE_FONTS_CATALOG } from "@/lib/googleFontsCatalog";
import { loadGoogleFontFamilies } from "@/lib/loadGoogleFont";

interface FontPickerProps {
  value: string;
  onChange: (family: string) => void;
  /** The existing small curated list, shown grouped when the search box is empty */
  curatedCategories: { category: string; fonts: string[] }[];
}

const MAX_RESULTS = 60;

// Searchable Google Fonts picker: the curated ~66-font list still shows first
// (already preloaded app-wide, so it previews instantly), but typing anything
// searches the full ~1,350-font Latin-script catalog and loads previews for
// only the handful of rows actually on screen — never the whole catalog.
export default function FontPicker({ value, onChange, curatedCategories }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const starts: string[] = [];
    const contains: string[] = [];
    for (const entry of GOOGLE_FONTS_CATALOG) {
      const lower = entry.family.toLowerCase();
      if (lower.startsWith(q)) starts.push(entry.family);
      else if (lower.includes(q)) contains.push(entry.family);
      if (starts.length + contains.length >= MAX_RESULTS * 3) break;
    }
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [query]);

  // Load real-font previews for whatever is currently visible, debounced so
  // fast typing doesn't fire a network request per keystroke.
  useEffect(() => {
    if (searchResults.length === 0) return;
    const t = setTimeout(() => loadGoogleFontFamilies(searchResults), 250);
    return () => clearTimeout(t);
  }, [searchResults]);

  const handleSelect = (family: string) => {
    loadGoogleFontFamilies([family]);
    onChange(family);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="w-full flex items-center justify-between gap-2 text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-sans cursor-pointer"
      >
        <span style={{ fontFamily: value }} className="truncate">{value}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 p-2 border-b border-slate-100">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${GOOGLE_FONTS_CATALOG.length.toLocaleString()}+ fonts...`}
              className="w-full text-xs font-semibold outline-none font-sans"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {query.trim() === "" ? (
              curatedCategories.map(({ category, fonts }) => (
                <div key={category}>
                  <div className="px-3 pt-2 pb-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                    {category}
                  </div>
                  {fonts.map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => handleSelect(font)}
                      style={{ fontFamily: font }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-slate-50 cursor-pointer ${
                        font === value ? "bg-indigo-50 text-indigo-700" : "text-slate-700"
                      }`}
                    >
                      <span className="truncate">{font}</span>
                      {font === value && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              ))
            ) : searchResults.length > 0 ? (
              searchResults.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => handleSelect(font)}
                  style={{ fontFamily: font }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-slate-50 cursor-pointer ${
                    font === value ? "bg-indigo-50 text-indigo-700" : "text-slate-700"
                  }`}
                >
                  <span className="truncate">{font}</span>
                  {font === value && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-xs font-semibold text-slate-400 text-center">
                No fonts match &ldquo;{query}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
