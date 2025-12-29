import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * TailwindCSS 클래스를 병합하는 유틸리티 함수
 * shadcn/ui 컴포넌트에서 className을 조합할 때 사용됩니다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
