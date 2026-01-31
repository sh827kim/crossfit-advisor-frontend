# Authentication (인증) 기능 문서

## 개요

Crossfit Advisor는 **Google OAuth 2.0 + JWT 기반 토큰 시스템**을 사용하여 사용자 인증을 처리합니다.

- **인증**: Google OAuth 2.0 (백엔드의 Spring Security)
- **토큰 관리**: JWT Access Token + Refresh Token
- **쿠키**: cf_refresh (Refresh Token을 위한 보안 쿠키)
- **저장**: Access Token은 localStorage, Refresh Token은 localStorage + 쿠키

## 인증 흐름

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Crossfit Advisor Frontend                      │
├─────────────────────────────────────────────────────────────────────┤
│  1. [사용자] → Google 로그인 버튼 클릭                              │
│     ↓                                                                │
│  2. 백엔드 OAuth2 엔드포인트로 리다이렉트                           │
│     window.location.href = "http://localhost:8080/oauth2/          │
│                            authorization/google"                   │
│     ↓                                                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           Backend (Spring Boot + Spring Security)             │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  3. Spring Security OAuth2 처리 시작                           │  │
│  │  4. Google로 사용자 리다이렉트                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│     ↓                                                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Google OAuth2                              │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  5. 사용자 로그인 및 동의                                    │  │
│  │  6. 인증 코드 발급                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│     ↓                                                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           Backend (Spring Boot + Spring Security)             │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  7. 인증 코드를 토큰과 교환                                  │  │
│  │  8. 사용자 정보 조회/저장                                    │  │
│  │  9. Refresh Token을 cf_refresh 쿠키에 저장                  │  │
│  │  10. 프론트엔드로 리다이렉트 (/dashboard)                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│     ↓                                                                │
│  11. 대시보드 페이지 로드                                          │
│     ↓                                                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │        12. POST /auth/refresh (cf_refresh 쿠키 포함)         │  │
│  │            요청 본문: {refreshToken}                          │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  응답:                                                        │  │
│  │  {                                                           │  │
│  │    "accessToken": "eyJhbGciOi...",                          │  │
│  │    "refreshToken": "eyJhbGciOi..."                          │  │
│  │  }                                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│     ↓                                                                │
│  13. 토큰들을 localStorage에 저장                                   │
│     - accessToken: Authorization 헤더에 사용                      │
│     - refreshToken: 토큰 재발급용                                │
│     ↓                                                                │
│  14. GET /api/user/me (Authorization: Bearer accessToken)          │
│     현재 사용자 정보 조회 및 표시                                │
│                                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## 환경변수 설정

### 필수 환경변수

```env
# .env.local 또는 배포 시 환경변수 설정

# 백엔드 API 주소
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# 리다이렉트 경로 (기본값 사용 권장)
NEXT_PUBLIC_LOGIN_SUCCESS_REDIRECT_PATH=/dashboard
NEXT_PUBLIC_LOGIN_ERROR_REDIRECT_PATH=/login
NEXT_PUBLIC_LOGOUT_REDIRECT_PATH=/
```

---

## 토큰 관리 시스템

### 1. Access Token과 Refresh Token의 역할

| 토큰 | 저장 위치 | 유효 기간 | 용도 | 만료 시 |
|------|---------|---------|------|-------|
| **Access Token** | localStorage | 짧음 (15분 권장) | 모든 API 요청의 Authorization 헤더 | 자동 재발급 |
| **Refresh Token** | localStorage + cf_refresh 쿠키 | 길음 (7일 권장) | 새로운 Access Token 발급 | 재로그인 필요 |

### 2. cf_refresh 쿠키

**백엔드에서 설정**:
- 로그인 성공 후 자동으로 쿠키에 저장
- HttpOnly 플래그: 보안을 위해 JavaScript에서 접근 불가
- Secure 플래그: HTTPS 환경에서만 전송
- SameSite: CSRF 공격 방지

**프론트엔드에서 사용**:
- `credentials: 'include'`로 자동 포함
- 개발자 도구에서 볼 수 없음 (HttpOnly)
- JavaScript에서 직접 접근 불가 (보안)

### 3. 토큰 저장 구조

```
localStorage:
├── auth_access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
├── auth_refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
└── auth_user: {"id":"user_123","email":"user@example.com","name":"John Doe"}

쿠키 (httponly):
└── cf_refresh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## API 호출 방법

### 1. 인증된 API 호출 (자동 토큰 갱신)

```typescript
import { authenticatedFetch } from '@/app/lib/api';

// 사용: Access Token이 자동으로 포함되고, 만료시 자동 재발급
const response = await authenticatedFetch(
  '/api/v1/workouts/generate/balance',
  {
    method: 'POST',
    body: JSON.stringify({
      wodText: '5 rounds for time: 10 snatch, 20 pull-ups'
    })
  }
);

const data = await response.json();
```

**특징**:
- ✅ Access Token 자동 포함 (Authorization 헤더)
- ✅ 토큰 만료 시 자동 갱신
- ✅ 401 에러 시 자동 로그아웃
- ✅ 간단한 사용법

### 2. 수동 토큰 관리 (필요시)

```typescript
import {
  getAccessToken,
  isTokenExpired,
  ensureValidAccessToken
} from '@/app/lib/auth-storage';
import { refreshAccessToken } from '@/app/lib/api';

// 현재 Access Token 확인
const token = getAccessToken();

// 토큰 만료 확인 (60초 버퍼)
if (isTokenExpired(token)) {
  const refreshToken = getRefreshToken();
  const newTokens = await refreshAccessToken(refreshToken);
}

// 유효한 토큰 확보 (자동 갱신)
const validToken = await ensureValidAccessToken();
```

---

## 주요 함수

### auth-storage.ts

| 함수 | 설명 | 사용 예 |
|------|------|--------|
| `saveAccessToken(token)` | Access Token 저장 | `saveAccessToken(token)` |
| `getAccessToken()` | Access Token 조회 | `const token = getAccessToken()` |
| `saveRefreshToken(token)` | Refresh Token 저장 | `saveRefreshToken(token)` |
| `getRefreshToken()` | Refresh Token 조회 | `const token = getRefreshToken()` |
| `saveTokens(access, refresh)` | 두 토큰 동시 저장 | `saveTokens(at, rt)` |
| `saveUser(user)` | 사용자 정보 저장 | `saveUser(userData)` |
| `getUser()` | 사용자 정보 조회 | `const user = getUser()` |
| `isTokenExpired(token, buffer)` | 토큰 만료 확인 | `if (isTokenExpired(token))` |
| `getTokenExpiresIn(token)` | 남은 만료 시간(초) | `const sec = getTokenExpiresIn(token)` |
| `clearAuthData()` | 인증 정보 모두 삭제 | `clearAuthData()` (로그아웃) |

### api.ts

| 함수 | 설명 | 사용 예 |
|------|------|--------|
| `authenticatedFetch(endpoint, options)` | 토큰 포함 API 호출 (자동 갱신) | `await authenticatedFetch('/api/v1/workouts/generate/balance', {...})` |
| `ensureValidAccessToken()` | 유효한 토큰 확보 | `const token = await ensureValidAccessToken()` |
| `refreshAccessToken(refreshToken)` | 토큰 갱신 | `const {accessToken} = await refreshAccessToken(rt)` |
| `logoutFromBackend()` | 백엔드 로그아웃 | `await logoutFromBackend()` |

---

## 백엔드 API 스펙

### 1. OAuth2 엔드포인트

```
GET {NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/google
```

**처리**: Spring Security가 자동으로 Google로 리다이렉트

### 2. 토큰 갱신 엔드포인트

```
POST /auth/refresh
```

**요청**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

또는 쿠키에서 자동으로 처리:
```
쿠키: cf_refresh=eyJhbGciOi...
```

**응답**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. 현재 사용자 정보 조회

```
GET /api/user/me
```

**요청 헤더**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답**:
```json
{
  "success": true,
  "message": "사용자 정보 조회 성공",
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 4. 로그아웃 엔드포인트

```
POST /logout
```

**요청**: 없음 (또는 빈 body)

**처리**:
- 백엔드: 세션/쿠키 정리
- 프론트엔드: localStorage 정리

---

## 토큰 만료 및 갱신 플로우

```
┌─────────────────────────────────────────────────────────────┐
│          API 호출 (authenticatedFetch)                      │
├─────────────────────────────────────────────────────────────┤
│  1. Access Token 확인                                       │
│     ↓                                                       │
│  2. 토큰이 곧 만료되나? (60초 버퍼)                        │
│     ├─ NO → 그대로 사용                                    │
│     └─ YES ↓                                               │
│  3. Refresh Token으로 새로운 토큰 발급                      │
│     ├─ 성공: 새 토큰 저장 후 API 호출                     │
│     └─ 실패 (401): 로그아웃 처리 → 로그인 페이지로      │
│  4. Authorization 헤더에 Access Token 포함                 │
│  5. API 호출                                               │
│     ├─ 성공: 데이터 반환                                 │
│     └─ 401: 로그아웃 처리 → 로그인 페이지로             │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 로그인/로그아웃 흐름

### 로그인

```
1. 사용자가 로그인 버튼 클릭
2. 백엔드 OAuth2 엔드포인트로 리다이렉트
3. Google 인증 완료 후 /dashboard로 리다이렉트
4. 대시보드에서 cf_refresh 쿠키로부터 토큰 발급 (POST /auth-token/refresh)
5. Access Token과 Refresh Token을 localStorage에 저장
6. 사용자 정보 조회 및 표시
```

### 로그아웃

```typescript
// 대시보드의 로그아웃 버튼
onClick={async () => {
  clearAuthData();                    // localStorage 정리
  await logoutFromBackend();          // 백엔드 세션 정리
  router.push('/login');              // 로그인 페이지로 리다이렉트
}}
```

---

## 보안 고려사항

### 1. Token 저장 위치 선택

| 저장 위치 | 장점 | 단점 | 결정 |
|---------|------|------|------|
| localStorage | 간단, 영속성 | XSS 취약 | ✅ 사용 (Access Token) |
| 쿠키 (httpOnly) | 보안 | 조작 어려움 | ✅ 사용 (Refresh Token) |
| 메모리 | 보안 | 새로고침 시 손실 | ❌ 미사용 |

**현재 구조**:
- **Access Token**: localStorage (빈번한 사용)
- **Refresh Token**: localStorage + HttpOnly 쿠키 (이중 보안)

### 2. XSS 방지

- ✅ Content Security Policy (CSP) 설정 필수
- ✅ 입력값 sanitization
- ✅ innerHTML 대신 textContent 사용

### 3. CSRF 방지

- ✅ SameSite 쿠키 설정
- ✅ 백엔드: CSRF 토큰 (필요시)

### 4. 버퍼 시간 (60초)

- ✅ 네트워크 지연 고려
- ✅ API 처리 중 만료 방지
- ✅ 동시 요청 처리

### 5. HTTPS 사용

- ✅ 프로덕션: 반드시 HTTPS
- ✅ 개발: localhost HTTP 허용

---

## 개발 환경 테스트

### 1. 로컬 실행

```bash
# 프론트엔드 (포트 3000)
pnpm run dev

# 백엔드 (포트 8080)
# Spring Boot 애플리케이션 실행
```

### 2. 환경변수 설정

```env
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### 3. 테스트 순서

1. `http://localhost:3000` 방문
2. "Google 계정으로 로그인" 버튼 클릭
3. Google 로그인 완료 후 `/dashboard`로 자동 리다이렉트
4. 대시보드에서 사용자 정보 표시 확인
5. 브라우저 DevTools:
   - Application → Local Storage: `auth_access_token`, `auth_refresh_token` 확인
   - Application → Cookies: `cf_refresh` 확인
   - Network → /auth/refresh 요청 확인
6. "로그아웃" 버튼 클릭 → 로그인 페이지로 이동

---

## 문제 해결

### "로그인 후 대시보드에서 토큰 오류"

- ✅ `/auth/refresh` 엔드포인트 구현 확인
- ✅ cf_refresh 쿠키가 설정되었는지 확인
- ✅ 응답에 accessToken, refreshToken 포함 확인
- ✅ CORS 설정에서 credentials: true 확인

### "로그아웃 후 대시보드 접근 가능"

- ✅ 백엔드에서 401 응답 확인
- ✅ localStorage 정리 확인
- ✅ 대시보드의 401 처리 로직 확인

### "API 호출 시 401 에러"

- ✅ Access Token이 localStorage에 저장되었는지 확인
- ✅ 토큰 포맷 확인: `Bearer {token}`
- ✅ 토큰 만료 여부 확인
- ✅ 백엔드의 JWT 검증 로직 확인

### "토큰 자동 갱신이 작동하지 않음"

- ✅ Refresh Token이 localStorage에 저장되었는지 확인
- ✅ `/auth/refresh` 응답 확인
- ✅ 토큰 만료 시간(exp) 확인
- ✅ 버퍼 시간(60초) 설정 확인

---

## 참고 자료

- [JWT (JSON Web Token)](https://jwt.io/)
- [Spring Security OAuth2](https://spring.io/projects/spring-security-oauth2-resource-server)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [MDN - Authorization Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)
