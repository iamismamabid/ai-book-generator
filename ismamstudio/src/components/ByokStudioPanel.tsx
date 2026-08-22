"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Key, Eye, EyeOff, Check, Trash2, ExternalLink,
  Loader2, Download, Plus, LayoutTemplate, Layers, AlertCircle,
  CheckCircle2, ChevronDown, ChevronUp, Settings2, Wand2
} from "lucide-react";
import { 
  ByokProvider, 
  loadByokKeys, 
  saveByokKey, 
  removeByokKey, 
  getProviderInfo,
  hasActiveKeyForProvider 
} from "@/lib/byokStorage";

interface ByokStudioPanelProps {
  studioType: "cover" | "coloring";
  onApplyFrontCover?: (imageUrl: string) => void;
  onApplyFullCover?: (imageUrl: string) => void;
  onAddToCanvas?: (imageUrl: string) => void;
  onApplyColoringPage?: (imageUrl: string, promptText: string) => void;
  initialCollapsed?: boolean;
}

const COVER_PROMPT_PRESETS = [
  { label: "Fantasy Dragon", prompt: "Epic dragon perched on ancient stone castle ruins, stormy twilight sky, volumetric lighting, rich cinematic digital art" },
  { label: "Sci-Fi City", prompt: "Futuristic neon cyberpunk city skyline at night, flying holographic vehicles, rainy streets with neon reflections, 8k" },
  { label: "Victorian Romance", prompt: "Elegant 19th-century vintage Victorian ballroom, soft romantic candlelight, ornate chandelier, oil painting texture" },
  { label: "Dark Forest", prompt: "Dark foggy forest road at midnight, mysterious silhouette under a solitary streetlamp, moody shadows, cinematic lighting" },
  { label: "Cozy Garden", prompt: "Charming countryside cottage garden with blooming sunflowers and lavender, soft pastel watercolor illustration" },
  { label: "Space Nebula", prompt: "Vibrant cosmic nebula, deep galaxy stars, swirling solar flares, majestic celestial planet, astronomical photography" },
];

const COLORING_PROMPT_PRESETS = [
  { label: "Mandala", prompt: "Intricate circular mandala pattern, sacred geometry, floral symmetry, fine outline line art, clean white background" },
  { label: "Jungle Animals", prompt: "Cute baby elephant, tiger cub and playful parrot surrounded by tropical palm leaves, clear outlines for coloring" },
  { label: "Botanical Flowers", prompt: "Detailed bouquet of wild peonies, roses, eucalyptus branches and butterflies, botanical line art, black outline" },
  { label: "Stained Glass", prompt: "Stained glass window design featuring a majestic flying owl under a crescent moon, thick segmented black lines" },
  { label: "Fairytale Cottage", prompt: "Whimsical fairytale cottage house with stone chimney, picket fence and climbing ivy garden, clean coloring page" },
  { label: "Under the Sea", prompt: "Magical coral reef underwater scene with sea turtle, clownfish, starfish and sea anemones, crisp line art" },
];

const COVER_STYLES = [
  { label: "Default", value: "" },
  { label: "Cinematic 3D", value: "cinematic 3d render, octane render, photorealistic" },
  { label: "Oil Painting", value: "rich textured oil on canvas, classical brushstrokes" },
  { label: "Digital Fantasy", value: "digital fantasy concept art, highly detailed" },
  { label: "Minimalist Vector", value: "clean modern minimalist vector illustration, bold contrast" },
  { label: "Dark Moody", value: "dark moody noir atmosphere, dramatic volumetric shadows" },
];

const COLORING_STYLES = [
  { label: "Default", value: "" },
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
  initialCollapsed = false,
}: ByokStudioPanelProps) {
  const isCover = studioType === "cover";
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [activeProvider, setActiveProvider] = useState<ByokProvider>("gemini");
  const [keys, setKeys] = useState({ openai: "", gemini: "", stability: "" });
  const [currentKeyInput, setCurrentKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);

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
    const hasKey = Boolean(existing && existing.length > 5);
    setIsKeySaved(hasKey);
    setIsEditingKey(!hasKey);
  }, [activeProvider]);

  const handleSaveKey = () => {
    if (!currentKeyInput.trim()) {
      removeByokKey(activeProvider);
      setKeys(prev => ({ ...prev, [activeProvider]: "" }));
      setIsKeySaved(false);
      setIsEditingKey(true);
      return;
    }
    const updated = saveByokKey(activeProvider, currentKeyInput);
    setKeys(updated);
    setIsKeySaved(true);
    setIsEditingKey(false);
    setActionFeedback("Saved!");
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleClearKey = () => {
    removeByokKey(activeProvider);
    setCurrentKeyInput("");
    setKeys(prev => ({ ...prev, [activeProvider]: "" }));
    setIsKeySaved(false);
    setIsEditingKey(true);
  };

  const handleGenerate = async () => {
    const activeKey = keys[activeProvider] || currentKeyInput;
    if (!activeKey || activeKey.trim().length < 5) {
      setErrorMsg(`Please enter and save your ${getProviderInfo(activeProvider).name} API key first.`);
      setIsEditingKey(true);
      return;
    }

    if (!prompt.trim()) {
      setErrorMsg("Please enter a concept prompt first.");
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/byok/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: activeProvider,
          apiKey: activeKey,
          prompt: prompt.trim(),
          style: selectedStyle,
          studioType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Generation failed. Please check your API key.");
      }

      setGeneratedResult({
        imageUrl: data.imageUrl,
        prompt: prompt.trim(),
      });
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const providerInfo = getProviderInfo(activeProvider);
  const presets = isCover ? COVER_PROMPT_PRESETS : COLORING_PROMPT_PRESETS;
  const stylePresets = isCover ? COVER_STYLES : COLORING_STYLES;

  return (
    <div className="space-y-2.5 text-slate-800 dark:text-slate-200">
      {/* 1. Header (Click to collapse/expand) */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1">
            BYOK AI Studio
          </h3>
          <span className="text-[8px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
            0% Markup
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isKeySaved ? (
            <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> Key Ready
            </span>
          ) : (
            <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded">
              Setup Key
            </span>
          )}
          <button type="button" className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 p-0.5">
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-2 pt-0.5">
          {/* Provider Tabs (Compact) */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg text-[9px] font-black uppercase">
            {(["openai", "gemini", "stability"] as ByokProvider[]).map((p) => {
              const hasKey = Boolean(keys[p] && keys[p].length > 5);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActiveProvider(p)}
                  className={`py-1 px-1.5 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeProvider === p
                      ? "bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <span>{p === "openai" ? "OpenAI" : p === "gemini" ? "Gemini" : "Stability"}</span>
                  {hasKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </button>
              );
            })}
          </div>

          {/* Key Management (Compact / Collapsible when saved) */}
          {!isEditingKey && isKeySaved ? (
            <div className="p-1.5 px-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between text-[9px]">
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-bold">{providerInfo.name}</span>
                <span className="text-slate-400 font-normal">({providerInfo.costEstimate})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingKey(true)}
                className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Settings2 className="w-2.5 h-2.5" /> Edit Key
              </button>
            </div>
          ) : (
            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Key className="w-2.5 h-2.5 text-slate-400" /> {providerInfo.name} API Key
                </span>
                <a
                  href={providerInfo.keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  Get Key <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="flex gap-1">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    value={currentKeyInput}
                    onChange={(e) => setCurrentKeyInput(e.target.value)}
                    placeholder={providerInfo.keyPlaceholder}
                    className="w-full text-[10px] font-mono py-1 px-2 pr-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 text-[10px] font-bold transition-all cursor-pointer"
                >
                  Save
                </button>
                {isKeySaved && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                    title="Remove Key"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {actionFeedback && (
            <div className="p-1 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> {actionFeedback}
            </div>
          )}

          {/* Prompt Textarea (Compact) */}
          <div className="space-y-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isCover
                  ? "e.g., Majestic white wolf on mountain peak under aurora borealis..."
                  : "e.g., Cute baby dragon sitting on treasure pile, clean bold outlines..."
              }
              className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 resize-none leading-tight"
              rows={2}
            />

            {/* Quick Inspo Horizontal Scrollable Mini Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider shrink-0">
                Inspo:
              </span>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPrompt(preset.prompt)}
                  className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-400 text-[8px] font-bold text-slate-600 dark:text-slate-300 shrink-0 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Style Selector (Compact Dropdown) */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider shrink-0">
                Style:
              </span>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full text-[9px] font-bold py-1 px-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {stylePresets.map((st) => (
                  <option key={st.label} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[10px] font-medium flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-tight">{errorMsg}</span>
            </div>
          )}

          {/* Generate Button (Slim) */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating ({providerInfo.name})...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate {isCover ? "Cover Artwork" : "Coloring Page"}</span>
              </>
            )}
          </button>

          {/* Generated Result Preview (Compact) */}
          {generatedResult && (
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[9px]">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
                <a
                  href={generatedResult.imageUrl}
                  download={`byok-${studioType}-${Date.now()}.png`}
                  className="font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-0.5"
                >
                  <Download className="w-2.5 h-2.5" /> Save PNG
                </a>
              </div>

              {/* Preview Thumbnail */}
              <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-h-36 aspect-video bg-slate-950 flex items-center justify-center">
                <img
                  src={generatedResult.imageUrl}
                  alt="AI Generated Preview"
                  className="max-h-36 w-full object-contain"
                />
              </div>

              {/* 1-Click Action Buttons */}
              <div className="space-y-1">
                {isCover ? (
                  <>
                    {onApplyFrontCover && (
                      <button
                        type="button"
                        onClick={() => {
                          onApplyFrontCover(generatedResult.imageUrl);
                          setActionFeedback("Applied Front Cover!");
                          setTimeout(() => setActionFeedback(null), 2500);
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <LayoutTemplate className="w-3 h-3" /> Set Front Cover BG
                      </button>
                    )}
                    {onApplyFullCover && (
                      <button
                        type="button"
                        onClick={() => {
                          onApplyFullCover(generatedResult.imageUrl);
                          setActionFeedback("Applied Full Wrap!");
                          setTimeout(() => setActionFeedback(null), 2500);
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Layers className="w-3 h-3" /> Set Full Wrap BG
                      </button>
                    )}
                  </>
                ) : (
                  onApplyColoringPage && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyColoringPage(generatedResult.imageUrl, generatedResult.prompt);
                        setActionFeedback("Loaded into Canvas!");
                        setTimeout(() => setActionFeedback(null), 2500);
                      }}
                      className="w-full py-2 px-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3 h-3" /> Open &amp; Color on Canvas (300 DPI)
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
