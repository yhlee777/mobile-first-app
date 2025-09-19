const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

async function generateIcons() {
  const inputPath = path.join(__dirname, '../public/logo.png')
  const outputDir = path.join(__dirname, '../public/icons')

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 각 사이즈별 아이콘 생성 (패딩 최소화)
  for (const size of sizes) {
    // 로고를 95%까지 크게 (패딩 5%만)
    const logoSize = Math.round(size * 0.95)
    const padding = Math.round((size - logoSize) / 2)
    
    await sharp(inputPath)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    
    console.log(`✅ Generated icon-${size}x${size}.png`)
  }

  console.log('🎉 모든 아이콘 생성 완료!')
}

generateIcons()