"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Eraser,
  Pencil,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Sparkles,
  Sliders,
  Move
} from "lucide-react";

interface ArtbookRetouchModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (newImageUrl: string) => void;
  pagePrompt?: string;
}

export default function ArtbookRetouchModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  pagePrompt
}: ArtbookRetouchModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Tool states
  const [tool, setTool] = useState<"eraser" | "pen">("eraser");
  const [brushSize, setBrushSize] = useState<number>(12);
  const [zoom, setZoom] = useState<number>(1);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Initialize canvas with image when opened
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setOriginalImage(img);
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.naturalWidth || 1024;
      canvas.height = img.naturalHeight || 1024;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Save initial snapshot to history
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
      setHistoryIndex(0);
      setZoom(1);
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl]);

  // Helper to push history
  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      if (sliced.length >= 20) sliced.shift(); // keep max 20 history states
      return [...sliced, data];
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 19));
  }, [historyIndex]);

  // Undo
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const prevIndex = historyIndex - 1;
    ctx.putImageData(history[prevIndex], 0, 0);
    setHistoryIndex(prevIndex);
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const nextIndex = historyIndex + 1;
    ctx.putImageData(history[nextIndex], 0, 0);
    setHistoryIndex(nextIndex);
  };

  // Reset
  const handleReset = () => {
    if (!originalImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    pushHistory();
  };

  // Get pointer coordinates mapped to canvas resolution
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Start drawing stroke
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : "#000000";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Draw motion
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    pushHistory();
  };

  // Save cleaned artwork
  const handleSaveCleaned = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cleanedDataUrl = canvas.toDataURL("image/png", 1.0);
    onSave(cleanedDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-150 select-none">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
            <Eraser className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              Coloring Line Retouch &amp; Eraser
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Pixel-Clean
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 truncate max-w-sm">
              {pagePrompt ? `"${pagePrompt}"` : "Erase unwanted AI artifacts, specks or closed line gaps"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition-all cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition-all cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 transition-all cursor-pointer"
            title="Reset to Original Image"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleSaveCleaned}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Cleaned Artwork</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-auto relative cursor-crosshair"
      >
        <div
          className="relative rounded-2xl shadow-2xl bg-white transition-transform duration-100 ease-out"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="block max-h-[72vh] max-w-[80vw] object-contain rounded-xl select-none"
          />
        </div>
      </div>

      {/* Floating Bottom Toolbar */}
      <footer className="h-16 border-t border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between shrink-0">
        {/* Tool Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool("eraser")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              tool === "eraser"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>White Eraser (Wipe AI Specks)</span>
          </button>

          <button
            onClick={() => setTool("pen")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              tool === "pen"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Pencil className="w-4 h-4" />
            <span>Black Line Pen (Close Gaps)</span>
          </button>
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-3 w-64 bg-slate-950/60 p-2 px-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">
            Size: {brushSize}px
          </span>
          <input
            type="range"
            min="2"
            max="48"
            step="2"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setZoom((prev) => Math.max(0.6, prev - 0.2))}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-300 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((prev) => Math.min(3.0, prev + 0.2))}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
