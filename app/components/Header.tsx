'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

export function Header() {
  const router = useRouter();
  const { userProfileImage } = useApp();

  return (
    <header className="h-16 flex justify-between items-center px-6 bg-white z-20 sticky top-0 border-b border-gray-50">
      <div
        className="font-extrabold text-xl text-slate-800 tracking-tight cursor-pointer flex items-center hover:opacity-80 transition"
        onClick={() => router.replace('/')}
      >
        <i className="fa-solid fa-dumbbell text-blue-600 mr-2.5"></i>애프터와드
      </div>
      <div className="flex gap-3 items-center">
        <button
          onClick={() => router.push('/history')}
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
          title="운동 기록"
        >
          <i className="fa-solid fa-calendar-days text-lg"></i>
        </button>
        <button
          onClick={() => router.push('/profile')}
          className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold border border-blue-200 overflow-hidden hover:opacity-80 transition"
          title="프로필"
        >
          {userProfileImage ? (
            <img
              src={userProfileImage}
              alt="프로필"
              className="w-full h-full object-cover"
            />
          ) : (
            <i className="fa-solid fa-user text-lg"></i>
          )}
        </button>
      </div>
    </header>
  );
}
