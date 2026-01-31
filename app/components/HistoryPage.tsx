'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

export function HistoryPage() {
  const router = useRouter();
  const { workoutHistory, isLoadingHistory } = useApp();

  // Initialize Date
  const [currentDate] = useState(new Date()); // For Calendar Month view
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar Logic
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Adjust for Mon start if needed? The CSS shows Mon first.
  // Standard JS getDay(): 0=Sun, 1=Mon.
  // We want Mon=0, Sun=6.
  const startDay = (firstDay + 6) % 7;

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Helper: Get Records
  const getRecords = (dateStr: string) => workoutHistory.filter(r => r.date === dateStr);

  // Helper: Get Dot Colors for a Day
  const getDots = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const records = getRecords(dateStr);
    if (records.length === 0) return [];

    // Map records to colors 
    // Design shows 3 dots max.
    const colors = records.map(r => {
      if (r.mode === 'balance-care') return '#F43000'; // Red
      if (r.mode === 'GOAL') return '#EEFD32'; // Yellow
      if (r.mode === 'PART') return '#00DCEB'; // Cyan
      return '#00DCEB'; // WOD/Others (Cyan)
    });

    return colors.slice(0, 3); // Max 3
  };

  const selectedDateRecords = getRecords(selectedDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <main className="min-h-screen bg-[#010101] text-white font-sf-pro relative overflow-hidden flex flex-col">
      {/* Background Decoration (Gradient) - Optional, based on design mood */}

      {/* Header */}
      <div className="pt-14 pb-4 px-5 flex items-center justify-between relative z-10">
        <button onClick={() => router.back()} className="text-white p-2 -ml-2">
          <i className="fa-solid fa-chevron-left text-lg" />
        </button>
        <h1 className="text-[17px] font-bold font-apple absolute left-1/2 -translate-x-1/2">
          {year}.{month + 1} 운동기록
        </h1>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Calendar Grid */}
      <div className="px-5 mt-4">
        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-4 text-center">
          {weekDays.map(d => (
            <div key={d} className="text-[13px] text-white/55 font-normal">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-6 justify-items-center">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDate;
            const dots = getDots(day);

            return (
              <div
                key={day}
                className="flex flex-col items-center cursor-pointer relative"
                onClick={() => setSelectedDate(dateStr)}
              >
                <div className={`w-[30px] h-[30px] flex items-center justify-center rounded-full text-[15px] mb-1 transition-all ${isSelected ? 'bg-white text-black font-bold' : 'text-white font-normal'
                  }`}>
                  {day}
                </div>

                {/* Dots Container */}
                <div className="flex gap-[3px] h-[5px] items-center absolute -bottom-2">
                  {dots.map((color, i) => (
                    <div key={i} className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Card List (Bottom Sheet style but inline for now) */}
      <div className="mt-10 px-5 pb-10 flex-1 overflow-y-auto">
        {selectedDateRecords.length > 0 ? (
          <div className="space-y-3">
            {selectedDateRecords.map((record, i) => (
              <div key={i} className="w-full bg-[#1F1F1F] rounded-[24px] border border-white/5 p-6 relative">
                {/* Mode Specific Styling */}
                <div className={`text-[13px] font-extrabold mb-1 ${record.mode === 'balance-care' ? 'text-[#F43000]' :
                  record.mode === 'GOAL' ? 'text-[#EEFD32]' : 'text-[#00DCEB]'
                  }`}>
                  {record.mode === 'balance-care' ? '밸런스 케어 운동' :
                    record.mode === 'GOAL' ? '골 케어 운동' :
                      record.mode === 'PART' ? '파트 케어 운동' : '오늘의 운동 (WOD)'}
                </div>

                {/* Main Title (Duration/Rounds) */}
                <div className="text-[24px] font-bold text-white mb-3 font-sf-pro">
                  {record.rounds
                    ? `${record.rounds} Rounds, ${Math.ceil(record.duration / 60)}분 운동`
                    : `${Math.ceil(record.duration / 60)}분 운동`
                  }
                </div>

                {/* Exercises */}
                <div className="text-[13px] text-[#787878] leading-relaxed line-clamp-2">
                  {record.exercises.join(', ')}
                </div>

                {/* Menu Dots (Visual) */}
                <div className="absolute top-6 right-6 flex gap-1">
                  <div className="w-[3px] h-[3px] bg-[#6B6B6B] rounded-full" />
                  <div className="w-[3px] h-[3px] bg-[#6B6B6B] rounded-full" />
                  <div className="w-[3px] h-[3px] bg-[#6B6B6B] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-white/30 text-sm">
            기록이 없습니다.
          </div>
        )}
      </div>
    </main>
  );
}
