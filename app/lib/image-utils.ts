/**
 * 이미지를 Canvas를 사용하여 압축
 * @param base64String Base64 인코딩된 이미지 데이터
 * @param maxWidth 최대 너비 (기본값: 300)
 * @param maxHeight 최대 높이 (기본값: 300)
 * @param quality 압축 품질 (기본값: 0.8, 0~1)
 * @returns 압축된 Base64 이미지
 */
export async function compressImage(
  base64String: string,
  maxWidth: number = 300,
  maxHeight: number = 300,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 비율 유지하면서 최대 크기 제한
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }

      // JPEG 형식으로 압축
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.src = base64String;
  });
}
