import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack ને ફરજિયાત બંધ કરવા માટે આ લાઇન ઉમેરી છે
  turbo: {
    rules: {},
  },
  webpack: (config) => {
    return config;
  },
};

export default withPWA(nextConfig);