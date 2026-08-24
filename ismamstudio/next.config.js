const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Performance & Compression Tuning ──────────────────────────────────────
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'lodash',
      'framer-motion',
      '@clerk/nextjs',
      'canvas-confetti'
    ],
  },

  // ─── Strip console.log in production builds ───────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // ─── Image optimization config (KDP export quality) ──────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },

  // ─── Webpack: bundle analyzer (dev-only) ─────────────────────────────────
  webpack(config, { isServer }) {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }
    return config;
  },

  // ─── PostHog reverse proxy (avoids ad blockers) ──────────────────────────
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  // ─── Security headers (applied to every route) ───────────────────────────
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.paddle.com https://public.profitwell.com https://*.clerk.accounts.dev https://clerk.kdpage.com https://*.clerk.com https://challenges.cloudflare.com https://us-assets.i.posthog.com https://us.i.posthog.com https://va.vercel-scripts.com https://www.googletagmanager.com https://*.google-analytics.com https://*.googleadservices.com https://*.doubleclick.net https://*.trustpilot.com https://*.partnero.com https://embed.tawk.to https://*.tawk.to https://cdn.jsdelivr.net https://www.clarity.ms https://*.clarity.ms https://scripts.clarity.ms;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.paddle.com https://*.tawk.to;
      img-src 'self' data: blob: https://images.unsplash.com https://*.amazonaws.com https://grainy-gradients.vercel.app https://*.clerk.com https://img.clerk.com https://www.googletagmanager.com https://*.google.com https://*.google.com.bd https://*.doubleclick.net https://*.trustpilot.com https://*.trustpilot.net https://*.partnero.com https://*.tawk.to https://tawk.link https://*.clarity.ms https://c.bing.com;
      font-src 'self' data: https://fonts.gstatic.com https://*.tawk.to;
      connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.kdpage.com https://challenges.cloudflare.com https://us.i.posthog.com https://us-assets.i.posthog.com https://v2.paddle.com https://buy.paddle.com https://*.paddle.com https://*.amazonaws.com https://vitals.vercel-insights.com wss://*.clerk.accounts.dev https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com https://*.doubleclick.net https://*.trustpilot.com https://*.partnero.com https://*.tawk.to wss://*.tawk.to https://*.clarity.ms https://c.bing.com https://*.bing.com;
      frame-src 'self' https://buy.paddle.com https://*.paddle.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://www.googletagmanager.com https://*.trustpilot.com https://www.youtube.com https://www.youtube-nocookie.com https://*.tawk.to;
      worker-src 'self' blob:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'self';
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          // Prevent our pages being framed by other origins (clickjacking).
          // SAMEORIGIN — not DENY — because Paddle/Clerk overlays are framed
          // BY our page, which this does not affect; it only controls who may
          // frame US.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stop browsers MIME-sniffing responses away from declared type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send origin (not full path) on cross-origin navigations.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable powerful features no tool uses; camera left on for self
          // in case OCR/scan tools ever call getUserMedia.
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), browsing-topics=()",
          },
        ],
      },
      {
        source: "/:path*.(png|jpg|jpeg|gif|webp|avif|ico|svg|woff|woff2|ttf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ─── SEO: consolidate duplicate hub page into the canonical /tools ──────
  async redirects() {
    return [
      { source: "/kdp-formatting-guide", destination: "/kdp-checklist", permanent: true },
      { source: "/tools/free", destination: "/tools", permanent: true },
      { source: "/tools/kdp-spine-calculator", destination: "/tools/spine-calculator", permanent: true },
      { source: "/tools/kdp-spine-width-calculator", destination: "/tools/spine-calculator", permanent: true },
      { source: "/tools/free-kdp-spine-calculator", destination: "/tools/spine-calculator", permanent: true },
      { source: "/tools/book-spine-calculator", destination: "/tools/spine-calculator", permanent: true },
      { source: "/tools/kdp-isbn-barcode-generator", destination: "/tools/isbn-generator", permanent: true },
      { source: "/tools/free-isbn-barcode-generator", destination: "/tools/isbn-generator", permanent: true },
      { source: "/tools/book-barcode-generator", destination: "/tools/isbn-generator", permanent: true },
      { source: "/tools/kdp-keyword-research", destination: "/tools/keyword-research", permanent: true },
      { source: "/tools/free-kdp-keyword-research", destination: "/tools/keyword-research", permanent: true },
      { source: "/tools/amazon-kdp-keywords", destination: "/tools/keyword-research", permanent: true },
      { source: "/tools/kdp-royalty-calculator", destination: "/tools/royalty-estimator", permanent: true },
      { source: "/tools/free-kdp-royalty-calculator", destination: "/tools/royalty-estimator", permanent: true },
      { source: "/tools/amazon-royalty-calculator", destination: "/tools/royalty-estimator", permanent: true },
      { source: "/tools/kdp-print-cost-calculator", destination: "/tools/print-cost-calculator", permanent: true },
      { source: "/tools/amazon-kdp-printing-cost", destination: "/tools/print-cost-calculator", permanent: true },
      { source: "/tools/kdp-pdf-validator", destination: "/tools/kdp-file-validator", permanent: true },
      { source: "/tools/free-kdp-pdf-checker", destination: "/tools/kdp-file-validator", permanent: true },
      { source: "/tools/kdp-sudoku-generator", destination: "/sudoku", permanent: true },
      { source: "/tools/free-sudoku-generator", destination: "/sudoku", permanent: true },
      { source: "/tools/kdp-maze-generator", destination: "/maze", permanent: true },
      { source: "/tools/free-maze-generator", destination: "/maze", permanent: true },
    ];
  },

  // ─── Delegate TypeScript & ESLint checks to GitHub Actions CI ───────────
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
