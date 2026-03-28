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
  const { workoutHistory, isLoadingHistory, userNickname, setUserNickname, userProfileColorIndex, setUserProfileColorIndex, isBeginnerMode, setIsBeginnerMode, resetWorkoutHistory } = useApp();

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

  const confirmReset = async () => {
    setShowResetPopup(false);
    await resetWorkoutHistory();
  };

  const fallbackColor = useMemo(() => getProfileColorByIndex(userProfileColorIndex), [userProfileColorIndex]);

  return (
    <div className="h-full bg-[#010101] text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="h-[60px] flex items-center justify-between px-5 relative z-10">
        <button onClick={() => router.push('/')} className="w-10 h-10 flex items-center justify-center">
          <i className="fa-solid fa-xmark text-[24px] text-gray-400"></i>
        </button>
        <h1 className="text-[17px] font-bold absolute left-1/2 -translate-x-1/2">프로필</h1>
        <button
          onClick={handleEditToggle}
          className={`text-[16px] font-bold w-[60px] text-right transition-colors text-white hover:text-gray-300`}
        >
          {isEditing ? '완료' : '편집'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10 flex flex-col items-center pt-[60px]">
        {/* Profile Card Container (Onboarding Style) */}
        <div className="relative w-full max-w-[290px] rounded-[32px] p-[3px] mb-8"
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
          <div className="w-full h-full rounded-[29px] flex flex-col items-center relative overflow-hidden bg-[#1F1F1F] px-4 pt-5 pb-8"
            style={{ background: 'linear-gradient(134.49deg, rgba(244, 48, 0, 0.2) 3.24%, rgba(0, 0, 0, 0.2) 35.53%), #1F1F1F' }}>

            {/* 1. Logo (Top) */}
            <div className="mb-1 opacity-30 mt-0">
              <Image src="/logo-gray.svg" alt="AFTERWOD" width={78} height={26} className="h-[22px] w-auto" />
            </div>

            {/* 2. Member Label */}
            <p className="text-[8px] font-extrabold text-white/40 uppercase tracking-[3px] mb-[40px]">
              Member
            </p>

            {/* 3. Profile Image & Refresh Button */}
            <div className="relative mb-[16px]">
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
              <div className="relative flex items-center justify-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-[231px] bg-white/5 border border-white/10 rounded-[12px] py-2 text-center text-[20px] font-extrabold text-white placeholder-white/20 focus:outline-none focus:border-[#F43000]/50 transition-colors font-apple-sd"
                    maxLength={10}
                    placeholder="닉네임"
                  />
                ) : (
                  <h2 className="text-[24px] font-extrabold text-white font-apple-sd text-center">{userNickname}</h2>
                )}
                {isBeginnerMode && (
                  <div className="absolute -left-6.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <Image src="/beginner.svg" alt="초보자 모드" width={26} height={26} className="opacity-90" />
                  </div>
                )}
              </div>
            </div>

            {/* 5. Decoration Line */}
            <div className="w-full h-[1px] bg-white/5 mb-4"></div>

            {/* Beginner Mode Toggle (Only visible in Edit Mode) */}
            {isEditing && (
              <>
                <div className="w-[231px] mx-auto mb-4 flex items-center justify-between opacity-100 transition-opacity duration-300">
                  <div className="flex flex-col items-start text-left">
                    <span className="flex items-center text-[14px] font-bold text-white tracking-tight">
                      <Image src="/beginner.svg" alt="초보자 모드" width={16} height={16} className="mr-1" />
                      초보자 모드
                    </span>
                  </div>
                  <button
                    onClick={() => setIsBeginnerMode(!isBeginnerMode)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none flex-shrink-0 cursor-pointer hover:brightness-110 ${isBeginnerMode ? 'bg-[#F43000]' : 'bg-white/10'}`}
                  >
                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isBeginnerMode ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 6. Decoration Line */}
                <div className="w-full h-[1px] bg-white/5 mb-4"></div>
              </>
            )}

            {/* 7. Stats Section (Inside Card) */}
            <div className="w-full px-2">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-x-4 opacity-40 pointer-events-none grayscale">
                  <div className="flex flex-col gap-4">
                    <div className="w-16 h-4 bg-white/20 rounded mb-0 animate-pulse"></div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col">
                        <div className="w-12 h-3 bg-white/20 rounded animate-pulse"></div>
                        <div className="w-16 h-8 bg-white/20 rounded animate-pulse mt-1"></div>
                      </div>
                      <div className="flex flex-col">
                        <div className="w-8 h-3 bg-white/20 rounded animate-pulse"></div>
                        <div className="w-16 h-8 bg-white/20 rounded animate-pulse mt-1"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="w-16 h-4 bg-white/20 rounded mb-0 animate-pulse"></div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col">
                        <div className="w-12 h-3 bg-white/20 rounded animate-pulse"></div>
                        <div className="w-20 h-8 bg-white/20 rounded animate-pulse mt-1"></div>
                      </div>
                      <div className="flex flex-col">
                        <div className="w-8 h-3 bg-white/20 rounded animate-pulse"></div>
                        <div className="w-20 h-8 bg-white/20 rounded animate-pulse mt-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4">
                  {/* Left Column: 운동 횟수 */}
                  <div className="flex flex-col">
                    <span className="text-[15px] text-white/90 font-bold mb-4">운동 횟수</span>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col items-start justify-center">
                        <span className="text-[12px] text-white/80 font-medium leading-none">이번 달</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-[30px] font-bold text-white font-barlow leading-none">{stats.thisMonthCount}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center">
                        <span className="text-[12px] text-white/80 font-medium leading-none">총</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-[30px] font-bold text-white font-barlow leading-none">{stats.totalCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 운동 시간 */}
                  <div className="flex flex-col">
                    <span className="text-[15px] text-white/90 font-bold mb-4">운동 시간</span>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col items-start justify-center">
                        <span className="text-[12px] text-white/80 font-medium leading-none">이번 달</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-[30px] font-bold text-white font-barlow leading-none">{stats.thisMonthDuration}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center">
                        <span className="text-[12px] text-white/80 font-medium leading-none">총</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-[30px] font-bold text-white font-barlow leading-none">{stats.totalDuration}</span>
                        </div>
                      </div>
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
              className="flex items-center gap-1 text-[#555] text-[13px] hover:text-[#666] transition"
            >
              <Image src="/trash.svg" alt="초기화" width={14} height={14} />
              <span className="underline decoration-[#555] underline-offset-4">운동 기록 초기화</span>
            </button>
          </div>
        )}
      </div>

      {/* Reset Modal */}
      <ConfirmDialog
        isOpen={showResetPopup}
        title={<>운동 기록을<br />초기화할까요?</>}
        description=""
        confirmText="네"
        cancelText="아니요"
        onConfirm={confirmReset}
        onCancel={() => setShowResetPopup(false)}
        confirmColor="#ffffff"
      />
    </div>
  );
}
