// Named version snapshots for Book Builder (book outlines).
// Allows users to save named checkpoints ("v1 50 pages", "Final Outline with Solutions")
// that survive browser reloads and can be restored at any time.

const STORAGE_KEY = "kdp-book-versions";
const MAX_VERSIONS = 20;

export interface BookVersion {
  id: string;
  name: string;
  createdAt: number;
  pageCount: number;
  trimSize: string;
  bookPages: any[];
}

export function loadBookVersions(): BookVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(versions: BookVersion[]): { ok: boolean; stored: BookVersion[] } {
  let candidate = [...versions];
  while (candidate.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
      return { ok: true, stored: candidate };
    } catch {
      candidate = candidate.slice(0, -1);
    }
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing more we can do */
  }
  return { ok: false, stored: [] };
}

export function saveBookVersion(
  version: Omit<BookVersion, "id" | "createdAt">
): { versions: BookVersion[]; ok: boolean } {
  const entry: BookVersion = {
    ...version,
    id: `bv-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    createdAt: Date.now(),
  };
  const current = loadBookVersions();
  const next = [entry, ...current].slice(0, MAX_VERSIONS);
  const { stored, ok } = persist(next);
  return { versions: stored, ok };
}

export function deleteBookVersion(id: string): BookVersion[] {
  const current = loadBookVersions();
  const next = current.filter((v) => v.id !== id);
  const { stored } = persist(next);
  return stored;
}
