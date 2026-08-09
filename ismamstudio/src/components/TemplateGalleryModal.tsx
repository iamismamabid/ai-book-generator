"use client";

import { useEffect, useState, useMemo } from "react";
import { X, Loader2, ImageOff } from "lucide-react";
import { COVER_TEMPLATES, CoverTemplate } from "@/lib/coverTemplates";

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CoverTemplate, photoUrl: string | null) => void;
}

interface CachedPhoto {
  thumb: string;
  regular: string;
  cachedAt: number;
}

const CACHE_KEY = "kdp-template-photo-cache";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — Unsplash URLs are long-lived, this just avoids indefinite staleness

function readCache(): Record<string, CachedPhoto> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, CachedPhoto>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable — thumbnails just won't persist across sessions
  }
}

export default function TemplateGalleryModal({ isOpen, onClose, onSelectTemplate }: TemplateGalleryModalProps) {
  const [photos, setPhotos] = useState<Record<string, CachedPhoto | null>>({});
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(COVER_TEMPLATES.map((t) => t.category)))], []);

  useEffect(() => {
    if (!isOpen) return;

    const cache = readCache();
    const now = Date.now();

    COVER_TEMPLATES.forEach((template) => {
      const cached = cache[template.photoQuery];
      if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
        setPhotos((prev) => ({ ...prev, [template.id]: cached }));
        return;
      }

      fetch(`/api/generate/unsplash?query=${encodeURIComponent(template.photoQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          const first = data?.results?.[0];
          if (!first?.urls?.regular) {
            setPhotos((prev) => ({ ...prev, [template.id]: null }));
            return;
          }
          const entry: CachedPhoto = { thumb: first.urls.small, regular: first.urls.regular, cachedAt: now };
          cache[template.photoQuery] = entry;
          writeCache(cache);
          setPhotos((prev) => ({ ...prev, [template.id]: entry }));
        })
        .catch(() => {
          setPhotos((prev) => ({ ...prev, [template.id]: null }));
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const visibleTemplates = activeCategory === "All"
    ? COVER_TEMPLATES
    : COVER_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div
      className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 pt-32"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[calc(100vh-140px)] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">Cover Templates</h2>
            <p className="text-xs text-slate-500 font-semibold">
              {COVER_TEMPLATES.length} genre templates with real photo backgrounds from Unsplash — click one to apply
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-slate-100 flex gap-2 flex-wrap shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide transition cursor-pointer ${
                activeCategory === cat
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleTemplates.map((template) => {
            const photo = photos[template.id];
            return (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template, photo?.regular ?? null)}
                className="group text-left rounded-2xl overflow-hidden border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer"
              >
                <div
                  className="w-full aspect-[3/4] flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: template.swatch }}
                >
                  {photo === undefined && (
                    <Loader2 className="w-6 h-6 text-white/80 animate-spin" />
                  )}
                  {photo === null && (
                    <ImageOff className="w-6 h-6 text-white/60" />
                  )}
                  {photo && (
                    <img
                      src={photo.thumb}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-black leading-tight drop-shadow">
                    {template.name}
                  </span>
                </div>
                <div className="px-2.5 py-1.5 bg-white">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{template.category}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
