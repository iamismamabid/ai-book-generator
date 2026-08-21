"use client";

import { useEffect, useRef } from "react";

export default function TrustpilotWidget() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-initialize Trustpilot widget when component mounts in client-side React
    if (typeof window !== "undefined" && (window as any).Trustpilot) {
      try {
        (window as any).Trustpilot.loadFromElement(ref.current);
      } catch (err) {
        console.log("Trustpilot widget initialization note:", err);
      }
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-4 min-h-[52px]">
      <div
        ref={ref}
        className="trustpilot-widget min-h-[52px]"
        data-locale="en-US"
        data-template-id="5419b6a8b0d04a076446a9ad"
        data-businessunit-id="6a6b9f255899f3a104131ad8"
        data-style-height="52px"
        data-style-width="100%"
        data-theme="light"
      >
        <a
          href="https://www.trustpilot.com/review/kdpage.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors inline-flex items-center gap-2 bg-emerald-50/80 px-4 py-2 rounded-full border border-emerald-200 shadow-sm"
        >
          <span className="text-emerald-600 font-black">★ Trustpilot</span>
          <span>Read our live reviews on Trustpilot.com</span>
        </a>
      </div>
    </div>
  );
}
