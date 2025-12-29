'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

function LoginErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, { title: string; description: string }> = {
    signin_failed: {
      title: '로그인 실패',
      description:
        '로그인 중에 오류가 발생했습니다. 다시 시도해주세요.',
    },
    server_error: {
      title: '서버 오류',
      description:
        '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    },
    invalid_token: {
      title: '잘못된 토큰',
      description: 'Google 토큰이 유효하지 않습니다. 다시 로그인해주세요.',
    },
    network_error: {
      title: '네트워크 오류',
      description:
        '네트워크 연결을 확인하고 다시 시도해주세요.',
    },
    access_denied: {
      title: '접근 거부',
      description:
        '로그인이 거부되었습니다. 권한 설정을 확인하고 다시 시도해주세요.',
    },
    unknown_error: {
      title: '알 수 없는 오류',
      description: '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
    },
  };

  const errorInfo =
    errorMessages[error as string] ||
    errorMessages.unknown_error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full">
              <span className="text-3xl">⚠️</span>
            </div>
            <CardTitle>{errorInfo.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 오류 메시지 */}
            <Alert variant="destructive">
              <AlertDescription>
                <p className="text-center">
                  {errorInfo.description}
                </p>
                {/* 상세 오류 코드 */}
                {error && (
                  <p className="text-xs text-center mt-2 font-mono opacity-75">
                    오류 코드: {error}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            {/* 행동 버튼 */}
            <Button asChild className="w-full" size="lg">
              <Link href="/login">다시 로그인하기</Link>
            </Button>

            <Button asChild variant="secondary" className="w-full" size="lg">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* 도움말 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            문제가 계속되면 다시 시도하거나 홈으로 돌아가세요.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 로그인 오류 페이지
 * 로그인 실패 시 사용자에게 오류 메시지를 표시합니다.
 */
export default function LoginErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로드 중...</div>}>
      <LoginErrorContent />
    </Suspense>
  );
}
