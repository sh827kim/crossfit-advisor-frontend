'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useConversationId } from '@/app/hooks/use-conversation-id';
import { useChatSSE } from '@/app/hooks/use-chat-sse';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toaster, toast } from 'sonner';
import 'highlight.js/styles/atom-one-dark.css';

/**
 * 채팅 인터페이스 컴포넌트
 * - 메시지 리스트 표시
 * - 사용자 입력 폼
 * - SSE 스트리밍 지원
 */
export default function ChatInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { conversationId, resetConversationId } = useConversationId();
  const { session, sendMessage, clearMessages, disconnect } = useChatSSE(conversationId!);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 초기 메시지 전송 여부를 ref로 관리 (한 번만 실행되도록)
  const hasInitialMessageSentRef = useRef(false);

  // 새로운 메시지 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  // URL 파라미터에서 초기 메시지를 받아 자동 전송 (한 번만 실행)
  // WOD 입력 페이지에서 OCR 또는 텍스트를 채팅으로 전달할 때 사용
  useEffect(() => {
    // 이미 초기 메시지를 전송했으면 실행하지 않음
    if (hasInitialMessageSentRef.current) {
      return;
    }

    const initialMessage = searchParams.get('initialMessage');

    // 초기 메시지가 있고, 세션 준비가 완료된 경우
    if (initialMessage && !session.isLoading && session.messages.length === 0) {
      hasInitialMessageSentRef.current = true;
      const decodedMessage = decodeURIComponent(initialMessage);
      sendMessage(decodedMessage);

      // URL에서 파라미터 제거 (히스토리 정리)
      window.history.replaceState({}, '', '/chat');
    }
  }, [searchParams, sendMessage]);

  // 컴포넌트 언마운트 시 연결 종료
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // 메시지 전송 핸들러
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || session.isLoading) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  // 새로운 대화 시작
  const handleNewConversation = () => {
    resetConversationId();
    clearMessages();
    toast.success('새 대화가 시작되었습니다.');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <Toaster position="top-center" />

      {/* 헤더 */}
      <nav className="bg-slate-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-amber-600">
                🏋️ 또와드 - AI 채팅
              </h1>
              {session.isConnected && (
                <Badge variant="success">연결됨</Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
              >
                새 대화
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
              >
                대시보드로
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 메시지 리스트 */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
        {session.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Alert>
              <AlertDescription>
                💡 메시지를 입력하여 AI와 대화를 시작하세요.
                <br />
                보강운동 추천, 강도 조절 등을 요청할 수 있습니다.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <Card
                  className={`max-w-[80%] md:max-w-[60%] p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-slate-800 text-white border border-amber-600'
                      : 'bg-slate-900 text-white border border-slate-700'
                  }`}
                >
                  {message.role === 'user' ? (
                    // 사용자 메시지: 일반 텍스트
                    <div className="whitespace-pre-wrap break-words text-sm md:text-base">
                      {message.content}
                      {message.isStreaming && (
                        <span className="inline-block ml-1 animate-pulse">▋</span>
                      )}
                    </div>
                  ) : (
                    // AI 메시지: 마크다운 렌더링
                    <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          // 커스텀 컴포넌트: 마크다운 요소 스타일링
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold mt-3 mb-2">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-bold mt-2 mb-1">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-sm leading-relaxed mb-2">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside text-sm mb-2 space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside text-sm mb-2 space-y-1">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-sm">{children}</li>
                          ),
                          code: (props: any) => {
                            const { inline, children } = props;
                            return inline ? (
                              <code className="bg-slate-800 text-amber-500 px-1.5 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ) : (
                              <code className="block bg-slate-800 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2">
                                {children}
                              </code>
                            );
                          },
                          pre: ({ children }) => (
                            <pre className="bg-slate-800 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs font-mono my-2">
                              {children}
                            </pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-amber-600 pl-4 italic text-gray-300 my-2">
                              {children}
                            </blockquote>
                          ),
                          table: ({ children }) => (
                            <table className="border-collapse border border-slate-700 text-xs my-2">
                              {children}
                            </table>
                          ),
                          th: ({ children }) => (
                            <th className="border border-slate-700 px-2 py-1 bg-slate-800">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-slate-700 px-2 py-1">{children}</td>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-500 hover:underline"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block ml-1 animate-pulse">▋</span>
                      )}
                    </div>
                  )}
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </Card>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* 입력 폼 */}
      <footer className="bg-slate-900 border-t border-slate-700 px-4 py-4">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex gap-2"
        >
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              session.isLoading
                ? 'AI가 응답 중입니다...'
                : '메시지를 입력하세요'
            }
            disabled={session.isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={session.isLoading || !inputMessage.trim()}
          >
            {session.isLoading ? '전송 중...' : '전송'}
          </Button>
        </form>
      </footer>
    </div>
  );
}
