"use client";

import React, { useEffect, useState, useRef } from "react";

interface ClickEffect {
  id: number;
  x: number;
  y: number;
}

export default function GeminiScreenGlow() {
  const [isActive, setIsActive] = useState(false);
  const [clickRipples, setClickRipples] = useState<ClickEffect[]>([]);
  const rippleIdRef = useRef(0);
  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Trigger full screen border glow pulse
      setIsActive(true);
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
      activeTimerRef.current = setTimeout(() => {
        setIsActive(false);
      }, 1600);

      // Add radial click ripple at mouse coordinates
      const newId = ++rippleIdRef.current;
      const newRipple: ClickEffect = {
        id: newId,
        x: e.clientX,
        y: e.clientY,
      };

      setClickRipples((prev) => [...prev.slice(-4), newRipple]);

      // Remove ripple after animation finishes (900ms)
      setTimeout(() => {
        setClickRipples((prev) => prev.filter((r) => r.id !== newId));
      }, 900);
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes geminiGlowRotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes geminiRippleExpand {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(3.5);
            opacity: 0;
          }
        }

        .gemini-border-glow {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 999990;
          box-shadow: inset 0 0 15px rgba(66, 133, 244, 0.25);
          transition: opacity 0.4s ease, box-shadow 0.4s ease;
        }

        .gemini-border-glow.active {
          box-shadow: 
            inset 0 0 25px rgba(66, 133, 244, 0.6),
            inset 0 0 50px rgba(155, 81, 224, 0.4),
            inset 0 0 80px rgba(0, 201, 255, 0.3);
        }

        .gemini-edge-ray {
          position: fixed;
          pointer-events: none;
          z-index: 999991;
          background: linear-gradient(
            90deg,
            #4285f4,
            #9b51e0,
            #00c9ff,
            #ffb800,
            #4285f4
          );
          background-size: 300% 300%;
          animation: geminiGlowRotate 4s linear infinite;
          opacity: 0.45;
          transition: opacity 0.3s ease, filter 0.3s ease, transform 0.3s ease;
        }

        .gemini-edge-ray.active {
          opacity: 1;
          filter: drop-shadow(0 0 12px #4285f4) drop-shadow(0 0 20px #9b51e0);
        }

        .gemini-edge-top {
          top: 0; left: 0; right: 0; height: 3.5px;
        }

        .gemini-edge-bottom {
          bottom: 0; left: 0; right: 0; height: 3.5px;
        }

        .gemini-edge-left {
          top: 0; bottom: 0; left: 0; width: 3.5px;
        }

        .gemini-edge-right {
          top: 0; bottom: 0; right: 0; width: 3.5px;
        }

        .gemini-click-ripple {
          position: fixed;
          pointer-events: none;
          z-index: 999992;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(66, 133, 244, 0.45) 0%,
            rgba(155, 81, 224, 0.35) 45%,
            rgba(0, 201, 255, 0.25) 75%,
            transparent 100%
          );
          box-shadow: 
            0 0 30px rgba(66, 133, 244, 0.5),
            0 0 60px rgba(155, 81, 224, 0.3);
          animation: geminiRippleExpand 0.85s ease-out forwards;
        }
      ` }} />

      {/* Viewport Edge Glow Rays */}
      <div className={`gemini-border-glow ${isActive ? "active" : ""}`} />
      <div className={`gemini-edge-ray gemini-edge-top ${isActive ? "active" : ""}`} />
      <div className={`gemini-edge-ray gemini-edge-bottom ${isActive ? "active" : ""}`} />
      <div className={`gemini-edge-ray gemini-edge-left ${isActive ? "active" : ""}`} />
      <div className={`gemini-edge-ray gemini-edge-right ${isActive ? "active" : ""}`} />

      {/* Dynamic Click Flares */}
      {clickRipples.map((ripple) => (
        <div
          key={ripple.id}
          className="gemini-click-ripple"
          style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }}
        />
      ))}
    </>
  );
}
