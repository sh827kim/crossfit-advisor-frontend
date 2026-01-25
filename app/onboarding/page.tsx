'use client';

import { Suspense } from 'react';
import { OnboardingPage as OnboardingPageComponent } from '@/app/components/OnboardingPage';

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <main className="px-6 pb-6 pt-8 flex-grow flex flex-col justify-center items-center">
        <div className="text-center text-slate-400">로딩 중...</div>
      </main>
    }>
      <OnboardingPageComponent />
    </Suspense>
  );
}
