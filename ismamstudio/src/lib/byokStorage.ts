"use client";

export type ByokProvider = "openai" | "gemini" | "stability";

export interface ByokKeys {
  openai: string;
  gemini: string;
  stability: string;
}

const STORAGE_KEY = "kdpage_byok_keys_v1";

export function loadByokKeys(): ByokKeys {
  if (typeof window === "undefined") {
    return { openai: "", gemini: "", stability: "" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { openai: "", gemini: "", stability: "" };
    const parsed = JSON.parse(raw);
    return {
      openai: typeof parsed.openai === "string" ? parsed.openai.trim() : "",
      gemini: typeof parsed.gemini === "string" ? parsed.gemini.trim() : "",
      stability: typeof parsed.stability === "string" ? parsed.stability.trim() : "",
    };
  } catch {
    return { openai: "", gemini: "", stability: "" };
  }
}

export function saveByokKey(provider: ByokProvider, key: string): ByokKeys {
  const current = loadByokKeys();
  const updated: ByokKeys = {
    ...current,
    [provider]: key.trim(),
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save BYOK key:", err);
    }
  }
  return updated;
}

export function removeByokKey(provider: ByokProvider): ByokKeys {
  const current = loadByokKeys();
  const updated: ByokKeys = {
    ...current,
    [provider]: "",
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to clear BYOK key:", err);
    }
  }
  return updated;
}

export function hasActiveKeyForProvider(provider: ByokProvider): boolean {
  const keys = loadByokKeys();
  return Boolean(keys[provider] && keys[provider].length > 5);
}

export function getProviderInfo(provider: ByokProvider): {
  name: string;
  model: string;
  costEstimate: string;
  keyUrl: string;
  keyPlaceholder: string;
} {
  switch (provider) {
    case "openai":
      return {
        name: "OpenAI",
        model: "DALL-E 3 / DALL-E 2",
        costEstimate: "~$0.02 - $0.04 / image",
        keyUrl: "https://platform.openai.com/api-keys",
        keyPlaceholder: "sk-...",
      };
    case "gemini":
      return {
        name: "Google Gemini",
        model: "Imagen 3 / Gemini 2.0",
        costEstimate: "~$0.03 / image",
        keyUrl: "https://aistudio.google.com/app/apikey",
        keyPlaceholder: "AIzaSy...",
      };
    case "stability":
      return {
        name: "Stability AI",
        model: "Stable Diffusion 3.5 & SDXL",
        costEstimate: "~$0.018 / image",
        keyUrl: "https://platform.stability.ai/account/keys",
        keyPlaceholder: "sk-...",
      };
  }
}
