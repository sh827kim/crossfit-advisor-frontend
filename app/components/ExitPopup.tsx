'use client';

import { useApp } from '@/app/context/AppContext';

/**
 * PWA 종료 팝업
 */
export function ExitPopup() {
  const { showExitPopup, setShowExitPopup } = useApp();

  const handleExit = () => {
    // PWA 앱 종료 (메인 화면으로 돌아감)
    const nav = window.navigator as any;
    if (nav.app && nav.app.exitApp) {
      nav.app.exitApp();
    } else {
      // 일반 웹에서는 현재 탭 종료 불가능하므로 팝업 닫음
      setShowExitPopup(false);
    }
  };

  const handleCancel = () => {
    setShowExitPopup(false);
  };

  if (!showExitPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full">
        <h3 className="text-xl font-black text-slate-800 mb-2 text-center">앱을 종료하시겠어요?</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          진행 중인 운동이 있으면 중단됩니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-2xl transition"
          >
            계속하기
          </button>
          <button
            onClick={handleExit}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl transition"
          >
            종료
          </button>
        </div>
      </div>
    </div>
  );
}
