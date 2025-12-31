'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageCapture } from '@/components/ImageCapture';
import { OCRResult } from '@/components/OCRResult';
import { useOCR } from '@/app/hooks/use-ocr';

/**
 * WOD 입력 페이지 (Client Component)
 * OCR 또는 텍스트 입력을 통해 WOD 정보를 입력받음
 * - 이미지 카메라/갤러리 선택 (OCR 모드)
 * - 텍스트 직접 입력 (텍스트 모드)
 */
export function WodInputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 입력 모드: 'ocr' 또는 'text'
  const [mode, setMode] = useState<'ocr' | 'text'>('ocr');
  // 직접 입력한 텍스트 (텍스트 모드)
  const [textInput, setTextInput] = useState('');
  // OCR 관련 상태
  const { session, progress, recognizeText, reset } = useOCR();

  // 초기화: URL 파라미터에서 모드 결정
  useEffect(() => {
    const source = searchParams.get('source');
    if (source === 'text') {
      setMode('text');
    } else {
      setMode('ocr');
    }
  }, [searchParams]);

  /**
   * 이미지 선택 완료 시 호출
   * 이미지 파일을 백엔드로 전송하여 OCR 처리 시작
   */
  const handleImageSelected = async (imageFile: File) => {
    await recognizeText(imageFile);
  };

  /**
   * OCR 결과 전송 핸들러
   */
  const handleOCRSend = (editedText: string) => {
    // URL 파라미터로 채팅 페이지로 이동
    const encodedMessage = encodeURIComponent(editedText);
    router.push(`/chat?initialMessage=${encodedMessage}`);
  };

  /**
   * 텍스트 모드 전송 핸들러
   */
  const handleTextSend = () => {
    if (textInput.trim()) {
      const encodedMessage = encodeURIComponent(textInput);
      router.push(`/chat?initialMessage=${encodedMessage}`);
    }
  };

  /**
   * OCR 다시 촬영 핸들러
   */
  const handleRetake = () => {
    reset();
  };

  // OCR 모드
  if (mode === 'ocr') {
    return (
      <div className="space-y-6">
        {/* 모드 전환 버튼 */}
        <div className="flex gap-2">
          <Button disabled className="flex-1">
            📷 OCR 입력
          </Button>
          <Button
            variant="outline"
            onClick={() => setMode('text')}
            className="flex-1"
          >
            ✍️ 텍스트 입력
          </Button>
        </div>

        {/* 이미지 선택 단계 */}
        {session.status === 'idle' && (
          <Card>
            <CardHeader>
              <CardTitle>사진 촬영</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageCapture
                onImageSelected={handleImageSelected}
                isLoading={false}
              />
            </CardContent>
          </Card>
        )}

        {/* OCR 처리 중 */}
        {session.status === 'processing' && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-r-transparent" />
              <p className="mb-4 text-gray-400">
                텍스트 추출 중...
              </p>
              {progress > 0 && (
                <div className="w-full max-w-xs">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full bg-amber-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-center text-sm text-gray-400">
                    {progress}
                    %
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* OCR 처리 실패 */}
        {session.status === 'error' && session.error && (
          <div className="space-y-4">
            <Alert className="border-red-700 bg-red-900/20">
              <AlertDescription className="text-red-400">
                {session.error}
              </AlertDescription>
            </Alert>
            <Button onClick={handleRetake} className="w-full">
              다시 촬영
            </Button>
          </div>
        )}

        {/* OCR 결과 */}
        {session.status === 'success' && session.result && (
          <OCRResult
            result={session.result}
            onSend={handleOCRSend}
            onRetake={handleRetake}
            isSending={false}
          />
        )}
      </div>
    );
  }

  // 텍스트 모드
  return (
    <div className="space-y-6">
      {/* 모드 전환 버튼 */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setMode('ocr')}
          className="flex-1"
        >
          📷 OCR 입력
        </Button>
        <Button disabled className="flex-1">
          ✍️ 텍스트 입력
        </Button>
      </div>

      {/* 텍스트 입력 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>WOD 텍스트 입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="wod-input" className="text-sm font-medium">
              오늘의 WOD를 입력하세요
            </label>
            <Textarea
              id="wod-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="예: 20분 EMOM
3 Power Cleans
6 Push-ups
9 Squats

또는 단순히 운동 종목과 강도를 입력하면 AI가 분석해줍니다."
              rows={10}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {textInput.length}
              자
            </p>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleTextSend}
              disabled={!textInput.trim()}
              className="flex-1"
            >
              보강운동 추천받기
            </Button>
          </div>

          {/* 도움말 */}
          <p className="text-xs text-gray-500">
            WOD 정보를 최대한 자세히 입력할수록 더 정확한 보강운동 추천을 받을 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
