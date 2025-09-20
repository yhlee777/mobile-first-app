// components/MobileOptimizations.tsx
// 이걸 웹앱의 _app.tsx나 레이아웃에 추가하면 앱처럼 동작함

import { useEffect, useRef, useState } from 'react';

export function MobileOptimizations() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. 고무줄 효과 제거 (iOS 필수!)
    document.body.style.overscrollBehavior = 'none';
    
    // 2. 100vh 문제 해결 (iOS 주소창 때문에 레이아웃 깨지는 거)
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // 3. 텍스트 선택 방지 (네이티브 앱처럼)
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.webkitTouchCallout = 'none';

    // 4. 탭 하이라이트 제거
    document.body.style.webkitTapHighlightColor = 'transparent';

    // 5. 스와이프 제스처 (뒤로가기)
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].clientX;
      const swipeThreshold = 50;
      
      // 왼쪽에서 오른쪽 스와이프 = 뒤로가기
      if (touchStartX < 20 && touchEndX > touchStartX + swipeThreshold) {
        if (window.history.length > 1) {
          window.history.back();
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    // 6. PWA 설치 프롬프트 캐치
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    // 7. Standalone 모드 체크
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')
    );

    // 8. 페이지 전환 시 스크롤 위치 저장
    const saveScrollPosition = () => {
      sessionStorage.setItem(
        `scroll-${window.location.pathname}`,
        window.scrollY.toString()
      );
    };
    
    window.addEventListener('beforeunload', saveScrollPosition);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, []);

  // PWA 설치 배너 (스마트하게 보여주기)
  if (installPrompt && !isStandalone) {
    setTimeout(() => {
      if (confirm('앱으로 설치하시면 더 빠르게 사용할 수 있어요!')) {
        installPrompt.prompt();
      }
    }, 30000); // 30초 후에 물어봄
  }

  return null;
}

// hooks/useHaptic.ts
// 햅틱 피드백 (진동) - 진짜 앱같은 느낌
export function useHaptic() {
  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return {
    light: () => vibrate(10),
    medium: () => vibrate(20),
    heavy: () => vibrate(30),
    success: () => vibrate([10, 10, 10]),
    warning: () => vibrate([20, 10, 20]),
    error: () => vibrate([30, 10, 30, 10, 30]),
  };
}

// components/OptimizedImage.tsx
// 이미지 최적화 - 모바일에서 겁나 빨라짐
export function OptimizedImage({ src, alt, ...props }: any) {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} style={{ minHeight: 200, background: '#f0f0f0' }}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}

// utils/storage.ts
// 오프라인 데이터 캐싱 (네트워크 없어도 작동)
class OfflineStorage {
  private dbName = 'itda-offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('posts')) {
          db.createObjectStore('posts', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('user')) {
          db.createObjectStore('user', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async save(store: string, data: any) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([store], 'readwrite');
    const objectStore = transaction.objectStore(store);
    
    return new Promise((resolve, reject) => {
      const request = objectStore.put({
        ...data,
        timestamp: Date.now(),
      });
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(store: string, key: string) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([store], 'readonly');
    const objectStore = transaction.objectStore(store);
    
    return new Promise((resolve, reject) => {
      const request = objectStore.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        
        // 24시간 이상 오래된 데이터는 무시
        if (result && Date.now() - result.timestamp > 86400000) {
          resolve(null);
        } else {
          resolve(result);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async clearOldData() {
    if (!this.db) await this.init();
    
    const stores = ['posts', 'user', 'cache'];
    const cutoff = Date.now() - 86400000; // 24시간
    
    for (const store of stores) {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          if (cursor.value.timestamp < cutoff) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }
  }
}

export const offlineStorage = new OfflineStorage();

// hooks/useNetworkStatus.ts
// 네트워크 상태 실시간 감지
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [networkType, setNetworkType] = useState<string>('unknown');
  const [effectiveType, setEffectiveType] = useState<string>('unknown');

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 네트워크 정보 가져오기
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      setNetworkType(connection.type || 'unknown');
      setEffectiveType(connection.effectiveType || 'unknown');
      
      connection.addEventListener('change', () => {
        setNetworkType(connection.type || 'unknown');
        setEffectiveType(connection.effectiveType || 'unknown');
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, networkType, effectiveType };
}

// components/PullToRefresh.tsx
// Pull to Refresh (인스타그램처럼)
export function PullToRefresh({ onRefresh, children }: any) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const haptic = useHaptic();

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (startY.current === 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance > 0 && distance < 150) {
      setPullDistance(distance);
      
      if (distance > 80 && !isPulling) {
        haptic.light();
        setIsPulling(true);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling) {
      haptic.success();
      await onRefresh();
    }
    
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling]);

  return (
    <div style={{ position: 'relative' }}>
      {pullDistance > 0 && (
        <div
          style={{
            position: 'absolute',
            top: -40,
            left: '50%',
            transform: `translateX(-50%) translateY(${Math.min(pullDistance, 100)}px)`,
            transition: isPulling ? 'none' : 'transform 0.3s',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '2px solid #007AFF',
              borderTopColor: 'transparent',
              animation: isPulling ? 'spin 1s linear infinite' : 'none',
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
}