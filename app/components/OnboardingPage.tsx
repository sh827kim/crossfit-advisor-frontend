'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { compressImage } from '@/app/lib/image-utils';

export function OnboardingPage() {
  const router = useRouter();
  const { hasVisited, userNickname, userProfileImage, setUserNickname, setUserProfileImage, markAsVisited } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [nickname, setNickname] = useState(userNickname);
  const [profileImage, setProfileImage] = useState<string | null>(userProfileImage);
  const [displayText, setDisplayText] = useState('');
  const [subtitleText, setSubtitleText] = useState('');
  const fullTitle = '애프터와드';
  const fullSubtitle = '당신을 위한 보강운동 추천 서비스';

  // 온보딩 페이지 도착 시 history 정리
  useEffect(() => {
    if (window.location.pathname === '/onboarding') {
      // 현재 항목을 onboarding으로 설정 (이전 모든 히스토리 제거)
      window.history.replaceState({ page: 'onboarding' }, '', '/onboarding');
      // 뒤로가기 차단을 위해 추가 상태 추가
      window.history.pushState({ page: 'onboarding-guard' }, '', '/onboarding');
    }
  }, []);

  // 텍스트 애니메이션 (프로필 설정 화면에서만 시작)
  useEffect(() => {
    if (!showProfile) return;

    let titleIndex = 0;
    let subtitleIndex = 0;

    // 프로필 화면 진입 시 텍스트 리셋
    setDisplayText('');
    setSubtitleText('');

    const titleTimer = setInterval(() => {
      if (titleIndex < fullTitle.length) {
        setDisplayText(fullTitle.slice(0, titleIndex + 1));
        titleIndex++;
      } else if (subtitleIndex < fullSubtitle.length) {
        setSubtitleText(fullSubtitle.slice(0, subtitleIndex + 1));
        subtitleIndex++;
      } else {
        clearInterval(titleTimer);
      }
    }, 50); // 50ms마다 한글자씩 나타나기

    return () => clearInterval(titleTimer);
  }, [showProfile]);

  // 로딩 시뮬레이션
  useEffect(() => {
    if (hasVisited === true) {
      // 재방문자: 환영메시지 표시
      setShowContent(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => router.push('/'), 500); // 페이드아웃 후 전환
      }, 2500); // 2.5초 동안 환영메시지 표시
      return () => clearTimeout(timer);
    } else if (hasVisited === false) {
      // 첫 방문자: 스플래시 화면 표시
      setShowContent(true);
      // 3초 후 프로필 설정 화면으로 전환
      const timer = setTimeout(() => {
        setShowProfile(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasVisited, router]);

  // userProfileImage 변경 감지
  useEffect(() => {
    setProfileImage(userProfileImage);
  }, [userProfileImage]);

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
    markAsVisited();
    router.push('/');
  };

  // 첫 방문: 온보딩 페이지
  if (!hasVisited) {
    // 스플래시 화면
    if (!showProfile) {
      return (
        <main className={`px-6 pb-6 flex-grow flex flex-col justify-center items-center transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* 배경 그래디언트 */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-slate-50 -z-10"></div>

          <div className="w-full flex flex-col items-center justify-center">
            {/* 로고 애니메이션 */}
            <div className="mb-8 animate-bounce">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                <i className="fa-solid fa-dumbbell text-white text-5xl"></i>
              </div>
            </div>

            {/* 앱 제목 */}
            <h1 className="text-5xl font-black text-slate-800 mb-2">
              애프터와드
            </h1>

            {/* 영문 서브 타이틀 */}
            <p className="text-sm text-slate-400 font-medium mb-6 tracking-wider">
              Afterwod
            </p>

            {/* 슬로건 */}
            <div className="text-center mb-12">
              <p className="text-lg font-bold text-slate-700 mb-1">
                당신을 위한
              </p>
              <p className="text-lg font-bold text-slate-700 mb-1">
                보강운동 추천 서비스
              </p>
              <p className="text-sm text-slate-500 mt-3">
                Crossfit 초심자를 위한 맞춤형 워크아웃 추천
              </p>
            </div>

            {/* 특징 아이콘 */}
            <div className="grid grid-cols-3 gap-4 mb-12 w-full max-w-xs">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <i className="fa-solid fa-brain text-blue-600"></i>
                </div>
                <p className="text-xs text-slate-600 font-medium">AI 추천</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <i className="fa-solid fa-chart-line text-green-600"></i>
                </div>
                <p className="text-xs text-slate-600 font-medium">기록 관리</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <i className="fa-solid fa-zap text-purple-600"></i>
                </div>
                <p className="text-xs text-slate-600 font-medium">맞춤형</p>
              </div>
            </div>

            {/* 로딩 인디케이터 */}
            <div className="flex items-center justify-center gap-1 mb-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-xs text-slate-400 font-medium">준비 중입니다...</p>

            {/* 스킵 버튼 */}
            <button
              onClick={() => setShowProfile(true)}
              className="mt-8 text-xs font-medium text-slate-400 hover:text-blue-600 transition"
            >
              또는 시작하기 →
            </button>
          </div>
        </main>
      );
    }

    // 프로필 설정 화면
    return (
      <main className={`px-6 pb-6 flex-grow flex flex-col justify-center transition-opacity duration-500 ${
        showProfile ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 mb-2 min-h-12">
            {displayText}
            {displayText.length < fullTitle.length && (
              <span className="animate-pulse">|</span>
            )}
          </h1>
          <p className="text-sm text-slate-500 font-medium min-h-12">
            {subtitleText}
            {subtitleText.length < fullSubtitle.length && (
              <span className="animate-pulse">|</span>
            )}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-lg shadow-gray-100 mb-6">
          {/* 프로필 이미지 */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-500 group-hover:brightness-75 transition"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="프로필"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <i className="fa-solid fa-camera text-blue-400 text-2xl mb-1 block"></i>
                    <span className="text-xs text-blue-400 font-medium">사진 추가</span>
                  </div>
                )}
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
            <label className="block text-xs font-bold text-slate-600 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 10))}
              placeholder="닉네임을 입력하세요"
              maxLength={10}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-slate-400 mt-1">{nickname.length}/10</p>
          </div>

          {/* 소개 문구 */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
            <p className="text-sm text-slate-700 font-medium">
              <span className="text-blue-600 font-bold"> 계획 추천</span> →
              <span className="text-blue-600 font-bold"> 운동 진행</span> →
              <span className="text-blue-600 font-bold"> 기록</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              당신의 보강운동을 도와드려요!
            </p>
          </div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-blue-900/20 text-lg active:scale-95"
        >
          시작하기 <i className="fa-solid fa-arrow-right ml-2"></i>
        </button>
      </main>
    );
  }

  // 재방문: 환영 메시지
  return (
    <div className={`fixed inset-0 bg-white flex items-center justify-center transition-all duration-500 ${
      isLoading ? 'opacity-100 z-50' : 'opacity-0 pointer-events-none'
    }`}>
      <div className="text-center px-6">
        <div className="mb-6">
          <div className="text-6xl mb-4 animate-bounce">
            <i className="fa-solid fa-fire text-orange-500"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            다시 오셨네요!
          </h2>
          <p className="text-slate-500 font-medium">
            {userNickname}님, 환영합니다! 🎉
          </p>
        </div>
        <div className="mt-8 text-sm text-slate-400 font-medium">
          조금만 기다려주세요...
        </div>
      </div>
    </div>
  );
}
