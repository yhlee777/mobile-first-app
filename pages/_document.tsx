// pages/_document.tsx 또는 app/layout.tsx의 <head>에 추가
// 이거 하나만 제대로 해도 90% 앱처럼 보임

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* 기본 메타 태그 */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* PWA 필수 */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        
        {/* iOS 완벽 대응 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ITDA" />
        
        {/* iOS 아이콘 (다양한 크기) */}
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        
        {/* iOS 스플래시 스크린 (모든 기기) */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-2048x2732.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1668x2388.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1536x2048.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1242x2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-828x1792.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1170x2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1284x2778.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        
        {/* Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* 스크롤 동작 최적화 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        
        {/* 전화번호 자동 감지 끄기 (의도치 않은 링크 방지) */}
        <meta name="format-detection" content="telephone=no" />
        
        {/* 주소 자동 감지 끄기 */}
        <meta name="format-detection" content="address=no" />
        
        {/* 이메일 자동 감지 끄기 */}
        <meta name="format-detection" content="email=no" />
        
        {/* 날짜 자동 감지 끄기 */}
        <meta name="format-detection" content="date=no" />
        
        {/* 검색엔진 최적화 */}
        <meta name="description" content="ITDA - 모바일 최적화 앱" />
        <meta name="keywords" content="ITDA, 소셜, 커뮤니티" />
        
        {/* Open Graph (카톡 공유 시) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ITDA" />
        <meta property="og:description" content="ITDA에서 새로운 경험을 시작하세요" />
        <meta property="og:image" content="https://mobile-first-app-silk.vercel.app/og-image.png" />
        <meta property="og:url" content="https://mobile-first-app-silk.vercel.app" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ITDA" />
        <meta name="twitter:description" content="ITDA에서 새로운 경험을 시작하세요" />
        <meta name="twitter:image" content="https://mobile-first-app-silk.vercel.app/og-image.png" />
        
        {/* 폰트 preload (성능 최적화) */}
        <link
          rel="preload"
          href="/fonts/Pretendard-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Pretendard-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* DNS Prefetch (API 서버) */}
        <link rel="dns-prefetch" href="https://api.itda.app" />
        <link rel="preconnect" href="https://api.itda.app" />
        
        {/* 중요한 CSS 인라인 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* 즉시 적용되어야 할 스타일 */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            html {
              /* iOS 100vh 문제 해결 */
              height: -webkit-fill-available;
            }
            
            body {
              min-height: 100vh;
              min-height: -webkit-fill-available;
              min-height: calc(var(--vh, 1vh) * 100);
              overscroll-behavior: none;
              -webkit-tap-highlight-color: transparent;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              user-select: none;
              font-family: -apple-system, BlinkMacSystemFont, Pretendard, 'Segoe UI', Roboto, sans-serif;
            }
            
            /* 입력 필드는 선택 가능하게 */
            input, textarea {
              -webkit-user-select: text;
              user-select: text;
            }
            
            /* iOS 안전 영역 대응 */
            .safe-top {
              padding-top: env(safe-area-inset-top);
            }
            
            .safe-bottom {
              padding-bottom: env(safe-area-inset-bottom);
            }
            
            /* 스크롤바 숨기기 */
            ::-webkit-scrollbar {
              display: none;
            }
            
            /* 로딩 스피너 */
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            
            .loading-spinner {
              width: 40px;
              height: 40px;
              border: 3px solid #f3f3f3;
              border-top: 3px solid #007AFF;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            
            /* 페이지 전환 애니메이션 */
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }
            
            @keyframes slideOutLeft {
              from {
                transform: translateX(0);
              }
              to {
                transform: translateX(-100%);
              }
            }
            
            .page-enter {
              animation: slideInRight 0.3s ease-out;
            }
            
            .page-exit {
              animation: slideOutLeft 0.3s ease-in;
            }
            
            /* 터치 시 하이라이트 효과 */
            .touchable {
              position: relative;
              overflow: hidden;
            }
            
            .touchable::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 0;
              height: 0;
              border-radius: 50%;
              background: rgba(0, 0, 0, 0.1);
              transform: translate(-50%, -50%);
              transition: width 0.3s, height 0.3s;
            }
            
            .touchable:active::after {
              width: 200%;
              height: 200%;
            }
          `
        }} />
        
        {/* 초기 로딩 스크립트 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // 다크모드 깜빡임 방지
            (function() {
              // 라이트 모드만 지원
              document.documentElement.classList.add('light');
              
              // viewport 높이 설정
              const setViewportHeight = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', vh + 'px');
              };
              
              setViewportHeight();
              window.addEventListener('resize', setViewportHeight);
              window.addEventListener('orientationchange', setViewportHeight);
              
              // 네트워크 상태 체크
              if (!navigator.onLine) {
                window.location.href = '/offline.html';
              }
            })();
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
        
        {/* 전역 에러 핸들링 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('error', function(e) {
              console.error('Global error:', e.error);
              // 에러 리포팅 서비스로 전송
            });
            
            window.addEventListener('unhandledrejection', function(e) {
              console.error('Unhandled promise rejection:', e.reason);
              // 에러 리포팅 서비스로 전송
            });
          `
        }} />
      </body>
    </Html>
  );
}