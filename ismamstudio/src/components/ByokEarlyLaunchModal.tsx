"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, Sparkles, Key, Zap, ShieldCheck, Check, Bell, 
  Cpu, ArrowRight, BookOpen, Paintbrush, Layers, CheckCircle2,
  ExternalLink, Settings2, Wand2
} from "lucide-react";
import confetti from "canvas-confetti";
import ByokStudioPanel from "./ByokStudioPanel";

interface ByokEarlyLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  studioType: "cover" | "coloring";
  onApplyFrontCover?: (imageUrl: string) => void;
  onApplyBackCover?: (imageUrl: string) => void;
  onApplyFullCover?: (imageUrl: string) => void;
  onAddToCanvas?: (imageUrl: string) => void;
  onApplyColoringPage?: (imageUrl: string, promptText: string) => void;
}

const PROVIDERS = [
  {
    name: "OpenAI",
    models: "DALL-E 3 & GPT-4o Vision",
    badge: "Official API",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
    iconColor: "text-emerald-400"
  },
  {
    name: "Google Gemini",
    models: "Imagen 3 & Gemini 2.0 Flash",
    badge: "High Res",
    color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300",
    iconColor: "text-blue-400"
  },
  {
    name: "Stability AI",
    models: "Stable Diffusion 3.5 & SDXL",
    badge: "Vector Art",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300",
    iconColor: "text-purple-400"
  },
  {
    name: "Fal.ai & Flux",
    models: "Flux.1 Schnell & Dev Pro",
    badge: "Ultra Fast",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300",
    iconColor: "text-amber-400"
  }
];

export default function ByokEarlyLaunchModal({ 
  isOpen, 
  onClose, 
  studioType,
  onApplyFrontCover,
  onApplyBackCover,
  onApplyFullCover,
  onAddToCanvas,
  onApplyColoringPage
}: ByokEarlyLaunchModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "overview">("generate");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(`kdpage_byok_notified_${studioType}`);
    if (saved) {
      setIsSubscribed(true);
    }
  }, [studioType]);

  if (!isOpen || !mounted) return null;

  const handleNotifyMe = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubscribed(true);
    localStorage.setItem(`kdpage_byok_notified_${studioType}`, "true");
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Safe fallback if confetti isn't initialized
    }
  };

  const isCover = studioType === "cover";

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top News Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> AI Magic Studio • Bring Your Own Key
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/60">
            {isCover ? "Cover Studio" : "Coloring Book Studio"} Power Feature
          </span>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 mb-5 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("generate")}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "generate"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" /> AI Magic Generator &amp; Key Setup
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" /> How BYOK Works &amp; Specs
          </button>
        </div>

        {activeTab === "generate" ? (
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <ByokStudioPanel
              studioType={studioType}
              onApplyFrontCover={(url) => {
                onApplyFrontCover?.(url);
                onClose();
              }}
              onApplyBackCover={(url) => {
                onApplyBackCover?.(url);
                onClose();
              }}
              onApplyFullCover={(url) => {
                onApplyFullCover?.(url);
                onClose();
              }}
              onAddToCanvas={(url) => {
                onAddToCanvas?.(url);
                onClose();
              }}
              onApplyColoringPage={(url, pr) => {
                onApplyColoringPage?.(url, pr);
                onClose();
              }}
            />
          </div>
        ) : (
          <div>
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 leading-tight">
              Infinite AI Creation Magic With <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">Your Own Key (BYOK)</span>
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {isCover
                ? "Transform simple thoughts into breathtaking 8K photorealistic book covers, fantasy landscapes, and cinematic character artwork directly on your canvas at direct raw provider cost (~$0.02 - $0.04/image) with zero monthly limits."
                : "Turn text prompts into high-definition 300 DPI vector line art, intricate mandalas, and print-ready coloring books with zero per-image platform limits or credit markups."}
            </p>

            {/* Value Props Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800/80 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Key className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Raw API Pricing</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pay direct provider pricing (~$0.02 - $0.04/image) directly to OpenAI, Google, or Stability. No middleman markups.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800/80 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Client-Side Privacy</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your API keys are stored locally in your browser. They are never saved or logged on KDPage servers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800/80 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">1-Click Canvas Integration</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Generated artwork automatically formats to KDP trim dimensions and inserts into your live canvas layout instantly.
                </p>
              </div>
            </div>

            {/* Supported AI Providers */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Supported AI Engine Providers</span>
                <span className="text-[10px] text-amber-400 font-bold">Active in Studio</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROVIDERS.map((provider) => (
                  <div
                    key={provider.name}
                    className={`p-3 rounded-xl border bg-gradient-to-b ${provider.color} flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{provider.name}</span>
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-300">
                          {provider.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-300 block line-clamp-1">{provider.models}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-lg shadow-amber-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Ready to Generate Magic?
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Switch to the Generator tab to paste your API key and start creating artwork in seconds.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("generate")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" /> Start Generating
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
