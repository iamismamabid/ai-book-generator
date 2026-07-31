"use client";

import { useRef, useState } from "react";
import { X, Download, Loader2, Box } from "lucide-react";

interface CoverMockup3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontImageDataUrl: string | null;
  spineImageDataUrl: string | null;
  /** front cover width / height, used to size the mockup box */
  frontAspect: number;
  /** spine width in inches, used to size the mockup's 3D depth proportionally */
  spineWidthInches: number;
  /** front cover width in inches, for the same depth-proportion calculation */
  frontWidthInches: number;
  isLoading?: boolean;
}

// A lightweight, dependency-free CSS-3D book mockup: two faces (front cover +
// spine) hinged at their shared edge with rotateY(), plus a thin "page
// block" sliver on the trailing edge for realism. No WebGL/Three.js needed —
// this is the same technique classic CSS "3D flip book" demos use.
export default function CoverMockup3DModal({
  isOpen,
  onClose,
  frontImageDataUrl,
  spineImageDataUrl,
  frontAspect,
  spineWidthInches,
  frontWidthInches,
  isLoading = false,
}: CoverMockup3DModalProps) {
  const mockupRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [rotation, setRotation] = useState(-26);

  if (!isOpen) return null;

  const displayHeight = 380;
  const displayWidth = displayHeight * frontAspect;
  // Depth is proportional to real spine width, clamped to a range that still
  // reads clearly as "thin chapbook" vs "thick paperback" at this display size.
  const rawDepth = (spineWidthInches / frontWidthInches) * displayWidth;
  const depth = Math.max(6, Math.min(70, rawDepth));

  const handleDownload = async () => {
    if (!mockupRef.current) return;
    setIsDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(mockupRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "book-3d-mockup.png";
      a.click();
    } catch (err) {
      console.error("Failed to export 3D mockup:", err);
      alert("Couldn't export the mockup image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Box className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-black text-white">3D Book Mockup Preview</h2>
        </div>
        <p className="text-slate-400 text-xs font-semibold mb-6">
          A realistic angled preview of your cover — download it for Etsy, Amazon A+ content, or social media.
        </p>

        <div className="flex items-center justify-center py-8" style={{ perspective: "1400px" }}>
          {isLoading ? (
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          ) : frontImageDataUrl ? (
            <div ref={mockupRef} className="p-10">
              <div
                className="relative transition-transform duration-500 ease-out"
                style={{
                  width: displayWidth,
                  height: displayHeight,
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${rotation}deg)`,
                }}
              >
                {/* Spine face — hinged at the front cover's left edge */}
                {spineImageDataUrl && (
                  <div
                    className="absolute top-0"
                    style={{
                      left: -depth,
                      width: depth,
                      height: displayHeight,
                      backgroundImage: `url(${spineImageDataUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      transformOrigin: "right center",
                      transform: "rotateY(90deg)",
                      boxShadow: "inset 6px 0 12px rgba(0,0,0,0.35)",
                    }}
                  />
                )}

                {/* Page block sliver — hinged at the front cover's right edge */}
                <div
                  className="absolute top-1 right-0"
                  style={{
                    right: -8,
                    width: 8,
                    height: displayHeight - 8,
                    transformOrigin: "left center",
                    transform: "rotateY(-90deg)",
                    background:
                      "repeating-linear-gradient(to bottom, #f8fafc 0px, #f8fafc 2px, #e2e8f0 2px, #e2e8f0 3px)",
                  }}
                />

                {/* Front cover face */}
                <div
                  className="absolute inset-0 rounded-r-sm"
                  style={{
                    backgroundImage: `url(${frontImageDataUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6), inset -8px 0 16px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm font-semibold">No cover to preview yet.</p>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <input
            type="range"
            min={-60}
            max={0}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider w-16 text-right">Rotate</span>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading || !frontImageDataUrl}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isDownloading ? "Exporting..." : "Download Mockup Image"}
        </button>
      </div>
    </div>
  );
}
