import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoginButtonClient } from '@/app/components/LoginButtonClient';

/**
 * 로그인 페이지
 * 백엔드의 OAuth2 엔드포인트로 리다이렉트합니다.
 * 백엔드는 Spring Security OAuth2를 사용하여 Google 인증을 처리합니다.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">🏋️ 또와드</CardTitle>
            <CardDescription className="text-base mt-2">
              오늘도 또 와드를 해냈다! 내일은 또와드와 함께
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-6">
              <p className="text-sm text-muted-foreground">
                Google 계정으로 로그인하여 시작하세요
              </p>

              {/* Google 로그인 버튼 */}
              <Suspense
                fallback={
                  <div className="flex justify-center py-4">
                    <div className="text-muted-foreground text-sm">로그인 버튼 로드 중...</div>
                  </div>
                }
              >
                <LoginButtonClient />
              </Suspense>
            </div>

            {/* 약관 동의 텍스트 */}
            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                로그인하면{' '}
                <a href="#" className="text-primary hover:underline">
                  서비스 약관
                </a>
                과{' '}
                <a href="#" className="text-primary hover:underline">
                  개인정보보호정책
                </a>
                에 동의하는 것입니다.
              </p>
            </div>

            {/* 보안 알림 */}
            <Alert>
              <AlertDescription className="text-xs">
                🔒 <strong>보안 안내:</strong> 당신의 비밀번호는 안전하게 보호됩니다.
                또와드는 Google 계정으로 안전하게 인증합니다.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            계정이 없으신가요?{' '}
            <span className="text-muted-foreground">
              Google 계정으로 자동 가입됩니다
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
