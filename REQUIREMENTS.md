# Crossfit Advisor Frontend

Crossfit **초심자**를 위한
WOD 분석 + 보강운동 추천을 제공하는 **AI Agent 기반 프론트엔드 애플리케이션**이다.

사용자는 당일 WOD를 텍스트로 입력하고,
AI Agent와의 대화를 통해 보강운동을 추천·조절하며
개인 운동 기록을 관리할 수 있다.

본 문서는 **MVP 구현 기준**이며,  
향후 기능 확장을 고려한 **확장 가능한 설계**를 전제로 한다.

---

## 1. Project Goal

- WOD 입력 → 분석 → 보강운동 추천 → 대화로 조절하는 흐름 완성
- Mobile 환경에서 언제든 접근 가능한 UI 제공
- 초심자 관점에서 **과부하 방지 + 보조운동 가이드** 제공

---

## 2. Target Platform & Constraints

### Platform
- Mobile Web 중심
- **PWA 형태** (설치 가능, 기본 캐싱)
- Backend 분리 구조 전제

### Authentication
- **Google OAuth 기반 로그인**
- 프론트엔드는 인증 UI 및 토큰 전달 역할만 담당
- 실제 사용자 검증/세션 관리는 백엔드 책임

---

## 3. MVP Feature Scope

### 3.1 Authentication
- Google OAuth 로그인
- 로그인 성공 후 백엔드에서 발급한 토큰으로 API 호출

---

### 3.2 WOD Input

사용자는 두 가지 방식으로 WOD를 입력할 수 있습니다:

#### Text Input (텍스트 입력)
- WOD를 자유 형식으로 직접 입력
- 형식 제한 없음 (AMRAP / For Time / EMOM 등)

#### Image Input with Backend OCR (이미지 입력 with 백엔드 OCR)
- 모바일 카메라 촬영 또는 갤러리에서 기존 사진 선택
- 프론트엔드에서 이미지 파일을 백엔드 `/api/ocr` 엔드포인트로 전송
- 백엔드에서 **Google Vision API**로 이미지에서 텍스트 추출 처리
- 추출된 텍스트를 사용자에게 표시
- 사용자가 추출된 텍스트를 편집한 후 확정

> **주의**: tesseract.js는 프론트엔드에서 사용하지 않으며, OCR 처리는 **백엔드의 Google Vision API**에서 수행됩니다.

---

### 3.3 WOD Analysis & Recommendation

AI Agent 응답 기반으로 아래 정보 표시:

1. WOD 요약  
   - 형식
   - 주요 동작

2. 초심자 관점 주의 포인트

3. 보강운동 추천 플랜
   - 운동명
   - 세트 / 반복
   - 운동 목적

추천 결과는 **조절 가능한 상태**로 표현해야 함.

---

### 3.4 AI Agent Chat (Core Feature)

- WOD 단위 채팅 세션 유지
- 채팅을 통해 추천 조절 가능
  - 강도
  - 볼륨
  - 보강 부위
  - 장비 유무

예시:
- “시간 10분으로 줄여줘”
- “어깨 말고 코어 위주로”
- “기구 없이 할 수 있게”

---

### 3.5 User Preferences (MVP)

사용자 설정 저장:

- 선호 보강 부위 (복수 선택)
- 선호 보강 방식 (맨몸 / 덤벨 / 바벨 등)
- 운동 가능 시간 (분 단위)

해당 정보는 AI 추천 요청 시 함께 전달됨.

---

### 3.6 Personal Record (Basic)

- 오늘 WOD에 포함된 주요 종목에 대해 기록 가능

MVP 예시:
- 스내치: 몇 lb / kg

기록 항목:
- 종목명
- 무게
- 단위 (lb / kg)
- 날짜

> 통계 / 그래프는 MVP 범위 아님  
> **기록 저장 구조까지만 구현**

---

## 4. UX / UI Guidelines

- Mobile First
- 한 손 조작 중심 UI
- OCR / AI 응답 시 명확한 로딩 상태 표시
- 네트워크 오류 시 재시도 UX 제공

---

## 5. Architecture & State Design Notes

프론트엔드는 **표현과 상태 관리**에 집중한다.

권장 개념 단위:
- WOD Entry
- Recommendation Plan
- Chat Session
- User Preferences
- Personal Record

각 단위는 **느슨하게 결합**되어야 하며,  
“오늘 WOD”를 중심으로 확장 가능해야 한다.

---

## 6. Roadmap (Design Only, Not MVP)

아래 기능은 **MVP 이후 추가 예정**이다.  
현재 구현하지 않지만, 설계 시 확장 가능성은 고려한다.

- 개인화 추천 고도화
  - 과거 기록 기반 추천
  - 선호도 반영 강도 조절
- 통계 & 시각화
  - 종목별 PR 추이
  - 주간 / 월간 수행량
- WOD / 보강 히스토리 관리
- PWA Push 알림 (운동 리마인더)
- 부상/통증 회피 로직 강화

---

## 7. Non-goals (MVP에서 하지 않는 것)

- 커뮤니티 기능
- 운동 데이터베이스 관리
- 상세 통계 그래프
- AI 모델 직접 호출/운영

---

## 8. Guiding Principle

> MVP의 목표는  
> **“WOD 입력 → 추천 → 대화로 조절 → 최소 기록” 흐름을 완성하는 것**이다.  
>  
> 모든 구조는 이후 개인화·통계 기능이 자연스럽게 확장될 수 있도록 설계한다.
