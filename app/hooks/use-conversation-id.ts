'use client';

import { useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Conversation ID 관리 훅
 * - UUID 생성 및 sessionStorage 저장
 * - 페이지 새로고침 시에도 sessionStorage로 복원
 * - 새로운 대화 시작 시 ID 재생성
 */
export function useConversationId() {
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    // sessionStorage에서 기존 ID 조회
    const storedId = sessionStorage.getItem('conversation_id');

    if (storedId) {
      conversationIdRef.current = storedId;
    } else {
      // 새로운 UUID 생성
      const newId = uuidv4();
      conversationIdRef.current = newId;
      sessionStorage.setItem('conversation_id', newId);
    }
  }, []);

  /**
   * 새로운 대화 시작 (ID 재생성)
   */
  const resetConversationId = () => {
    const newId = uuidv4();
    conversationIdRef.current = newId;
    sessionStorage.setItem('conversation_id', newId);
    return newId;
  };

  return {
    conversationId: conversationIdRef.current,
    resetConversationId,
  };
}
