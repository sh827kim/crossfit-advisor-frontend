'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/app/context/AppContext';

import { PROFILE_BACKGROUND_COLORS, getProfileColor } from '@/app/lib/profile-colors';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfileImage, userNickname } = useApp();

  // 특정 화면에서는 글로벌 헤더를 숨김 (페이지 자체 헤더/플로우 사용)
  const hideHeaderPrefixes = ['/onboarding', '/goal-care', '/balance-care', '/part-care', '/profile', '/history'];
  if (hideHeaderPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null;
  }

  return (
    <header className="h-16 flex justify-between items-center px-6 z-20 sticky top-0 bg-black">
      <div
        className="font-extrabold text-lg tracking-tight cursor-pointer flex items-center hover:opacity-80 transition text-white"
        onClick={() => router.replace('/')}
      >
        {/* Logo and Text removed as requested */}
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
                backgroundColor: getProfileColor(userNickname),
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
