import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://4ae7cyrl9i.ufs.sh/**')],
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'lodash'],
  },
  // Enable static generation for better performance
  output: 'standalone',
  // Optimize bundle size
  swcMinify: true,
  // Enable compression
  compress: true,
};

export default nextConfig;
