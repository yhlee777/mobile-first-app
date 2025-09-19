const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// iOS는 자동으로 둥근 모서리를 추가하므로 정사각형 아이콘 사용
// 여백 없이 꽉 채워서 생성
async function generateAppleIcons() {
  const inputPath = path.join(__dirname, '../public/logo.png')
  const outputDir = path.join(__dirname, '../public')

  // iOS용 사이즈 (여백 없이)
  const sizes = [
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 152, name: 'apple-touch-icon-152.png' },
    { size: 120, name: 'apple-touch-icon-120.png' }
  ]

  for (const { size, name } of sizes) {
    // 로고를 100% 크기로 (여백 없음)
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(path.join(outputDir, name))
    
    console.log(`✅ Generated ${name} (${size}x${size})`)
  }

  console.log('🎉 iOS 아이콘 생성 완료!')
}

generateAppleIcons()