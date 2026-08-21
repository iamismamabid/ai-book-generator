"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * InstantNavPrefetcher
 * Hooks into pointerover, touchstart, and mousedown to immediately prefetch
 * the destination route into Next.js client router cache.
 * When the user completes the click, the page opens instantly (0ms transition).
 */
export default function InstantNavPrefetcher() {
  const router = useRouter();

  useEffect(() => {
    const handlePointerOver = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      
      const link = target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      // Only prefetch internal relative links (skip external, anchor jumps, api, mailto)
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        !href.startsWith("/api") &&
        !href.startsWith("//")
      ) {
        try {
          router.prefetch(href);
        } catch {
          // Ignore any prefetch errors silently
        }
      }
    };

    // Attach passive listeners for maximum scrolling and interaction responsiveness
    document.addEventListener("mouseover", handlePointerOver, { passive: true });
    document.addEventListener("touchstart", handlePointerOver, { passive: true });

    return () => {
      document.removeEventListener("mouseover", handlePointerOver);
      document.removeEventListener("touchstart", handlePointerOver);
    };
  }, [router]);

  return null;
}
