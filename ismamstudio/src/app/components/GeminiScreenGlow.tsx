"use client";

import React, { useEffect, useState, useRef } from "react";

interface ClickEffect {
  id: number;
  x: number;
  y: number;
}

export default function GeminiScreenGlow() {
  const [clickRipples, setClickRipples] = useState<ClickEffect[]>([]);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Add radial Gemini click flare at exact click coordinates
      const newId = ++rippleIdRef.current;
      const newRipple: ClickEffect = {
        id: newId,
        x: e.clientX,
        y: e.clientY,
      };

      setClickRipples((prev) => [...prev.slice(-4), newRipple]);

      // Remove ripple flare after animation finishes (900ms)
      setTimeout(() => {
        setClickRipples((prev) => prev.filter((r) => r.id !== newId));
      }, 900);
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes geminiGlowPulse {
          0%, 100% {
            opacity: 0.55;
            filter: blur(28px);
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            filter: blur(36px);
            transform: scale(1.05);
          }
        }

        @keyframes geminiRippleExpand {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0.95;
            filter: drop-shadow(0 0 10px #4285f4);
          }
          50% {
            opacity: 0.75;
            filter: drop-shadow(0 0 20px #9b51e0);
          }
          100% {
            transform: translate(-50%, -50%) scale(3.2);
            opacity: 0;
            filter: drop-shadow(0 0 30px #00c9ff);
          }
        }

        /* ✨ Gemini Ambient Edge Glow Up Rays */
        .gemini-ambient-glow {
          position: fixed;
          pointer-events: none;
          z-index: 999980;
          border-radius: 9999px;
          animation: geminiGlowPulse 6s ease-in-out infinite;
        }

        .gemini-glow-top-left {
          top: -60px;
          left: -60px;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(66, 133, 244, 0.35) 0%, rgba(0, 201, 255, 0.2) 60%, transparent 80%);
        }

        .gemini-glow-top-right {
          top: -60px;
          right: -60px;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(0, 201, 255, 0.35) 0%, rgba(155, 81, 224, 0.2) 60%, transparent 80%);
          animation-delay: -2s;
        }

        .gemini-glow-bottom-right {
          bottom: -60px;
          right: -60px;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(155, 81, 224, 0.35) 0%, rgba(255, 75, 75, 0.2) 60%, transparent 80%);
          animation-delay: -4s;
        }

        .gemini-glow-bottom-left {
          bottom: -60px;
          left: -60px;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(255, 184, 0, 0.3) 0%, rgba(66, 133, 244, 0.2) 60%, transparent 80%);
          animation-delay: -3s;
        }

        .gemini-click-ripple {
          position: fixed;
          pointer-events: none;
          z-index: 999992;
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(66, 133, 244, 0.5) 0%,
            rgba(155, 81, 224, 0.35) 45%,
            rgba(0, 201, 255, 0.25) 75%,
            transparent 100%
          );
          box-shadow: 
            0 0 25px rgba(66, 133, 244, 0.6),
            0 0 50px rgba(155, 81, 224, 0.4);
          animation: geminiRippleExpand 0.85s ease-out forwards;
        }
      ` }} />

      {/* ✨ Gemini Ambient Edge Glow Up Light Rays (Android Gemini Style) */}
      <div className="gemini-ambient-glow gemini-glow-top-left" />
      <div className="gemini-ambient-glow gemini-glow-top-right" />
      <div className="gemini-ambient-glow gemini-glow-bottom-right" />
      <div className="gemini-ambient-glow gemini-glow-bottom-left" />

      {/* Dynamic Gemini Click Light Ray Wave (At Click Location Only) */}
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
