'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/app/context/AppContext';

import { getProfileColorByIndex } from '@/app/lib/profile-colors';
import { CalendarIcon } from '@/app/components/shared/icons/CalendarIcon';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { userNickname, userProfileColorIndex } = useApp();

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
      <div className="flex gap-4 items-center">
        <button
          onClick={() => router.push('/history')}
          className="flex items-center justify-center text-white hover:opacity-80 transition"
          title="운동 기록"
        >
          <CalendarIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => router.push('/profile')}
          className="w-8 h-8 rounded-full relative flex items-center justify-center text-[10px] font-bold overflow-hidden border border-gray-700 hover:border-gray-600 hover:opacity-80 transition"
          style={{
            backgroundColor: getProfileColorByIndex(userProfileColorIndex),
            color: '#000000',
          }}
          title="프로필"
        >
          <span>{(userNickname || '신').charAt(0)}</span>
        </button>
      </div>
    </header>
  );
}
