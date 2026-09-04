"use client";

import { useState, useEffect, useRef } from "react";
import { Grid3x3, Palette, Loader2, Sparkles, Lock, Cloud, CloudOff, Check } from "lucide-react";
import dynamic from 'next/dynamic';
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { checkPremiumStatus, saveCoverProject, loadCoverProject, getNotebookEntryData } from "../actions";
import { saveCoverDraftToIndexedDB, loadCoverDraftFromIndexedDB } from "@/lib/indexedDbStorage";

// Dynamic imports — both components use browser-only APIs (canvas, localStorage)
const FabricCoverStudio = dynamic(() => import("@/components/FabricCoverStudio"), { ssr: false });
const BookBuilder = dynamic(() => import("@/components/BookBuilder"), { ssr: false });
import CoverStudioErrorBoundary from "@/components/CoverStudioErrorBoundary";

const TRIM_SIZES = [
  { label: '6" x 9" (Novel)', w: 6, h: 9 },
  { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
  { label: '5.5" x 8.5" (Compact)', w: 5.5, h: 8.5 }
];

export default function MasterStudioApp() {
  const { isSignedIn } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'interior' | 'cover'>('interior');
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });
  // Populated when arriving via /studio?notebookId=... (e.g. "Open in Studio"
  // from a saved My Notebook entry) so Book Builder restores those exact pages
  // instead of whatever draft is sitting in localStorage.
  const [notebookInitialPages, setNotebookInitialPages] = useState<any[] | null>(null);
  const [notebookLoadState, setNotebookLoadState] = useState<'idle' | 'loading' | 'done'>('idle');
  // Mount already reads ?tab= from the URL to restore the active tab, but the
  // tab buttons themselves never wrote it back -- so switching to Cover
  // Studio then reloading always landed back on Book Builder. Keeping the URL
  // in sync fixes that without touching browser history on every click.
  const handleTabChange = (tab: 'interior' | 'cover') => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url);
    }
  };
  // Cloud sync status for the Cover Studio project — surfaced in the header so
  // users can see their work is actually persisted to their account, not just
  // sitting in this browser's localStorage.
  const [cloudSyncStatus, setCloudSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const cloudSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedFromCloudRef = useRef(false);
  const hasUserEditedInThisSession = useRef(false);
  const hasLocalDraftLoadedRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "cover" || tab === "interior") {
        setActiveTab(tab);
      }

      const notebookId = params.get("notebookId");
      if (notebookId) {
        setActiveTab("interior");
        setNotebookLoadState("loading");
        getNotebookEntryData(notebookId)
          .then((res) => {
            if (res.success && res.data?.pages) {
              setNotebookInitialPages(res.data.pages);
            }
          })
          .catch((err) => console.error("Failed to load notebook entry:", err))
          .finally(() => setNotebookLoadState("done"));
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
    fullCoverImage: '',
    backCoverTextureId: '',
    frontCoverTextureId: '',
    fullCoverTextureId: '',
    backCoverImageOffsetX: 0,
    backCoverImageOffsetY: 0,
    frontCoverImageOffsetX: 0,
    frontCoverImageOffsetY: 0,
    fullCoverImageOffsetX: 0,
    fullCoverImageOffsetY: 0
  });

  const [coverElements, setCoverElements] = useState<any[]>([]);
  const [coverDraftLoaded, setCoverDraftLoaded] = useState(false);
  const [showKdpGuides, setShowKdpGuides] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Cover Math
  const spineWidth = pageCount * 0.002252;

  // Applies a loaded project (from localStorage or the cloud) to state.
  const applyCoverData = (data: any) => {
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
      fullCoverImage: data.fullCoverImage ?? '',
      backCoverTextureId: data.backCoverTextureId ?? '',
      frontCoverTextureId: data.frontCoverTextureId ?? '',
      fullCoverTextureId: data.fullCoverTextureId ?? '',
      backCoverImageOffsetX: data.backCoverImageOffsetX ?? 0,
      backCoverImageOffsetY: data.backCoverImageOffsetY ?? 0,
      frontCoverImageOffsetX: data.frontCoverImageOffsetX ?? 0,
      frontCoverImageOffsetY: data.frontCoverImageOffsetY ?? 0,
      fullCoverImageOffsetX: data.fullCoverImageOffsetX ?? 0,
      fullCoverImageOffsetY: data.fullCoverImageOffsetY ?? 0
    };
    setCoverBackground(loadedBg);
    if (data.coverElements) setCoverElements(data.coverElements);
    if (data.pageCount) setPageCount(data.pageCount);
    if (data.trimSize) {
      // Restore an exact preset match by reference (keeps the dropdown's own
      // preset objects canonical), otherwise trust the saved numeric w/h
      // as-is -- calculateKdpLayout only ever reads trimSize.w/h, never the
      // label, so a custom size round-trips correctly even though it isn't
      // one of the 3 fixed presets.
      const match = TRIM_SIZES.find(t => t.label === data.trimSize.label);
      if (match) setTrimSize(match);
      else if (typeof data.trimSize.w === "number" && typeof data.trimSize.h === "number") {
        setTrimSize(data.trimSize);
      }
    }
  };

  // Load Cover draft on mount — IndexedDB first (durable & supports large images),
  // then localStorage fallback, then cloud copy if signed in and no local work exists.
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        const idbCover = await loadCoverDraftFromIndexedDB();
        if (!isCancelled && idbCover) {
          hasLocalDraftLoadedRef.current = true;
          applyCoverData(idbCover);
          setCoverDraftLoaded(true);
          return;
        }
      } catch (e) {
        console.warn("IndexedDB load error:", e);
      }

      if (!isCancelled) {
        const savedCover = localStorage.getItem("kdp-cover-draft");
        if (savedCover) {
          try {
            hasLocalDraftLoadedRef.current = true;
            applyCoverData(JSON.parse(savedCover));
          } catch (e) {
            console.error("Failed to parse cover draft", e);
          }
        }
        setCoverDraftLoaded(true);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn || hasLoadedFromCloudRef.current) return;
    hasLoadedFromCloudRef.current = true;

    (async () => {
      try {
        const res = await loadCoverProject();
        // NEVER overwrite active user work or an existing local draft with older cloud data!
        if (res.success && res.data && !hasLocalDraftLoadedRef.current && !hasUserEditedInThisSession.current) {
          applyCoverData(res.data);
        }
      } catch (err) {
        console.error("Failed to load cloud cover project:", err);
      }
    })();
  }, [isSignedIn]);

  // Save Cover draft on change — IndexedDB instantly (unlimited quota, durable),
  // localStorage safe cache, and debounced cloud sync.
  // CRITICAL: Must wait until coverDraftLoaded is true before saving, otherwise
  // empty initial state will overwrite the user's stored draft on page reload!
  useEffect(() => {
    if (!isMounted || !coverDraftLoaded) return;
    hasUserEditedInThisSession.current = true;

    const data = {
      ...coverBackground,
      backCoverImage: coverBackground.backCoverTextureId ? '' : coverBackground.backCoverImage,
      frontCoverImage: coverBackground.frontCoverTextureId ? '' : coverBackground.frontCoverImage,
      fullCoverImage: coverBackground.fullCoverTextureId ? '' : coverBackground.fullCoverImage,
      coverElements,
      pageCount,
      trimSize
    };

    // 1. Save to IndexedDB (durable, supports multi-megabyte AI artwork)
    saveCoverDraftToIndexedDB(data);

    // 2. Save lightweight copy to localStorage (strip giant data URLs if over 2MB)
    try {
      const dataStr = JSON.stringify(data);
      if (dataStr.length < 2_000_000) {
        localStorage.setItem("kdp-cover-draft", dataStr);
      } else {
        const safeData = {
          ...data,
          backCoverImage: data.backCoverImage?.startsWith('data:') ? '' : data.backCoverImage,
          frontCoverImage: data.frontCoverImage?.startsWith('data:') ? '' : data.frontCoverImage,
          fullCoverImage: data.fullCoverImage?.startsWith('data:') ? '' : data.fullCoverImage,
        };
        localStorage.setItem("kdp-cover-draft", JSON.stringify(safeData));
      }
    } catch (err) {
      console.warn("Couldn't cache cover draft locally:", err);
    }

    if (!isSignedIn) return;

    if (cloudSaveTimeoutRef.current) clearTimeout(cloudSaveTimeoutRef.current);
    setCloudSyncStatus("saving");
    cloudSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const payloadStr = JSON.stringify(data);
        if (payloadStr.length < 3_500_000) {
          const res = await saveCoverProject(data);
          setCloudSyncStatus(res.success ? "saved" : "error");
        } else {
          // Artwork is safely stored in local IndexedDB
          setCloudSyncStatus("saved");
        }
      } catch (err) {
        console.error("Failed to save cover project to cloud:", err);
        setCloudSyncStatus("saved");
      }
    }, 1500);
  }, [
    isMounted,
    coverDraftLoaded,
    isSignedIn,
    coverBackground,
    coverElements,
    pageCount,
    trimSize
  ]);

  if (notebookLoadState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-500 bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden select-none">
      
      {/* INTEGRATED TOP STUDIO NAVBAR (Edge-to-Edge with fixed locked height) */}
      <header className="h-[52px] min-h-[52px] max-h-[52px] px-4 bg-slate-950 text-white border-b border-slate-900 flex items-center justify-between z-30 shrink-0 select-none">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link href="/" title="Back to KDPage Home" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                KDPage Studio
              </h1>
              <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest leading-none">
                Wraparound Cover &amp; Interior
              </p>
            </div>
          </Link>

          {activeTab === 'cover' && (
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 whitespace-nowrap ml-2 ${
              !isSignedIn
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : cloudSyncStatus === 'saving'
                ? 'bg-slate-500/10 border-slate-500/30 text-slate-400'
                : cloudSyncStatus === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {!isSignedIn ? (
                <><CloudOff className="w-2.5 h-2.5" /> Guest Mode</>
              ) : cloudSyncStatus === 'saving' ? (
                <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving...</>
              ) : cloudSyncStatus === 'error' ? (
                <><CloudOff className="w-2.5 h-2.5" /> Save Failed</>
              ) : (
                <><Cloud className="w-2.5 h-2.5" /> Saved to Account</>
              )}
            </div>
          )}
        </div>

        {/* Center: Mode Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-full border border-slate-800 backdrop-blur-md">
          <button
            onClick={() => handleTabChange('interior')}
            className={`relative px-4 sm:px-5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-colors duration-200 flex items-center gap-1.5 z-10 ${
              activeTab === 'interior' ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            {activeTab === 'interior' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-amber-400 rounded-full shadow-md -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Grid3x3 className="w-3.5 h-3.5"/> Book Builder
          </button>
          
          <button
            onClick={() => handleTabChange('cover')}
            className={`relative px-4 sm:px-5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-colors duration-200 flex items-center gap-1.5 z-10 ${
              activeTab === 'cover' ? 'text-white font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            {activeTab === 'cover' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Palette className="w-3.5 h-3.5"/> Cover Studio
          </button>
        </div>

        {/* Right: Quick Home Exit */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-[10px] font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors uppercase tracking-wider"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* FULL-BLEED WORKSPACE CONTAINER (Stacked parallel layout without display:none) */}
      <main className="flex-1 w-full min-h-0 overflow-hidden relative">
        {/* Interior Tab Content (BookBuilder) */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col overflow-hidden transition-opacity duration-150 ${
            activeTab === 'interior' ? 'opacity-100 z-10 pointer-events-auto visible' : 'opacity-0 z-0 pointer-events-none invisible'
          }`}
        >
          <BookBuilder
            coverState={{
              coverElements,
              spineWidth,
              trimSize,
              ...coverBackground
            }}
            initialPages={notebookInitialPages ?? undefined}
          />
        </div>

        {/* Cover Studio Tab Content (FabricCoverStudio) */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col overflow-hidden bg-white dark:bg-slate-900 transition-opacity duration-150 ${
            activeTab === 'cover' ? 'opacity-100 z-10 pointer-events-auto visible' : 'opacity-0 z-0 pointer-events-none invisible'
          }`}
        >
          {premiumStatus.checked && premiumStatus.plan === "free" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0b0f19] text-white w-full h-full relative overflow-hidden">
              <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] relative z-10 space-y-6" style={{ boxShadow: "var(--shadow-soft-lg)" }}>
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight">
                    Cover Studio is Locked
                  </h2>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                    Designing high-converting book covers (front, spine, and back cover canvas) is available starting on our **Starter Creator** plan.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/pricing"
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs rounded-2xl transition-all duration-200 ease-out active:scale-[0.98]"
                    style={{ boxShadow: "var(--shadow-glow-primary)" }}
                  >
                    Upgrade to Starter Creator
                  </Link>
                </div>
              </div>
            </div>
          ) : !coverDraftLoaded ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 text-indigo-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <CoverStudioErrorBoundary>
              <FabricCoverStudio
                isActive={activeTab === 'cover'}
                trimSize={trimSize}
                setTrimSize={setTrimSize}
                pageCount={pageCount}
                setPageCount={(val) => {
                  const numeric = typeof val === 'function' ? val(pageCount) : val;
                  const safe = Math.max(24, Math.min(1000, Number(numeric) || 100));
                  setPageCount(safe);
                }}
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
            </CoverStudioErrorBoundary>
          )}
        </div>
      </main>
    </div>
  );
}