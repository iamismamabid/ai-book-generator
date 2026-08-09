// Lightweight "Brand Kit" for Cover Studio -- saved colors and fonts reused
// across designs, following the same localStorage-backed pattern as
// coverVersions.ts (no backend/account scoping exists at this layer to key
// a synced version off of).

const STORAGE_KEY = "kdp-cover-brand-kit";
const MAX_COLORS = 24;
const MAX_FONTS = 12;

export interface BrandKit {
  colors: string[];
  fonts: string[];
}

const EMPTY: BrandKit = { colors: [], fonts: [] };

export function loadBrandKit(): BrandKit {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      colors: Array.isArray(parsed.colors) ? parsed.colors : [],
      fonts: Array.isArray(parsed.fonts) ? parsed.fonts : [],
    };
  } catch {
    return EMPTY;
  }
}

function persist(kit: BrandKit): BrandKit {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kit));
  } catch {
    /* quota or unavailable -- silently keep in-memory state only */
  }
  return kit;
}

export function addBrandColor(hex: string): BrandKit {
  const kit = loadBrandKit();
  const normalized = hex.toUpperCase();
  if (kit.colors.includes(normalized)) return kit;
  const colors = [normalized, ...kit.colors].slice(0, MAX_COLORS);
  return persist({ ...kit, colors });
}

export function removeBrandColor(hex: string): BrandKit {
  const kit = loadBrandKit();
  return persist({ ...kit, colors: kit.colors.filter((c) => c !== hex) });
}

export function addBrandFont(fontFamily: string): BrandKit {
  const kit = loadBrandKit();
  if (kit.fonts.includes(fontFamily)) return kit;
  const fonts = [fontFamily, ...kit.fonts].slice(0, MAX_FONTS);
  return persist({ ...kit, fonts });
}

export function removeBrandFont(fontFamily: string): BrandKit {
  const kit = loadBrandKit();
  return persist({ ...kit, fonts: kit.fonts.filter((f) => f !== fontFamily) });
}
