// CommonJS 환경에서도 동작하도록 dynamic import 사용 (eslint no-require-imports 대응)

// SVG 생성 함수
function generateIconSVG(size) {
  const mid = size / 2;

  // 안쪽 원판 (더 큼)
  const innerPlateWidth = size * 0.12;
  const innerPlateHeight = size * 0.25;

  // 바깥쪽 원판 (더 작음)
  const outerPlateWidth = size * 0.08;
  const outerPlateHeight = size * 0.22;

  const gap = size * 0.003; // 아주 작은 간격
  const barWidth = size * 0.28;
  const barX = (size - barWidth) / 2; // 중앙 정렬
  const barRight = barX + barWidth;

  // 대칭 배치
  const rightInnerX = barRight + gap;
  const rightOuterX = rightInnerX + innerPlateWidth + gap;
  const leftInnerX = barX - gap - innerPlateWidth;
  const leftOuterX = leftInnerX - gap - outerPlateWidth;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1E40AF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563EB;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- 그라데이션 배경 -->
  <rect width="${size}" height="${size}" fill="url(#blueGrad)"/>

  <!-- 덤벨 그룹 -->
  <g filter="url(#shadow)">
    <!-- 왼쪽 바깥쪽 원판 (더 작음) -->
    <rect x="${leftOuterX}" y="${mid - outerPlateHeight/2}" width="${outerPlateWidth}" height="${outerPlateHeight}" fill="white" rx="${size * 0.02}"/>

    <!-- 왼쪽 안쪽 원판 (더 큼) -->
    <rect x="${leftInnerX}" y="${mid - innerPlateHeight/2}" width="${innerPlateWidth}" height="${innerPlateHeight}" fill="white" rx="${size * 0.02}"/>

    <!-- 중앙 손잡이 -->
    <rect x="${barX}" y="${mid - size * 0.035}" width="${barWidth}" height="${size * 0.07}" fill="white" rx="${size * 0.035}"/>

    <!-- 오른쪽 안쪽 원판 (더 큼) -->
    <rect x="${rightInnerX}" y="${mid - innerPlateHeight/2}" width="${innerPlateWidth}" height="${innerPlateHeight}" fill="white" rx="${size * 0.02}"/>

    <!-- 오른쪽 바깥쪽 원판 (더 작음) -->
    <rect x="${rightOuterX}" y="${mid - outerPlateHeight/2}" width="${outerPlateWidth}" height="${outerPlateHeight}" fill="white" rx="${size * 0.02}"/>
  </g>
</svg>`;
}

async function generateIcons() {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { default: sharp } = await import('sharp');
  const sizes = [192, 512];
  const publicDir = path.join(__dirname, '../public');

  for (const size of sizes) {
    const svgContent = generateIconSVG(size);
    const svgPath = path.join(publicDir, `icon-${size}x${size}.svg`);
    const pngPath = path.join(publicDir, `icon-${size}x${size}.png`);

    // SVG 파일 생성
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ Generated SVG: ${svgPath}`);

    // SVG를 PNG로 변환
    try {
      await sharp(Buffer.from(svgContent))
        .png()
        .toFile(pngPath);
      console.log(`✅ Generated PNG: ${pngPath}`);
    } catch (error) {
      console.error(`❌ Error converting SVG to PNG for ${size}x${size}:`, error.message);
    }
  }

  console.log('\n✨ PWA 아이콘이 성공적으로 생성되었습니다!');
}

generateIcons().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
