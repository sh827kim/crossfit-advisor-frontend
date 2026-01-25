'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/app/context/AppContext';
import { compressImage } from '@/app/lib/image-utils';

// 온보딩 단계: splash → walkthrough → profile
type OnboardingStep = 'splash' | 'walkthrough' | 'profile';

// 워크스루 단계 인터페이스
interface WalkthroughStep {
  title: string;
  description: string;
}

// 워크스루 단계 정의
const walkthroughSteps: WalkthroughStep[] = [
  {
    title: '운동 계획 추천',
    description: 'WOD, 목표, 부위별로 선택하여\n맞춤형 워크아웃을 추천받으세요.'
  },
  {
    title: '운동 진행',
    description: '타이머와 체크박스로 운동을\n체계적으로 진행하세요.'
  },
  {
    title: '기록하기',
    description: '완료한 운동을 기록하여\n당신의 운동 데이터를 관리하세요.'
  }
];

// 랜덤 배경 색상 생성
const backgroundColors = [
  '#FF6B6B', // 빨강
  '#4ECDC4', // 청록
  '#45B7D1', // 파랑
  '#FFA07A', // 라이트 산호
  '#98D8C8', // 민트
  '#F7DC6F', // 노랑
  '#BB8FCE', // 보라
  '#85C1E2', // 하늘
  '#F8B88B', // 살구
  '#ABEBC6', // 라임
];

const getRandomColor = (seed: string) => {
  // 닉네임의 첫 글자를 기반으로 일관된 색상 선택
  const charCode = seed.charCodeAt(0) || 0;
  return backgroundColors[charCode % backgroundColors.length];
};

export function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldReset = searchParams.get('reset') === 'true';
  const { hasVisited, userNickname, userProfileImage, setUserNickname, setUserProfileImage, markAsVisited, resetAllData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasHandledResetRef = useRef(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('splash');
  const [showContent, setShowContent] = useState(false);
  const [nickname, setNickname] = useState(userNickname);
  const [profileImage, setProfileImage] = useState<string | null>(userProfileImage);

  // Walkthrough 애니메이션 상태
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [displayedTexts, setDisplayedTexts] = useState<string[]>(['', '', '']);
  const [typingIndices, setTypingIndices] = useState<number[]>([0, 0, 0]);

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

  // Walkthrough 단계별 애니메이션
  useEffect(() => {
    if (currentStep !== 'walkthrough') return;

    // 0.5초마다 한 단계씩 보이기
    const stepTimer = setInterval(() => {
      setVisibleSteps(prev => {
        if (prev < walkthroughSteps.length) {
          return prev + 1;
        }
        clearInterval(stepTimer);
        return prev;
      });
    }, 800);

    return () => clearInterval(stepTimer);
  }, [currentStep]);

  // 각 단계별 타이핑 애니메이션
  useEffect(() => {
    if (currentStep !== 'walkthrough') return;

    const timers: NodeJS.Timeout[] = [];

    for (let stepIndex = 0; stepIndex < visibleSteps; stepIndex++) {
      const fullText = walkthroughSteps[stepIndex].description;

      // 각 단계가 보이는 시점부터 타이핑 시작
      const startDelay = stepIndex * 800 + 200;

      if (displayedTexts[stepIndex].length < fullText.length) {
        const timer = setInterval(() => {
          setDisplayedTexts(prev => {
            const newTexts = [...prev];
            if (newTexts[stepIndex].length < fullText.length) {
              newTexts[stepIndex] = fullText.slice(0, newTexts[stepIndex].length + 1);
            }
            return newTexts;
          });
        }, 50);

        setTimeout(() => {
          timers.push(timer);
        }, startDelay);
      }
    }

    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [currentStep, visibleSteps, displayedTexts]);

  // userProfileImage 변경 감지
  useEffect(() => {
    setProfileImage(userProfileImage);
  }, [userProfileImage]);

  // userNickname 변경 감지 (데이터 초기화 후 입력값 동기화)
  useEffect(() => {
    setNickname(userNickname);
  }, [userNickname]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        // Promise 체인으로 비동기 처리
        compressImage(base64, 300, 300, 0.8)
          .then(compressedBase64 => {
            setProfileImage(compressedBase64);
          })
          .catch(error => {
            console.error('이미지 압축 실패:', error);
            setProfileImage(base64);
          });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStart = () => {
    setUserNickname(nickname);
    if (profileImage) {
      setUserProfileImage(profileImage);
    }

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
        <main className={`flex-grow flex flex-col justify-center items-center bg-black transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex flex-col items-center justify-center">
            {/* AFTERWOD 로고 */}
            <div className="mb-8 px-8 max-w-sm">
              <div className="bg-[#f43000] px-16 py-6 flex flex-col items-center rounded-lg">
                <h1 className="text-5xl font-black text-black mb-3 italic" style={{ fontFamily: 'SF Pro, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>
                  AFTERWOD
                </h1>
                <div className="flex items-center gap-3 w-full">
                  {/* 왼쪽 선 */}
                  <div className="flex-1 h-1 bg-black"></div>
                  <p className="text-xl font-bold text-black whitespace-nowrap">CLUB</p>
                  {/* 오른쪽 선 */}
                  <div className="flex-1 h-1 bg-black"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      );
    }

    // 워크스루 화면 - 3가지 기능 설명
    if (currentStep === 'walkthrough') {
      return (
        <main className="flex-grow flex flex-col justify-between bg-black text-white px-6 pt-8 pb-6 overflow-y-auto">
          <div className="flex-1 flex flex-col justify-start">
            {/* 헤더 텍스트 */}
            <div className="mb-8 animate-fadeIn" style={{ animation: 'fadeIn 0.8s ease-out' }}>
              <p className="text-lg font-bold text-[#f43000] mb-2">
                애프터 와드는
              </p>
              <h2 className="text-3xl font-bold leading-tight mb-2">
                당신을 위한
              </h2>
              <h2 className="text-3xl font-bold leading-tight mb-4">
                보강운동 추천해드려요.
              </h2>
              <p className="text-sm text-gray-400">
                Crossfiter를 위한 맞춤형 워크아웃 추천해드려요.
              </p>
            </div>

            {/* 3가지 기능 설명 */}
            <div className="space-y-6">
              {walkthroughSteps.map((step, index) => (
                <div key={index} className={`flex gap-3 transition-opacity duration-300 ${visibleSteps > index ? 'opacity-100' : 'opacity-0'}`}>
                  {/* 왼쪽 숫자 + 라인 */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-[#f43000] flex items-center justify-center text-black font-bold text-xs">
                      {index + 1}
                    </div>
                    {/* 마지막 항목이 아니면 라인 표시 */}
                    {index < walkthroughSteps.length - 1 && visibleSteps > index + 1 && (
                      <div className="w-0.5 h-12 bg-[#921d00] mt-2"></div>
                    )}
                  </div>

                  {/* 오른쪽 텍스트 */}
                  <div className="flex-1 pt-0.5">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-400 whitespace-pre-line min-h-10">
                      {displayedTexts[index]}
                      {displayedTexts[index].length < step.description.length && visibleSteps > index && (
                        <span className="animate-pulse">|</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next 버튼 - 모든 단계가 완료되면 표시 */}
          {visibleSteps === walkthroughSteps.length && displayedTexts[walkthroughSteps.length - 1].length === walkthroughSteps[walkthroughSteps.length - 1].description.length && (
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
      // 닉네임의 첫 글자 추출
      const firstChar = nickname.charAt(0) || '신';
      const profileBgColor = getRandomColor(nickname || '신');

      return (
        <main className="flex-grow flex flex-col justify-between bg-black text-white px-6 pb-8 pt-8 overflow-y-auto">
          <div className="flex-1 flex flex-col justify-start">
            {/* 헤더 텍스트 */}
            <div className="mb-8">
              <p className="text-lg font-bold text-[#f43000] mb-2">
                거의 다 왔어요!
              </p>
              <h2 className="text-3xl font-bold leading-tight mb-4">
                프로필을
                <br />
                등록해주세요.
              </h2>
              <p className="text-sm text-gray-400">
                Crossfiter를 위한 맞춤형 워크아웃 추천
              </p>
            </div>

            {/* 프로필 카드 */}
            <div
              className="relative rounded-3xl p-8 mb-8 overflow-hidden"
              style={{
                background: `linear-gradient(125.7deg, rgba(244, 48, 0, 0.2) 3.2%, rgba(0, 0, 0, 0.2) 35.5%), linear-gradient(90deg, rgb(31, 31, 31) 0%, rgb(31, 31, 31) 100%)`,
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 0 32px rgba(244, 48, 0, 0.15)'
              }}
            >
              {/* MEMBER 라벨 */}
              <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-6 text-center opacity-50">
                Member
              </p>

              {/* 프로필 이미지 */}
              <div className="flex justify-center mb-8 relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative"
                >
                  <div
                    className="w-24 h-24 rounded-full relative flex items-center justify-center overflow-hidden cursor-pointer hover:brightness-90 transition"
                    style={{ backgroundColor: profileBgColor }}
                  >
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt="프로필"
                        fill
                        sizes="96px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-4xl font-bold text-black">
                        {firstChar}
                      </span>
                    )}
                  </div>
                  {/* 카메라 아이콘 */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500 transition">
                    <i className="fa-solid fa-camera text-white text-xs"></i>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* 닉네임 입력 */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 mb-3">
                  닉네임 ({nickname.length}/10)
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 10))}
                  placeholder="닉네임을 입력하세요"
                  maxLength={10}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl text-white font-medium placeholder-gray-600 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-600"
                />
              </div>

              {/* 로고 */}
              <div className="flex flex-col items-center justify-center pt-6 border-t border-gray-700">
                <div className="mt-4 opacity-40 flex flex-col items-center">
                  <p className="text-sm font-bold text-white tracking-wide italic mb-2" style={{ fontSize: '14px', letterSpacing: '0.08em' }}>
                    AFTERWOD
                  </p>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 h-0.5 bg-white"></div>
                    <p className="text-xs font-bold text-white whitespace-nowrap" style={{ fontSize: '10px' }}>CLUB</p>
                    <div className="flex-1 h-0.5 bg-white"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 시작하기 버튼 */}
          <button
            onClick={handleStart}
            className="w-full bg-[#f43000] hover:bg-[#d92a00] text-black font-bold py-4 rounded-2xl transition active:scale-95 text-lg"
          >
            시작하기
          </button>
        </main>
      );
    }
  }

  // 재방문자는 렌더링하지 않음 (메인 페이지로 자동 리다이렉트됨)
  return null;
}
