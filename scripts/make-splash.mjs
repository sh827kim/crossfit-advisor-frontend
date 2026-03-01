import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function createSplashIcon() {
  const logoBuffer = fs.readFileSync('./public/logo-splash.svg');

  // Android 12 스플래시 아이콘 권장 규격 (1:1 정사각형)
  // 너무 커서 잘리지 않도록 안전 영역에 맞춰 너비 320 정도로 리사이즈
  const resizedLogo = await sharp(logoBuffer)
    .resize({ width: 320 })
    .toBuffer();

  const outPath = path.resolve('./android/app/src/main/res/drawable/splash_icon.png');

  // 투명한 512x512 정사각형 캔버스를 만들고, 그 정중앙에 로고를 박습니다.
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 } // 투명!
    }
  })
    .composite([
      { input: resizedLogo, gravity: 'centre' }
    ])
    .png()
    .toFile(outPath);

  console.log('✅ 안드로이드 전용 스플래시 아이콘(splash_icon.png) 생성 완료!');
}

createSplashIcon().catch(console.error);
