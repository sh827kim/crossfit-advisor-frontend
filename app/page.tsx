'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 모바일 디바이스 감지
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    // 모바일 사용자는 바로 로그인 화면으로 리다이렉트
    if (isMobile()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 네비게이션 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-primary">🏋️ 또와드</div>
            <Button asChild>
              <Link href="/login">로그인</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* 메인 섹션 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* 히어로 섹션 */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            오늘도 또 <span className="text-primary">와드</span>를 해냈다!<br />
            <span className="text-3xl">또와드와 함께</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            WOD 후 보강운동이 고민이신가요?<br />
            AI가 당신의 약점을 분석해 맞춤형 보강운동을 추천해줍니다.
          </p>
          <Button asChild size="lg" className="text-lg">
            <Link href="/login">
              지금 시작하기 →
            </Link>
          </Button>
        </div>

        {/* 기능 소개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* 기능 1 */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">📝</div>
              <CardTitle className="mb-2">간편한 WOD 입력</CardTitle>
              <p className="text-muted-foreground">
                오늘의 WOD를 텍스트로 입력하거나 카메라로 촬영해서 공유하세요.
                복잡한 형식은 필요 없습니다.
              </p>
            </CardContent>
          </Card>

          {/* 기능 2 */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">🤖</div>
              <CardTitle className="mb-2">AI 분석</CardTitle>
              <p className="text-muted-foreground">
                AI가 WOD를 분석하여 초심자가 놓치기 쉬운
                약점을 파악해줍니다.
              </p>
            </CardContent>
          </Card>

          {/* 기능 3 */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">💪</div>
              <CardTitle className="mb-2">스마트한 보강운동</CardTitle>
              <p className="text-muted-foreground">
                부족한 부위를 집중 보강할 수 있도록
                당신만을 위한 운동을 추천합니다.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 추가 기능 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* AI 대화 */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">💬</div>
              <CardTitle className="mb-2">실시간 조정</CardTitle>
              <p className="text-muted-foreground">
                추천받은 운동이 딱 맞지 않나요?
                AI와 대화하며 강도, 부위, 장비를 자유롭게 조절하세요.
              </p>
            </CardContent>
          </Card>

          {/* 개인 기록 */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">📊</div>
              <CardTitle className="mb-2">나의 기록</CardTitle>
              <p className="text-muted-foreground">
                WOD의 주요 종목들의 기록을 저장하세요.
                성장을 기록하고 추적할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 선호도 설정 */}
        <Card className="mb-20">
          <CardHeader>
            <CardTitle>🎯 나만의 운동 스타일 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">약점 부위</h4>
                <p className="text-muted-foreground text-sm">보강하고 싶은 부위를 선택하면, 그 부분 중심으로 운동을 추천받아요.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">운동 방식</h4>
                <p className="text-muted-foreground text-sm">맨몸? 덤벨? 바벨? 당신이 선호하는 방식으로 맞춰드립니다.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">여유 시간</h4>
                <p className="text-muted-foreground text-sm">WOD 후 보강에 쓸 수 있는 시간을 알려주세요. 딱 맞는 운동량을 추천해요.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">또와드와 함께 시작해봐요!</h2>
            <p className="text-lg mb-8 opacity-90">
              오늘도 와드를 해냈다면, 내일의 보강은 또와드에게 맡겨보세요.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/login">
                로그인하기
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">또와드</h4>
              <p className="text-sm">
                오늘도 또 와드를 해냈다! 라는 마음으로 시작된<br />
                Crossfit 초심자를 위한 AI 맞춤형 보강운동 추천 서비스
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">링크</h4>
              <ul className="text-sm space-y-2">
                <li><a href="/login" className="hover:text-white">로그인</a></li>
                <li><a href="#" className="hover:text-white">서비스 약관</a></li>
                <li><a href="#" className="hover:text-white">개인정보보호정책</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">문의</h4>
              <p className="text-sm">
                또와드 서비스에 대한 피드백은 언제든지 환영합니다.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 또와드. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
