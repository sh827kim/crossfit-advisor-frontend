'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* 에러 아이콘 */}
        <div className="text-6xl mb-6">⚠️</div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-foreground mb-2">문제가 발생했습니다</h1>

        {/* 설명 */}
        <p className="text-muted-foreground mb-4">
          예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>

        {/* 에러 메시지 (개발 환경에서만 표시) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-destructive font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            다시 시도
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-border hover:bg-muted"
          >
            <Link href="/">홈으로</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
