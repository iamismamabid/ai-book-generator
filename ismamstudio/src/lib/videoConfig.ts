/**
 * Helper to extract a 11-character YouTube Video ID from any format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Raw 11-char ID (e.g. "VIDEO_ID")
 */
export function extractYouTubeId(urlOrId: string = ""): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();

  // Short link: https://youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Embed URL: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Direct 11-char ID
  const directMatch = trimmed.match(/^[a-zA-Z0-9_-]{11}$/);
  if (directMatch) return directMatch[0];

  return trimmed;
}

export const DEMO_YOUTUBE_VIDEO_ID =
  extractYouTubeId(process.env.NEXT_PUBLIC_DEMO_YOUTUBE_ID || "https://youtu.be/OCrO925cK1c");

export const getYouTubeEmbedUrl = (
  urlOrId: string = DEMO_YOUTUBE_VIDEO_ID,
  autoplay: boolean = false
): string => {
  const cleanId = extractYouTubeId(urlOrId);
  if (!cleanId) return "";
  return `https://www.youtube.com/embed/${cleanId}${autoplay ? "?autoplay=1&rel=0" : "?rel=0"}`;
};
