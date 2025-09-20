// next.config.js - 미친 최적화 설정
module.exports = {
  // 1. 이미지 최적화
  images: {
    domains: ['mobile-first-app-silk.vercel.app'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1년 캐싱
    deviceSizes: [390, 414, 428], // iPhone 사이즈만
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // 2. 번들 크기 줄이기
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Tree shaking 극대화
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // 불필요한 폴리필 제거
      config.resolve.alias = {
        ...config.resolve.alias,
        'lodash': 'lodash-es',
      };
    }
    return config;
  },

  // 3. 압축 극대화
  compress: true,
  poweredByHeader: false,
  
  // 4. 빌드 최적화
  swcMinify: true,
  reactStrictMode: true,
  
  // 5. 실험적 기능 활성화
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: ['lodash', 'date-fns'],
  },
};

// utils/performance.ts - 성능 모니터링
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  
  mark(name: string) {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (start && end) {
      const duration = end - start;
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
      
      // 느린 작업 경고
      if (duration > 100) {
        console.warn(`🐌 Slow operation: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      // 분석 서버로 전송
      this.sendMetrics(name, duration);
    }
  }
  
  private sendMetrics(name: string, duration: number) {
    // Google Analytics나 커스텀 서버로 전송
    if ('sendBeacon' in navigator) {
      const data = JSON.stringify({
        metric: name,
        value: duration,
        timestamp: Date.now(),
        url: window.location.href,
      });
      
      navigator.sendBeacon('/api/metrics', data);
    }
  }
}

// hooks/useVirtualScroll.tsx - 무한 스크롤 최적화
import { useCallback, useEffect, useRef, useState } from 'react';

export function useVirtualScroll(items: any[], itemHeight: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.ceil((scrollTop + containerHeight) / itemHeight);
    
    // 버퍼 추가 (스크롤 시 깜빡임 방지)
    const bufferSize = 5;
    setVisibleRange({
      start: Math.max(0, start - bufferSize),
      end: Math.min(items.length, end + bufferSize),
    });
  }, [items.length, itemHeight]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      requestAnimationFrame(updateVisibleRange);
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    updateVisibleRange();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateVisibleRange]);
  
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    visibleRange,
  };
}

// components/OptimizedList.tsx - 리스트 렌더링 최적화
export function OptimizedList({ items }: { items: any[] }) {
  const { containerRef, visibleItems, totalHeight, offsetY } = useVirtualScroll(items, 80);
  
  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={item.id} style={{ height: 80 }}>
              {/* 아이템 렌더링 */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// utils/preload.ts - 리소스 프리로딩
export class ResourcePreloader {
  private preloadedUrls = new Set<string>();
  
  // 이미지 프리로드
  preloadImage(url: string) {
    if (this.preloadedUrls.has(url)) return;
    
    const img = new Image();
    img.src = url;
    this.preloadedUrls.add(url);
  }
  
  // 다음 페이지 프리페치
  prefetchPage(url: string) {
    if (this.preloadedUrls.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    this.preloadedUrls.add(url);
  }
  
  // API 응답 프리페치
  async prefetchAPI(endpoint: string) {
    if (this.preloadedUrls.has(endpoint)) return;
    
    try {
      const response = await fetch(endpoint, { 
        method: 'GET',
        priority: 'low' as any,
      });
      
      // 캐시에 저장
      if ('caches' in window) {
        const cache = await caches.open('api-cache');
        cache.put(endpoint, response.clone());
      }
      
      this.preloadedUrls.add(endpoint);
    } catch (error) {
      console.error('Prefetch failed:', error);
    }
  }
  
  // 유저 행동 예측
  predictAndPreload() {
    // 스크롤 방향 감지
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      
      // 아래로 스크롤 중이면 다음 콘텐츠 프리로드
      if (scrollDirection === 'down') {
        // 다음 페이지 데이터 미리 가져오기
        this.prefetchAPI('/api/posts?page=2');
      }
      
      lastScrollY = currentScrollY;
    }, { passive: true });
    
    // 링크 호버 시 프리페치
    document.addEventListener('mouseover', (e) => {
      const link = (e.target as HTMLElement).closest('a');
      if (link?.href) {
        this.prefetchPage(link.href);
      }
    });
  }
}

// 초기화
const preloader = new ResourcePreloader();
preloader.predictAndPreload();