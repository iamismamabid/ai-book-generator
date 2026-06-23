const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // <--- এই লাইনটি অবশ্যই যোগ করুন
  outputFileTracingRoot: path.resolve(__dirname),
};

module.exports = nextConfig;
