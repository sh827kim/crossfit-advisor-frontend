'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateImageFile } from '@/app/lib/ocr-utils';

interface ImageCaptureProps {
  /**
   * 이미지 선택 완료 시 호출
   * @param imageFile 선택된 이미지 파일 객체
   */
  onImageSelected: (imageFile: File) => void;
  /**
   * 선택 중 상태인지 여부
   */
  isLoading?: boolean;
}

/**
 * 이미지 캡처 컴포넌트
 * 카메라 촬영 또는 갤러리에서 이미지 선택
 * - 모바일 환경에서 카메라 직접 실행
 * - 갤러리에서 기존 사진 선택
 */
export function ImageCapture({
  onImageSelected,
  isLoading = false,
}: ImageCaptureProps) {
  // 파일 선택 input 참조
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // 에러 메시지 상태
  const [error, setError] = useState<string | null>(null);

  /**
   * 파일 선택 핸들러
   * 이미지 검증 후 백엔드 OCR 처리를 위해 파일 전달
   */
  const handleImageSelect = (file: File) => {
    setError(null);

    try {
      // 파일 유효성 검증
      validateImageFile(file);

      // 검증된 파일 전달 (백엔드에서 Google Vision API로 처리)
      onImageSelected(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : '이미지 검증 실패';
      setError(message);
    }
  };

  /**
   * 카메라 버튼 클릭 핸들러
   * 모바일 환경에서 카메라 앱을 직접 실행
   */
  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  /**
   * 갤러리 버튼 클릭 핸들러
   * 기존 사진을 선택
   */
  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  /**
   * Input onChange 핸들러
   */
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
    // input 초기화 (같은 파일 다시 선택 가능하도록)
    event.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 에러 메시지 */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 카메라/갤러리 선택 버튼 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 카메라 촬영 버튼 */}
        <Button
          onClick={handleCameraClick}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          📷
          {' '}
          카메라
        </Button>

        {/* 갤러리 선택 버튼 */}
        <Button
          onClick={handleGalleryClick}
          disabled={isLoading}
          variant="secondary"
          className="w-full"
          size="lg"
        >
          🖼️
          {' '}
          갤러리
        </Button>
      </div>

      {/* 카메라 Input (숨김) */}
      {/* capture="environment"로 모바일에서 후면 카메라 직접 실행 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        disabled={isLoading}
        className="hidden"
      />

      {/* 갤러리 Input (숨김) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        disabled={isLoading}
        className="hidden"
      />

      {/* 안내 메시지 */}
      <p className="text-center text-sm text-gray-600">
        WOD 사진을 촬영하거나 갤러리에서 선택하세요
      </p>
    </div>
  );
}
