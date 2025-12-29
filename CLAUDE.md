# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Crossfit 초심자들을 위한 AI Agent 기반 프론트엔드 애플리케이션입니다. 사용자가 WOD(운동 메뉴)를 텍스트 또는 사진으로 입력하면, AI Agent가 보강운동을 추천하고 대화를 통해 조절할 수 있습니다.

**MVP 범위**: Google OAuth 인증 → WOD 입력 → AI 분석 및 추천 → 대화 조절 → 최소 기록

## 기술 스택

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, TailwindCSS 4, shadcn/ui (예정)
- **상태관리**: localStorage (인증 정보), Context API (예정)
- **OCR**: tesseract.js (향후 구현)
- **Backend 통신**: Fetch API with Bearer Token

## 개발 환경 설정

### 필수 명령어

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:3000)
pnpm run dev

# 프로덕션 빌드
pnpm run build

# 빌드 결과 실행
pnpm run start

# 린트 검사
pnpm lint
```

### 환경변수 설정

`.env.local` 파일 생성 (`.env.example` 참고):

```env
# Google OAuth 클라이언트 ID (Google Cloud Console에서 발급)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# 백엔드 API URL (환경에 따라 변경)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# 리다이렉트 경로들
NEXT_PUBLIC_LOGIN_SUCCESS_REDIRECT_PATH=/dashboard
NEXT_PUBLIC_LOGIN_ERROR_REDIRECT_PATH=/login
NEXT_PUBLIC_LOGOUT_REDIRECT_PATH=/
```

## 코드 구조 및 아키텍처

### 디렉토리 구조

```
app/
├── actions/              # Server Actions (인증 처리 등)
├── api/                  # API Routes (향후 추가)
├── components/           # 재사용 가능한 UI 컴포넌트
├── lib/                  # 유틸리티 함수 및 설정
│   ├── api.ts           # 백엔드 API 호출 함수
│   └── auth-storage.ts  # localStorage 기반 인증 정보 관리
├── (auth)/               # 인증 관련 페이지 그룹
│   └── login/           # 로그인 페이지
├── (main)/               # 메인 기능 페이지 그룹 (향후)
├── layout.tsx           # Root Layout
├── page.tsx             # 홈 페이지
└── globals.css          # 전역 스타일
```

### 아키텍처 원칙

1. **Backend 분리**: 프론트엔드는 Google OAuth UI 및 토큰 전달만 담당
   - 사용자 검증 및 세션 관리는 백엔드 책임
   - `NEXT_PUBLIC_BACKEND_URL` 환경변수로 동적 설정

2. **인증 흐름**:
   - Google OAuth → ID Token 획득
   - Server Action으로 `POST /api/auth/login`에 토큰 전송
   - 백엔드 응답 토큰을 localStorage에 저장
   - 이후 모든 API 호출에 Bearer Token 포함

3. **Server Actions vs Client Components**:
   - `app/actions/` : 민감한 인증 로직 (Server Actions)
   - `app/components/` : UI 렌더링 (Client Components)

4. **상태 관리**:
   - 인증 토큰: localStorage (Client-side)
   - 사용자 정보: localStorage + Context API (향후)
   - API 응답 캐싱: React Query/SWR (향후)

## 코딩 스타일 및 컨벤션

### 네이밍 규칙

- **변수/함수**: camelCase (영어)
- **컴포넌트**: PascalCase (영어)
- **파일명**: kebab-case (영어) 또는 PascalCase (컴포넌트)

### 타입 안전성

- **any 타입 금지** - 명시적 타입 정의 필수
- 모든 함수에 입출력 타입 정의
- 환경변수 접근 시 `process.env.VARIABLE_NAME!` 형식으로 non-null assertion 사용

### 주석 작성

- **프론트엔드**: 초보자 관점의 명확한 주석 (무엇을 하는지 설명)
- **복잡한 로직**: JSDoc 형식 사용
- 자명한 코드에는 주석 불필요

### 반응형 디자인

- **Mobile First**: 모바일부터 설계 시작
- **TailwindCSS Breakpoints**: `sm`, `md`, `lg` 등 활용
- PWA 형태이므로 모바일 최적화 필수

### 패키지 관리

- **pnpm** 사용 (pnpm-workspace.yaml 참고)
- `dependencies`에만 필요한 라이브러리 추가
- 불필요한 라이브러리는 설치하지 않기

## 주요 API 통신 패턴

### 인증이 필요한 API 호출

```typescript
import { authenticatedFetch } from '@/app/lib/api';
import { getToken } from '@/app/lib/auth-storage';

const token = getToken();
const response = await authenticatedFetch(
  '/api/wod/analyze',
  token!,
  {
    method: 'POST',
    body: JSON.stringify({ wodText: '...' })
  }
);
```

### 에러 처리

- 네트워크 오류: 재시도 로직 포함 (향후)
- 401 Unauthorized: 로그아웃 후 로그인 페이지로 리다이렉트
- 기타 에러: 사용자 친화적인 에러 메시지 표시

## 환경별 주의사항

### 개발 (localhost:3000)

- Hot reload 활용
- 브라우저 DevTools 네트워크 탭에서 API 호출 확인
- localStorage Inspector로 토큰 상태 확인

### 프로덕션

- 환경변수 안전하게 관리 (시크릿 환경변수 사용)
- HTTPS 필수
- CORS 정책 확인
- 브라우저 쿠키 보안 설정 검토

## 향후 구현 예정 기능

- **shadcn/ui**: UI 컴포넌트 라이브러리 추가
- **WOD Input**: 텍스트/이미지(OCR) 입력 페이지
- **AI Chat**: WebSocket 기반 실시간 대화
- **User Preferences**: 사용자 설정 저장
- **Personal Record**: 운동 기록 관리

## 관련 문서

- `REQUIREMENTS.md`: 상세 요구사항 및 MVP 범위
- `README.md`: 프로젝트 개요 및 시작 가이드
- `next.config.ts`: Next.js 설정
- `tsconfig.json`: TypeScript 설정
- `eslint.config.mjs`: ESLint 규칙

## 주의사항

- `.env.local`은 커밋하지 않기 (`.gitignore` 참고)
- Google OAuth 클라이언트 시크릿은 절대 프론트엔드에 노출 금지
- localStorage는 XSS에 취약하므로, 민감한 정보는 HttpOnly 쿠키 사용 고려
