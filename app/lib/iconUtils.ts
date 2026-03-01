import { Movement } from '@/app/lib/types/workout.types';

export const getMovementIconPath = (movement: Movement): string => {
    if (movement.type === 'CARDIO') return '/wod-icon/cardio.svg';

    if (movement.type === 'WEIGHTLIFTING') {
        if (movement.equipment === 'DUMBBELL' || movement.equipment === 'KETTLEBELL') {
            return '/wod-icon/dumbbell-kb.svg';
        }
        return '/wod-icon/weight-lifting.svg';
    }

    if (movement.type === 'DUMBBELL_KB') {
        return '/wod-icon/dumbbell-kb.svg';
    }

    if (movement.type === 'GYMNASTICS_BODY') {
        return '/wod-icon/gymnastic-body.svg';
    }

    // Default GYMNASTICS_EQUIP or unknown
    if (movement.equipment === 'BODYWEIGHT') {
        return '/wod-icon/gymnastic-body.svg';
    }

    return '/wod-icon/gymnastic-equip.svg';
};
