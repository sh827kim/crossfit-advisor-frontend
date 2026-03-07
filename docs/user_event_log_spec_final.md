# 📊 사용자 행동 로그(Event Log) 정의서

본 문서는 기획자가 제공한 최신 로그 정의 엑셀(`애프터와드(After WOD) - 4.Logs.csv`)을 기반으로 재정리된 내용을 토대로 **프론트엔드에서 심어야 할 사용자 행동 이벤트를 명확히 정의**한다. 기존의 범용 `click` 이벤트 방식에서 **비즈니스 목적에 맞춘 명시적인 Custom Event(예: `request_recommendation`, `start_workout`) 방식으로 전환**되었다.

**💡 핵심 목표:** 유저들이 3가지 추천 방식 중 어떤 것을 가장 선호하며, 중간에 이탈하지 않고 끝까지 운동을 완료한 후 공유/기록까지 이어지는가 확인

---

## 1. 로그 공통 규칙

### 시스템 환경 (기본 수집)
- **UU (Unique User)**: 동일 유저를 식별하기 위한 식별자

---

## 2. 파라미터 정의 (Parameters)

| key | value / type | description |
|---|---|---|
| `time_select` | `"5"` \| `"10"` \| `"15"` \| `"20"` \| `"25"` \| `"30"` \| `"35"` \| `"40"` | 와드 선택 시 유저가 선택한 운동 시간 (고정값, string 처리) |
| `time_result` | `{time}` (예: `"10"`, `"13:05"`) | 실제 수행한 운동 시간 (중단 시점의 표시 시간 등) |
| `recommend_type`| `"selected_wod"` \| `"selected_goal"` \| `"selected_target"` | 유저가 선택한 추천 방식의 종류 | 
| `content_type` | `"workout_result"` | 공유되는 콘텐츠의 종류 (현재 운동 종료 후 공유 시 사용) |

> **원칙**  
> - 해당 시점에 값이 존재할 때만 포함  
> - 맞춤정의 시 '범위=아이템'은 이커머스용이므로 사용하지 않고, 이벤트/사용자 범위를 따른다.

---

## 3. 이벤트 정의 : 화면 진입 (Screen View)

화면 도달률 / 이탈률 분석 및 어느 화면인지 파악하는 역할(`screen_name`)은 **GA4의 기본 수집(Enhanced Measurement) 기능인 `page_view` (URL 기반 라우트 추적)로 완전히 대체**되었으므로 프론트엔드 레벨에서 수동으로 `pageview` 이벤트를 전송하지 않는다. (중복 집계 방지)
주요 화면 도달은 핵심 행동 이벤트(`complete_workout`, `view_calendar` 등)로 승격하여 별도 관리한다.

---

## 4. 이벤트 정의 : 핵심 행동 이벤트 (Custom Events)

사용자의 주요 여정 단위로 구체화된 이벤트명을 사용한다. (기존 방식의 범용 click 이벤트는 Deprecated 및 Fade out)

| event_name | 발생 시점 | params | 목적/Notes |
|---|---|---|---|
| `request_recommendation` | '운동 추천받기' 버튼 클릭 시 | `recommend_type`, `time_select` | 인기 있는 기능과 주로 설정하는 운동 시간 파악 |
| `start_workout` | 추천 결과에서 '운동 시작' 버튼 클릭 시 | `recommend_type`, `time_select` | 실제 운동으로 넘어가는 전환율 분석 |
| `regenerate_plan` | '운동 다시 생성' 버튼 클릭 시 | `recommend_type` | 추천 알고리즘 개선 필요성 파악 (많이 발생 시 개선 필요) |
| `complete_workout` | 운동 완료 후 '결과 화면' 진입 시 | `recommend_type`, `time_select` | 최종 완주율 측정 (시작한 사람 중 몇 %인지) |
| `cancel_workout` | 운동 진행 중 '운동 종료(중단)' 시 | `recommend_type`, `time_result` | 중단률 측정 및 언제 중단했는지 파악 |
| `share` | 운동 완료 화면에서 '공유하기' 클릭 시 | `content_type` (`"workout_result"`) | 바이럴 발생 횟수 파악 |
| `record_workout` | 운동 완료 화면에서 '기록하기' 버튼 클릭 시 | `recommend_type` | 리텐션 지표 (본인의 성장을 기록하려는 의지) |
| `view_calendar` | 캘린더 화면 진입 시 | - | 기록을 열어보는 활성 사용자 규모 파악 |

---

## 5. 구현 유의사항

- **이벤트 전송 최적화**: SPA 구조 특성상 re-render 컴포넌트 마운트로 인한 중복 전송 주의
- **명시적 이벤트 (Semantic Event)**: 기존처럼 클릭되는 타겟 요소 이름 등을 전송하는 것이 아니라, `request_recommendation` 처럼 비즈니스 의미가 담긴 이벤트를 방출
- **GA4 파라미터 매핑**: 개발 시 파라미터가 비어있는 속성은 굳이 억지로 채워넣지 않고 undefined 또는 제외하고 전송
