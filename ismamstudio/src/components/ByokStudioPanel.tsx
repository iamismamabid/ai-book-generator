"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Key, Eye, EyeOff, Check, Trash2, ExternalLink,
  Loader2, Download, Plus, LayoutTemplate, Layers, AlertCircle,
  CheckCircle2, ChevronDown, ChevronUp, Settings2, Wand2, Image as ImageIcon
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
  { label: "Default (Natural Prompt)", value: "" },
  { label: "Cinematic 3D Render", value: "cinematic 3d render, octane render, photorealistic" },
  { label: "Classical Oil Painting", value: "rich textured oil on canvas, classical brushstrokes" },
  { label: "Digital Fantasy Art", value: "digital fantasy concept art, highly detailed" },
  { label: "Modern Minimalist Vector", value: "clean modern minimalist vector illustration, bold contrast" },
  { label: "Dark Moody Noir", value: "dark moody noir atmosphere, dramatic volumetric shadows" },
];

const COLORING_STYLES = [
  { label: "Default (Clean Vector)", value: "" },
  { label: "Bold & Clean Outlines", value: "bold thick black outlines, minimal tiny details, easy coloring" },
  { label: "Intricate Line Art (Adult)", value: "ultra-detailed fine black linework, complex intricate patterns" },
  { label: "Stained Glass Mosaic", value: "stained glass segmented thick outlines, mosaic style" },
  { label: "Whimsical Storybook", value: "cute storybook illustration lines, charming and friendly" },
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
    setActionFeedback("API Key saved successfully!");
    setTimeout(() => setActionFeedback(null), 3000);
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
          stylePreset: selectedStyle,
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
    <div className="space-y-4 text-slate-800 dark:text-slate-200">
      {/* 1. Header with Badge & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white leading-none">
              BYOK AI Studio
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Direct AI Generation • 0% Markup
            </p>
          </div>
        </div>

        {isKeySaved ? (
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Key Ready
          </span>
        ) : (
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
            Setup Key
          </span>
        )}
      </div>

      {/* 2. Provider Selection Tabs */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
          Select AI Provider
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {(["openai", "gemini", "stability"] as ByokProvider[]).map((p) => {
            const hasKey = Boolean(keys[p] && keys[p].length > 5);
            const isSelected = activeProvider === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setActiveProvider(p)}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{p === "openai" ? "OpenAI" : p === "gemini" ? "Gemini" : "Stability"}</span>
                {hasKey && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Key Configured" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. API Key Card */}
      {!isEditingKey && isKeySaved ? (
        <div className="p-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {providerInfo.name} Connected
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingKey(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" /> Edit Key
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Model: {providerInfo.model}</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{providerInfo.costEstimate}</span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" /> {providerInfo.name} API Key
            </span>
            <a
              href={providerInfo.keyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Get Free Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={currentKeyInput}
                onChange={(e) => setCurrentKeyInput(e.target.value)}
                placeholder={providerInfo.keyPlaceholder}
                className="w-full text-xs font-mono py-2 px-3 pr-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveKey}
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              Save Key
            </button>
            {isKeySaved && (
              <button
                type="button"
                onClick={handleClearKey}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 transition-all cursor-pointer shrink-0"
                title="Remove Key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            🔒 Stored securely in your browser&apos;s localStorage only. Never sent to our servers.
          </p>
        </div>
      )}

      {actionFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> {actionFeedback}
        </div>
      )}

      {/* 4. Prompt Input Form */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Concept / Prompt Description
          </label>
          {prompt.trim() && (
            <button
              type="button"
              onClick={() => setPrompt("")}
              className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            isCover
              ? "e.g., Majestic white wolf standing on a misty mountain peak under vibrant aurora borealis, cinematic lighting, 8k..."
              : "e.g., Cute baby dragon resting on a treasure chest, detailed clean outlines, pure white background..."
          }
          className="w-full text-xs sm:text-sm p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 resize-none leading-relaxed shadow-xs transition-all"
          rows={3}
        />

        {/* Inspo Prompt Presets */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Quick Inspo Ideas:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setPrompt(preset.prompt)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style Selector */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Artistic Style Preset
          </label>
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="w-full text-xs font-semibold py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-400 text-slate-800 dark:text-slate-200 cursor-pointer shadow-xs"
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
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* 5. Primary Generate CTA */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            <span>Generating with {providerInfo.name}...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 text-slate-950" />
            <span>Generate {isCover ? "Cover Artwork" : "Coloring Page"}</span>
          </>
        )}
      </button>

      {/* 6. Generated Artwork Result Card */}
      {generatedResult && (
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 shadow-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Artwork Generated
            </span>
            <a
              href={generatedResult.imageUrl}
              download={`byok-${studioType}-${Date.now()}.png`}
              className="font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 text-xs"
            >
              <Download className="w-3.5 h-3.5" /> Save PNG
            </a>
          </div>

          {/* High-Res Preview */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center max-h-52 aspect-video">
            <img
              src={generatedResult.imageUrl}
              alt="AI Generated Artwork"
              className="max-h-52 w-full object-contain"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {isCover ? (
              <>
                {onApplyFrontCover && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyFrontCover(generatedResult.imageUrl);
                      setActionFeedback("Applied as Front Cover!");
                      setTimeout(() => setActionFeedback(null), 3000);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <LayoutTemplate className="w-4 h-4" /> Set as Front Cover Background
                  </button>
                )}
                {onApplyFullCover && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyFullCover(generatedResult.imageUrl);
                      setActionFeedback("Applied as Full Cover Wrap!");
                      setTimeout(() => setActionFeedback(null), 3000);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Layers className="w-4 h-4" /> Set as Full Wrap Cover Background
                  </button>
                )}
                {onAddToCanvas && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCanvas(generatedResult.imageUrl);
                      setActionFeedback("Added to Canvas Layer!");
                      setTimeout(() => setActionFeedback(null), 3000);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add to Canvas as Overlay Layer
                  </button>
                )}
              </>
            ) : (
              onApplyColoringPage && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyColoringPage(generatedResult.imageUrl, generatedResult.prompt);
                    setActionFeedback("Loaded into Canvas Editor!");
                    setTimeout(() => setActionFeedback(null), 3000);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Open &amp; Color on Canvas (300 DPI)
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
