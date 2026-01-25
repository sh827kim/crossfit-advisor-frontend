'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/app/context/AppContext';

// 닉네임 기반 프로필 배경색 생성 (OnboardingPage와 동일)
const backgroundColors = [
  '#FF6B6B', // 빨강
  '#4ECDC4', // 청록
  '#45B7D1', // 파랑
  '#FFA07A', // 라이트 산호
  '#98D8C8', // 민트
  '#F7DC6F', // 노랑
  '#BB8FCE', // 보라
  '#85C1E2', // 하늘
  '#F8B88B', // 살구
  '#ABEBC6', // 라임
];

const getRandomColor = (seed: string) => {
  const charCode = seed.charCodeAt(0) || 0;
  return backgroundColors[charCode % backgroundColors.length];
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfileImage, userNickname } = useApp();

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
        className={`font-extrabold text-lg tracking-tight cursor-pointer flex items-center hover:opacity-80 transition italic ${
          isHomePage ? 'text-white' : 'text-slate-800'
        }`}
        onClick={() => router.replace('/')}
        style={{ fontFamily: 'SF Pro, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}
      >
        <i
          className={`fa-solid fa-dumbbell mr-2.5 ${
            isHomePage ? 'text-[#f43000]' : 'text-blue-600'
          }`}
        ></i>
        AFTERWOD
      </div>
      <div className="flex gap-3 items-center">
        <button
          onClick={() => router.push('/history')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
            isHomePage
              ? 'bg-gray-900 text-gray-500 hover:text-[#f43000] hover:bg-gray-800'
              : 'bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50'
          }`}
          title="운동 기록"
        >
          <i className="fa-solid fa-calendar-days text-lg"></i>
        </button>
        <button
          onClick={() => router.push('/profile')}
          className={`w-10 h-10 rounded-full relative flex items-center justify-center text-xs font-bold overflow-hidden border transition ${
            isHomePage
              ? 'border-gray-700 hover:border-gray-600 hover:opacity-80'
              : 'border-blue-200 hover:opacity-80'
          }`}
          style={
            !userProfileImage && userNickname
              ? {
                  backgroundColor: getRandomColor(userNickname),
                  color: '#000000',
                }
              : isHomePage
              ? { backgroundColor: '#1F1F1F', color: '#9CA3AF' }
              : { backgroundColor: '#DBEAFE', color: '#2563EB' }
          }
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
            <span>{(userNickname || '신').charAt(0)}</span>
          )}
        </button>
      </div>
    </header>
  );
}
