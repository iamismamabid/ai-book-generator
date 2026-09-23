"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { checkPremiumStatus } from "@/app/actions";

// Lazy-load the heavy studio component (canvas, jsPDF, localStorage)
const AiArtbookStudio = dynamic(
  () =>
    import("@/components/AiArtbookStudio").catch((err) => {
      if (typeof window !== "undefined" && !sessionStorage.getItem("retry_chunk_artbook")) {
        sessionStorage.setItem("retry_chunk_artbook", "1");
        window.location.reload();
      }
      throw err;
    }),
  { ssr: false }
);

export default function ArtbookStudioClient() {
  const { isSignedIn } = useAuth();
  const [isMounted, setIsMounted]     = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    async function loadPremium() {
      try {
        const res = await checkPremiumStatus();
        setPremiumStatus(res as any);
      } catch {
        setPremiumStatus({ checked: true, isPremium: false, plan: "free" });
      }
    }
    if (isSignedIn) loadPremium();
    else setPremiumStatus({ checked: true, isPremium: false, plan: "free" });
  }, [isSignedIn]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!isMounted || !premiumStatus.checked) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-3 bg-[#FFFDF9] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-sm font-medium text-slate-600">Loading AI Coloring Artbook Studio…</span>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen w-full bg-[#FFFDF9]">
      <AiArtbookStudio
        isPremium={premiumStatus.isPremium}
        isSignedIn={!!isSignedIn}
        isActive={true}
      />
    </main>
  );
}
