"use client";

export type ByokProvider = "openai" | "gemini" | "stability";

export interface ByokKeys {
  openai: string;
  gemini: string;
  stability: string;
}

const STORAGE_KEY = "kdpage_byok_keys_v1";
const ACTIVE_PROVIDER_KEY = "kdpage_byok_active_provider";

export function loadActiveProvider(): ByokProvider | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(ACTIVE_PROVIDER_KEY);
    if (saved === "openai" || saved === "gemini" || saved === "stability") {
      return saved;
    }
  } catch {}
  return null;
}

export function saveActiveProvider(provider: ByokProvider): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_PROVIDER_KEY, provider);
  } catch (err) {
    console.error("Failed to save active provider:", err);
  }
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  const clean = key.trim();
  if (clean === "env" || clean === "system") return "Environment Pre-configured";
  if (clean.length <= 8) return "••••••••";
  return `${clean.slice(0, 4)}••••${clean.slice(-4)}`;
}

export function loadByokKeys(): ByokKeys {
  if (typeof window === "undefined") {
    return { openai: "", gemini: "", stability: "" };
  }
  let keys: ByokKeys = { openai: "", gemini: "", stability: "" };
  let needsResave = false;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      keys = {
        openai: typeof parsed?.openai === "string" ? parsed.openai.trim() : "",
        gemini: typeof parsed?.gemini === "string" ? parsed.gemini.trim() : "",
        stability: typeof parsed?.stability === "string" ? parsed.stability.trim() : "",
      };
    }
  } catch {
    keys = { openai: "", gemini: "", stability: "" };
  }

  // Check redundant backup and legacy localStorage keys
  try {
    if (!keys.gemini) {
      const g = localStorage.getItem("kdpage_byok_gemini") || 
                localStorage.getItem("gemini_api_key") || 
                localStorage.getItem("GEMINI_API_KEY") ||
                localStorage.getItem("kdpage_gemini_key");
      if (g && g.trim().length > 5) {
        keys.gemini = g.trim();
        needsResave = true;
      }
    }
    if (!keys.openai) {
      const o = localStorage.getItem("kdpage_byok_openai") || 
                localStorage.getItem("openai_api_key") || 
                localStorage.getItem("OPENAI_API_KEY") ||
                localStorage.getItem("kdpage_openai_key");
      if (o && o.trim().length > 5) {
        keys.openai = o.trim();
        needsResave = true;
      }
    }
    if (!keys.stability) {
      const s = localStorage.getItem("kdpage_byok_stability") || 
                localStorage.getItem("stability_api_key") || 
                localStorage.getItem("STABILITY_API_KEY") ||
                localStorage.getItem("kdpage_stability_key");
      if (s && s.trim().length > 5) {
        keys.stability = s.trim();
        needsResave = true;
      }
    }
  } catch {}

  // If fallback keys were recovered, persist to main storage
  if (needsResave) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch {}
  }

  return keys;
}

export function saveByokKey(provider: ByokProvider, key: string): ByokKeys {
  const current = loadByokKeys();
  const trimmed = key.trim();
  const updated: ByokKeys = {
    ...current,
    [provider]: trimmed,
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Redundant individual key backup to guarantee no key loss
      localStorage.setItem(`kdpage_byok_${provider}`, trimmed);
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
      localStorage.removeItem(`kdpage_byok_${provider}`);
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
