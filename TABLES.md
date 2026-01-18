# CrossFit Accessory Planner - 데이터베이스 테이블 설계

## 개요
이 문서는 CrossFit 보조 운동 플래너의 PostgreSQL 데이터베이스 테이블 구조와 생성 쿼리를 포함합니다.

**주요 변경사항 (v4):**
- 운동 계획(workout_plans)은 서버에서 임시로 생성되며 DB에 저장되지 않음
- 사용자가 운동을 시작할 때만 workout_records 생성
- 운동 세트별 개별 완료 처리 지원
- workout_record_exercises에 started_at 컬럼 추가 (세트 시작 시간 추적)
- 세트 상태를 NOT_STARTED, STARTED, COMPLETED 3단계로 관리
- 화면 리프레시 후 운동 재개를 위한 단건 조회 엔드포인트 추가
- duration에 1분 옵션 추가 (1, 5, 10, 15, 20, 25, 30분 지원)
- **목표 진행 템플릿 추가** (goal_progression_templates, goal_progression_exercises)
- **난이도별 목표 달성 프로그램** (BEGINNER, INTERMEDIATE, ADVANCED)
- **주차별, 요일별 운동 가이드** (목표 달성 사용자를 위한 구체적인 계획 제공)

---

## 1. users 테이블
사용자 정보를 저장합니다.

### 테이블 구조
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|--------|------|
| id | UUID | PRIMARY KEY | 사용자 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 주소 |
| name | VARCHAR(255) | NOT NULL | 사용자 이름 |
| google_id | VARCHAR(255) | UNIQUE, NULLABLE | Google 계정 ID |
| profile_image | TEXT | NULLABLE | 프로필 이미지 URL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 계정 생성 시간 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 계정 수정 시간 |

### 생성 쿼리
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    profile_image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
```

---

## 2. movements 테이블
운동 마스터 데이터를 저장합니다.

### 테이블 구조
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|--------|------|
| id | VARCHAR(50) | PRIMARY KEY | 운동 ID |
| name | VARCHAR(255) | NOT NULL | 운동 이름 |
| min_reps | INTEGER | NULLABLE | 권장 최소 반복 횟수 |
| max_reps | INTEGER | NULLABLE | 권장 최대 반복 횟수 |
| equipment | VARCHAR(50) | NULLABLE | 필요한 장비 (BODYWEIGHT, BARBELL, DUMBBELL 등) |
| muscle_groups | TEXT[] | NOT NULL | 타겟 근육 그룹 배열 (CORE, LEGS, BACK, CHEST, SHOULDER, ARMS, CARDIO, FULL) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 수정 시간 |

### 생성 쿼리
```sql
CREATE TABLE movements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    min_reps INTEGER,
    max_reps INTEGER,
    equipment VARCHAR(50) CHECK (equipment IN ('BODYWEIGHT', 'GHD', 'BAR', 'BAND', 'RINGS', 'BARBELL', 'BOX', 'DUMBBELL', 'KETTLEBELL', 'WALLBALL', 'WALL', 'ASSAULT_BIKE', 'ROWING')),
    muscle_groups TEXT[] NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (min_reps IS NULL OR max_reps IS NULL OR min_reps <= max_reps)
);

CREATE INDEX idx_movements_name ON movements(name);
CREATE INDEX idx_movements_equipment ON movements(equipment);
```

---

## 3. goal_progression_templates 테이블
달성 목표 운동별 난이도별 진행 템플릿을 저장합니다. (예: 머슬업 초보자 12주 프로그램)

### 테이블 구조
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|--------|------|
| id | UUID | PRIMARY KEY | 템플릿 ID |
| movement_id | VARCHAR(50) | NOT NULL, FK(movements) | 목표 운동 ID (머슬업, 핸드스탠드 등) |
| difficulty_level | VARCHAR(50) | NOT NULL | 난이도 (BEGINNER, INTERMEDIATE, ADVANCED) |
| name | VARCHAR(255) | NOT NULL | 템플릿 이름 (예: "초보자를 위한 머슬업 마스터 - 12주") |
| description | TEXT | NULLABLE | 템플릿 설명 및 목표 |
| total_weeks | INTEGER | NOT NULL | 총 진행 기간 (주) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 수정 시간 |

### 생성 쿼리
```sql
CREATE TABLE goal_progression_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_id VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_weeks INTEGER NOT NULL CHECK (total_weeks > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movement_id) REFERENCES movements(id) ON DELETE CASCADE,
    UNIQUE(movement_id, difficulty_level)
);

CREATE INDEX idx_goal_progression_templates_movement_id ON goal_progression_templates(movement_id);
CREATE INDEX idx_goal_progression_templates_difficulty ON goal_progression_templates(difficulty_level);
```

---

## 4. goal_progression_exercises 테이블
각 템플릿의 주차별 세부 운동을 저장합니다.

### 테이블 구조
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|--------|------|
| id | BIGSERIAL | PRIMARY KEY | 레코드 ID |
| template_id | UUID | NOT NULL, FK(goal_progression_templates) | 진행 템플릿 ID |
| week_number | INTEGER | NOT NULL | 주차 (1부터 시작) |
| day_number | INTEGER | NOT NULL | 요일 (1=월요일, 7=일요일) |
| exercise_order | INTEGER | NOT NULL | 같은 날짜 내 운동 순서 (0부터 시작) |
| movement_id | VARCHAR(50) | NOT NULL, FK(movements) | 운동 ID |
| sets | INTEGER | NULLABLE | 세트 수 |
| min_reps | INTEGER | NULLABLE | 최소 반복 횟수 |
| max_reps | INTEGER | NULLABLE | 최대 반복 횟수 |
| notes | TEXT | NULLABLE | 운동 관련 노트 (자세 설명, 팁 등) |

### 생성 쿼리
```sql
CREATE TABLE goal_progression_exercises (
    id BIGSERIAL PRIMARY KEY,
    template_id UUID NOT NULL,
    week_number INTEGER NOT NULL CHECK (week_number > 0),
    day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
    exercise_order INTEGER NOT NULL CHECK (exercise_order >= 0),
    movement_id VARCHAR(50) NOT NULL,
    sets INTEGER CHECK (sets IS NULL OR sets > 0),
    min_reps INTEGER,
    max_reps INTEGER,
    notes TEXT,
    FOREIGN KEY (template_id) REFERENCES goal_progression_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (movement_id) REFERENCES movements(id) ON DELETE CASCADE,
    UNIQUE(template_id, week_number, day_number, exercise_order),
    CHECK (min_reps IS NULL OR max_reps IS NULL OR min_reps <= max_reps)
);

CREATE INDEX idx_goal_progression_exercises_template_id ON goal_progression_exercises(template_id);
CREATE INDEX idx_goal_progression_exercises_movement_id ON goal_progression_exercises(movement_id);
CREATE INDEX idx_goal_progression_exercises_week ON goal_progression_exercises(template_id, week_number);
```

---

## 5. workout_records 테이블
사용자가 완료한 운동 기록을 저장합니다.

### 테이블 구조
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|--------|------|
| id | UUID | PRIMARY KEY | 기록 ID |
| user_id | UUID | NOT NULL, FK(users) | 사용자 ID |
| date | DATE | NOT NULL | 운동 날짜 |
| mode | VARCHAR(50) | NOT NULL | 운동 모드 (WOD, GOAL, PART) |
| duration | INTEGER | NOT NULL | 운동 시간 (분) |
| status | VARCHAR(50) | NOT NULL | 운동 상태 (STARTED, COMPLETED) |
| mode_display | VARCHAR(100) | NOT NULL | 모드 표시 텍스트 (부족 부위 채우기, 목표 달성 등) |
| notes | TEXT | NULLABLE | 운동 관련 메모 |
| started_at | TIMESTAMP | NOT NULL | 운동 시작 시간 |
| completed_at | TIMESTAMP | NULLABLE | 운동 완료 시간 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 수정 시간 |

### 생성 쿼리
```sql
CREATE TABLE workout_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('WOD', 'GOAL', 'PART')),
    duration INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('STARTED', 'COMPLETED')),
    mode_display VARCHAR(100) NOT NULL,
    notes TEXT,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, date)
);

CREATE INDEX idx_workout_records_user_id ON workout_records(user_id);
CREATE INDEX idx_workout_records_date ON workout_records(date);
CREATE INDEX idx_workout_records_status ON workout_records(status);
CREATE INDEX idx_workout_records_user_date ON workout_records(user_id, date);
```

---

## 4. workout_record_exercises 테이블
운동 기록에 포함된 개별 세트를 저장합니다.

### 테이블 구조
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|--------|------|
| id | BIGSERIAL | PRIMARY KEY | 레코드 ID |
| workout_record_id | UUID | NOT NULL, FK(workout_records) | 운동 기록 ID |
| movement_id | VARCHAR(50) | NOT NULL, FK(movements) | 운동 ID |
| min_reps | INTEGER | NULLABLE | 최소 반복 횟수 |
| max_reps | INTEGER | NULLABLE | 최대 반복 횟수 |
| status | VARCHAR(50) | NOT NULL | 세트 상태 (NOT_STARTED, STARTED, COMPLETED) |
| exercise_order | INTEGER | NOT NULL | 운동 순서 (0부터 시작) |
| started_at | TIMESTAMP | NULLABLE | 세트 시작 시간 |
| completed_at | TIMESTAMP | NULLABLE | 세트 완료 시간 |

### 생성 쿼리
```sql
CREATE TABLE workout_record_exercises (
    id BIGSERIAL PRIMARY KEY,
    workout_record_id UUID NOT NULL,
    movement_id VARCHAR(50) NOT NULL,
    min_reps INTEGER,
    max_reps INTEGER,
    status VARCHAR(50) NOT NULL CHECK (status IN ('NOT_STARTED', 'STARTED', 'COMPLETED')),
    exercise_order INTEGER NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (workout_record_id) REFERENCES workout_records(id) ON DELETE CASCADE,
    FOREIGN KEY (movement_id) REFERENCES movements(id) ON DELETE CASCADE,
    UNIQUE(workout_record_id, exercise_order),
    CHECK (min_reps IS NULL OR max_reps IS NULL OR min_reps <= max_reps)
);

CREATE INDEX idx_workout_record_exercises_workout_record_id ON workout_record_exercises(workout_record_id);
CREATE INDEX idx_workout_record_exercises_movement_id ON workout_record_exercises(movement_id);
CREATE INDEX idx_workout_record_exercises_status ON workout_record_exercises(status);
```

---

## 전체 생성 스크립트

모든 테이블을 한번에 생성하려면 다음 스크립트를 실행하세요:

```sql
-- 1. users 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    profile_image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- 2. movements 테이블
CREATE TABLE movements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    min_reps INTEGER,
    max_reps INTEGER,
    equipment VARCHAR(50) CHECK (equipment IN ('BODYWEIGHT', 'GHD', 'BAR', 'BAND', 'RINGS', 'BARBELL', 'BOX', 'DUMBBELL', 'KETTLEBELL', 'WALLBALL', 'WALL', 'ASSAULT_BIKE', 'ROWING')),
    muscle_groups TEXT[] NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (min_reps IS NULL OR max_reps IS NULL OR min_reps <= max_reps)
);

CREATE INDEX idx_movements_name ON movements(name);
CREATE INDEX idx_movements_equipment ON movements(equipment);

-- 3. goal_progression_templates 테이블
CREATE TABLE goal_progression_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_id VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_weeks INTEGER NOT NULL CHECK (total_weeks > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movement_id) REFERENCES movements(id) ON DELETE CASCADE,
    UNIQUE(movement_id, difficulty_level)
);

CREATE INDEX idx_goal_progression_templates_movement_id ON goal_progression_templates(movement_id);
CREATE INDEX idx_goal_progression_templates_difficulty ON goal_progression_templates(difficulty_level);

-- 4. goal_progression_exercises 테이블
CREATE TABLE goal_progression_exercises (
    id BIGSERIAL PRIMARY KEY,
    template_id UUID NOT NULL,
    week_number INTEGER NOT NULL CHECK (week_number > 0),
    day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
    exercise_order INTEGER NOT NULL CHECK (exercise_order >= 0),
    movement_id VARCHAR(50) NOT NULL,
    sets INTEGER CHECK (sets IS NULL OR sets > 0),
    min_reps INTEGER,
    max_reps INTEGER,
    notes TEXT,
    FOREIGN KEY (template_id) REFERENCES goal_progression_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (movement_id) REFERENCES movements(id) ON DELETE CASCADE,
    UNIQUE(template_id, week_number, day_number, exercise_order),
    CHECK (min_reps IS NULL OR max_reps IS NULL OR min_reps <= max_reps)
);

CREATE INDEX idx_goal_progression_exercises_template_id ON goal_progression_exercises(template_id);
CREATE INDEX idx_goal_progression_exercises_movement_id ON goal_progression_exercises(movement_id);
CREATE INDEX idx_goal_progression_exercises_week ON goal_progression_exercises(template_id, week_number);

-- 5. workout_records 테이블
CREATE TABLE workout_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('WOD', 'GOAL', 'PART')),
    duration INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('STARTED', 'COMPLETED')),
    mode_display VARCHAR(100) NOT NULL,
    notes TEXT,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, date)
);

CREATE INDEX idx_workout_records_user_id ON workout_records(user_id);
CREATE INDEX idx_workout_records_date ON workout_records(date);
CREATE INDEX idx_workout_records_status ON workout_records(status);
CREATE INDEX idx_workout_records_user_date ON workout_records(user_id, date);

-- 6. workout_record_exercises 테이블
CREATE TABLE workout_record_exercises (
    id BIGSERIAL PRIMARY KEY,
    workout_record_id UUID NOT NULL,
    movement_id VARCHAR(50) NOT NULL,
    min_reps INTEGER,
    max_reps INTEGER,
    status VARCHAR(50) NOT NULL CHECK (status IN ('NOT_STARTED', 'STARTED', 'COMPLETED')),
    exercise_order INTEGER NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (workout_record_id) REFERENCES workout_records(id) ON DELETE CASCADE,
    FOREIGN KEY (movement_id) REFERENCES movements(id) ON DELETE CASCADE,
    UNIQUE(workout_record_id, exercise_order),
    CHECK (min_reps IS NULL OR max_reps IS NULL OR min_reps <= max_reps)
);

CREATE INDEX idx_workout_record_exercises_workout_record_id ON workout_record_exercises(workout_record_id);
CREATE INDEX idx_workout_record_exercises_movement_id ON workout_record_exercises(movement_id);
CREATE INDEX idx_workout_record_exercises_status ON workout_record_exercises(status);
```

---

## 테이블 관계도

```
users (1)
  └─ (1:N) ──── workout_records
                 └─ (1:N) ──── workout_record_exercises
                               └─ (N:1) ──── movements

movements (M)
  ├─ (1:N) ──── goal_progression_templates
  │             └─ (1:N) ──── goal_progression_exercises
  │                           └─ (N:1) ──── movements (자기참조)
  ├─ (직접 참조)
  └─ 여러 workout_record_exercises에서 참조

[쿠폴 유스 케이스]
1. GOAL 모드에서 "머슬업" 선택
   → goal_progression_templates에서 movement_id='muscle_up'인 모든 템플릿 조회
   → 사용자가 난이도(BEGINNER/INTERMEDIATE/ADVANCED) 선택
   → goal_progression_exercises에서 해당 템플릿의 운동들 조회
   → 서버에서 임시로 운동 계획 생성 (저장 안 함)
   → 사용자가 시작하면 workout_records + workout_record_exercises 생성
```

---

## 주요 설계 사항

### 1. 계획과 기록 분리
- 운동 계획(workout_plans)은 서버에서 임시로 생성되며 DB에 저장되지 않음
- 사용자가 운동을 시작할 때만 workout_records 테이블에 저장
- 이를 통해 간단한 데이터베이스 구조 유지

### 2. 세트별 상태 관리
- `workout_records`: 전체 운동 세션의 상태 (STARTED, COMPLETED)
- `workout_record_exercises`: 개별 세트의 상태 (STARTED, COMPLETED)
- 사용자가 세트별로 완료 처리 가능

### 3. UUID 사용
- 사용자, 운동 기록에 UUID 사용으로 분산 환경에서의 확장성 지원

### 4. 반복 횟수 (minReps, maxReps)
- `movements` 테이블: 각 운동의 권장 최소/최대 반복 횟수
- `workout_record_exercises` 테이블: 기록별로 커스터마이징된 반복 횟수
- CHECK 제약으로 min_reps <= max_reps 보장

### 5. Equipment 열거형
- VARCHAR(50)으로 정의하고 CHECK 제약으로 유효한 값만 저장
- 유효한 equipment 값: BODYWEIGHT, GHD, BAR, BAND, RINGS, BARBELL, BOX, DUMBBELL, KETTLEBELL, WALLBALL, WALL, ASSAULT_BIKE, ROWING

### 6. 제약조건
- `mode` 필드: CHECK 제약으로 유효한 값만 저장 (WOD, GOAL, PART)
- `duration` 필드: 1, 5, 10, 15, 20, 25, 30분만 허용하도록 애플리케이션에서 검증
- `status` 필드 (workout_records): STARTED, COMPLETED만 허용
- `status` 필드 (workout_record_exercises): NOT_STARTED, STARTED, COMPLETED 허용

### 7. 인덱스
- 자주 조회되는 컬럼(user_id, date, status 등)에 인덱스 생성
- 복합 인덱스(idx_workout_records_user_date) 추가로 쿼리 성능 향상

### 8. 외래 키
- ON DELETE CASCADE 설정으로 사용자/운동 기록 삭제 시 관련 데이터 자동 삭제

### 9. UNIQUE 제약
- workout_records: (user_id, date)로 하루에 1개 기록만 허용
- workout_record_exercises: (workout_record_id, exercise_order)로 같은 기록에서 순서 중복 방지

### 10. 목표 진행 템플릿 (Goal Progression Templates)
- `goal_progression_templates`: 목표 운동별 난이도별 진행 계획 저장
  - 예: 머슬업 초보자 12주 프로그램, 머슬업 중급자 8주 프로그램
  - UNIQUE(movement_id, difficulty_level)로 운동당 난이도별 1개씩만 허용
- `goal_progression_exercises`: 각 템플릿의 주차별, 요일별 세부 운동
  - week_number: 1부터 시작하는 주차
  - day_number: 1(월)~7(일) 요일
  - 사용자가 GOAL 모드에서 목표를 선택하면 해당 템플릿의 운동들을 서버에서 임시로 계획 생성

### 11. 주차별 운동 배치
- goal_progression_exercises는 주, 요일, 순서(exercise_order)로 운동 배치
  - 예: 1주차 월요일 첫 번째 운동, 1주차 수요일 세 번째 운동 등
  - 이를 통해 사용자에게 "월요일은 이 운동을 하세요"라는 명확한 가이드 제공

---

## 쿼리 예시

### 사용자 프로필 조회
```sql
SELECT id, name, email, google_id, profile_image, created_at
FROM users
WHERE id = $1;
```

### 운동 기록 단건 조회
```sql
SELECT
    wr.id, wr.date, wr.mode, wr.duration, wr.status, wr.mode_display,
    wr.notes, wr.started_at, wr.completed_at
FROM workout_records wr
WHERE wr.id = $1 AND wr.user_id = $2;
```

### 운동 기록 단건 조회 (세부 운동 포함)
```sql
SELECT
    wr.id, wr.user_id, wr.date, wr.mode, wr.duration, wr.status, wr.mode_display,
    wr.notes, wr.started_at, wr.completed_at, wr.created_at, wr.updated_at,
    wre.id as exercise_id, wre.exercise_order, wre.movement_id, m.name as movement_name,
    wre.min_reps, wre.max_reps, wre.status as exercise_status,
    wre.started_at as exercise_started_at, wre.completed_at as exercise_completed_at
FROM workout_records wr
LEFT JOIN workout_record_exercises wre ON wr.id = wre.workout_record_id
LEFT JOIN movements m ON wre.movement_id = m.id
WHERE wr.id = $1 AND wr.user_id = $2
ORDER BY wre.exercise_order ASC;
```

### 월별 운동 기록 조회
```sql
SELECT id, date, mode, duration, status, mode_display, notes, started_at, completed_at
FROM workout_records
WHERE user_id = $1
  AND date >= $2::date
  AND date < ($3::date + INTERVAL '1 month')
ORDER BY date DESC;
```

### 운동 기록과 함께 운동 목록 조회
```sql
SELECT
    wr.id, wr.date, wr.mode, wr.duration, wr.status, wr.mode_display,
    wre.exercise_order, wre.status as exercise_status,
    m.id as movement_id, m.name as movement_name, m.muscle_groups,
    COALESCE(wre.min_reps, m.min_reps) as min_reps,
    COALESCE(wre.max_reps, m.max_reps) as max_reps,
    wre.completed_at
FROM workout_records wr
LEFT JOIN workout_record_exercises wre ON wr.id = wre.workout_record_id
LEFT JOIN movements m ON wre.movement_id = m.id
WHERE wr.user_id = $1 AND wr.date = $2
ORDER BY wre.exercise_order ASC;
```

### 특정 세트들 완료 처리 (일괄)
```sql
-- 여러 세트를 한 번에 완료 처리 (화면 리프레시 후 진행 중인 세트 완료)
UPDATE workout_record_exercises
SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP
WHERE workout_record_id = $1
  AND exercise_order = ANY($2::integer[])
  AND status != 'COMPLETED';

-- 모든 세트가 완료되었는지 확인하고 전체 기록 상태 업데이트
UPDATE workout_records
SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP
WHERE id = $1
  AND NOT EXISTS (
    SELECT 1 FROM workout_record_exercises
    WHERE workout_record_id = $1 AND status != 'COMPLETED'
  );
```

### 세트 시작 처리
```sql
-- 첫 세트 시작 시 현재 상태를 STARTED로 변경
UPDATE workout_record_exercises
SET status = 'STARTED', started_at = CURRENT_TIMESTAMP
WHERE workout_record_id = $1 AND exercise_order = $2 AND status = 'NOT_STARTED';
```

### 운동 기록 시작 시 데이터 저장
```sql
-- 1. workout_records 생성
INSERT INTO workout_records (user_id, date, mode, duration, status, mode_display, started_at)
VALUES ($1, CURRENT_DATE, $2, $3, 'STARTED', $4, CURRENT_TIMESTAMP)
RETURNING id;

-- 2. workout_record_exercises 생성 (예: 2개 운동)
-- 초기 상태는 NOT_STARTED이고, 사용자가 세트를 클릭하면 STARTED로 변경됨
INSERT INTO workout_record_exercises (workout_record_id, movement_id, min_reps, max_reps, status, exercise_order)
VALUES
  ($1, $2, $3, $4, 'NOT_STARTED', 0),
  ($1, $5, $6, $7, 'NOT_STARTED', 1);
```

### 목표 달성 템플릿 조회 (사용자가 목표 선택 시)
```sql
-- 1. 특정 목표 운동의 모든 난이도 템플릿 조회
SELECT id, name, difficulty_level, total_weeks, description
FROM goal_progression_templates
WHERE movement_id = $1
ORDER BY difficulty_level;

-- 2. 특정 템플릿의 세부 운동 조회 (주차별, 요일별 정렬)
SELECT
    gpe.week_number, gpe.day_number, gpe.exercise_order,
    m.id as movement_id, m.name as movement_name,
    gpe.sets, gpe.min_reps, gpe.max_reps, gpe.notes
FROM goal_progression_exercises gpe
JOIN movements m ON gpe.movement_id = m.id
WHERE gpe.template_id = $1
ORDER BY gpe.week_number ASC, gpe.day_number ASC, gpe.exercise_order ASC;

-- 3. 특정 주차의 운동만 조회
SELECT
    gpe.day_number, gpe.exercise_order,
    m.id as movement_id, m.name as movement_name,
    gpe.sets, gpe.min_reps, gpe.max_reps, gpe.notes
FROM goal_progression_exercises gpe
JOIN movements m ON gpe.movement_id = m.id
WHERE gpe.template_id = $1 AND gpe.week_number = $2
ORDER BY gpe.day_number ASC, gpe.exercise_order ASC;
```

### 화면 리프레시 후 운동 재개 시나리오
```sql
-- 1. 현재 기록 상태 확인 (단건 조회)
SELECT * FROM workout_records WHERE id = $1 AND user_id = $2;

-- 2. 현재 세부 운동 상태 확인 (세부 운동 포함)
SELECT exercise_order, status, started_at, completed_at
FROM workout_record_exercises
WHERE workout_record_id = $1
ORDER BY exercise_order ASC;

-- 3. 화면 리프레시 전에 완료한 세트들을 일괄 처리
UPDATE workout_record_exercises
SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP
WHERE workout_record_id = $1
  AND exercise_order = ANY($2::integer[])
  AND status = 'STARTED';

-- 4. 모든 세트가 완료되었는지 확인
UPDATE workout_records
SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP
WHERE id = $1 AND NOT EXISTS (
  SELECT 1 FROM workout_record_exercises
  WHERE workout_record_id = $1 AND status != 'COMPLETED'
);
```
