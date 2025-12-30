/**
 * OCR 관련 타입 정의
 */

/**
 * 이미지 소스 타입
 * - camera: 카메라에서 직접 촬영
 * - gallery: 갤러리/파일에서 선택
 */
export type ImageSource = 'camera' | 'gallery';

/**
 * OCR 처리 상태
 * - idle: 초기 상태
 * - processing: OCR 처리 중
 * - success: OCR 성공
 * - error: 처리 실패
 */
export type OCRStatus = 'idle' | 'processing' | 'success' | 'error';

/**
 * OCR 처리 결과
 */
export interface OCRResult {
  // 추출된 텍스트
  text: string;
  // 인식 신뢰도 (0~100)
  confidence: number;
  // 이미지 데이터 URL (미리보기용)
  imageDataUrl?: string;
}

/**
 * OCR 세션 상태
 * 전체 OCR 작업의 현재 상태를 관리
 */
export interface OCRSession {
  // 현재 처리 상태
  status: OCRStatus;
  // OCR 성공 시 결과 데이터
  result: OCRResult | null;
  // 에러 발생 시 에러 메시지
  error: string | null;
}

/**
 * 이미지 전처리 옵션
 * OCR 인식률을 높이기 위한 전처리 파이프라인 설정
 */
export interface PreprocessOptions {
  // 업스케일링 활성화 (기본: true)
  // 작은 이미지를 2-3배 확대하여 텍스트 선명도 향상
  enableUpscaling?: boolean;
  // 이진화 방식 (기본: 'otsu')
  // - 'otsu': Otsu's method로 자동 임계값 계산
  // - 'global': 고정된 임계값으로 이진화
  // - 'adaptive': 지역 블록별로 임계값 계산 (조명 불균일 대응)
  // - 'none': 이진화 미적용
  thresholdMode?: 'otsu' | 'global' | 'adaptive' | 'none';
  // Global 임계값 (0-255, 기본: 128)
  // thresholdMode가 'global'일 때 사용
  thresholdValue?: number;
  // 노이즈 제거 활성화 (기본: false)
  // Median filter를 사용하여 salt-and-pepper 노이즈 제거
  enableDenoising?: boolean;
  // 대비 개선 활성화 (기본: false)
  // Histogram equalization으로 명암 차이 강조
  enableContrastEnhancement?: boolean;
}
