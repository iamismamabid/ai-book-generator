"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { Search, ExternalLink, Info, Loader2, ImageIcon } from "lucide-react";

interface UnsplashPhoto {
  id: string;
  alt_description: string | null;
  urls: { small: string; regular: string; full: string };
  links: { html: string };
  user: { name: string; links: { html: string } };
}

const QUICK_SEARCHES = ["book cover", "nature", "abstract background", "vintage paper", "watercolor", "minimal texture", "night sky", "flowers"];

export default function StockImages() {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const search = async (q: string) => {
    const term = q.trim();
    if (!term) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/generate/unsplash?query=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setPhotos(data.results || []);
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed — please try again.");
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: "Do I need to credit the photographer?",
      a: "No — Unsplash's license allows free commercial use without attribution required, though crediting photographers is appreciated.",
    },
    {
      q: "Can I use these on a book cover I'll sell on Amazon?",
      a: "Yes, for most photos — just avoid images featuring identifiable people or visible trademarks/logos unless you have a release, since those can create separate legal issues regardless of the image license.",
    },
    {
      q: "Where do I get the full-resolution file?",
      a: "Click 'Open' on any photo to view and download it at full resolution directly from its Unsplash page.",
    },
  ];

  return (
    <ToolShell
      title="Free Stock"
      highlight="Images"
      subtitle="Search millions of royalty-free photos for your book covers and marketing materials, powered by Unsplash."
      maxWidth="max-w-7xl"
      faqs={faqs}
    >
      <div className="space-y-8">
        {/* Search bar */}
        <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-8 space-y-4 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              search(query);
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search photos… e.g. mountain sunset, coffee, old books"
              className="flex-1 bg-slate-950 border border-slate-900 text-white rounded-xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  search(q);
                }}
                className="px-3 py-1.5 rounded-full bg-slate-950/60 border border-slate-900 text-slate-400 hover:text-white hover:border-indigo-500 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-5 text-sm font-bold text-rose-300">
            {error}
          </div>
        )}

        {/* Results */}
        {photos.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((p) => (
              <div key={p.id} className="break-inside-avoid bg-slate-900/35 border border-slate-900 rounded-2xl overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.urls.small}
                  alt={p.alt_description || "Stock photo"}
                  className="w-full h-auto group-hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
                <div className="p-3 flex items-center justify-between gap-2">
                  <a
                    href={p.user.links.html + "?utm_source=kdpage&utm_medium=referral"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-300 truncate"
                  >
                    {p.user.name}
                  </a>
                  <a
                    href={p.links.html + "?utm_source=kdpage&utm_medium=referral"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          searched &&
          !loading &&
          !error && (
            <div className="bg-slate-900/35 border border-slate-900 rounded-[2rem] p-12 text-center">
              <ImageIcon className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">No photos found — try a broader search term.</p>
            </div>
          )
        )}

        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
            Photos are provided by Unsplash under the Unsplash License — free for commercial use
            without attribution required (though crediting photographers is appreciated). Download
            the full-resolution file from the photo&apos;s Unsplash page. For book covers, verify
            the photo doesn&apos;t feature identifiable people or trademarks without releases.
          </p>
        </div>
      </div>
    </ToolShell>
  );
}
