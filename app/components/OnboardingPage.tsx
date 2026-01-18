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
  const [nickname, setNickname] = useState(userNickname);
  const [profileImage, setProfileImage] = useState<string | null>(userProfileImage);

  // 로딩 시뮬레이션 (재방문 시 2초 후 자동 전환)
  useEffect(() => {
    if (hasVisited) {
      setShowContent(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => router.push('/'), 500); // 페이드아웃 후 전환
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
      setShowContent(true);
    }
  }, [hasVisited, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        try {
          // 이미지 압축
          const compressedBase64 = await compressImage(base64, 300, 300, 0.8);
          setProfileImage(compressedBase64);
        } catch (error) {
          console.error('이미지 압축 실패:', error);
          setProfileImage(base64);
        }
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
    return (
      <main className={`px-6 pb-6 flex-grow flex flex-col justify-center transition-opacity duration-500 ${
        showContent ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 mb-2">애프터와드</h1>
          <p className="text-sm text-slate-500 font-medium">
            Crossfit 초심자를 위한
            <br />
            보강운동 추천 및 기록 관리 서비스
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-lg shadow-gray-100 mb-6">
          {/* 프로필 이미지 */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative group"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-500 transition"
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
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition"></div>
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
              onChange={(e) => setNickname(e.target.value.slice(0, 20))}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-slate-400 mt-1">{nickname.length}/20</p>
          </div>

          {/* 소개 문구 */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
            <p className="text-sm text-slate-700 font-medium">
              <span className="text-blue-600 font-bold">운동 시간 선택</span> →
              <span className="text-blue-600 font-bold"> 맞춤형 계획</span> →
              <span className="text-blue-600 font-bold"> 실시간 진행</span> →
              <span className="text-blue-600 font-bold"> 기록 저장</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              모든 과정이 이 앱 한 곳에서 가능합니다!
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
