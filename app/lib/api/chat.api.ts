import { ensureValidAccessToken } from '../api';
import type { ChatCommand } from '../types/chat.types';

/**
 * SSE 채팅 연결 생성 (POST 방식)
 * POST /api/accessory/chat
 * Header: Conversation-Id (UUID)
 *
 * @param message 사용자 메시지
 * @param conversationId 대화 세션 ID (UUID)
 * @param onChunk 메시지 청크 수신 콜백
 * @param onError 에러 콜백
 * @param onClose 연결 종료 콜백
 * @returns Promise (연결 완료 시 resolve)
 */
export async function createChatSSE(
  message: string,
  conversationId: string,
  onChunk: (chunk: string) => void,
  onError: (error: Error) => void,
  onClose: () => void
): Promise<void> {
  try {
    // 유효한 Access Token 확보
    const accessToken = await ensureValidAccessToken();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error('NEXT_PUBLIC_BACKEND_URL 환경변수가 설정되지 않았습니다.');
    }

    // POST 요청으로 메시지 전송
    const response = await fetch(`${backendUrl}/api/accessory/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Conversation-Id': conversationId,
      },
      body: JSON.stringify({ message } as ChatCommand),
    });

    if (!response.ok) {
      throw new Error(`채팅 요청 실패: ${response.status}`);
    }

    // ReadableStream으로 응답 스트리밍
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('응답 스트림을 읽을 수 없습니다.');
    }

    const decoder = new TextDecoder();
    let buffer = ''; // 불완전한 줄을 저장하는 버퍼

    /**
     * SSE 형식에서 실제 메시지 콘텐츠 추출
     *
     * 백엔드 SSE 형식:
     * event: message
     * data: {"delta":"실제 메시지 내용"}
     *
     * 지원하는 형식:
     * - "data: {"delta":"content"}" (현재 백엔드 형식)
     * - "data: {"content":"message"}" (호환성)
     * - "data: content" (레거시)
     * - "event: messageName" (무시)
     */
    const extractContent = (line: string): string | null => {
      // 빈 줄은 null로 반환 (이벤트 경계 표시)
      if (!line.trim()) {
        return null;
      }

      // event: 라인은 무시 (이벤트 타입 정보)
      if (line.startsWith('event:')) {
        return null;
      }

      // data: 프리픽스 제거
      if (line.startsWith('data:')) {
        let content = line.replace(/^data:\s?/, '');

        // JSON 형식 확인
        if (content.trim().startsWith('{')) {
          try {
            const json = JSON.parse(content.trim());
            // 백엔드 형식: {"delta":"내용"}
            // 또는 호환 형식: {"content":"내용"} 또는 {"message":"내용"}
            return json.delta ?? json.content ?? json.message ?? '';
          } catch (e) {
            console.error('JSON 파싱 오류:', e);
            return content;
          }
        }
        return content;
      }

      return null;
    };

    // 스트리밍 처리
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // 남은 버퍼 처리
        if (buffer.trim()) {
          const content = extractContent(buffer);
          if (content !== null && content !== '') {
            onChunk(content);
          }
        }
        // 스트리밍 완료
        onClose();
        break;
      }

      // 청크를 텍스트로 디코딩
      const text = decoder.decode(value, { stream: true });
      buffer += text;

      // 줄 단위로 처리
      const lines = buffer.split('\n');

      // 마지막 줄이 불완전할 수 있으므로 버퍼에 유지
      buffer = lines.pop() || '';

      // 완전한 줄들 처리
      // 각 라인의 콘텐츠를 추출하고 그대로 전송
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const content = extractContent(line);

        // null이 아닌 경우만 전송 (빈 줄이나 event 라인 제외)
        if (content !== null) {
          onChunk(content);
        }
      }
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error('SSE 연결 생성 실패');
    onError(error);
    throw error;
  }
}
