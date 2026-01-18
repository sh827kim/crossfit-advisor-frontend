'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

export function ProfilePage() {
  const router = useRouter();
  const { workoutHistory } = useApp();
  const [nickName, setNickName] = useState('크로스핏 애호가');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(nickName);

  // localStorage에서 닉네임 로드
  useEffect(() => {
    const savedName = localStorage.getItem('cf_user_nickname');
    if (savedName) {
      setNickName(savedName);
      setTempName(savedName);
    }
  }, []);

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
      setNickName(tempName.trim());
      localStorage.setItem('cf_user_nickname', tempName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempName(nickName);
    setIsEditing(false);
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
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl text-blue-600 border-4 border-white shadow-sm">
          <i className="fa-solid fa-user-astronaut"></i>
        </div>

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
              <h2 className="text-xl font-black text-slate-800">{nickName}</h2>
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
