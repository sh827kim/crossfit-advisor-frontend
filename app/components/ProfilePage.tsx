'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/app/context/AppContext';
import { compressImage } from '@/app/lib/image-utils';

import { getProfileColorByIndex } from '@/app/lib/profile-colors';
import { ConfirmDialog } from '@/app/components/shared/ConfirmDialog';

export function ProfilePage() {
  const router = useRouter();
  const { workoutHistory, isLoadingHistory, userNickname, setUserNickname, userProfileColorIndex, setUserProfileColorIndex } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userNickname);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats Calculation
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const thisMonthRecords = workoutHistory.filter(r => {
      const d = new Date(r.date);
      return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
    });

    const thisMonthCount = thisMonthRecords.length;
    // Calculate duration for this month (minutes)
    const thisMonthDuration = Math.ceil(thisMonthRecords.reduce((acc, r) => acc + (r.duration || 0), 0) / 60);

    const totalCount = workoutHistory.length;
    // Total Duration (minutes)
    const totalDuration = Math.ceil(workoutHistory.reduce((acc, r) => acc + (r.duration || 0), 0) / 60);

    return { thisMonthCount, thisMonthDuration, totalCount, totalDuration };
  }, [workoutHistory]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      if (tempName.trim()) setUserNickname(tempName.trim());
      setIsEditing(false);
    } else {
      // Enter edit mode
      setTempName(userNickname);
      setIsEditing(true);
    }
  };

  const handleRefreshColor = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * 11);
    } while (nextIndex === userProfileColorIndex);
    setUserProfileColorIndex(nextIndex);
  };

  const confirmReset = () => {
    setShowResetPopup(false);
    localStorage.removeItem('cf_has_visited');
    router.replace('/onboarding?reset=true');
  };

  const fallbackColor = useMemo(() => getProfileColorByIndex(userProfileColorIndex), [userProfileColorIndex]);

  return (
    <main className="min-h-screen bg-[#010101] text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="h-[60px] flex items-center justify-between px-5 relative z-10">
        <button onClick={() => router.push('/')} className="w-10 h-10 flex items-center justify-center">
          <i className="fa-solid fa-xmark text-[24px] text-gray-400"></i>
        </button>
        <h1 className="text-[17px] font-bold absolute left-1/2 -translate-x-1/2">Profile</h1>
        <button
          onClick={handleEditToggle}
          className={`text-[16px] font-bold w-[60px] text-right transition-colors text-white hover:text-gray-300`}
        >
          {isEditing ? '완료' : '편집'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10 flex flex-col items-center pt-[60px]">
        {/* Profile Card Container (Onboarding Style) */}
        <div className="relative w-full max-w-[325px] rounded-[32px] p-[3px] mb-8"
          style={{
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
          {/* Inner Content */}
          <div className="w-full h-full rounded-[29px] flex flex-col items-center relative overflow-hidden bg-[#1F1F1F] px-4 py-8"
            style={{ background: 'linear-gradient(134.49deg, rgba(244, 48, 0, 0.2) 3.24%, rgba(0, 0, 0, 0.2) 35.53%), #1F1F1F' }}>

            {/* 1. Logo (Top) */}
            <div className="mb-4 opacity-30 mt-2">
              <Image src="/logo-gray.svg" alt="AFTERWOD" width={78} height={26} className="h-[22px] w-auto" />
            </div>

            {/* 2. Member Label */}
            <p className="text-[10px] font-extrabold text-white/40 uppercase tracking-[3px] mb-[24px]">
              Member
            </p>

            {/* 3. Profile Image & Refresh Button */}
            <div className="relative mb-[24px]">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden flex items-center justify-center relative shadow-2xl border border-white/5"
                style={{ backgroundColor: fallbackColor }}>
                <span className="text-[44px] font-extrabold text-black font-apple-sd mt-1">
                  {(userNickname || 'U').charAt(0)}
                </span>
              </div>
              {/* Refresh Color Button (Only in Edit Mode) */}
              {isEditing && (
                <button
                  onClick={handleRefreshColor}
                  className="absolute bottom-0 right-0 w-[34px] h-[34px] bg-[#333] border border-[#555] rounded-full flex items-center justify-center shadow-lg hover:bg-[#444] transition z-20 active:rotate-180 duration-300"
                >
                  <i className="fa-solid fa-rotate text-white text-[14px]"></i>
                </button>
              )}
            </div>

            {/* 4. Nickname */}
            <div className="w-full flex justify-center mb-8">
              {isEditing ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-[180px] bg-white/5 border border-white/10 rounded-[12px] py-2 text-center text-[20px] font-extrabold text-white placeholder-white/20 focus:outline-none focus:border-[#F43000]/50 transition-colors font-apple-sd"
                  maxLength={10}
                  placeholder="닉네임"
                />
              ) : (
                <h2 className="text-[24px] font-extrabold text-white font-apple-sd">{userNickname}</h2>
              )}
            </div>

            {/* 5. Decoration Line */}
            <div className="w-full h-[1px] bg-white/5 mb-8"></div>

            {/* 6. Stats Section (Inside Card - Corrected as per feedback) */}
            <div className="w-full mt-4 px-2">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 opacity-40 pointer-events-none grayscale">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex flex-col items-start justify-center animate-pulse">
                      {/* Label Skeleton */}
                      <div className="w-24 h-4 bg-white/20 rounded mb-2"></div>
                      {/* Value Skeleton */}
                      <div className="w-16 h-6 bg-white/20 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  {/* Item 1 */}
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-[13px] text-white font-medium mb-1">이번 달 운동 횟수</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[30px] font-bold text-white font-barlow">{stats.thisMonthCount}</span>
                    </div>
                  </div>
                  {/* Item 2 */}
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-[13px] text-white font-medium mb-1">이번 달 운동 시간</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[30px] font-bold text-white font-barlow">{stats.thisMonthDuration}</span>
                      <span className="text-[15px] text-white font-medium">분</span>
                    </div>
                  </div>
                  {/* Item 3 */}
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-[13px] text-white font-medium mb-1">총 운동 횟수</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[30px] font-bold text-white font-barlow">{stats.totalCount}</span>
                    </div>
                  </div>
                  {/* Item 4 */}
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-[13px] text-white font-medium mb-1">총 운동 시간</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[30px] font-bold text-white font-barlow">{stats.totalDuration}</span>
                      <span className="text-[15px] text-white font-medium">분</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Reset Button (Outside) */}
        {!isEditing && (
          <div className="mt-auto pb-6">
            <button
              onClick={() => setShowResetPopup(true)}
              className="text-[#555] text-[13px] underline decoration-[#555] underline-offset-4 hover:text-[#666] transition"
            >
              운동 기록 초기화
            </button>
          </div>
        )}
      </div>

      {/* Reset Modal */}
      <ConfirmDialog
        isOpen={showResetPopup}
        title={<>정말로<br />초기화 하시겠습니까?</>}
        description={<>지금까지의 운동 기록과<br />프로필 정보가 모두 사라집니다.</>}
        confirmText="초기화하기"
        cancelText="취소"
        onConfirm={confirmReset}
        onCancel={() => setShowResetPopup(false)}
        confirmColor="#f43000"
      />
    </main>
  );
}
