export const PROFILE_BACKGROUND_COLORS = [
    '#FF3B30', // Red
    '#FF9500', // Orange
    '#EEFD32', // Neon Yellow
    '#39FF14', // Neon Green
    '#00DCEB', // Cyan
    '#007AFF', // Blue
    '#5856D6', // Purple
    '#FF2D55', // Pink
    '#FF00FF', // Magenta
    '#F43000', // Theme Red
];

export const getProfileColor = (seed: string) => {
    if (!seed) return PROFILE_BACKGROUND_COLORS[0];
    const charCode = seed.charCodeAt(0) || 0;
    return PROFILE_BACKGROUND_COLORS[charCode % PROFILE_BACKGROUND_COLORS.length];
};
