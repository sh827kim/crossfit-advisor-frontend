'use client';

import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();

  return (
    <header className="h-16 flex justify-between items-center px-6 bg-white z-20 sticky top-0 border-b border-gray-50">
      <div
        className="font-extrabold text-xl text-slate-800 tracking-tight cursor-pointer flex items-center hover:opacity-80 transition"
        onClick={() => router.push('/')}
      >
        <i className="fa-solid fa-dumbbell text-blue-600 mr-2.5"></i>애프터와드
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => router.push('/history')}
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
          title="운동 기록"
        >
          <i className="fa-solid fa-calendar-days text-lg"></i>
        </button>
        <button
          onClick={() => router.push('/profile')}
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition relative"
          title="프로필"
        >
          <i className="fa-solid fa-user text-lg"></i>
        </button>
      </div>
    </header>
  );
}
