import { toPng } from 'html-to-image';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

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

        if (Capacitor.isNativePlatform()) {
            // 안드로이드 / iOS 원네이티브 앱 (Capacitor) 환경
            try {
                // 1. data URL에서 base64 데이터만 추출
                const base64Data = dataUrl.split(',')[1];
                
                // 2. 임시 캐시 디렉토리에 파일 저장
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache,
                });

                // 3. 네이티브 기기 공유 창 띄우기
                await Share.share({
                    title: '운동 완료',
                    text: '오늘의 운동을 완료했습니다!',
                    url: savedFile.uri, // 저장된 로컬 파일 경로 지정
                });
            } catch (error: any) {
                console.error('Error sharing natively:', error);
                alert('앱 내 이미지 공유 중 에러가 발생했습니다: ' + (error?.message || error));
            }
        } else {
            // 일반 모바일 웹 / 데스크톱 브라우저 환경
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
        }

    } catch (error: any) {
        console.error('Error in sharing workflow:', error);
        alert('이미지 생성 공유 중 에러가 발생했습니다: ' + (error?.message || error));
    }
};
