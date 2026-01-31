# 애프터와드 (Afterwod) - Crossfit 운동 기록 관리 앱

Crossfit 초심자들을 위한 **보강운동 추천 및 운동 기록 관리** 애플리케이션입니다.

사용자는 3가지 운동 모드를 선택하여 맞춤형 운동 계획을 받고,
실시간 타이머와 함께 운동을 진행한 후 기록을 저장할 수 있습니다.

---

## 🎯 주요 기능

### 1. 홈 페이지 - 운동 모드 선택
사용자는 오늘의 운동 목표에 맞는 3가지 모드 중 하나를 선택:

#### 🔋 부족한 부위 채우기 (BALANCE 모드)
- 오늘 수행한 WOD 운동 입력
- 입력한 운동의 근육그룹 분석
- 사용하지 않은 근육 위주의 보강운동 자동 추천

#### 🏆 나의 달성 목표 (GOAL 모드)
- 연습 목표 선택 (머슬업, 핸드스탠드 등)
- 해당 목표 달성을 위한 맞춤형 운동 추천

#### 🎯 타겟 부위 선택 (PART 모드)
- 집중할 부위 선택 (가슴, 등, 다리, 팔, 어깨, 코어)
- 선택 부위 집중 공략 운동 추천

### 2. 운동 시간 선택
5, 10, 15, 20, 25, 30분 중에서 선택 → 시간에 따라 운동 개수 자동 결정

### 3. 실시간 운동 진행
- ⏱️ **타이머**: MM:SS 형식의 실시간 타이머
- ✅ **완료 체크**: 각 운동별 완료 여부 체크 (완료 시 녹색 표시)
- 🔢 **횟수 조절**: 운동별 최소-최대 범위 내에서 실제 수행 횟수 기록
- 📊 **진행률 표시**: 운동 완료 진행 상황 실시간 표시
- 🛑 **중단 기능**: 언제든 "기록 없이 돌아가기" 클릭 후 확인 팝업으로 홈으로 이동 가능

### 4. 운동 기록 저장
모든 운동 완료 후:
- 운동 일자, 모드, 소요 시간, 각 운동별 수행 현황 저장
- localStorage에 자동 저장 (계속 유지됨)

### 5. 운동 기록 관리
#### 📅 히스토리 페이지
- 월별 캘린더 뷰 (기록 있는 날짜 강조)
- 날짜 선택 시 해당 날의 상세 운동 기록 조회
- 기본으로 오늘 날짜 기록 표시

#### 👤 프로필 페이지
- 닉네임 편집 (localStorage에 저장)
- 현재 월의 운동 횟수 통계

---

## 🚀 기술 스택

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, TailwindCSS 4
- **상태관리**: Context API + localStorage
- **패키지 관리**: pnpm
- **Backend**: RESTful API (localhost:8080)

---

## 📋 시작하기

### 1. 프로젝트 클론
```bash
git clone https://github.com/sh827kim/crossfit-advisor-frontend.git
cd crossfit-advisor-frontend
```

### 2. pnpm 설치
```bash
npm install -g pnpm
```

### 3. 의존성 설치
```bash
pnpm install
```

### 4. 환경 변수 설정
`.env.local` 파일 생성:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### 5. 개발 서버 실행
```bash
pnpm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

### 6. 프로덕션 빌드
```bash
pnpm run build
pnpm run start
```

### 7. 린트 검사
```bash
pnpm lint
```

---

## 📱 주요 페이지

| URL | 설명 |
|-----|------|
| `/` | 홈 페이지 - 운동 모드 선택 |
| `/input` | 운동 입력 페이지 |
| `/result` | 운동 진행 페이지 (타이머 + 체크) |
| `/history` | 운동 기록 조회 (캘린더) |
| `/profile` | 프로필 (닉네임 편집) |

---

## 🏗️ 프로젝트 구조

```
app/
├── api/                          # API Routes
│   └── v1/workouts/generate/     # 운동 계획 생성 API (balance, goal, part)
├── components/                   # 재사용 가능한 컴포넌트
│   ├── Header.tsx
│   ├── HomePage.tsx
│   ├── InputPage.tsx
│   ├── ResultPage.tsx
│   ├── HistoryPage.tsx
│   ├── ProfilePage.tsx
│   └── input-sections/           # 입력 폼
├── context/
│   └── AppContext.tsx            # 전역 상태 관리
├── lib/
│   ├── types/                    # TypeScript 타입
│   ├── utils.ts                  # 유틸리티 함수
│   └── workout-generator.ts      # 운동 계획 생성 로직
├── page.tsx                      # 홈 페이지
├── input/, result/, history/, profile/  # 각 페이지
├── layout.tsx                    # Root Layout
└── globals.css                   # 전역 스타일 + 디자인 토큰
```

---

## 💾 데이터 저장

- **메모리**: 현재 운동 계획 (Context)
- **localStorage**: 운동 기록, 사용자 닉네임 (영구 저장)
- **API 응답**: 백엔드에서 맞춤형 운동 계획 생성

---

## 🔄 향후 계획

### Phase 1 (계획)
- AI 대화 기능 (음성 입력/출력)
- 운동 강도 조절 (초급/중급/고급)

### Phase 2 (계획)
- 통계 & 시각화 (주간/월간 운동량, 종목별 추이)
- 개인 기록(PR) 관리

### Phase 3 (계획)
- 클라우드 동기화 (다기기 동기화)
- PWA 최적화 (Push 알림, 오프라인 모드)

---

## 🙅 제외된 기능

- ❌ Google OAuth 인증 (현재는 로컬 테스트)
- ❌ AI Agent 채팅
- ❌ 이미지 OCR
- ❌ 사용자 설정
- ❌ 커뮤니티 기능

---

## 📝 개발 가이드

### 코딩 스타일
- **변수/함수**: camelCase
- **컴포넌트**: PascalCase
- **타입**: 명시적 정의 필수 (any 금지)

### 라우팅
- Next.js App Router 기반
- `useRouter().push()`로 페이지 전환
- 각 페이지는 독립적인 라우트

### 상태 관리
- Context API로 전역 상태 관리
- localStorage로 데이터 영속화

### 디자인 토큰
- CSS 변수 기반 색상 시스템
- Figma 디자인 적용 시 CSS 변수만 변경하면 전체 앱에 자동 적용

---

## 📚 참고 문서

- [REQUIREMENTS.md](./REQUIREMENTS.md) - 프로젝트 요구사항 및 기능 명세
- [CLAUDE.md](./CLAUDE.md) - 개발자 가이드

---

## 🔗 관련 링크

**Backend 저장소**
- https://github.com/sh827kim/crossfit-advisor-backend

**기술 문서**
- [Next.js 문서](https://nextjs.org/docs)
- [TailwindCSS 문서](https://tailwindcss.com/docs)
- [React 문서](https://react.dev)

---

## 📄 라이선스

프로젝트의 라이선스는 별도로 명시되어 있지 않습니다.

---

## 👨‍💻 개발 팀

Crossfit 초심자들을 위한 더 나은 운동 경험을 제공하기 위해 개발 중입니다.

**의견 및 버그 리포트**: GitHub Issues에 등록해주세요.
