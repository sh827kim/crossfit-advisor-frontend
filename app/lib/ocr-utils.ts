/**
 * OCR 관련 유틸리티 함수
 * - 이미지 파일 검증
 * - 파일 변환
 *
 * 주의: 이미지 처리는 백엔드 Google Vision API에서 수행
 */

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (Google Vision API 제한)

/**
 * 파일 유효성 검증
 * @param file 검증할 파일
 * @throws Error 유효하지 않은 파일
 */
export function validateImageFile(file: File): void {
  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('이미지 크기는 10MB 이하여야 합니다.');
  }

  // 파일 타입 검증
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드 가능합니다.');
  }
}

/**
 * 이미지를 Base64 데이터 URL로 변환
 * @param file 변환할 이미지 파일
 * @returns Base64 데이터 URL
 */
export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('파일 읽기 실패'));
      }
    };

    reader.onerror = () => {
      reject(new Error('파일 읽기 중 오류 발생'));
    };

    reader.readAsDataURL(file);
  });
}

