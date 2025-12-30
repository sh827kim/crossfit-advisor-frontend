'use client';

import { useState, useCallback } from 'react';
import { sendImageToOCR } from '@/app/lib/api';
import type { OCRSession, OCRResult } from '@/app/lib/types/ocr.types';

/**
 * OCR 훅
 * 이미지 파일을 백엔드 Google Vision API로 전송하여 텍스트 추출
 */
export function useOCR() {
  // OCR 세션 상태
  const [session, setSession] = useState<OCRSession>({
    status: 'idle',
    result: null,
    error: null,
  });

  // OCR 처리 진행률 (0~100)
  const [progress, setProgress] = useState(0);

  /**
   * 이미지 파일을 백엔드로 전송하여 텍스트 추출
   * @param imageFile 처리할 이미지 파일 또는 이미지 데이터 URL
   */
  const recognizeText = useCallback(
    async (imageFileOrDataUrl: File | string) => {
      setSession({
        status: 'processing',
        result: null,
        error: null,
      });
      setProgress(0);

      try {
        let extractedText: string;

        // File 객체인 경우 직접 업로드, 문자열(Data URL)인 경우 변환
        if (typeof imageFileOrDataUrl === 'string') {
          // Data URL을 File 객체로 변환
          const response = await fetch(imageFileOrDataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'image.png', { type: 'image/png' });
          extractedText = await sendImageToOCR(file);
        } else {
          // File 객체인 경우 바로 업로드
          extractedText = await sendImageToOCR(imageFileOrDataUrl);
        }

        // 추출된 텍스트 검증
        if (!extractedText.trim() || extractedText.length < 3) {
          setSession({
            status: 'error',
            result: null,
            error:
              '추출된 텍스트가 없습니다. 이미지가 선명하고 텍스트가 잘 보이는지 확인해주세요.',
          });
          return;
        }

        setSession({
          status: 'success',
          result: {
            text: extractedText.trim(),
            confidence: 100, // Google Vision API는 신뢰도를 직접 반환하지 않음
            imageDataUrl:
              typeof imageFileOrDataUrl === 'string'
                ? imageFileOrDataUrl
                : URL.createObjectURL(imageFileOrDataUrl),
          },
          error: null,
        });
        setProgress(100);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'OCR 처리 실패';

        setSession({
          status: 'error',
          result: null,
          error: `텍스트 추출에 실패했습니다: ${errorMessage}`,
        });
      }
    },
    []
  );

  /**
   * OCR 세션 초기화
   * 새로운 사진을 촬영할 때 호출
   */
  const reset = useCallback(() => {
    setSession({
      status: 'idle',
      result: null,
      error: null,
    });
    setProgress(0);
  }, []);

  return {
    // OCR 세션 상태 (status, result, error)
    session,
    // OCR 처리 진행률 (0~100)
    progress,
    // 텍스트 인식 함수 (File 객체 또는 Data URL 지원)
    recognizeText,
    // 상태 초기화 함수
    reset,
  };
}
