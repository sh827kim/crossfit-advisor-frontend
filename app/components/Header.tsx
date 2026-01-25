'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/app/context/AppContext';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfileImage } = useApp();

  // 온보딩 페이지에서는 Header 렌더링하지 않음
  if (pathname === '/onboarding') {
    return null;
  }

  // 홈페이지 여부 (검은 배경 적용)
  const isHomePage = pathname === '/';

  return (
    <header
      className={`h-16 flex justify-between items-center px-6 z-20 sticky top-0 ${
        isHomePage
          ? 'bg-black border-b border-gray-800'
          : 'bg-white border-b border-gray-50'
      }`}
    >
      <div
        className={`font-extrabold text-xl tracking-tight cursor-pointer flex items-center hover:opacity-80 transition ${
          isHomePage ? 'text-white' : 'text-slate-800'
        }`}
        onClick={() => router.replace('/')}
      >
        <i
          className={`fa-solid fa-dumbbell mr-2.5 ${
            isHomePage ? 'text-blue-400' : 'text-blue-600'
          }`}
        ></i>
        애프터와드
      </div>
      <div className="flex gap-3 items-center">
        <button
          onClick={() => router.push('/history')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
            isHomePage
              ? 'bg-gray-900 text-gray-500 hover:text-blue-400 hover:bg-gray-800'
              : 'bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50'
          }`}
          title="운동 기록"
        >
          <i className="fa-solid fa-calendar-days text-lg"></i>
        </button>
        <button
          onClick={() => router.push('/profile')}
          className={`w-10 h-10 rounded-full relative flex items-center justify-center text-sm font-bold overflow-hidden hover:opacity-80 transition ${
            isHomePage
              ? 'bg-blue-600 text-white border border-blue-500'
              : 'bg-blue-100 text-blue-600 border border-blue-200'
          }`}
          title="프로필"
        >
          {userProfileImage ? (
            <Image
              src={userProfileImage}
              alt="프로필"
              fill
              sizes="40px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <i className="fa-solid fa-user text-lg"></i>
          )}
        </button>
      </div>
    </header>
  );
}
