"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Grid3x3, Palette, Loader2, Sparkles, Lock, Cloud, CloudOff, Check, X, Paintbrush, Tag, Box } from "lucide-react";
import dynamic from 'next/dynamic';
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { checkPremiumStatus, saveCoverProject, loadCoverProject, getNotebookEntryData } from "../actions";
import { saveCoverDraftToIndexedDB, loadCoverDraftFromIndexedDB } from "@/lib/indexedDbStorage";
import KdpListingSheetModal from "@/components/KdpListingSheetModal";

// Dynamic imports — components use browser-only APIs (canvas, localStorage)
// Wrapped with auto-reload protection against CDN/browser cache ChunkLoadError
const FabricCoverStudio = dynamic(
  () =>
    import("@/components/FabricCoverStudio").catch((err) => {
      if (typeof window !== "undefined" && !sessionStorage.getItem("retry_chunk_cover")) {
        sessionStorage.setItem("retry_chunk_cover", "1");
        const url = new URL(window.location.href);
        url.searchParams.set("ts", Date.now().toString());
        window.location.replace(url.toString());
      }
      throw err;
    }),
  { ssr: false }
);
const BookBuilder = dynamic(
  () =>
    import("@/components/BookBuilder").catch((err) => {
      if (typeof window !== "undefined" && !sessionStorage.getItem("retry_chunk_builder")) {
        sessionStorage.setItem("retry_chunk_builder", "1");
        const url = new URL(window.location.href);
        url.searchParams.set("ts", Date.now().toString());
        window.location.replace(url.toString());
      }
      throw err;
    }),
  { ssr: false }
);
import CoverStudioErrorBoundary from "@/components/CoverStudioErrorBoundary";
import InteriorErrorBoundary from "@/components/InteriorErrorBoundary";
import { BookCoverSyncData } from "@/components/FullBookPackagerModal";
import { COVER_THEMES, CoverThemeId } from "@/app/utils/autoCoverGenerator";

const TRIM_SIZES = [
  { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
  { label: '8.5" x 8.5" (Square)', w: 8.5, h: 8.5 },
  { label: '6" x 9" (Novel)', w: 6, h: 9 },
  { label: '5.5" x 8.5" (Compact)', w: 5.5, h: 8.5 }
];

export default function MasterStudioApp() {
  const { isSignedIn } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'interior' | 'cover'>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "cover" || tab === "interior") {
        return tab as 'interior' | 'cover';
      }
    }
    return 'interior';
  });
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });
  // Populated when arriving via /studio?notebookId=... (e.g. "Open in Studio"
  // from a saved My Notebook entry) so Book Builder restores those exact pages
  // instead of whatever draft is sitting in localStorage.
  const [notebookInitialPages, setNotebookInitialPages] = useState<any[] | null>(null);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [notebookLoadState, setNotebookLoadState] = useState<'idle' | 'loading' | 'done'>('idle');
  // Mount already reads ?tab= from the URL to restore the active tab, but the
  // tab buttons themselves never wrote it back -- so switching to Cover
  // Studio then reloading always landed back on Book Builder. Keeping the URL
  // in sync fixes that without touching browser history on every click.
  const handleTabChange = (tab: 'interior' | 'cover') => {
    if (tab === 'cover') {
      if (bookMeta.trimSize && (trimSize.w !== bookMeta.trimSize.w || trimSize.h !== bookMeta.trimSize.h)) {
        setTrimSize(bookMeta.trimSize);
      }
      if (bookMeta.pageCount && pageCount !== bookMeta.pageCount) {
        setPageCount(bookMeta.pageCount);
      }
    }
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

  // Import notification banner (e.g. when arriving via 1-click bridge from AI Artbook Studio)
  const [importToast, setImportToast] = useState<string | null>(null);

  // KDP Listing & Keyword Sheet Modal
  const [kdpSheetOpen, setKdpSheetOpen] = useState(false);

  useEffect(() => {
    if (importToast) {
      const timer = setTimeout(() => setImportToast(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [importToast]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Global ChunkLoadError auto-recovery listener for seamless post-deploy updates
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleGlobalChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const message = "message" in event ? event.message : (event.reason?.message || String(event.reason || ""));
      if (
        message &&
        (message.includes("Loading chunk") ||
          message.includes("ChunkLoadError") ||
          message.includes("Failed to fetch dynamically imported module") ||
          message.includes("CSS chunk"))
      ) {
        const lockKey = "kdpage_global_chunk_reload_lock";
        const lastReload = sessionStorage.getItem(lockKey);
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 12000) {
          sessionStorage.setItem(lockKey, now.toString());
          const url = new URL(window.location.href);
          url.searchParams.set("ts", now.toString());
          window.location.replace(url.toString());
        }
      }
    };

    window.addEventListener("error", handleGlobalChunkError);
    window.addEventListener("unhandledrejection", handleGlobalChunkError);
    return () => {
      window.removeEventListener("error", handleGlobalChunkError);
      window.removeEventListener("unhandledrejection", handleGlobalChunkError);
    };
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

  // Support incoming query parameters from MCP server / external AI agents
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlTitle = params.get("title");
    const urlSubtitle = params.get("subtitle");
    const urlAuthor = params.get("author");
    const urlPages = params.get("pages");
    const urlTrim = params.get("trim");
    const urlTheme = params.get("theme");

    if (urlTitle || urlAuthor || urlPages || urlTrim || urlTheme) {
      const pageNum = urlPages ? parseInt(urlPages, 10) : undefined;
      let matchedTrim = undefined;
      if (urlTrim) {
        matchedTrim = TRIM_SIZES.find(
          t => t.label.toLowerCase().includes(urlTrim.toLowerCase()) || `${t.w}x${t.h}` === urlTrim
        );
      }

      setBookMeta(prev => ({
        ...prev,
        title: urlTitle || prev.title,
        subtitle: urlSubtitle || prev.subtitle,
        author: urlAuthor || prev.author,
        pageCount: (pageNum && !isNaN(pageNum) && pageNum >= 24) ? pageNum : prev.pageCount,
        trimSize: matchedTrim || prev.trimSize,
        themeId: (urlTheme as CoverThemeId) || prev.themeId,
      }));

      if (pageNum && !isNaN(pageNum) && pageNum >= 24) {
        setPageCount(pageNum);
      }
      if (matchedTrim) {
        setTrimSize(matchedTrim);
      }
      if (urlTheme && COVER_THEMES[urlTheme as CoverThemeId]) {
        const theme = COVER_THEMES[urlTheme as CoverThemeId];
        setCoverBackground(prev => ({
          ...prev,
          frontCoverColor: theme.bgGradStart,
          frontCoverType: 'gradient',
          frontCoverGradientStart: theme.bgGradStart,
          frontCoverGradientEnd: theme.bgGradEnd,
          backCoverColor: theme.bgGradStart,
          backCoverType: 'gradient',
          backCoverGradientStart: theme.bgGradStart,
          backCoverGradientEnd: theme.bgGradEnd,
        }));
      }
    }
  }, []);

  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [pageCount, setPageCount] = useState(24);

  // Active book interior metadata & auto-align bridge
  const [bookMeta, setBookMeta] = useState<BookCoverSyncData>({
    title: "The Ultimate Variety Puzzle Book for Adults",
    subtitle: "Large Print Brain Games with Complete Solutions Included",
    author: "KDPage Publishing",
    trimSize: TRIM_SIZES[0],
    pageCount: 24,
    themeId: "midnight_gold",
    language: "en"
  });
  const [pendingAutoAlign, setPendingAutoAlign] = useState<BookCoverSyncData | null>(null);

  const handleOpenCoverStudio = (syncData?: BookCoverSyncData) => {
    const dataToApply = syncData || bookMeta;
    if (dataToApply.trimSize) {
      setTrimSize(dataToApply.trimSize);
    }
    if (dataToApply.pageCount) {
      setPageCount(dataToApply.pageCount);
    }
    if (dataToApply.themeId && COVER_THEMES[dataToApply.themeId as CoverThemeId]) {
      const theme = COVER_THEMES[dataToApply.themeId as CoverThemeId];
      setCoverBackground(prev => ({
        ...prev,
        frontCoverColor: theme.bgGradStart,
        frontCoverType: 'gradient',
        frontCoverGradientStart: theme.bgGradStart,
        frontCoverGradientEnd: theme.bgGradEnd,
        backCoverColor: theme.bgGradStart,
        backCoverType: 'gradient',
        backCoverGradientStart: theme.bgGradStart,
        backCoverGradientEnd: theme.bgGradEnd,
      }));
    }
    setBookMeta(dataToApply);
    setPendingAutoAlign(dataToApply);
    handleTabChange('cover');
  };

  const interiorPagesRef = useRef<any[]>([]);
  const interiorBorderThemeRef = useRef<any>(undefined);

  const handleSyncInteriorPages = useCallback((pages: any[], borderTheme?: any) => {
    if (pages && Array.isArray(pages)) {
      interiorPagesRef.current = pages;
    }
    if (borderTheme !== undefined) {
      interiorBorderThemeRef.current = borderTheme;
    }
  }, []);

  const getBookPages = useCallback(() => {
    return interiorPagesRef.current;
  }, []);

  const getBorderTheme = useCallback(() => {
    return interiorBorderThemeRef.current;
  }, []);

  const handleInteriorChange = useCallback(({ pageCount: newPages, trimSize: newTrim, bookPages, borderTheme, language }: { pageCount: number; trimSize: any; bookPages?: any[]; borderTheme?: any; language?: any }) => {
    if (bookPages && Array.isArray(bookPages)) {
      interiorPagesRef.current = bookPages;
    }
    if (borderTheme !== undefined) {
      interiorBorderThemeRef.current = borderTheme;
    }
    if (typeof newPages === 'number' && !isNaN(newPages) && newPages >= 24) {
      setPageCount(newPages);
    }
    setBookMeta(prev => {
      const pageMatch = !newPages || prev.pageCount === newPages;
      const trimMatch = !newTrim || (prev.trimSize?.w === newTrim.w && prev.trimSize?.h === newTrim.h);
      const langMatch = !language || prev.language === language;
      if (pageMatch && trimMatch && langMatch) return prev;
      return {
        ...prev,
        pageCount: newPages || prev.pageCount,
        trimSize: newTrim || prev.trimSize,
        language: language || prev.language || "en",
      };
    });
  }, []);

  const [coverBackground, setCoverBackground] = useState({
    backCoverColor: '#0F172A',
    backCoverType: 'solid' as 'solid' | 'gradient',
    backCoverGradientStart: '#0F172A',
    backCoverGradientEnd: '#0F172A',
    frontCoverColor: '#0F172A',
    frontCoverType: 'solid' as 'solid' | 'gradient',
    frontCoverGradientStart: '#0F172A',
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

  const coverStateMemo = useMemo(() => ({
    coverElements,
    spineWidth,
    trimSize,
    ...coverBackground
  }), [coverElements, spineWidth, trimSize, coverBackground]);

  // Applies a loaded project (from localStorage or the cloud) to state.
  const applyCoverData = (data: any) => {
    if (!data || typeof data !== 'object') return;
    try {
      const loadedBg = {
        backCoverColor: typeof data.backCoverColor === 'string' ? data.backCoverColor : '#0F172A',
        backCoverType: (data.backCoverType === 'gradient' ? 'gradient' : 'solid') as 'solid' | 'gradient',
        backCoverGradientStart: typeof data.backCoverGradientStart === 'string' ? data.backCoverGradientStart : '#0F172A',
        backCoverGradientEnd: typeof data.backCoverGradientEnd === 'string' ? data.backCoverGradientEnd : '#0F172A',
        frontCoverColor: typeof data.frontCoverColor === 'string' ? data.frontCoverColor : '#0F172A',
        frontCoverType: (data.frontCoverType === 'gradient' ? 'gradient' : 'solid') as 'solid' | 'gradient',
        frontCoverGradientStart: typeof data.frontCoverGradientStart === 'string' ? data.frontCoverGradientStart : '#0F172A',
        frontCoverGradientEnd: typeof data.frontCoverGradientEnd === 'string' ? data.frontCoverGradientEnd : '#0F172A',
        backCoverImage: typeof data.backCoverImage === 'string' ? data.backCoverImage : '',
        frontCoverImage: typeof data.frontCoverImage === 'string' ? data.frontCoverImage : '',
        fullCoverImage: typeof data.fullCoverImage === 'string' ? data.fullCoverImage : '',
        backCoverTextureId: typeof data.backCoverTextureId === 'string' ? data.backCoverTextureId : '',
        frontCoverTextureId: typeof data.frontCoverTextureId === 'string' ? data.frontCoverTextureId : '',
        fullCoverTextureId: typeof data.fullCoverTextureId === 'string' ? data.fullCoverTextureId : '',
        backCoverImageOffsetX: typeof data.backCoverImageOffsetX === 'number' ? data.backCoverImageOffsetX : 0,
        backCoverImageOffsetY: typeof data.backCoverImageOffsetY === 'number' ? data.backCoverImageOffsetY : 0,
        frontCoverImageOffsetX: typeof data.frontCoverImageOffsetX === 'number' ? data.frontCoverImageOffsetX : 0,
        frontCoverImageOffsetY: typeof data.frontCoverImageOffsetY === 'number' ? data.frontCoverImageOffsetY : 0,
        fullCoverImageOffsetX: typeof data.fullCoverImageOffsetX === 'number' ? data.fullCoverImageOffsetX : 0,
        fullCoverImageOffsetY: typeof data.fullCoverImageOffsetY === 'number' ? data.fullCoverImageOffsetY : 0
      };
      setCoverBackground(loadedBg);

      if (Array.isArray(data.coverElements)) {
        setCoverElements(data.coverElements.filter(Boolean));
      }

      if (typeof data.pageCount === 'number' && !isNaN(data.pageCount) && data.pageCount >= 24) {
        setPageCount(Math.min(1000, data.pageCount));
      }

      if (data.trimSize && typeof data.trimSize === 'object') {
        const match = TRIM_SIZES.find(t => t.label === data.trimSize.label);
        if (match) {
          setTrimSize(match);
        } else if (typeof data.trimSize.w === "number" && typeof data.trimSize.h === "number" && !isNaN(data.trimSize.w) && !isNaN(data.trimSize.h)) {
          setTrimSize({
            label: data.trimSize.label || `Custom (${data.trimSize.w}" x ${data.trimSize.h}")`,
            w: data.trimSize.w,
            h: data.trimSize.h
          });
        }
      }
    } catch (err) {
      console.warn("Failed to apply loaded cover data cleanly:", err);
    }
  };

  // Load Cover draft or Notebook entry on mount —
  // If notebookId is present, check sessionStorage first for instant load, then fetch
  // from getNotebookEntryData. If it's a cover, apply it, cache in IndexedDB, and activate cover tab.
  // Otherwise, load from IndexedDB (durable & supports large images), then localStorage,
  // then cloud copy if signed in and no local work exists.
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const notebookId = params?.get("notebookId");
      const tabParam = params?.get("tab");
      const importParam = params?.get("import");

      // 0. Artbook Studio Bridge: 1-click import coloring pages into Book Builder
      if (importParam === "artbook") {
        try {
          let cachedImportStr = sessionStorage.getItem("kdpage_artbook_import");
          if (!cachedImportStr) {
            cachedImportStr = localStorage.getItem("kdpage_artbook_import");
          }
          if (cachedImportStr) {
            const parsedImport = JSON.parse(cachedImportStr);
            if (parsedImport && Array.isArray(parsedImport.pages) && parsedImport.pages.length > 0) {
              setActiveTab("interior");
              setNotebookInitialPages(parsedImport.pages);
              const importedCount = Math.max(24, parsedImport.pages.length);
              setPageCount(importedCount);
              setNotebookLoadState("done");

              if (parsedImport.trimSize) {
                const matched = TRIM_SIZES.find(t => t.label === parsedImport.trimSize.label || (t.w === parsedImport.trimSize.w && t.h === parsedImport.trimSize.h)) || {
                  label: parsedImport.trimSize.label || `${parsedImport.trimSize.w}" x ${parsedImport.trimSize.h}"`,
                  w: parsedImport.trimSize.w,
                  h: parsedImport.trimSize.h,
                };
                setTrimSize(matched);
              }

              const coloringPagesCount = parsedImport.pages.filter((p: any) => p.type === 'coloring_book').length;
              const blankPagesCount = parsedImport.pages.filter((p: any) => p.type === 'blank').length;
              const trimLabel = parsedImport.trimSize ? `${parsedImport.trimSize.w}" x ${parsedImport.trimSize.h}"` : '8.5" x 11"';
              setImportToast(
                `🎨 Imported ${coloringPagesCount} coloring pages in ${trimLabel}! ${blankPagesCount > 0 ? `🛡️ Bleed protection active (${blankPagesCount} blank backs).` : ''} Spine recalculated for ${importedCount} pages.`
              );

              try {
                sessionStorage.removeItem("kdpage_artbook_import");
                localStorage.removeItem("kdpage_artbook_import");
              } catch {}

              const url = new URL(window.location.href);
              url.searchParams.delete("import");
              window.history.replaceState({}, "", url);
              return;
            }
          }
        } catch (e) {
          console.error("Failed to load artbook import in StudioClient:", e);
        }
      }

      if (notebookId) {
        setActiveNotebookId(notebookId);
        setNotebookLoadState("loading");

        // 1. Fast path: check if sessionStorage cached the notebook entry on click
        let fastPayload: any = null;
        try {
          const cachedStr = sessionStorage.getItem(`kdpage_notebook_entry_${notebookId}`);
          if (cachedStr) {
            fastPayload = JSON.parse(cachedStr);
          }
        } catch {}

        if (fastPayload) {
          const isCoverFast =
            tabParam === "cover" ||
            fastPayload?.type === "kdp_cover" ||
            Array.isArray(fastPayload?.coverElements) ||
            typeof fastPayload?.backCoverColor === "string";

          if (isCoverFast) {
            setActiveTab("cover");
            hasUserEditedInThisSession.current = true;
            hasLocalDraftLoadedRef.current = true;
            applyCoverData(fastPayload);
            saveCoverDraftToIndexedDB(fastPayload);
            setCoverDraftLoaded(true);
            setNotebookLoadState("done");
            return;
          } else if (fastPayload?.pages) {
            setActiveTab("interior");
            setNotebookInitialPages(fastPayload.pages);
            setNotebookLoadState("done");
          }
        }

        // 2. Authoritative path: fetch from server action
        try {
          const res = await getNotebookEntryData(notebookId);
          if (!isCancelled && res?.success) {
            const rawData = res.data || res.entry?.data;
            const entryCategory = (res.category || res.entry?.category || "").toLowerCase();
            const isCoverEntry =
              entryCategory === "cover" ||
              tabParam === "cover" ||
              rawData?.type === "kdp_cover" ||
              Array.isArray(rawData?.coverElements) ||
              typeof rawData?.backCoverColor === "string";

            if (isCoverEntry && rawData) {
              setActiveTab("cover");
              hasUserEditedInThisSession.current = true;
              hasLocalDraftLoadedRef.current = true;
              applyCoverData(rawData);
              saveCoverDraftToIndexedDB(rawData);
              setCoverDraftLoaded(true);
              setNotebookLoadState("done");
              return;
            } else if (rawData?.pages) {
              setActiveTab("interior");
              setNotebookInitialPages(rawData.pages);
              setNotebookLoadState("done");
            }
          }
        } catch (err) {
          console.error("Failed to load notebook entry:", err);
        } finally {
          if (!isCancelled) setNotebookLoadState("done");
        }
      }

      // Standard draft restore when no cover notebookId was applied
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

    // 2. Save lightweight copy to localStorage (strip giant data URLs if over 1.5MB)
    try {
      const dataStr = JSON.stringify(data);
      if (dataStr.length < 1_500_000) {
        localStorage.setItem("kdp-cover-draft", dataStr);
      } else {
        const safeData = {
          ...data,
          backCoverImage: data.backCoverImage?.startsWith('data:') ? '' : data.backCoverImage,
          frontCoverImage: data.frontCoverImage?.startsWith('data:') ? '' : data.frontCoverImage,
          fullCoverImage: data.fullCoverImage?.startsWith('data:') ? '' : data.fullCoverImage,
          coverElements: (data.coverElements || []).map((el: any) => {
            if (el?.src && typeof el.src === 'string' && el.src.startsWith('data:') && el.src.length > 300_000) {
              return { ...el, src: '' };
            }
            return el;
          })
        };
        const safeStr = JSON.stringify(safeData);
        if (safeStr.length < 2_000_000) {
          localStorage.setItem("kdp-cover-draft", safeStr);
        }
      }
    } catch (err) {
      console.warn("Couldn't cache cover draft locally in localStorage (IndexedDB has full copy):", err);
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
    }, 20000);
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
      
      {/* Toast Notification (e.g. Artbook Import Success) */}
      {importToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white border border-indigo-500/50 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 max-w-lg">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold leading-snug">{importToast}</span>
          <button
            onClick={() => setImportToast(null)}
            className="ml-auto text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
            type="button"
            onClick={() => handleTabChange('interior')}
            className={`relative px-4 sm:px-5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 z-10 cursor-pointer ${
              activeTab === 'interior'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid3x3 className="w-3.5 h-3.5"/> Book Builder
          </button>
          
          <button
            type="button"
            onClick={() => handleTabChange('cover')}
            className={`relative px-4 sm:px-5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 z-10 cursor-pointer ${
              activeTab === 'cover'
                ? 'bg-indigo-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5"/> Cover Studio
          </button>
        </div>

        {/* Right: Dedicated Tools & Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKdpSheetOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-black text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
            title="Amazon KDP 7-Backend-Keywords, Categories & HTML Description Copy Sheet"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">KDP Keywords &amp; Sheet</span>
            <span className="sm:hidden">KDP Sheet</span>
          </button>
          <Link
            href="/tools/3d-mockup"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-600 uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            title="Free 3D Book Mockup Generator"
          >
            <Box className="w-3.5 h-3.5 text-indigo-400" />
            <span>3D Mockup ↗</span>
          </Link>
          <Link
            href="/artbook-studio?v=2"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 uppercase tracking-wider transition-all hover:bg-amber-500/30 shadow-sm"
            title="Launch Dedicated AI Coloring Artbook Studio Tool"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Artbook Tool ↗</span>
          </Link>
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
          className="absolute inset-0 w-full h-full flex flex-col overflow-hidden transition-opacity duration-150"
          style={{
            visibility: activeTab === 'interior' ? 'visible' : 'hidden',
            pointerEvents: activeTab === 'interior' ? 'auto' : 'none',
            zIndex: activeTab === 'interior' ? 10 : 0,
            opacity: activeTab === 'interior' ? 1 : 0,
          }}
        >
          <InteriorErrorBoundary>
            <BookBuilder
              coverState={coverStateMemo}
              initialPages={notebookInitialPages ?? undefined}
              notebookId={activeNotebookId ?? undefined}
              onOpenCoverStudio={handleOpenCoverStudio}
              onInteriorChange={handleInteriorChange}
              onSyncPages={handleSyncInteriorPages}
            />
          </InteriorErrorBoundary>
        </div>

        {/* Cover Studio Tab Content (FabricCoverStudio) */}
        <div
          className="absolute inset-0 w-full h-full flex flex-col overflow-hidden bg-white dark:bg-slate-900 transition-opacity duration-150"
          style={{
            visibility: activeTab === 'cover' ? 'visible' : 'hidden',
            pointerEvents: activeTab === 'cover' ? 'auto' : 'none',
            zIndex: activeTab === 'cover' ? 10 : 0,
            opacity: activeTab === 'cover' ? 1 : 0,
          }}
        >
          {!coverDraftLoaded ? (
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
                  const numeric = typeof val === 'function' ? (val as (prev: number) => number)(pageCount) : val;
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
                bookMeta={bookMeta}
                pendingAutoAlign={pendingAutoAlign}
                onClearAutoAlign={() => setPendingAutoAlign(null)}
                getBookPages={getBookPages}
                getBorderTheme={getBorderTheme}
                isPremium={premiumStatus.isPremium}
              />
            </CoverStudioErrorBoundary>
          )}
        </div>
      </main>

      {/* Amazon KDP 7-Backend-Keywords & Category Copy Sheet Helper Modal */}
      <KdpListingSheetModal
        isOpen={kdpSheetOpen}
        onClose={() => setKdpSheetOpen(false)}
        bookMeta={bookMeta}
        bookPages={getBookPages ? getBookPages() : []}
        onUpdateMeta={(updated) => setBookMeta(prev => ({ ...prev, ...updated }))}
      />
    </div>
  );
}