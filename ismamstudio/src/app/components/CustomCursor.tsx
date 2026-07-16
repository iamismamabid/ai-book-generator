"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Refs for tracking position without state-triggering re-renders for smooth 60fps performance
  const mouseRef = useRef({ x: 0, y: 0 });
  const ringRef = useRef({ x: 0, y: 0 });
  const dotRef = useRef<HTMLDivElement | null>(null);
  const outerRingRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Device check: Only enable on desktop pointer screens
    const checkDevice = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isCoarse = window.matchMedia("(pointer: coarse)").matches;
      const isDesktop = !hasTouch && !isCoarse;
      setIsMobile(!isDesktop);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    if (isMobile) return;

    // 2. Mouse Move & Visibility Listeners
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      setIsVisible(true);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // 3. Hover state listeners for interactive elements
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

    // Create a MutationObserver to apply listeners to dynamically rendered/changing elements
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    // 4. Smooth Trailing Animation Loop
    const updatePosition = () => {
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;

      // Update inner dot position immediately
      if (dotRef.current) {
        dotRef.current.style.left = `${targetX}px`;
        dotRef.current.style.top = `${targetY}px`;
      }

      // Calculate spring trailing position for outer ring
      const ring = ringRef.current;
      const dx = targetX - ring.x;
      const dy = targetY - ring.y;
      
      // Lerp/Spring factor: 0.15 (15% closer to target each frame)
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
      window.removeEventListener("resize", checkDevice);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      observer.disconnect();
    };
  }, [isMobile]);

  // If mobile or touch-screen, render nothing and do not hide cursor
  if (isMobile) return null;

  return (
    <>
      {/* Inject cursor hide style on pointer screens */}
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
        className={`fixed pointer-events-none rounded-full z-[9999] -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)] ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
        } ${isHovered ? "w-3 h-3 bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]" : "w-2 h-2"}`}
        style={{ left: "-100px", top: "-100px" }}
      />

      {/* Outer Ring */}
      <div
        ref={outerRingRef}
        className={`fixed pointer-events-none rounded-full z-[9998] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out border-2 border-indigo-400/40 bg-indigo-500/0 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
        } ${
          isHovered
            ? "w-12 h-12 border-rose-400/30 bg-rose-500/5 shadow-[inset_0_0_8px_rgba(244,63,94,0.1)] scale-110"
            : "w-8 h-8"
        }`}
        style={{ left: "-100px", top: "-100px" }}
      />
    </>
  );
}
