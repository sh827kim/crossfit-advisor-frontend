'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/app/context/AppContext';
import { compressImage } from '@/app/lib/image-utils';

// 닉네임 기반 프로필 배경색 생성 (Header/OnboardingPage와 동일)
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
  const charCode = seed.charCodeAt(0) || 0;
  return backgroundColors[charCode % backgroundColors.length];
};

export function ProfilePage() {
  const router = useRouter();
  const { workoutHistory, isLoadingHistory, userNickname, setUserNickname, userProfileImage, setUserProfileImage } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userNickname);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 현재 월의 기록 개수 계산
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const thisMonthCount = isLoadingHistory ? 0 : workoutHistory.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === currentYear && recordDate.getMonth() + 1 === currentMonth;
  }).length;

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserNickname(tempName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempName(userNickname);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        compressImage(base64, 300, 300, 0.8)
          .then(compressedBase64 => {
            setUserProfileImage(compressedBase64);
          })
          .catch(error => {
            console.error('이미지 압축 실패:', error);
            setUserProfileImage(base64);
          });
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmReset = () => {
    setShowResetPopup(false);
    localStorage.removeItem('cf_has_visited');
    router.replace('/onboarding?reset=true');
  };

  // Fallback Profile Style
  const fallbackStyle = !userProfileImage && userNickname
    ? {
      backgroundColor: getRandomColor(userNickname),
      color: '#000000',
    }
    : {};

  return (
    <main className="px-6 pb-6 flex-grow flex flex-col bg-black text-white h-[calc(100vh-64px)] overflow-hidden">

      {/* Main Content Container - Centered and Full Height */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="bg-[#1F1F1F] rounded-3xl p-6 shadow-2xl border border-white/5 flex flex-col items-center justify-center w-full max-h-full overflow-y-auto relative">

          {/* Decorative Gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#F43000]/10 to-transparent pointer-events-none"></div>

          {/* Profile Image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative z-10 shrink-0 mt-2"
          >
            <div
              className={`w-24 h-24 rounded-full relative flex items-center justify-center mx-auto mb-2 text-4xl border-4 border-[#1F1F1F] shadow-[0_0_20px_rgba(244,48,0,0.3)] overflow-hidden cursor-pointer group-hover:brightness-110 transition ring-2 ring-[#F43000] ${!userProfileImage ? '' : 'bg-[#333]'}`}
              style={fallbackStyle}
            >
              {userProfileImage ? (
                <Image
                  src={userProfileImage}
                  alt="프로필"
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="font-bold">{(userNickname || '신').charAt(0)}</span>
              )}
            </div>
            <div className="text-xs text-[#F43000] text-center font-bold mt-1 opacity-80 group-hover:opacity-100 transition">
              사진 변경
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* 닉네임 표시/편집 */}
          {isEditing ? (
            <div className="w-full max-w-xs mb-4 z-10 mt-4 shrink-0">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value.slice(0, 10))}
                maxLength={10}
                className="w-full px-4 py-2 bg-[#333] border border-white/10 rounded-xl text-center font-bold text-lg text-white focus:outline-none focus:border-[#F43000] focus:ring-1 focus:ring-[#F43000] transition"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveName}
                  className="flex-1 py-3 bg-[#F43000] hover:bg-[#d92a00] text-black text-sm font-bold rounded-xl transition active:scale-95"
                >
                  저장
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-[#333] hover:bg-[#444] text-white text-sm font-bold rounded-xl transition active:scale-95"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 mt-4 z-10 shrink-0">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-black text-white">{userNickname}</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 bg-[#333] hover:bg-[#444] rounded-full transition text-white/60 hover:text-[#F43000]"
                  title="닉네임 변경"
                >
                  <i className="fa-solid fa-pen-to-square text-xs"></i>
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-white/40 mb-3 font-bold uppercase tracking-wider shrink-0">Workout Stats</p>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-6 w-full max-w-sm relative overflow-hidden shrink-0">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#F43000]"></div>
            <p className="text-[#F43000] text-xs font-bold mb-1">THIS MONTH</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-white font-sf-pro">
                {isLoadingHistory ? '-' : thisMonthCount}
              </p>
              <span className="text-white/60 text-sm font-bold">Workouts</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 w-full shrink-0">
            <button
              onClick={() => setShowResetPopup(true)}
              className="text-xs font-medium text-white/40 hover:text-red-500 transition flex items-center justify-center w-full py-3"
            >
              <i className="fa-solid fa-trash mr-2"></i> 데이터 초기화
            </button>
          </div>
        </div>
      </div>

      {/* 초기화 확인 팝업 */}
      {showResetPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="bg-[#1F1F1F] rounded-[32px] p-8 shadow-2xl max-w-sm w-full border border-white/10 text-center">
            <h3 className="text-xl font-bold text-white mb-2 leading-snug">
              정말로<br />초기화 하시겠습니까?
            </h3>
            <p className="text-sm text-white/60 mb-8 leading-relaxed">
              지금까지의 운동 기록과 닉네임,<br />프로필 정보가 모두 사라집니다.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmReset}
                className="w-full py-4 bg-[#F43000] text-black font-bold rounded-2xl transition hover:brightness-110 active:scale-95"
              >
                초기화하기
              </button>
              <button
                onClick={() => setShowResetPopup(false)}
                className="w-full py-4 bg-[#333] hover:bg-[#444] text-white font-bold rounded-2xl transition active:scale-95"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
