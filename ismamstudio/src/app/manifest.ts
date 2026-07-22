import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Book Generator & KDP Studio',
    short_name: 'AI Book Studio',
    description: 'Create AI Manuscripts, Vector Puzzles, and KDP Covers',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f19',
    theme_color: '#f59e0b',
    icons: [
      {
        src: '/logo_transparent.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo_transparent.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
