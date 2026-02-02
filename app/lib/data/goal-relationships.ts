import { GoalEntity } from '@/app/lib/types/workout.types';

export const GOALS_DATA: GoalEntity[] = [
    {
        id: 'pullup',
        name: '풀업',
        category: 'SKILL',
        primaryMuscles: ['BACK'],
        secondaryMuscles: ['CORE', 'CHEST'],
        recommendedRoutines: [
            {
                id: 'pullup_beg',
                goalId: 'pullup',
                level: 'BEGINNER',
                movements: [
                    { movementId: 'ring_row', role: 'MAIN', guidance: '몸을 일직선으로 유지하세요' },
                    { movementId: 'band_pulldown', role: 'ACCESSORY' },
                    { movementId: 'scapular_pullup', role: 'DRILL' },
                    { movementId: 'plank', role: 'ACCESSORY' }
                ]
            },
            {
                id: 'pullup_int',
                goalId: 'pullup',
                level: 'INTERMEDIATE',
                movements: [
                    { movementId: 'negative_pullup', role: 'MAIN', guidance: '3초 이상 버티며 내려오세요' },
                    { movementId: 'bent_over_barbell_row', role: 'ACCESSORY' },
                    { movementId: 'hollow_rock', role: 'ACCESSORY' }
                ]
            }
        ]
    },
    {
        id: 'muscle_up',
        name: '머슬업',
        category: 'SKILL',
        primaryMuscles: ['BACK', 'CHEST'],
        secondaryMuscles: ['CORE'],
        recommendedRoutines: [
            {
                id: 'mu_beg',
                goalId: 'muscle_up',
                level: 'BEGINNER',
                movements: [
                    { movementId: 'pullup', role: 'MAIN' },
                    { movementId: 'bar_dips', role: 'MAIN' },
                    { movementId: 'hanging_leg_raise', role: 'ACCESSORY' }
                ]
            },
            {
                id: 'mu_int',
                goalId: 'muscle_up',
                level: 'INTERMEDIATE',
                movements: [
                    { movementId: 'chest_to_bar', role: 'MAIN' },
                    { movementId: 'ring_dips', role: 'MAIN' },
                    { movementId: 'false_grip_hang', role: 'DRILL' }
                ]
            }
        ]
    },
    {
        id: 'toes_to_bar',
        name: '토투바',
        category: 'SKILL',
        primaryMuscles: ['CORE'],
        secondaryMuscles: ['BACK'],
        recommendedRoutines: [
            {
                id: 't2b_beg',
                goalId: 'toes_to_bar',
                level: 'BEGINNER',
                movements: [
                    { movementId: 'hanging_leg_raise', role: 'MAIN' },
                    { movementId: 'vup', role: 'ACCESSORY' },
                    { movementId: 'plank', role: 'ACCESSORY' }
                ]
            }
        ]
    },
    {
        id: 'handstand_pushup',
        name: '핸드스탠드 푸쉬업',
        category: 'SKILL',
        primaryMuscles: ['CHEST'],
        secondaryMuscles: ['CORE'],
        recommendedRoutines: [
            {
                id: 'hspu_beg',
                goalId: 'handstand_pushup',
                level: 'BEGINNER',
                movements: [
                    { movementId: 'pike_pushup', role: 'MAIN' },
                    { movementId: 'dumbbell_shoulder_press', role: 'ACCESSORY' },
                    { movementId: 'handstand_hold', role: 'DRILL', guidance: '벽에 기대어 30초 버티기' }
                ]
            }
        ]
    },
    {
        id: 'handstand_walk',
        name: '핸드스탠드 워크',
        category: 'SKILL',
        primaryMuscles: ['CHEST', 'CORE'],
        secondaryMuscles: ['BACK'],
        recommendedRoutines: [
            {
                id: 'hsw_beg',
                goalId: 'handstand_walk',
                level: 'BEGINNER',
                movements: [
                    { movementId: 'wall_walk', role: 'MAIN', guidance: '벽을 타고 천천히 올라가세요' },
                    { movementId: 'handstand_hold', role: 'DRILL', guidance: '코어에 힘을 주고 버티세요' },
                    { movementId: 'shoulder_taps', role: 'ACCESSORY' },
                    { movementId: 'hollow_rock', role: 'ACCESSORY' }
                ]
            },
            {
                id: 'hsw_int',
                goalId: 'handstand_walk',
                level: 'INTERMEDIATE',
                movements: [
                    { movementId: 'handstand_walk', role: 'MAIN', guidance: '5m 구간 반복 연습' },
                    { movementId: 'shoulder_taps', role: 'ACCESSORY' },
                    { movementId: 'overhead_lunge', role: 'ACCESSORY' }
                ]
            }
        ]
    }
];
