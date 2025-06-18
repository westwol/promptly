import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://4ae7cyrl9i.ufs.sh/**')],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'lodash'],
  },
  compress: true,
};

export default nextConfig;
