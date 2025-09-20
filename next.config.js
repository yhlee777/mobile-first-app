/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 이미지 최적화 설정 (처음 준 거)
  images: {
    domains: [
      'localhost',
      'mobile-first-app-silk.vercel.app', 
      'vercel.app'
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1년 캐싱
    deviceSizes: [390, 414, 428], // iPhone 사이즈
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // 웹팩 설정 (번들 크기 최적화)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },

  // 압축 설정
  compress: true,
  poweredByHeader: false,
  
  // 실험적 기능
  experimental: {
    optimizeCss: true,
    scrollRestoration: true
  }
}

module.exports = nextConfig