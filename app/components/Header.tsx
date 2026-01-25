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

  return (
    <header className="h-16 flex justify-between items-center px-6 z-20 sticky top-0 bg-black">
      <div
        className="font-extrabold text-lg tracking-tight cursor-pointer flex items-center hover:opacity-80 transition italic text-white"
        onClick={() => router.replace('/')}
        style={{ fontFamily: 'SF Pro, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}
      >
        <i className="fa-solid fa-dumbbell mr-2.5 text-[#f43000]"></i>
        AFTERWOD
      </div>
      <div className="flex gap-3 items-center">
        <button
          onClick={() => router.push('/history')}
          className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-500 hover:text-[#f43000] hover:bg-gray-800 transition"
          title="운동 기록"
        >
          <i className="fa-solid fa-calendar-days text-lg"></i>
        </button>
        <button
          onClick={() => router.push('/profile')}
          className="w-10 h-10 rounded-full relative flex items-center justify-center text-xs font-bold overflow-hidden border border-gray-700 hover:border-gray-600 hover:opacity-80 transition"
          style={
            !userProfileImage && userNickname
              ? {
                  backgroundColor: getRandomColor(userNickname),
                  color: '#000000',
                }
              : { backgroundColor: '#1F1F1F', color: '#9CA3AF' }
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
