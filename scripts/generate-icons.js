const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 기본 SVG 아이콘 생성
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#51a66f"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="280" font-weight="bold" text-anchor="middle" fill="white">IM</text>
</svg>
`;

const sizes = [
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
  // iOS 전용 아이콘
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-167x167.png', size: 167 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
];

async function generateIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  
  // icons 디렉토리 생성
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // SVG를 PNG로 변환
  const svgBuffer = Buffer.from(svgIcon);
  
  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, name));
    
    console.log(`✅ Generated ${name}`);
  }

  // iOS 스플래시 스크린 생성
  const splashSizes = [
    { name: 'apple-splash-1125x2436.png', width: 1125, height: 2436 }, // iPhone X
    { name: 'apple-splash-1242x2688.png', width: 1242, height: 2688 }, // iPhone XS Max
    { name: 'apple-splash-828x1792.png', width: 828, height: 1792 },   // iPhone XR
    { name: 'apple-splash-1170x2532.png', width: 1170, height: 2532 }, // iPhone 12/13
  ];

  for (const { name, width, height } of splashSizes) {
    const splash = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#51a66f"/>
        <circle cx="${width/2}" cy="${height/2}" r="100" fill="white"/>
        <text x="${width/2}" y="${height/2 + 20}" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="#51a66f">IM</text>
      </svg>
    `;
    
    await sharp(Buffer.from(splash))
      .png()
      .toFile(path.join(iconsDir, name));
    
    console.log(`✅ Generated ${name}`);
  }

  console.log('\n🎉 모든 아이콘 생성 완료!');
}

generateIcons().catch(console.error);