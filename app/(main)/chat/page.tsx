import { Suspense } from 'react';
import ChatInterface from './chat-interface';

/**
 * 채팅 페이지
 * 인증이 필요한 페이지
 */
export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <ChatInterface />
    </Suspense>
  );
}

/**
 * 로딩 상태 UI
 */
function ChatLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">채팅 초기화 중...</p>
      </div>
    </div>
  );
}
