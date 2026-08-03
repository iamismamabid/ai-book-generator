"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Store } from "lucide-react";

interface MarketplaceThumbnailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontImageDataUrl: string | null;
  /** front cover width / height, used to size each preview correctly */
  frontAspect: number;
  isLoading?: boolean;
}

// Approximate, commonly-seen thumbnail heights for book covers across
// marketplace surfaces (search grids, product pages, mobile apps). These are
// round, representative sizes for a legibility gut-check — not scraped or
// guaranteed-exact measurements from any live site.
const PREVIEW_SIZES = [
  { label: "Mobile Search", heightPx: 96 },
  { label: "Search Results", heightPx: 160 },
  { label: "Product Listing", heightPx: 240 },
] as const;

export default function MarketplaceThumbnailPreviewModal({
  isOpen,
  onClose,
  frontImageDataUrl,
  frontAspect,
  isLoading = false,
}: MarketplaceThumbnailPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Store className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-black text-white">Marketplace Thumbnail Preview</h2>
        </div>
        <p className="text-slate-400 text-xs font-semibold mb-6">
          See how your front cover reads at real listing sizes — check that your title stays legible before you publish.
        </p>

        <div className="flex items-center justify-center py-6">
          {isLoading ? (
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          ) : frontImageDataUrl ? (
            <div className="flex items-end justify-center gap-6 flex-wrap">
              {PREVIEW_SIZES.map((size) => (
                <div key={size.label} className="flex flex-col items-center gap-2.5">
                  <div
                    className="bg-white rounded-sm shadow-lg overflow-hidden ring-1 ring-black/10"
                    style={{
                      height: size.heightPx,
                      width: size.heightPx * frontAspect,
                      backgroundImage: `url(${frontImageDataUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="text-center">
                    <p className="text-[10px] font-black text-white uppercase tracking-wider">{size.label}</p>
                    <p className="text-[9px] font-semibold text-slate-500">~{size.heightPx}px tall</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm font-semibold">No cover to preview yet.</p>
          )}
        </div>

        <div className="mt-2 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <p className="text-[11px] font-semibold text-amber-200 leading-relaxed">
            <strong className="text-amber-400">Legibility tip:</strong> at the smallest size your title is the only thing readers actually notice at a glance — keep it bold, high-contrast, and free of thin or decorative fonts that blur together when shrunk down.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
