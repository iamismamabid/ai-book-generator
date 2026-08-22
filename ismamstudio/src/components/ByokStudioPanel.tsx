"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Key, Eye, EyeOff, Check, Trash2, ExternalLink,
  Loader2, Download, Plus, LayoutTemplate, Layers, AlertCircle,
  RefreshCw, CheckCircle2, SlidersHorizontal, Image as ImageIcon
} from "lucide-react";
import { 
  ByokProvider, 
  loadByokKeys, 
  saveByokKey, 
  removeByokKey, 
  getProviderInfo,
  hasActiveKeyForProvider 
} from "@/lib/byokStorage";
import confetti from "canvas-confetti";

interface ByokStudioPanelProps {
  studioType: "cover" | "coloring";
  onApplyFrontCover?: (imageUrl: string) => void;
  onApplyFullCover?: (imageUrl: string) => void;
  onAddToCanvas?: (imageUrl: string) => void;
  onApplyColoringPage?: (imageUrl: string, promptText: string) => void;
}

const COVER_PROMPT_PRESETS = [
  { label: "Fantasy Dragon", prompt: "Epic dragon perched on ancient stone castle ruins, stormy twilight sky, volumetric lighting, rich cinematic digital art" },
  { label: "Sci-Fi Cyberpunk", prompt: "Futuristic neon cyberpunk city skyline at night, flying holographic vehicles, rainy streets with neon reflections, 8k" },
  { label: "Victorian Romance", prompt: "Elegant 19th-century vintage Victorian ballroom, soft romantic candlelight, ornate chandelier, oil painting texture" },
  { label: "Psychological Thriller", prompt: "Dark foggy forest road at midnight, mysterious silhouette under a solitary streetlamp, moody shadows, cinematic lighting" },
  { label: "Cozy Watercolor", prompt: "Charming countryside cottage garden with blooming sunflowers and lavender, soft pastel watercolor illustration" },
  { label: "Space Odyssey", prompt: "Vibrant cosmic nebula, deep galaxy stars, swirling solar flares, majestic celestial planet, astronomical photography" },
];

const COLORING_PROMPT_PRESETS = [
  { label: "Sacred Mandala", prompt: "Intricate circular mandala pattern, sacred geometry, floral symmetry, fine outline line art, clean white background" },
  { label: "Jungle Animals", prompt: "Cute baby elephant, tiger cub and playful parrot surrounded by tropical palm leaves, clear outlines for coloring" },
  { label: "Botanical Florals", prompt: "Detailed bouquet of wild peonies, roses, eucalyptus branches and butterflies, botanical line art, black outline" },
  { label: "Stained Glass", prompt: "Stained glass window design featuring a majestic flying owl under a crescent moon, thick segmented black lines" },
  { label: "Cozy Cottage", prompt: "Whimsical fairytale cottage house with stone chimney, picket fence and climbing ivy garden, clean coloring page" },
  { label: "Under the Sea", prompt: "Magical coral reef underwater scene with sea turtle, clownfish, starfish and sea anemones, crisp line art" },
];

const COVER_STYLES = [
  { label: "Cinematic 3D", value: "cinematic 3d render, octane render, photorealistic" },
  { label: "Oil Painting", value: "rich textured oil on canvas, classical brushstrokes" },
  { label: "Digital Fantasy", value: "digital fantasy concept art, highly detailed" },
  { label: "Minimalist Vector", value: "clean modern minimalist vector illustration, bold contrast" },
  { label: "Dark Moody", value: "dark moody noir atmosphere, dramatic volumetric shadows" },
];

const COLORING_STYLES = [
  { label: "Bold & Clean", value: "bold thick black outlines, minimal tiny details, easy coloring" },
  { label: "Intricate (Adult)", value: "ultra-detailed fine black linework, complex intricate patterns" },
  { label: "Stained Glass", value: "stained glass segmented thick outlines, mosaic style" },
  { label: "Whimsical / Cute", value: "cute storybook illustration lines, charming and friendly" },
];

export default function ByokStudioPanel({
  studioType,
  onApplyFrontCover,
  onApplyFullCover,
  onAddToCanvas,
  onApplyColoringPage,
}: ByokStudioPanelProps) {
  const isCover = studioType === "cover";
  const [activeProvider, setActiveProvider] = useState<ByokProvider>("openai");
  const [keys, setKeys] = useState({ openai: "", gemini: "", stability: "" });
  const [currentKeyInput, setCurrentKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);

  // Generation states
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    imageUrl: string;
    prompt: string;
  } | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Sync keys from localStorage on mount & provider switch
  useEffect(() => {
    const loaded = loadByokKeys();
    setKeys(loaded);
    const existing = loaded[activeProvider];
    setCurrentKeyInput(existing);
    setIsKeySaved(Boolean(existing && existing.length > 5));
  }, [activeProvider]);

  const handleSaveKey = () => {
    if (!currentKeyInput.trim()) {
      removeByokKey(activeProvider);
      setKeys(prev => ({ ...prev, [activeProvider]: "" }));
      setIsKeySaved(false);
      return;
    }
    const updated = saveByokKey(activeProvider, currentKeyInput);
    setKeys(updated);
    setIsKeySaved(true);
    setActionFeedback("API Key saved securely in your browser!");
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleClearKey = () => {
    removeByokKey(activeProvider);
    setCurrentKeyInput("");
    setKeys(prev => ({ ...prev, [activeProvider]: "" }));
    setIsKeySaved(false);
  };

  const handleGenerate = async () => {
    const activeKey = keys[activeProvider] || currentKeyInput;
    if (!activeKey || activeKey.trim().length < 5) {
      setErrorMsg(`Please enter and save your ${getProviderInfo(activeProvider).name} API key first.`);
      return;
    }
    if (!prompt.trim()) {
      setErrorMsg("Please enter a text prompt to generate image.");
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const res = await fetch("/api/byok/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: activeProvider,
          apiKey: activeKey.trim(),
          prompt: prompt.trim(),
          studioType,
          stylePreset: selectedStyle,
          size: isCover ? "1024x1792" : "1024x1024",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Generation failed. Please verify your API key and quota.");
      }

      setGeneratedResult({
        imageUrl: data.imageUrl,
        prompt: prompt.trim(),
      });

      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch {
        // safe fallback
      }
    } catch (err: any) {
      console.error("BYOK Generation Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const providerInfo = getProviderInfo(activeProvider);
  const presets = isCover ? COVER_PROMPT_PRESETS : COLORING_PROMPT_PRESETS;
  const stylePresets = isCover ? COVER_STYLES : COLORING_STYLES;

  return (
    <div className="space-y-4 text-slate-800">
      {/* 1. Header & Provider Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-900">
              BYOK AI Generator
            </h3>
          </div>
          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Raw API Cost
          </span>
        </div>

        {/* Provider Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-black uppercase">
          {(["openai", "gemini", "stability"] as ByokProvider[]).map((p) => {
            const hasKey = Boolean(keys[p] && keys[p].length > 5);
            return (
              <button
                key={p}
                onClick={() => setActiveProvider(p)}
                className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeProvider === p
                    ? "bg-white shadow-sm text-slate-900 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{p === "openai" ? "OpenAI" : p === "gemini" ? "Gemini" : "Stability"}</span>
                {hasKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Key Active" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. API Key Management Box */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Key className="w-3 h-3 text-slate-400" /> {providerInfo.name} API Key
          </label>
          <a
            href={providerInfo.keyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
          >
            Get Key <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <input
              type={showKey ? "text" : "password"}
              value={currentKeyInput}
              onChange={(e) => setCurrentKeyInput(e.target.value)}
              placeholder={providerInfo.keyPlaceholder}
              className="w-full text-xs font-mono p-2 pr-7 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={handleSaveKey}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
            title="Save Key"
          >
            Save
          </button>
          {isKeySaved && (
            <button
              onClick={handleClearKey}
              className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
              title="Remove Key"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold pt-0.5">
          <span>{providerInfo.model} • {providerInfo.costEstimate}</span>
          {isKeySaved ? (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          ) : (
            <span className="text-amber-600 font-bold">Key required</span>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
          <Check className="w-3.5 h-3.5" /> {actionFeedback}
        </div>
      )}

      {/* 3. Prompt & Presets Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
          {isCover ? "Book Cover Concept Prompt" : "Coloring Page Prompt"}
        </label>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            isCover
              ? "e.g., A majestic white wolf overlooking a snow-capped mountain peak under aurora borealis, mystical fantasy lighting..."
              : "e.g., Cute baby dragon sitting on a pile of treasure and jewels, clean bold outlines, coloring book page..."
          }
          className="w-full text-xs font-medium p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 resize-none font-sans"
          rows={3}
        />

        {/* 1-Click Prompt Preset Pills */}
        <div className="space-y-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
            Quick Inspo Presets
          </span>
          <div className="flex flex-wrap gap-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setPrompt(preset.prompt)}
                className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:text-indigo-600 text-[9px] font-bold text-slate-600 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style Presets */}
        <div className="space-y-1 pt-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
            Artistic Style
          </span>
          <div className="flex flex-wrap gap-1">
            {stylePresets.map((st) => (
              <button
                key={st.label}
                onClick={() => setSelectedStyle(selectedStyle === st.value ? "" : st.value)}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                  selectedStyle === st.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating with {providerInfo.name}...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generate {isCover ? "Cover Artwork" : "Coloring Page"}</span>
          </>
        )}
      </button>

      {/* 4. Generated Artwork Preview & 1-Click Action Buttons */}
      {generatedResult && (
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Generated Successfully
            </span>
            <a
              href={generatedResult.imageUrl}
              download={`byok-${studioType}-${Date.now()}.png`}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Save PNG
            </a>
          </div>

          {/* Image Preview Box */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[3/4] bg-slate-900">
            <img
              src={generatedResult.imageUrl}
              alt="AI Generated result"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5 pt-1">
            {isCover && (
              <>
                {onApplyFrontCover && (
                  <button
                    onClick={() => {
                      onApplyFrontCover(generatedResult.imageUrl);
                      setActionFeedback("Applied as Front Cover Background!");
                      setTimeout(() => setActionFeedback(null), 3000);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <LayoutTemplate className="w-3.5 h-3.5" /> Set Front Cover Background
                  </button>
                )}

                {onApplyFullCover && (
                  <button
                    onClick={() => {
                      onApplyFullCover(generatedResult.imageUrl);
                      setActionFeedback("Applied as Full-Wrap Cover Background!");
                      setTimeout(() => setActionFeedback(null), 3000);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Layers className="w-3.5 h-3.5" /> Set Full Wrap Background
                  </button>
                )}

                {onAddToCanvas && (
                  <button
                    onClick={() => {
                      onAddToCanvas(generatedResult.imageUrl);
                      setActionFeedback("Added to canvas layer!");
                      setTimeout(() => setActionFeedback(null), 3000);
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add as Canvas Layer Graphic
                  </button>
                )}
              </>
            )}

            {!isCover && onApplyColoringPage && (
              <button
                onClick={() => {
                  onApplyColoringPage(generatedResult.imageUrl, generatedResult.prompt);
                  setActionFeedback("Loaded into 300 DPI Vector Coloring Studio!");
                  setTimeout(() => setActionFeedback(null), 3000);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" /> Open &amp; Color on Canvas (300 DPI)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
