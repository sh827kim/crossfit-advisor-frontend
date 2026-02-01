export const PROFILE_BACKGROUND_COLORS = [
    '#F43000', // Neon Red
    '#EEFD32', // Neon Yellow
    '#00DCEB', // Neon Cyan
    '#FF00FF', // Hot Pink
    '#39FF14', // Lime Green
    '#007FFF', // Electric Blue
    '#FF5E00', // Neon Orange
    '#BF00FF', // Electric Purple
    '#FFD700', // Gold
    '#00FF7F', // Spring Green
];

export const getProfileColor = (seed: string) => {
    if (!seed) return PROFILE_BACKGROUND_COLORS[0];
    const charCode = seed.charCodeAt(0) || 0;
    return PROFILE_BACKGROUND_COLORS[charCode % PROFILE_BACKGROUND_COLORS.length];
};
