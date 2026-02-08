# 📊 사용자 행동 로그(Event Log) 정의서

본 문서는 기획자가 제공한 로그 정의 엑셀과 이를 기반으로 재정리된 내용을 토대로  
**프론트엔드에서 심어야 할 사용자 행동 이벤트를 명확히 정의**한다.

---

## 1. 로그 공통 규칙

### 이벤트 타입
- `pageview` : 화면 진입 시 발생
- `click` : 사용자 클릭/탭 액션 시 발생

### 공통 필수 파라미터 (모든 이벤트 공통)

| key | description |
|----|------------|
| UU | Unique User 식별자 (동일 유저 구분) |
| device | 접속 환경 (`ios` / `android` / `window` / `mac`) |

---

## 2. 파라미터 정의 (Parameters)

| key | value / type | description | notes |
|---|---|---|---|
| time_select | `"5" \|"10" \| "15" \| "20" \| "25" \| "30" \| "35"\"|"40"` | 와드 선택 시 유저가 선택한 운동 시간 | 고정값 → **string 처리** |
| time_result | `{time}` | 실제 수행한 운동 시간 | 예: 25분 선택 후 10분 수행 → `"10"` |
| selected_wod | `{work_name}` | 밸런스케어에서 선택한 WOD 종류 | recommend_1 |
| selected_goal | `{goal}` | 목표달성 트레이닝에서 선택한 운동 종류 | recommend_2 |
| selected_target | `{target}` | 부위별 집중 운동에서 선택한 타겟 부위 | recommend_3 |
| device | enum | 접속 환경 정보 | 공통 |
| UU | string | 동일 유저 식별 | 공통 |

> 원칙  
> - **해당 시점에 값이 존재할 때만 포함**  
> - 값이 없는 경우 억지로 넣지 않는다

---

## 3. 이벤트 정의 : Page View

- event_type: `pageview`
- 발생 시점: **화면 진입 시 1회**
- 목적: 화면 도달률 / 이탈률 분석

### Page View 이벤트 목록

| screen_name | params |
|------------|--------|
| main | device |
| recommend_1 | device |
| recommend_2 | device |
| recommend_3 | device |
| workout | device |
| workout_result | device |
| calendar | device |

---

## 4. 이벤트 정의 : Click

- event_type: `click`
- 발생 시점: 사용자 버튼/탭 클릭
- 목적: 버튼별 전환율 / 사용자 흐름 분석

### Click 이벤트 목록

| screen_name | event_category | target | params |
|------------|---------------|--------|--------|
| main | main | workout_1 | device |
| main | main | workout_2 | device |
| main | main | workout_3 | device |
| main | main | calendar | device |
| main | main | profile | device |
| recommend_1 | header | back | device |
| recommend_1 | recommend_workout | create_workout_button | device, time_select, selected_wod |
| recommend_2 | header | back | device |
| recommend_2 | recommend_workout | create_workout_button | device, time_select, selected_goal |
| recommend_3 | header | back | device |
| recommend_3 | recommend_workout | create_workout_button | device, time_select, selected_target |
| workout_ready | header | back | device |
| workout_ready | start_workout | start_button | device, time_select |
| workout_result | result | record_button | device, time_result |
| workout_result | result | back_home | device |

---

## 5. 구현 유의사항

- pageview는 **라우트/화면 전환 기준으로 1회만 전송**
- SPA 구조 특성상 re-render로 인한 중복 전송 주의
- click 이벤트는 **실제 사용자 액션에만 바인딩**
- event_category / target / screen_name 값은 **본 문서 기준으로 고정**

---

본 문서는 **Agent / 프론트엔드 개발자가 그대로 구현에 사용할 수 있는 실행 명세서**다.
