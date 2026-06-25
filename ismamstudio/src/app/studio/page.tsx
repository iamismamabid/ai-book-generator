"use client";

import { useState, useEffect } from "react";
import { Grid3x3, Palette, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamic imports — both components use browser-only APIs (canvas, localStorage)
const FabricCoverStudio = dynamic(() => import("@/components/FabricCoverStudio"), { ssr: false });
const BookBuilder = dynamic(() => import("@/components/BookBuilder"), { ssr: false });

const TRIM_SIZES = [
  { label: '6" x 9" (Novel)', w: 6, h: 9 },
  { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
  { label: '5.5" x 8.5" (Compact)', w: 5.5, h: 8.5 }
];

export default function MasterStudioApp() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const [activeTab, setActiveTab] = useState<'interior' | 'cover'>('interior');
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [pageCount, setPageCount] = useState(100);

  const [backCoverColor, setBackCoverColor] = useState('#0F172A');
  const [backCoverType, setBackCoverType] = useState<'solid' | 'gradient'>('solid');
  const [backCoverGradientStart, setBackCoverGradientStart] = useState('#0F172A');
  const [backCoverGradientEnd, setBackCoverGradientEnd] = useState('#020617');

  const [frontCoverColor, setFrontCoverColor] = useState('#1E293B');
  const [frontCoverType, setFrontCoverType] = useState<'solid' | 'gradient'>('solid');
  const [frontCoverGradientStart, setFrontCoverGradientStart] = useState('#1E293B');
  const [frontCoverGradientEnd, setFrontCoverGradientEnd] = useState('#0F172A');

  const [coverElements, setCoverElements] = useState<any[]>([]);
  const [showKdpGuides, setShowKdpGuides] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Cover Math
  const spineWidth = pageCount * 0.002252;

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600 bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900 flex flex-col overflow-hidden">

      {/* APP HEADER */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center max-w-[1600px] mx-auto w-full gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">AI</div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">KDP Master Studio</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Premium Cover & Interior Creator</p>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex bg-slate-200/80 p-1 rounded-full shadow-inner border border-slate-300/40">
          <button
            onClick={() => setActiveTab('interior')}
            className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'interior' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-slate-300/50'
            }`}
          >
            <Grid3x3 className="w-4 h-4"/> Book Builder
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'cover' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-slate-300/50'
            }`}
          >
            <Palette className="w-4 h-4"/> Cover Studio
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-[1600px] w-full mx-auto">

        {/* ================= 1. INTERIOR COMPONENT ================= */}
        {activeTab === 'interior' && (
          <div className="animate-in fade-in duration-300 w-full h-full">
            <BookBuilder
              coverState={{
                coverElements,
                frontCoverColor,
                backCoverColor,
                frontCoverType,
                backCoverType,
                frontCoverGradientStart,
                frontCoverGradientEnd,
                backCoverGradientStart,
                backCoverGradientEnd,
                spineWidth,
                trimSize
              }}
            />
          </div>
        )}

        {/* ================= 2. COVER STUDIO COMPONENT ================= */}
        {activeTab === 'cover' && (
          <div className="flex h-[calc(100vh-140px)] rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm animate-in fade-in duration-500">
            <FabricCoverStudio
              trimSize={trimSize}
              setTrimSize={setTrimSize}
              pageCount={pageCount}
              setPageCount={setPageCount}

              backCoverColor={backCoverColor}
              setBackCoverColor={setBackCoverColor}
              backCoverType={backCoverType}
              setBackCoverType={setBackCoverType}
              backCoverGradientStart={backCoverGradientStart}
              setBackCoverGradientStart={setBackCoverGradientStart}
              backCoverGradientEnd={backCoverGradientEnd}
              setBackCoverGradientEnd={setBackCoverGradientEnd}

              frontCoverColor={frontCoverColor}
              setFrontCoverColor={setFrontCoverColor}
              frontCoverType={frontCoverType}
              setFrontCoverType={setFrontCoverType}
              frontCoverGradientStart={frontCoverGradientStart}
              setFrontCoverGradientStart={setFrontCoverGradientStart}
              frontCoverGradientEnd={frontCoverGradientEnd}
              setFrontCoverGradientEnd={setFrontCoverGradientEnd}

              showKdpGuides={showKdpGuides}
              setShowKdpGuides={setShowKdpGuides}
              snapToGrid={snapToGrid}
              setSnapToGrid={setSnapToGrid}
              initialElements={coverElements}
              onSaveWorkspace={(elements) => {
                setCoverElements(elements);
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
}