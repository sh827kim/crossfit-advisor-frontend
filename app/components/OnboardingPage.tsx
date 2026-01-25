'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/app/context/AppContext';
import { compressImage } from '@/app/lib/image-utils';

// 온보딩 단계: splash → walkthrough → profile
type OnboardingStep = 'splash' | 'walkthrough' | 'profile';

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
            <div className="mb-8">
              <div className="bg-[#f43000] px-12 py-8 flex flex-col items-center rounded-lg">
                <h1 className="text-4xl font-black text-black mb-3 italic">
                  AFTERWOD
                </h1>
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-0.5 bg-black"></div>
                  <p className="text-xl font-bold text-black whitespace-nowrap">CLUB</p>
                  <div className="flex-1 h-0.5 bg-black"></div>
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
        <main className="flex-grow flex flex-col justify-between items-center bg-black text-white px-6 pb-10 pt-8 overflow-y-auto">
          <div className="flex-1 flex flex-col justify-start pt-4">
            {/* 헤더 텍스트 */}
            <div className="mb-8">
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
              {/* 운동 계획 추천 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#f43000] flex items-center justify-center text-black font-bold text-sm mb-3">
                    1
                  </div>
                  <div className="w-1 h-16 bg-[#921d00]"></div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    운동 계획 추천
                  </h3>
                  <p className="text-sm text-gray-400">
                    Crossfiter를 위한 맞춤형 워크아웃 추천해드려요.
                  </p>
                </div>
              </div>

              {/* 운동 진행 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#f43000] flex items-center justify-center text-black font-bold text-sm mb-3">
                    2
                  </div>
                  <div className="w-1 h-16 bg-[#921d00]"></div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    운동 진행
                  </h3>
                  <p className="text-sm text-gray-400">
                    Crossfiter를 위한 맞춤형 워크아웃 추천해드려요.
                  </p>
                </div>
              </div>

              {/* 기록하기 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#f43000] flex items-center justify-center text-black font-bold text-sm">
                    3
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    기록하기
                  </h3>
                  <p className="text-sm text-gray-400">
                    Crossfiter를 위한 맞춤형 워크아웃 추천해드려요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next 버튼 */}
          <button
            onClick={() => setCurrentStep('profile')}
            className="w-max bg-[#f43000] hover:bg-[#d92a00] text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 transition active:scale-95"
          >
            Next
            <i className="fa-solid fa-arrow-right-up transform rotate-180"></i>
          </button>
        </main>
      );
    }

    // 프로필 설정 화면
    if (currentStep === 'profile') {
      return (
        <main className="flex-grow flex flex-col justify-between bg-black text-white px-6 pb-10 pt-8 overflow-y-auto">
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
            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gray-700 rounded-3xl p-8 mb-8 backdrop-blur-sm">
              {/* MEMBER 라벨 */}
              <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-6 text-center opacity-50">
                Member
              </p>

              {/* 프로필 이미지 */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative"
                >
                  <div className="w-24 h-24 rounded-full bg-yellow-300 relative flex items-center justify-center overflow-hidden cursor-pointer hover:brightness-90 transition">
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
                        신
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

              {/* 표시된 닉네임 */}
              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  {nickname || '신나는 승리'}
                </p>
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
