'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { ConfirmDialog } from '@/app/components/shared/ConfirmDialog';

export function HistoryPage() {
  const router = useRouter();
  const { workoutHistory, deleteWorkoutRecord } = useApp();

  // Initialize State: combine viewDate and selectedDate
  const [historyState, setHistoryState] = useState(() => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return {
      viewDate: now,
      selectedDate: dateStr
    };
  });

  const { viewDate: currentDate, selectedDate } = historyState;

  // 삭제 메뉴 상태
  const [activeMenuRecordId, setActiveMenuRecordId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month Navigation
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const handlePrevMonth = () => {
    const prevDate = new Date(year, month - 1, 1);
    const newYear = prevDate.getFullYear();
    const newMonth = prevDate.getMonth();

    // Check if we navigated back to current month
    const isNowCurrentMonth = newYear === now.getFullYear() && newMonth === now.getMonth();

    let newSelectedDate = '';
    if (isNowCurrentMonth) {
      newSelectedDate = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    } else {
      newSelectedDate = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-01`;
    }

    setHistoryState({
      viewDate: prevDate,
      selectedDate: newSelectedDate
    });
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return; // Prevent going to future

    const nextDate = new Date(year, month + 1, 1);
    const newYear = nextDate.getFullYear();
    const newMonth = nextDate.getMonth();

    const isNowCurrentMonth = newYear === now.getFullYear() && newMonth === now.getMonth();

    let newSelectedDate = '';
    if (isNowCurrentMonth) {
      newSelectedDate = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    } else {
      newSelectedDate = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-01`;
    }

    setHistoryState({
      viewDate: nextDate,
      selectedDate: newSelectedDate
    });
  };

  // Stats for the displayed month
  const monthlyStats = useMemo(() => {
    const statsRecords = workoutHistory.filter(r => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const count = statsRecords.length;
    const duration = Math.ceil(statsRecords.reduce((acc, r) => acc + (r.duration || 0), 0) / 60);
    return { count, duration };
  }, [workoutHistory, year, month]);

  // NEW: Current Month Records (Sorted Desc)
  const monthlyRecords = useMemo(() => {
    return workoutHistory
      .filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workoutHistory, year, month]);

  const handleDeleteClick = (id: number) => {
    setActiveMenuRecordId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (activeMenuRecordId !== null) {
      await deleteWorkoutRecord(activeMenuRecordId);
      setShowDeleteConfirm(false);
      setActiveMenuRecordId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setActiveMenuRecordId(null);
  };

  // Calendar Logic
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Mon start: 0=Mon, ... 6=Sun
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

    const colors = records.map(r => {
      if (r.mode === 'BALANCE') return '#F43000'; // Red
      if (r.mode === 'GOAL') return '#EEFD32'; // Yellow
      if (r.mode === 'PART') return '#00DCEB'; // Cyan
      return '#00DCEB';
    });

    return colors.slice(0, 3);
  };

  const selectedDateRecords = getRecords(selectedDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <main className="h-screen bg-[#010101] text-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-[60px] flex items-center justify-between px-5 relative z-10">
        <button onClick={() => router.push('/')} className="w-10 h-10 flex items-center justify-center text-white hover:opacity-80 transition">
          <i className="fa-solid fa-xmark text-[24px] text-gray-400" />
        </button>
        <div className="w-10" />
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-8 mb-6 mt-2">
        <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full transition">
          <i className="fa-solid fa-chevron-left text-[16px] text-gray-500 hover:text-white transition"></i>
        </button>
        <h1 className="text-[20px] font-bold font-barlow tabular-nums tracking-wide text-center pt-1">
          {year}.{String(month + 1).padStart(2, '0')}
        </h1>
        <button
          onClick={handleNextMonth}
          disabled={isCurrentMonth}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition ${isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/5'}`}
        >
          <i className="fa-solid fa-chevron-right text-[16px] text-gray-500 hover:text-white transition"></i>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="px-5 mb-6">
        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-4 text-center">
          {weekDays.map(d => (
            <div key={d} className="text-[12px] text-white/30 font-bold uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-2 justify-items-center" key={`${year}-${month}`}>
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDate;
            const dots = getDots(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div
                key={day}
                className="flex flex-col items-center cursor-pointer relative py-2 w-full"
                onClick={() => setHistoryState(prev => ({ ...prev, selectedDate: dateStr }))}
              >
                <div className={`w-[30px] h-[30px] flex items-center justify-center rounded-full text-[14px] transition-all font-barlow
                    ${isSelected
                    ? 'bg-white text-black font-bold shadow-lg'
                    : isToday
                      ? 'text-[#F43000] font-bold bg-[#F43000]/10 border border-[#F43000]/30'
                      : 'text-white/80 font-medium hover:bg-white/5'
                  }`}>
                  {day}
                </div>

                {/* Dots Container */}
                <div className="flex gap-[3px] h-[4px] items-center absolute bottom-1">
                  {dots.map((color, i) => (
                    <div key={i} className="w-[4px] h-[4px] rounded-full shadow-[0_0_4px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Header */}
      <div className='px-6 mb-4'>
        <h3 className='text-[14px] font-bold text-white/40 tracking-wide font-barlow'>{selectedDate.replace(/-/g, '.')}</h3>
      </div>

      {/* Floating Card List */}
      <div className="px-5 pb-10 flex-1 overflow-y-auto no-scrollbar pt-2">
        {selectedDateRecords.length > 0 ? (
          <div className="space-y-3">
            {selectedDateRecords.map((record, i) => {
              const recordDate = new Date(record.date);
              const dateDisplay = `${String(recordDate.getMonth() + 1).padStart(2, '0')}.${String(recordDate.getDate()).padStart(2, '0')}`;

              return (
                <div key={i} className="bg-[#1F1F1F] border border-white/5 rounded-[24px] p-5 relative group transition-all active:scale-[0.98]">
                  {/* Header Row: Mode & Date & Menu */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-[6px] h-[6px] rounded-full ${record.mode === 'BALANCE' ? 'bg-[#F43000] shadow-[0_0_8px_#F43000]' :
                        record.mode === 'GOAL' ? 'bg-[#EEFD32] shadow-[0_0_8px_#EEFD32]' : 'bg-[#00DCEB] shadow-[0_0_8px_#00DCEB]'
                        }`} />
                      <span className={`text-[12px] font-bold tracking-wider ${record.mode === 'BALANCE' ? 'text-[#F43000]' :
                        record.mode === 'GOAL' ? 'text-[#EEFD32]' : 'text-[#00DCEB]'
                        }`}>
                        {record.mode === 'BALANCE' ? '밸런스 케어 운동' :
                          record.mode === 'GOAL' ? '목표 관리 운동' :
                            record.mode === 'PART' ? '부위별 운동' : '자유 운동'}
                      </span>
                      <span className="text-[12px] text-gray-500 font-medium ml-1 border-l border-white/10 pl-2 font-barlow">
                        {dateDisplay}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (record.id != null) {
                          setActiveMenuRecordId(activeMenuRecordId === record.id ? null : record.id as number);
                        }
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition -mt-1 -mr-1"
                    >
                      <i className="fa-solid fa-ellipsis text-white/50 text-sm"></i>
                    </button>
                  </div>

                  {/* Main Title */}
                  <div className="text-[20px] font-extrabold text-white mb-2 font-barlow tracking-tight">
                    {record.rounds
                      ? `${record.rounds} Rounds`
                      : `${Math.ceil(record.duration / 60)}분 운동`
                    }
                    <span className="text-[13px] font-bold text-gray-500 ml-2 align-middle">
                      / {Math.ceil(record.duration / 60)} mins
                    </span>
                  </div>

                  {/* Exercises */}
                  <div className="text-[14px] text-gray-400 font-medium leading-relaxed line-clamp-2 pr-8">
                    {record.exercises.join(', ')}
                  </div>

                  {/* Delete Menu Popup */}
                  {activeMenuRecordId === record.id && !showDeleteConfirm && (
                    <div className="absolute right-6 top-10 z-20 animate-fadeInFast origin-top-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open Cancel/Confirm Modal
                          if (record.id != null) {
                            handleDeleteClick(record.id as number);
                          }
                        }}
                        className="w-[100px] py-2.5 bg-[#333333] border border-white/10 shadow-xl rounded-xl flex items-center justify-center gap-2 hover:bg-[#444444] transition active:scale-95"
                      >
                        <i className="fa-solid fa-trash-can text-[#999999] text-[12px]"></i>
                        <span className="text-[13px] text-[#DDDDDD] font-bold">삭제하기</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <i className="fa-regular fa-calendar-xmark text-5xl mb-4"></i>
            <p className="text-[14px] font-medium">운동 기록이 없습니다</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="기록 삭제"
        description={<>선택한 운동 기록이 영구적으로 삭제됩니다.<br />계속하시겠습니까?</>}
        confirmText="삭제하기"
        cancelText="취소"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmColor="#f43000"
      />
    </main>
  );
}
