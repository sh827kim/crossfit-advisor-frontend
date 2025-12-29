import { Suspense } from 'react';
import DashboardContent from './dashboard-content';

/**
 * 대시보드 페이지
 * Suspense로 감싼 클라이언트 컴포넌트
 */
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <DashboardContent />
    </Suspense>
  );
}

/**
 * 로딩 상태 UI
 */
function DashboardLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">로드 중...</p>
      </div>
    </div>
  );
}
