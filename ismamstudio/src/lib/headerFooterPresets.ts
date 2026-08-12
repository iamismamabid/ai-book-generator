// LocalStorage-backed Header/Footer Presets Manager for KDPage Studio

export interface HeaderFooterPreset {
  id: string;
  name: string;
  headerText: string;
  footerText: string;
  showPageNumbers: boolean;
  pageNumberPrefix: string;
  fontFamily: "sans-serif" | "serif" | "monospace";
}

const STORAGE_KEY = "kdpage-studio-header-footer-presets";

const DEFAULT_PRESETS: HeaderFooterPreset[] = [
  {
    id: "default-1",
    name: "Classic Book Header & Footer",
    headerText: "DAILY PUZZLE CHALLENGE",
    footerText: "Published by KDPage Studio • All Rights Reserved",
    showPageNumbers: true,
    pageNumberPrefix: "Page",
    fontFamily: "sans-serif",
  },
  {
    id: "default-2",
    name: "Minimalist Brand Header",
    headerText: "PUZZLE STUDIO COLLECTION",
    footerText: "Commercial License Verified",
    showPageNumbers: true,
    pageNumberPrefix: "",
    fontFamily: "serif",
  },
];

export function loadHeaderFooterPresets(): HeaderFooterPreset[] {
  if (typeof window === "undefined") return DEFAULT_PRESETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRESETS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRESETS;
  } catch {
    return DEFAULT_PRESETS;
  }
}

export function saveHeaderFooterPreset(
  preset: Omit<HeaderFooterPreset, "id">
): HeaderFooterPreset[] {
  const presets = loadHeaderFooterPresets();
  const newPreset: HeaderFooterPreset = {
    ...preset,
    id: "preset-" + Date.now(),
  };
  const updated = [newPreset, ...presets];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* quota fallback */
  }
  return updated;
}

export function deleteHeaderFooterPreset(id: string): HeaderFooterPreset[] {
  const presets = loadHeaderFooterPresets();
  const updated = presets.filter((p) => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* quota fallback */
  }
  return updated;
}
