'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OCRResult } from '@/app/lib/types/ocr.types';

interface OCRResultProps {
  /**
   * OCR 처리 결과
   */
  result: OCRResult;
  /**
   * "전달" 버튼 클릭 시 호출
   * @param editedText 사용자가 수정한 텍스트
   */
  onSend: (editedText: string) => void;
  /**
   * "다시 촬영" 버튼 클릭 시 호출
   */
  onRetake: () => void;
  /**
   * 전송 중 상태인지 여부
   */
  isSending?: boolean;
}

/**
 * OCR 결과 컴포넌트
 * - 추출된 텍스트 표시 및 편집
 * - 이미지 미리보기
 * - OCR 신뢰도 표시
 * - "AI 채팅으로 전달" 및 "다시 촬영" 버튼
 */
export function OCRResult({
  result,
  onSend,
  onRetake,
  isSending = false,
}: OCRResultProps) {
  // 사용자가 수정한 텍스트
  const [editedText, setEditedText] = useState(result.text);

  /**
   * 전달 버튼 클릭 핸들러
   */
  const handleSend = () => {
    if (editedText.trim()) {
      onSend(editedText);
    }
  };

  /**
   * 신뢰도 상태 배지 컬러
   * 신뢰도가 높을수록 초록색, 낮을수록 빨간색
   */
  const getConfidenceBadgeVariant = (): 'default' | 'secondary' | 'outline' => {
    if (result.confidence >= 80) return 'default';
    if (result.confidence >= 60) return 'secondary';
    return 'outline';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>인식된 WOD</CardTitle>
          <Badge variant={getConfidenceBadgeVariant()}>
            신뢰도:
            {' '}
            {Math.round(result.confidence)}
            %
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 이미지 미리보기 */}
        {result.imageDataUrl && (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <img
              src={result.imageDataUrl}
              alt="촬영한 WOD 사진"
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* 텍스트 편집 영역 */}
        <div className="space-y-2">
          <label htmlFor="wod-text" className="text-sm font-medium">
            텍스트 편집
          </label>
          <Textarea
            id="wod-text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="인식된 텍스트를 편집하세요"
            rows={8}
            className="resize-none"
            disabled={isSending}
          />
          <p className="text-xs text-gray-500">
            {editedText.length}
            자
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          {/* 다시 촬영 버튼 */}
          <Button
            onClick={onRetake}
            variant="outline"
            className="flex-1"
            disabled={isSending}
          >
            다시 촬영
          </Button>

          {/* AI 채팅으로 전달 버튼 */}
          <Button
            onClick={handleSend}
            className="flex-1"
            disabled={isSending || !editedText.trim()}
          >
            {isSending ? 'AI에게 전달 중...' : 'AI에게 전달'}
          </Button>
        </div>

        {/* 도움말 */}
        <p className="text-xs text-gray-500">
          텍스트를 정확히 수정한 후 "AI에게 전달"을 클릭하면
          AI가 보강운동을 추천해줍니다.
        </p>
      </CardContent>
    </Card>
  );
}
