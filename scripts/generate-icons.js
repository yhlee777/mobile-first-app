const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

async function generateIcons() {
  const inputPath = path.join(__dirname, '../public/logo.png')
  const outputDir = path.join(__dirname, '../public/icons')

  // icons 폴더 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 각 사이즈별 아이콘 생성
  for (const size of sizes) {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    
    console.log(`✅ Generated icon-${size}x${size}.png`)
  }

  console.log('🎉 모든 아이콘 생성 완료!')
}

generateIcons()