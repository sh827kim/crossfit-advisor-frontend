'use client';

import { useState, useRef, useCallback } from 'react';
import { createChatSSE } from '@/app/lib/api/chat.api';
import type { ChatMessage, ChatSession } from '@/app/lib/types/chat.types';

/**
 * 채팅 SSE 연결 관리 훅
 * - 메시지 전송 및 스트리밍 수신
 * - 연결 상태 관리
 */
export function useChatSSE(conversationId: string) {
  const [session, setSession] = useState<ChatSession>({
    conversationId,
    messages: [],
    isConnected: false,
    isLoading: false,
  });

  const currentMessageRef = useRef<ChatMessage | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 메시지 전송 및 SSE 연결
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    // AI 응답 메시지 초기화 (스트리밍용)
    currentMessageRef.current = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    try {
      // SSE 연결 생성
      await createChatSSE(
        message,
        conversationId,
        handleSSEChunk,
        handleSSEError,
        handleSSEClose
      );
    } catch (err) {
      console.error('메시지 전송 오류:', err);
      setSession((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [conversationId]);

  /**
   * SSE 청크 수신 핸들러
   */
  const handleSSEChunk = useCallback((chunk: string) => {
    // 참조 없으면 새로운 메시지 생성
    if (!currentMessageRef.current) {
      currentMessageRef.current = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: chunk,
        timestamp: Date.now(),
        isStreaming: true,
      };
    } else {
      // 청크를 기존 content에 추가
      currentMessageRef.current.content += chunk;
    }

    setSession((prev) => {
      // setState 콜백 내에서도 참조 유효성 확인
      const currentMsg = currentMessageRef.current;
      if (!currentMsg) {
        console.warn('currentMessage is null in setState callback');
        return prev;
      }

      const messages = [...prev.messages];
      const lastMessage = messages[messages.length - 1];

      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
        // 기존 스트리밍 메시지 업데이트
        lastMessage.content = currentMsg.content;
      } else {
        // 새로운 스트리밍 메시지 추가
        messages.push({ ...currentMsg });
      }

      return {
        ...prev,
        messages,
      };
    });
  }, []);

  /**
   * SSE 에러 핸들러
   */
  const handleSSEError = useCallback((error: Error) => {
    console.error('SSE 에러:', error);

    // 에러 메시지 추가
    const errorMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `오류가 발생했습니다: ${error.message}`,
      timestamp: Date.now(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, errorMessage],
      isLoading: false,
      isConnected: false,
    }));

    currentMessageRef.current = null;
  }, []);

  /**
   * SSE 연결 종료 핸들러
   */
  const handleSSEClose = useCallback(() => {
    if (currentMessageRef.current) {
      // 스트리밍 메시지 스트리밍 상태 제거
      currentMessageRef.current.isStreaming = false;

      setSession((prev) => {
        const messages = [...prev.messages];
        const lastMessage = messages[messages.length - 1];

        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.isStreaming = false;
        }

        return {
          ...prev,
          messages,
          isLoading: false,
          isConnected: false,
        };
      });

      currentMessageRef.current = null;
    } else {
      setSession((prev) => ({
        ...prev,
        isConnected: false,
        isLoading: false,
      }));
    }
  }, []);

  /**
   * 채팅 초기화 (메시지 삭제)
   */
  const clearMessages = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      messages: [],
    }));
    currentMessageRef.current = null;
  }, []);

  /**
   * 연결 종료
   */
  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setSession((prev) => ({
      ...prev,
      isConnected: false,
      isLoading: false,
    }));
  }, []);

  return {
    session,
    sendMessage,
    clearMessages,
    disconnect,
  };
}
