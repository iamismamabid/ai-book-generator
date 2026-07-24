const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname),

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
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.paddle.com https://*.clerk.accounts.dev https://clerk.kdpage.com https://*.clerk.com https://us-assets.i.posthog.com https://us.i.posthog.com https://va.vercel-scripts.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https://images.unsplash.com https://*.amazonaws.com https://grainy-gradients.vercel.app https://*.clerk.com https://img.clerk.com;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.kdpage.com https://us.i.posthog.com https://us-assets.i.posthog.com https://v2.paddle.com https://buy.paddle.com https://*.paddle.com https://*.amazonaws.com https://vitals.vercel-insights.com wss://*.clerk.accounts.dev;
      frame-src 'self' https://buy.paddle.com https://*.paddle.com https://*.clerk.accounts.dev https://*.clerk.com;
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
    ];
  },

  // ─── SEO: consolidate duplicate hub page into the canonical /tools ──────
  // /tools/free rendered the same ToolsClient as /tools with its own
  // self-referencing canonical, creating duplicate content. 301 to the
  // version that's actually linked from nav + sitemap so link equity
  // consolidates onto one URL instead of splitting across two.
  async redirects() {
    return [
      {
        source: "/tools/free",
        destination: "/tools",
        permanent: true,
      },
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

