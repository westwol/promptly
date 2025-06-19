import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://4ae7cyrl9i.ufs.sh/**')],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'lodash'],
  },
  compress: true,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/chat',
      },
      {
        source: '/chat/:path*',
        destination: '/chat',
      },
    ];
  },
};

export default nextConfig;
