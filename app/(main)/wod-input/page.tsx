import { Suspense } from 'react';
import { WodInputContent } from './wod-input-content';

/**
 * WOD 입력 페이지 (Server Component)
 * OCR 또는 텍스트 입력을 통해 WOD 정보를 입력받는 페이지
 */
export default function WodInputPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* 헤더 */}
      <nav className="bg-slate-900 shadow">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <h1 className="text-2xl font-bold text-amber-600">
              🏋️ WOD 입력
            </h1>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-r-transparent" />
                <p className="text-gray-400">WOD 입력 페이지 로딩 중...</p>
              </div>
            </div>
          }
        >
          <WodInputContent />
        </Suspense>
      </main>
    </div>
  );
}
