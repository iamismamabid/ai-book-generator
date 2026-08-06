// Feature visibility flags.
//
// AI_FEATURES_ENABLED gates the AI Novel Outline / Chapter Writer (the
// /generate route) and every entry point that advertises it. AppSumo's
// listing requirements exclude AI-branded functionality, so this stays off.
//
// This used to be inferred from whether NEXT_PUBLIC_PADDLE_CLIENT_TOKEN was
// set, which coupled AI visibility to payment configuration -- the AI writer
// would silently reappear in any environment where that token was missing.
// It's an explicit constant now so the behaviour can't drift with env config.
//
// Set to true to bring the AI Book Generator back.
export const AI_FEATURES_ENABLED = false;

// True for a plan/tier bullet that advertises AI. Matches "AI" as a standalone
// word so both "AI Outlines" and "AI Book Chapters" are caught, without false
// positives on words like "available" or "email".
export const isAiFeature = (feature: string) => /\bAI\b/.test(feature);

// Drops AI-branded bullets from a feature list while AI features are hidden.
export const visibleFeatures = (features: string[]) =>
  AI_FEATURES_ENABLED ? features : features.filter((f) => !isAiFeature(f));
