"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { checkPremiumStatus } from "@/app/actions";

// Lazy-load the heavy studio component with immediate parallel downloading
const AiArtbookStudio = dynamic(
  () =>
    import("@/components/AiArtbookStudio").catch((err) => {
      if (typeof window !== "undefined" && !sessionStorage.getItem("retry_chunk_artbook")) {
        sessionStorage.setItem("retry_chunk_artbook", "1");
        const url = new URL(window.location.href);
        url.searchParams.set("ts", Date.now().toString());
        window.location.replace(url.toString());
      }
      throw err;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-3 bg-[#FFFDF9] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-sm font-semibold text-slate-600">Loading AI Coloring Artbook Studio…</span>
      </div>
    ),
  }
);

export default function ArtbookStudioClient() {
  const { isSignedIn } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });

  useEffect(() => {
    if (isSignedIn) {
      checkPremiumStatus()
        .then((res: any) => setPremiumStatus(res))
        .catch(() => setPremiumStatus({ checked: true, isPremium: false, plan: "free" }));
    }
  }, [isSignedIn]);

  return (
    <main className="min-h-screen w-full bg-[#FFFDF9]">
      <AiArtbookStudio
        isPremium={premiumStatus.isPremium}
        isSignedIn={Boolean(isSignedIn)}
        isActive={true}
      />
    </main>
  );
}
