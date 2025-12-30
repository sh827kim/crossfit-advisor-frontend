import { Suspense } from 'react';
import SettingsForm from './settings-form';

/**
 * 사용자 설정 페이지
 * 인증이 필요한 페이지
 */
export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoadingFallback />}>
      <SettingsForm />
    </Suspense>
  );
}

/**
 * 로딩 상태 UI
 */
function SettingsLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">설정 로드 중...</p>
      </div>
    </div>
  );
}
