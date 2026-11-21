import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // "/" has no page of its own. Redirecting here, before rendering, keeps it out of
  // Cache Components' instant-navigation validation.
  async redirects() {
    return [{ source: '/', destination: '/overview', permanent: false }];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
