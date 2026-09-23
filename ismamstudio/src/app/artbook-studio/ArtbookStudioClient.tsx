"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { checkPremiumStatus } from "@/app/actions";
import AiArtbookStudio from "@/components/AiArtbookStudio";

export default function ArtbookStudioClient() {
  const { isSignedIn } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("v") !== "2") {
        url.searchParams.set("v", "2");
        window.location.replace(url.pathname + url.search);
      }
    }
  }, []);

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
