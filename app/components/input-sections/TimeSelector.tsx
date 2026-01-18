'use client';

const TIME_OPTIONS = [5, 10, 15, 20, 25, 30];

interface TimeSelectorProps {
  totalTime: number;
  setTotalTime: (time: number) => void;
}

export function TimeSelector({ totalTime, setTotalTime }: TimeSelectorProps) {
  return (
    <div className="mt-auto pt-6 border-t border-gray-100">
      <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center">
        <div className="w-1 h-4 bg-slate-800 mr-2 rounded-full"></div> 운동 시간 설정
      </label>
      <div className="grid grid-cols-6 gap-2 mb-6">
        {TIME_OPTIONS.map(time => (
          <button
            key={time}
            onClick={() => setTotalTime(time)}
            className={`flex items-center justify-center h-12 border rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${
              totalTime === time
                ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105'
                : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'
            }`}
          >
            {time}분
          </button>
        ))}
      </div>
    </div>
  );
}
