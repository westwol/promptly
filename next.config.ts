import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://4ae7cyrl9i.ufs.sh/**')],
  },
  /* config options here */
};

export default nextConfig;
