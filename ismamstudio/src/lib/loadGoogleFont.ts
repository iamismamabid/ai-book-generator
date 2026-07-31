// Shared helper for on-demand Google Fonts loading outside of the main curated
// stylesheet link built in FabricCoverStudio. Used by FontPicker to load preview
// fonts for whatever search results are currently visible, and to persist any
// non-curated font a user actually picks for the rest of the session.
const loadedFamilies = new Set<string>();

export function loadGoogleFontFamilies(families: string[]): void {
  if (typeof document === "undefined") return;
  const toLoad = families.filter((f) => f && !loadedFamilies.has(f));
  if (toLoad.length === 0) return;
  toLoad.forEach((f) => loadedFamilies.add(f));

  const familyParams = toLoad
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;700`)
    .join("&");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
  document.head.appendChild(link);
}

export function isGoogleFontLoaded(family: string): boolean {
  return loadedFamilies.has(family);
}
