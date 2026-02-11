'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/app/context/AppContext';
import { compressImage } from '@/app/lib/image-utils';
import { defineStepper } from '@/components/ui/stepper';
import { VerticalStepper } from '@/app/components/shared/VerticalStepper';

// 온보딩 단계: splash → walkthrough → profile
type OnboardingStep = 'splash' | 'walkthrough' | 'profile';

const walkthroughStepper = defineStepper(
  {
    id: 'plan',
    title: '운동 계획 추천',
    description: 'WOD, 목표, 부위별로 선택하여\n맞춤형 워크아웃을 추천받으세요.'
  },
  {
    id: 'progress',
    title: '운동 진행',
    description: '타이머와 체크박스로 운동을\n체계적으로 진행하세요.'
  },
  {
    id: 'record',
    title: '기록하기',
    description: '완료한 운동을 기록하여\n당신의 운동 데이터를 관리하세요.'
  }
);

import { getProfileColorByIndex } from '@/app/lib/profile-colors';

export function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldReset = searchParams.get('reset') === 'true';
  const { hasVisited, userNickname, setUserNickname, markAsVisited, resetAllData, userProfileColorIndex, setUserProfileColorIndex } = useApp();
  const hasHandledResetRef = useRef(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('splash');
  const [showContent, setShowContent] = useState(false);
  const [nickname, setNickname] = useState(userNickname);

  // Walkthrough 애니메이션 상태

  const fallbackColor = useMemo(() => getProfileColorByIndex(userProfileColorIndex), [userProfileColorIndex]);

  // 초기화 요청 시 데이터 초기화
  useEffect(() => {
    if (!shouldReset || hasHandledResetRef.current) {
      return;
    }

    hasHandledResetRef.current = true;
    let isActive = true;

    async function runReset() {
      // 모든 데이터 초기화 (상태 초기화까지 완료된 뒤 URL 정리)
      await resetAllData();
      if (!isActive) return;
      router.replace('/onboarding');
    }

    void runReset();

    return () => {
      isActive = false;
    };
  }, [shouldReset, resetAllData, router]);

  // 온보딩 페이지 도착 시 history 정리 및 재방문자 리다이렉트
  useEffect(() => {
    // 초기화 요청인 경우 리다이렉트하지 않음
    if (shouldReset) {
      // history 정리
      window.history.replaceState({ page: 'onboarding' }, '', '/onboarding');
      window.history.pushState({ page: 'onboarding-guard' }, '', '/onboarding');
      return;
    }

    // 재방문자는 메인 페이지로 리다이렉트
    if (hasVisited === true) {
      router.replace('/');
      return;
    }

    // 첫 방문자는 history 정리
    if (window.location.pathname === '/onboarding') {
      // 현재 항목을 onboarding으로 설정 (이전 모든 히스토리 제거)
      window.history.replaceState({ page: 'onboarding' }, '', '/onboarding');
      // 뒤로가기 차단을 위해 추가 상태 추가
      window.history.pushState({ page: 'onboarding-guard' }, '', '/onboarding');
    }
  }, [hasVisited, router, shouldReset]);


  // 온보딩 단계별 타이밍
  useEffect(() => {
    // 초기화 요청이거나 첫 방문인 경우
    if (hasVisited === false || shouldReset) {
      // 스플래시 화면 표시
      setShowContent(true);
      // 2.5초 후 워크스루 화면으로 전환
      const timer = setTimeout(() => {
        setCurrentStep('walkthrough');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [hasVisited, shouldReset]);


  // userNickname 변경 감지 (데이터 초기화 후 입력값 동기화)
  useEffect(() => {
    setNickname(userNickname);
  }, [userNickname]);

  const handleRefreshColor = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * 11); // 11 colors in lib
    } while (nextIndex === userProfileColorIndex);
    setUserProfileColorIndex(nextIndex);
  };

  const handleStart = () => {
    setUserNickname(nickname);

    // AppContext와 localStorage 모두 업데이트
    markAsVisited();

    // 상태 업데이트 완료 후 라우팅
    setTimeout(() => {
      router.push('/');
    }, 50);
  };

  // 첫 방문이거나 초기화 요청: 온보딩 페이지
  if (!hasVisited || shouldReset) {
    // 스플래시 화면 - AFTERWOD CLUB 로고
    if (currentStep === 'splash') {
      return (
        <main className={`flex-grow flex flex-col justify-center items-center bg-black transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'
          }`}>
          <div className="flex flex-col items-center justify-center">
            {/* AFTERWOD 로고 */}
            <div className="mb-8 px-8 max-w-sm w-full flex justify-center">
              <Image
                src="/logo-splash.svg"
                alt="AFTERWOD CLUB"
                width={300}
                height={150}
                className="w-full h-auto max-w-[280px]"
                priority
              />
            </div>
          </div>
        </main>
      );
    }

    // 워크스루 화면 - 3가지 기능 설명
    if (currentStep === 'walkthrough') {
      // Steps are always fully visible now
      const canGoNext = true;

      return (
        <main className="flex-grow flex flex-col justify-between bg-black text-white px-6 pt-8 pb-6 overflow-y-auto">
          <div className="flex-1 flex flex-col justify-start">
            {/* 헤더 텍스트 */}
            <div className="mb-8 animate-fadeIn" style={{ animation: 'fadeIn 0.8s ease-out' }}>
              {/* <p className="text-lg font-bold text-[#f43000] mb-2">
                애프터 와드는
              </p> */}
              <h2 className="text-3xl font-bold leading-tight mb-2">
                WOD가 끝나고
              </h2>
              <h2 className="text-3xl font-bold leading-tight mb-4">
                시작되는 나만의 훈련
              </h2>
              <p className="text-sm text-gray-400">
                오늘보다 더 강한 내일, 애프터와드와 함께해요!
              </p>
            </div>

            {/* 워크스루 단계 (Common Component) */}
            <div className="mt-2 relative">
              <VerticalStepper
                steps={walkthroughStepper.steps.map(step => ({
                  id: step.id,
                  title: step.title,
                  description: step.description
                }))}
                themeColor="#f43000"
                themeDarkColor="#921d00"
                enableTextAnimation={true}
              />
            </div>
          </div>

          {canGoNext && (
            <button
              onClick={() => setCurrentStep('profile')}
              className="self-end bg-[#f43000] hover:bg-[#d92a00] text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 transition active:scale-95 animate-fadeIn text-lg"
            >
              <span>Next</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          )}
        </main>
      );
    }

    // 프로필 설정 화면
    if (currentStep === 'profile') {
      const firstChar = (nickname || '신').charAt(0);

      return (
        <main className="flex-grow flex flex-col justify-between bg-black text-white px-6 pb-8 pt-8 overflow-y-auto">
          <div className="flex-1 flex flex-col justify-start">
            {/* 헤더 텍스트 */}
            <div className="mb-8">
              {/* <p className="text-lg font-bold text-[#f43000] mb-2">
                거의 다 왔어요!
              </p> */}
              <h2 className="text-3xl font-bold leading-tight mb-4">
                프로필을
                <br />
                등록해주세요.
              </h2>
              <p className="text-sm text-gray-400">
                닉네임은 언제든 수정할 수 있어요.
              </p>
            </div>

            {/* 프로필 카드 */}
            {/* 프로필 카드 Container - Border & Background Separation */}
            <div className="relative w-full max-w-[305px] h-[420px] mx-auto mb-8 rounded-[30px] p-[3px]"
              style={{
                // 은색 위주의 메탈릭 그라데이션 테두리
                background: `conic-gradient(from 180deg at 50% 50%, 
                     #707070 0deg, 
                     #FFFFFF 45deg, 
                     #9E9E9E 110deg, 
                     #FFFFFF 160deg, 
                     #707070 210deg, 
                     #FFFFFF 260deg, 
                     #9E9E9E 310deg, 
                     #FFFFFF 360deg)`
              }}
            >
              {/* Inner Content (빨강-검정 배경) */}
              <div
                className="w-full h-full rounded-[27px] flex flex-col items-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(134.49deg, rgba(244, 48, 0, 0.2) 3.24%, rgba(0, 0, 0, 0.2) 35.53%), #1F1F1F',
                }}
              >
                {/* Logo (Top) */}
                <div className="mt-[36px] mb-6 opacity-30">
                  <Image
                    src="/logo-gray.svg"
                    alt="AFTERWOD CLUB"
                    width={78}
                    height={26}
                    className="h-[22px] w-auto"
                  />
                </div>

                {/* Member Label */}
                <p className="text-[10px] font-extrabold text-white/40 uppercase tracking-[3px] mb-[20px]">
                  Member
                </p>

                {/* Profile Image */}
                <div className="relative mb-[24px]">
                  <div className="group relative">
                    <div
                      className="w-[88px] h-[88px] rounded-full relative flex items-center justify-center overflow-hidden shadow-xl transition"
                      style={{ backgroundColor: fallbackColor }}
                    >
                      <span className="text-[40px] font-extrabold text-black font-apple-sd leading-none mt-1">
                        {firstChar}
                      </span>
                    </div>
                    {/* Refresh Color Icon */}
                    <button
                      onClick={handleRefreshColor}
                      className="absolute bottom-0 right-0 w-[30px] h-[30px] bg-[#4E4E4E] border border-white/5 rounded-full flex items-center justify-center shadow-lg hover:bg-[#666] transition active:rotate-180 duration-300"
                    >
                      <i className="fa-solid fa-rotate text-white text-[12px]"></i>
                    </button>
                  </div>
                </div>

                {/* Nickname Input Label */}
                <label className="text-[12px] font-bold text-[#959595] mb-2 tracking-tight font-apple-sd">
                  닉네임 ({nickname.length}/10)
                </label>

                {/* Nickname Input Field */}
                <div className="w-[231px] h-[50px] relative">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.slice(0, 10))}
                    placeholder="닉네임 입력"
                    maxLength={10}
                    className="w-full h-full bg-white/5 border border-white/5 rounded-[16px] text-center text-[17px] font-extrabold text-white placeholder-white/20 focus:outline-none focus:border-[#F43000]/50 transition-colors font-apple-sd"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 시작하기 버튼 */}
          <button
            onClick={handleStart}
            className="w-full bg-[#f43000] hover:bg-[#d92a00] text-black font-bold py-4 rounded-2xl transition active:scale-95 text-lg"
          >
            애프터와드 시작하기
          </button>
        </main>
      );
    }
  }

  // 재방문자는 렌더링하지 않음 (메인 페이지로 자동 리다이렉트됨)
  return null;
}
