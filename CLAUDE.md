# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Crossfit 초심자들을 위한 보강운동 추천 및 운동 기록 관리 프론트엔드 애플리케이션입니다.

**서비스명**: 애프터와드 (Afterword)

**주요 기능**:
- 3가지 운동 모드 선택 (WOD, GOAL, PART)
- 맞춤형 운동 계획 생성
- 실시간 타이머와 함께 운동 진행
- 운동 기록 저장 및 관리

## 기술 스택

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, TailwindCSS 4
- **상태관리**: Context API (전역 상태), localStorage (영속 저장)
- **Backend 통신**: Fetch API

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

`.env.local` 파일 생성:

```env
# 백엔드 API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

## 코드 구조 및 아키텍처

### 디렉토리 구조

```
app/
├── api/                  # API Routes (백엔드 엔드포인트)
│   └── v1/workouts/generate/
│       ├── wod/          # WOD 모드 API
│       ├── goal/         # GOAL 모드 API
│       └── part/         # PART 모드 API
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── Header.tsx
│   ├── HomePage.tsx
│   ├── InputPage.tsx
│   ├── ResultPage.tsx
│   ├── HistoryPage.tsx
│   ├── ProfilePage.tsx
│   └── input-sections/   # 입력 폼 섹션
├── context/              # 상태 관리
│   └── AppContext.tsx
├── lib/                  # 유틸리티 함수 및 설정
│   ├── utils.ts         # cn() 유틸리티
│   ├── types/           # TypeScript 타입
│   │   └── workout.types.ts
│   └── workout-generator.ts  # 운동 계획 생성 로직
├── page.tsx             # 홈 페이지 (/)
├── input/
│   └── page.tsx         # 운동 입력 페이지 (/input)
├── result/
│   └── page.tsx         # 운동 진행 페이지 (/result)
├── history/
│   └── page.tsx         # 운동 기록 페이지 (/history)
├── profile/
│   └── page.tsx         # 프로필 페이지 (/profile)
├── layout.tsx           # Root Layout (Header + 페이지 레이아웃)
└── globals.css          # 전역 스타일 + 디자인 토큰
```

### 아키텍처 원칙

1. **라우팅**: Next.js App Router 기반
   - URL 중심 네비게이션
   - `useRouter().push()`로 페이지 전환
   - 각 페이지는 독립적인 파일 기반

2. **상태 관리**: Context API
   - 전역 상태: `AppContext`
   - 운동 모드, 입력 데이터, 생성된 계획, 기록 저장
   - 페이지 간 데이터 공유

3. **데이터 저장**
   - **메모리**: 현재 운동 계획 (Context)
   - **localStorage**: 운동 기록, 사용자 닉네임
   - **API 응답**: 백엔드에서 계획 생성

4. **컴포넌트 구조**
   - 페이지 컴포넌트: `app/[route]/page.tsx`
   - 기능 컴포넌트: `app/components/`
   - 재사용성 중심의 설계

## 코딩 스타일 및 컨벤션

### 네이밍 규칙

- **변수/함수**: camelCase (영어)
- **컴포넌트**: PascalCase (영어)
- **파일명**: kebab-case (영어) 또는 PascalCase (컴포넌트)

### 타입 안전성

- **any 타입 금지** - 명시적 타입 정의 필수
- 모든 함수에 입출력 타입 정의
- 환경변수 접근 시 `process.env.VARIABLE_NAME!` 형식

### 주석 작성

- **프론트엔드**: 초보자 관점의 명확한 주석
- **복잡한 로직**: JSDoc 형식 사용
- 자명한 코드에는 주석 불필요

### 반응형 디자인

- **Mobile First**: 모바일부터 설계 시작
- **TailwindCSS Breakpoints**: `sm`, `md`, `lg` 등 활용
- max-w-md로 모바일 뷰포트 제한

### 패키지 관리

- **pnpm** 사용
- `dependencies`에만 필요한 라이브러리 추가
- 불필요한 라이브러리는 설치하지 않기

## 주요 기능 흐름

### 1. 운동 모드 선택 → 계획 생성

```typescript
// 사용자가 모드 선택
setCurrentMode('wod');
setCurrentPage('input');  // → /input으로 이동

// 입력 후 계획 생성
const response = await fetch('/api/v1/workouts/generate/wod', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ duration: 20, wodMovementIds: [...] })
});

setGeneratedPlan(response.data);
router.push('/result');  // → /result로 이동
```

### 2. 운동 진행 (ResultPage)

```typescript
// 상태 관리
const [exercises, setExercises] = useState<ExerciseWithStatus[]>([]);
const [timerSeconds, setTimerSeconds] = useState<number>(0);

// 운동 완료 체크
toggleExerciseComplete(index);

// 횟수 조절
updateReps(index, 'min', value);

// 기록 저장
handleSaveRecord();
```

### 3. 기록 저장 및 관리

```typescript
// 기록 저장
addWorkoutRecord({
  date: '2026-01-18',
  mode: 'WOD',
  duration: 20,
  exercises: ['Snatch 3-5', 'Pull-ups 5-8']
});

// localStorage에 저장되어 히스토리에서 조회 가능
```

## 디자인 토큰 시스템

### CSS 변수 기반 색상 (app/globals.css)

```css
:root {
  /* 색상 토큰 */
  --color-primary: 220 90% 56%;        /* blue-600 */
  --color-secondary: 215 20% 45%;      /* slate-600 */
  --color-accent: 142 76% 36%;         /* green-600 */
  --color-success: 142 76% 36%;        /* green-600 */
  --color-warning: 39 84% 58%;         /* amber-500 */
  --color-destructive: 0 84% 60%;      /* red-500 */
  --color-muted: 220 14% 96%;          /* slate-100 */
  --color-muted-foreground: 215 20% 65%; /* slate-400 */
}
```

### TailwindCSS 적용

```typescript
// 색상을 CSS 변수로 사용
className="bg-primary text-primary-foreground"
// Tailwind 설정에서 자동으로 hsl(var(...))로 변환
```

**Figma 디자인 적용 시**: CSS 변수 값만 변경하면 전체 앱에 자동 적용

## 라우트 매핑

| URL | 컴포넌트 | 설명 |
|-----|----------|------|
| `/` | `app/page.tsx` | 홈 페이지 (운동 모드 선택) |
| `/input` | `app/input/page.tsx` | 운동 입력 페이지 |
| `/result` | `app/result/page.tsx` | 운동 진행 페이지 (타이머) |
| `/history` | `app/history/page.tsx` | 운동 기록 조회 |
| `/profile` | `app/profile/page.tsx` | 프로필 (닉네임 편집) |

## 현재 구현된 기능

✅ **홈 페이지**: 3가지 운동 모드 선택
✅ **입력 페이지**: 모드별 입력 폼 (WOD/GOAL/PART)
✅ **운동 진행 (Result 페이지)**:
  - 실시간 타이머
  - 운동별 완료 체크박스
  - 횟수 조절
  - 진행률 표시
  - "기록 없이 돌아가기" 버튼 (확인 팝업 포함)
✅ **기록 저장**: localStorage 기반 저장
✅ **히스토리 페이지**: 캘린더 뷰 + 기록 조회
✅ **프로필 페이지**: 닉네임 편집 + 월간 운동 횟수

## 향후 구현 예정 기능

- AI 대화 기능
- 운동 강도 조절
- 통계 & 시각화
- 개인 기록 (PR) 관리
- 클라우드 동기화
- PWA 최적화

## 삭제된 기능 (MVP에서 제거)

❌ Google OAuth 인증 (현재는 로컬 테스트)
❌ AI Agent 채팅
❌ 이미지 OCR (텍스트 입력만 지원)
❌ User Preferences
❌ 불필요한 페이지 (login, chat, dashboard, settings)

## 환경별 주의사항

### 개발 (localhost:3000)

- Hot reload 활용
- 브라우저 DevTools로 API 호출 확인
- localStorage Inspector로 기록 확인

### 프로덕션

- 환경변수 안전하게 관리
- HTTPS 필수
- CORS 정책 확인

## 주의사항

- `.env.local`은 커밋하지 않기
- localStorage는 클라이언트 전용 (민감한 정보 저장 금지)
- 타입 정의는 반드시 명시적으로
- 컴포넌트는 재사용성 중심으로 설계
