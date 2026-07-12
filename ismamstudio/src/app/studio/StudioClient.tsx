"use client";

import { useState, useEffect } from "react";
import { Grid3x3, Palette, Loader2, Sparkles, Lock } from "lucide-react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { checkPremiumStatus } from "../actions";

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
  const [activeTab, setActiveTab] = useState<'interior' | 'cover'>('interior');
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "cover" || tab === "interior") {
        setActiveTab(tab);
      }
    }
  }, []);

  useEffect(() => {
    async function loadPremium() {
      try {
        const res = await checkPremiumStatus();
        setPremiumStatus(res as any);
      } catch (err) {
        console.error(err);
      }
    }
    loadPremium();
  }, []);
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [pageCount, setPageCount] = useState(100);

  const [coverBackground, setCoverBackground] = useState({
    backCoverColor: '#0F172A',
    backCoverType: 'solid' as 'solid' | 'gradient',
    backCoverGradientStart: '#0F172A',
    backCoverGradientEnd: '#020617',
    frontCoverColor: '#1E293B',
    frontCoverType: 'solid' as 'solid' | 'gradient',
    frontCoverGradientStart: '#1E293B',
    frontCoverGradientEnd: '#0F172A',
    backCoverImage: '',
    frontCoverImage: '',
    fullCoverImage: ''
  });

  const [coverElements, setCoverElements] = useState<any[]>([]);
  const [showKdpGuides, setShowKdpGuides] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Cover Math
  const spineWidth = pageCount * 0.002252;

  // Load Cover draft on mount
  useEffect(() => {
    const savedCover = localStorage.getItem("kdp-cover-draft");
    if (savedCover) {
      try {
        const data = JSON.parse(savedCover);
        const loadedBg = {
          backCoverColor: data.backCoverColor ?? '#0F172A',
          backCoverType: data.backCoverType ?? 'solid',
          backCoverGradientStart: data.backCoverGradientStart ?? '#0F172A',
          backCoverGradientEnd: data.backCoverGradientEnd ?? '#020617',
          frontCoverColor: data.frontCoverColor ?? '#1E293B',
          frontCoverType: data.frontCoverType ?? 'solid',
          frontCoverGradientStart: data.frontCoverGradientStart ?? '#1E293B',
          frontCoverGradientEnd: data.frontCoverGradientEnd ?? '#0F172A',
          backCoverImage: data.backCoverImage ?? '',
          frontCoverImage: data.frontCoverImage ?? '',
          fullCoverImage: data.fullCoverImage ?? ''
        };
        setCoverBackground(loadedBg);
        if (data.coverElements) setCoverElements(data.coverElements);
        if (data.pageCount) setPageCount(data.pageCount);
        if (data.trimSize) {
          const match = TRIM_SIZES.find(t => t.label === data.trimSize.label);
          if (match) setTrimSize(match);
        }
      } catch (e) {
        console.error("Failed to parse cover draft", e);
      }
    }
  }, []);

  // Save Cover draft on change
  useEffect(() => {
    if (!isMounted) return;
    const data = {
      ...coverBackground,
      coverElements,
      pageCount,
      trimSize
    };
    localStorage.setItem("kdp-cover-draft", JSON.stringify(data));
  }, [
    isMounted,
    coverBackground,
    coverElements,
    pageCount,
    trimSize
  ]);

  if (!isMounted) {

    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-500 bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden relative">
      
      {/* 🌌 Background ambient gradient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* APP HEADER */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center max-w-[1600px] mx-auto w-full gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-slate-200 dark:to-indigo-400">
              KDP Master Studio
            </h1>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest">
              Premium Cover & Interior Creator
            </p>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex bg-slate-200/60 dark:bg-slate-900/60 p-1.5 rounded-full shadow-inner border border-slate-300/30 dark:border-slate-800/30 backdrop-blur-md relative">
          <button
            onClick={() => setActiveTab('interior')}
            className={`relative px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-colors duration-300 flex items-center gap-2 z-10 ${
              activeTab === 'interior' ? 'text-slate-950 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === 'interior' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-md -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Grid3x3 className="w-4 h-4"/> Book Builder
          </button>
          
          <button
            onClick={() => setActiveTab('cover')}
            className={`relative px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-colors duration-300 flex items-center gap-2 z-10 ${
              activeTab === 'cover' ? 'text-slate-950 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === 'cover' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-md -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Palette className="w-4 h-4"/> Cover Studio
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'interior' ? (
            <motion.div
              key="interior"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <BookBuilder
                coverState={{
                  coverElements,
                  spineWidth,
                  trimSize,
                  ...coverBackground
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="cover"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex h-[calc(100vh-140px)] rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden bg-white dark:bg-slate-900 shadow-xl"
            >
              {premiumStatus.checked && (premiumStatus.plan === "free" || premiumStatus.plan === "starter") ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0b0f19] text-white w-full h-full relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  <div className="max-w-md w-full bg-slate-900/60 border border-slate-850 p-8 rounded-[2.5rem] shadow-2xl relative z-10 space-y-6">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 mx-auto">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight">
                        Cover Studio is Locked
                      </h2>
                      <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                        Designing high-converting book covers (front, spine, and back cover canvas) is a premium feature available on our **Pro Studio** and **Publisher Agency** plans.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <Link 
                        href="/pricing"
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-650 hover:to-purple-750 text-white font-black text-xs rounded-xl shadow-lg transition-all"
                      >
                        Upgrade to Pro Studio
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <FabricCoverStudio
                  trimSize={trimSize}
                  setTrimSize={setTrimSize}
                  pageCount={pageCount}
                  setPageCount={setPageCount}
                  coverBackground={coverBackground}
                  setCoverBackground={setCoverBackground}
                  showKdpGuides={showKdpGuides}
                  setShowKdpGuides={setShowKdpGuides}
                  snapToGrid={snapToGrid}
                  setSnapToGrid={setSnapToGrid}
                  initialElements={coverElements}
                  onSaveWorkspace={(elements) => {
                    setCoverElements(elements);
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}