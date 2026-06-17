import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // તારા બીજા કોઈ એક્ઝિસ્ટિંગ કન્ફિગરેશન હોય તો અહીં રાખવા
};

export default withPWA(nextConfig);