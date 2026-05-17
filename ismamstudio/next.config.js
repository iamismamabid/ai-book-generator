/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone', // <--- এই লাইনটি অবশ্যই যোগ করুন
};

module.exports = nextConfig;
