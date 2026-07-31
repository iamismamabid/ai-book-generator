// Named version snapshots for Cover Studio. Undo/redo already covers
// step-by-step changes within a session; this covers the other need — keeping
// named checkpoints ("v1 red cover", "client feedback round 2") that survive a
// reload and can be restored in any order.

const STORAGE_KEY = "kdp-cover-versions";
const MAX_VERSIONS = 20;

export interface CoverVersion {
  id: string;
  name: string;
  createdAt: number;
  pageCount: number;
  trimSize: { label: string; w: number; h: number };
  background: any;
  canvasJson: any;
}

export function loadVersions(): CoverVersion[] {
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

// Snapshots include the full canvas JSON, so a design with an uploaded
// background photo can be large. Rather than failing the save outright, drop
// the oldest snapshots until the write fits.
function persist(versions: CoverVersion[]): { ok: boolean; stored: CoverVersion[] } {
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

export function saveVersion(
  version: Omit<CoverVersion, "id" | "createdAt">
): { versions: CoverVersion[]; ok: boolean } {
  const entry: CoverVersion = {
    ...version,
    id: `v-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    createdAt: Date.now(),
  };
  // Newest first, oldest evicted once the cap is hit.
  const next = [entry, ...loadVersions()].slice(0, MAX_VERSIONS);
  const { ok, stored } = persist(next);
  return { versions: stored, ok };
}

export function deleteVersion(id: string): CoverVersion[] {
  const next = loadVersions().filter((v) => v.id !== id);
  return persist(next).stored;
}

export function renameVersion(id: string, name: string): CoverVersion[] {
  const next = loadVersions().map((v) => (v.id === id ? { ...v, name } : v));
  return persist(next).stored;
}
