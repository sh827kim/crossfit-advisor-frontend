'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { compressImage } from '@/app/lib/image-utils';

export function ProfilePage() {
  const router = useRouter();
  const { workoutHistory, userNickname, setUserNickname, userProfileImage, setUserProfileImage } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userNickname);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 현재 월의 기록 개수 계산
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const thisMonthCount = workoutHistory.filter(record => {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        try {
          // 이미지 압축
          const compressedBase64 = await compressImage(base64, 300, 300, 0.8);
          setUserProfileImage(compressedBase64);
        } catch (error) {
          console.error('이미지 압축 실패:', error);
          setUserProfileImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="px-6 pb-6 flex-grow flex flex-col">
      <button
        onClick={() => router.push('/')}
        className="text-sm font-bold text-slate-400 mb-6 flex items-center w-fit hover:text-slate-800 transition mt-6"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i> 메인으로
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-lg shadow-gray-100 text-center border border-gray-50 flex-grow flex flex-col items-center justify-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative group"
        >
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl text-blue-600 border-4 border-white shadow-sm overflow-hidden cursor-pointer group-hover:border-blue-600 transition">
            {userProfileImage ? (
              <img
                src={userProfileImage}
                alt="프로필"
                className="w-full h-full object-cover"
              />
            ) : (
              <i className="fa-solid fa-user-astronaut"></i>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition mx-auto w-24 h-24 mt-4"></div>
          <div className="text-xs text-slate-400 text-center group-hover:text-blue-600 transition font-medium">
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
          <div className="w-full max-w-xs mb-4">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-blue-500 rounded-xl text-center font-bold text-lg text-slate-800 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSaveName}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition"
              >
                저장
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-bold rounded-lg transition"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-black text-slate-800">{userNickname}</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-blue-600"
                title="닉네임 변경"
              >
                <i className="fa-solid fa-pen-to-square text-sm"></i>
              </button>
            </div>
          </div>
        )}

        <p className="text-sm text-slate-400 mb-6">운동 기록 관리</p>

        <div className="bg-blue-50 rounded-xl p-4 mb-6 w-full">
          <p className="text-blue-800 text-sm font-bold">이번 달 운동 횟수</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{thisMonthCount}회</p>
        </div>

        {workoutHistory.length === 0 && (
          <p className="text-sm text-slate-400">아직 기록된 운동이 없습니다.</p>
        )}
      </div>
    </main>
  );
}
