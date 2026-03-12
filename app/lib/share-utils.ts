import { toPng } from 'html-to-image';

function dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

export const shareWorkoutCard = async (element: HTMLElement | null, fileName: string = 'workout-summary.png') => {
    if (!element) return;

    try {
        // Generate image using html-to-image
        const dataUrl = await toPng(element, {
            cacheBust: true,
            pixelRatio: 2, // High resolution
            filter: (node) => {
                // Exclude elements with 'no-share' class
                if (node instanceof HTMLElement && node.classList.contains('no-share')) {
                    return false;
                }
                return true;
            }
        });

        const blob = dataURItoBlob(dataUrl);
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
                    // Fallback to download
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = dataUrl;
                    link.click();
                }
            }
        } else {
            // Fallback: Download image
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            link.click();
        }

    } catch (error: any) {
        console.error('Error in sharing workflow:', error);
        alert('이미지 생성 공유 중 에러가 발생했습니다: ' + (error?.message || error));
    }
};
