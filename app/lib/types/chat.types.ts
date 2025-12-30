/**
 * 채팅 메시지 전송 요청
 */
export interface ChatCommand {
  message: string;
}

/**
 * 채팅 메시지 (UI 표시용)
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

/**
 * 채팅 세션 상태
 */
export interface ChatSession {
  conversationId: string;
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
}
