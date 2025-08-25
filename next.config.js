const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;
