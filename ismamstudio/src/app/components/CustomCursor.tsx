"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [standardCursor, setStandardCursor] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setStandardCursor(localStorage.getItem("kdpageStandardCursor") === "true");

    const handleToggle = (e: Event) => {
      const customEvt = e as CustomEvent<{ standard: boolean }>;
      if (customEvt.detail !== undefined) {
        setStandardCursor(customEvt.detail.standard);
      } else {
        setStandardCursor(localStorage.getItem("kdpageStandardCursor") === "true");
      }
    };

    window.addEventListener("kdpageCursorToggle", handleToggle);
    return () => window.removeEventListener("kdpageCursorToggle", handleToggle);
  }, []);

  const mouseRef = useRef({ x: 0, y: 0 });
  const ringRef = useRef({ x: 0, y: 0 });
  const dotRef = useRef<HTMLDivElement | null>(null);
  const outerRingRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if device supports a fine pointer (mouse/trackpad)
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    setEnabled(true);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      setIsVisible(true);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    const addHoverListeners = () => {
      const interactives = document.querySelectorAll(
        "a, button, [role='button'], input[type='submit'], select, input[type='button'], input[type='text'], input[type='number'], textarea, .interactive-hover"
      );
      
      interactives.forEach((el) => {
        el.addEventListener("mouseenter", () => setIsHovered(true));
        el.addEventListener("mouseleave", () => setIsHovered(false));
      });
    };

    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    const updatePosition = () => {
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;

      if (dotRef.current) {
        dotRef.current.style.left = `${targetX}px`;
        dotRef.current.style.top = `${targetY}px`;
      }

      const ring = ringRef.current;
      const dx = targetX - ring.x;
      const dy = targetY - ring.y;
      
      ring.x += dx * 0.15;
      ring.y += dy * 0.15;

      if (outerRingRef.current) {
        outerRingRef.current.style.left = `${ring.x}px`;
        outerRingRef.current.style.top = `${ring.y}px`;
      }

      requestRef.current = requestAnimationFrame(updatePosition);
    };

    requestRef.current = requestAnimationFrame(updatePosition);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      observer.disconnect();
    };
  }, []);

  if (!enabled || standardCursor) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (pointer: fine) {
          html, body, a, button, select, input, textarea, [role="button"] {
            cursor: none !important;
          }
        }
      ` }} />

      {/* Inner Dot */}
      <div
        ref={dotRef}
        className={`fixed pointer-events-none rounded-full z-[2147483647] -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out bg-[#800000] shadow-[0_0_8px_rgba(128,0,0,0.5)] ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
        } ${isHovered ? "w-3 h-3 bg-[#800000] shadow-[0_0_12px_rgba(128,0,0,0.8)]" : "w-2 h-2"}`}
        style={{ left: "-100px", top: "-100px" }}
      />

      {/* Outer Ring */}
      <div
        ref={outerRingRef}
        className={`fixed pointer-events-none rounded-full z-[2147483646] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out border-2 border-black/40 bg-black/0 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
        } ${
          isHovered
            ? "w-12 h-12 border-black/60 bg-black/5 shadow-[inset_0_0_8px_rgba(0,0,0,0.15)] scale-110"
            : "w-8 h-8"
        }`}
        style={{ left: "-100px", top: "-100px" }}
      />
    </>
  );
}
