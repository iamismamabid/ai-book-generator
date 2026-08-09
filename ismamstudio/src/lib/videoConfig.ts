/**
 * Configuration for YouTube Video Walkthrough & Demo Embeds
 * Replace NEXT_PUBLIC_DEMO_YOUTUBE_ID in .env.local or update default ID below
 */
export const DEMO_YOUTUBE_VIDEO_ID =
  process.env.NEXT_PUBLIC_DEMO_YOUTUBE_ID || "L_LUpnjgPso";

export const getYouTubeEmbedUrl = (videoId: string = DEMO_YOUTUBE_VIDEO_ID, autoplay: boolean = false) => {
  return `https://www.youtube.com/embed/${videoId}${autoplay ? "?autoplay=1&rel=0" : "?rel=0"}`;
};
