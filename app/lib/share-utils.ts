import { toPng } from 'html-to-image';

export const shareWorkoutCard = async (element: HTMLElement | null, fileName: string = 'workout-summary.png') => {
    if (!element) return;

    try {
        // Generate image using html-to-image
        const dataUrl = await toPng(element, {
            cacheBust: true,
            pixelRatio: 2, // High resolution
            // backgroundColor: undefined // default is transparent
        });

        // Convert dataURL to Blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        const file = new File([blob], fileName, { type: 'image/png' });

        // Check if Web Share API is supported and can share files
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: '운동 완료',
                    text: '오늘의 운동을 완료했습니다!',
                });
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
            }
        } else {
            // Fallback: Download image
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            link.click();
        }

    } catch (error) {
        console.error('Error in sharing workflow:', error);
    }
};
