'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

export function HistoryPage() {
  const router = useRouter();
  const { workoutHistory, isLoadingHistory } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [today] = useState(() => new Date());

  // 초기 로드 시 오늘 날짜를 선택
  useEffect(() => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(todayStr);
  }, [today]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // 캘린더 생성
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // 기록 조회
  const getRecordsForDate = (date: string) => {
    return workoutHistory.filter(record => record.date === date);
  };

  // 해당 날짜에 기록이 있는지 확인
  const hasRecord = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workoutHistory.some(record => record.date === dateStr);
  };

  // 오늘 날짜인지 확인
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const modeDisplay: Record<string, string> = {
    'WOD': '부족 부위',
    'GOAL': '목표',
    'PART': '타겟'
  };

  const selectedDateRecords = selectedDate ? getRecordsForDate(selectedDate) : [];

  // 로딩 중일 때
  if (isLoadingHistory) {
    return (
      <main className="px-6 pb-6 flex-grow flex flex-col justify-center">
        <p className="text-center text-slate-400">운동 기록을 불러오는 중...</p>
      </main>
    );
  }

  return (
    <main className="px-6 pb-6 flex-grow flex flex-col">
      <div className="h-16 flex items-center mb-2 mt-6">
        <button
          onClick={() => router.replace('/')}
          className="text-slate-400 hover:text-slate-800 transition mr-4"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h2 className="text-2xl font-black text-slate-800">운동 기록</h2>
      </div>

      {/* 캘린더 */}
      <div className="bg-white rounded-3xl shadow-lg shadow-gray-100 border border-gray-50 p-6 mb-6">
        <div className="text-center font-bold text-lg mb-6 text-slate-800">
          {year}년 {month + 1}월
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-2 text-center mb-2 text-xs font-bold text-slate-300">
          <div>일</div>
          <div>월</div>
          <div>화</div>
          <div>수</div>
          <div>목</div>
          <div>금</div>
          <div>토</div>
        </div>

        {/* 캘린더 일자 */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dateStr = day
              ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              : null;

            return (
              <div
                key={index}
                onClick={() => dateStr && setSelectedDate(dateStr)}
                className={`aspect-square flex items-center justify-center rounded-lg font-bold text-sm cursor-pointer transition ${
                  day === null
                    ? 'text-transparent'
                    : hasRecord(day)
                    ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                    : isToday(day)
                    ? 'bg-orange-100 text-slate-800 border-2 border-orange-500 hover:bg-orange-200'
                    : 'text-slate-400 hover:bg-gray-100'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* 기록 상세 */}
      <div className="bg-slate-50 rounded-2xl p-6 flex-grow overflow-y-auto border border-slate-100">
        {!selectedDate ? (
          <p className="text-center text-slate-400 text-sm py-8">
            날짜를 선택하여 기록을 확인하세요.
          </p>
        ) : selectedDateRecords.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">
            이 날짜에 기록된 운동이 없습니다.
          </p>
        ) : (
          <>
            <h3 className="font-black mb-4 sticky top-0 bg-slate-50 pb-2 border-b border-slate-200 text-slate-800">
              {selectedDate}
            </h3>
            <div className="space-y-3">
              {selectedDateRecords.map((record, index) => (
                <div
                  key={index}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"
                >
                  <div className="flex justify-between mb-3 items-center">
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                      {modeDisplay[record.mode] || record.mode}
                    </span>
                    <span className="text-sm font-bold text-blue-600">{record.duration}분</span>
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed font-medium">
                    {record.exercises.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
