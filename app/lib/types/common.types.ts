/**
 * 공통 API 응답 형식
 */
export interface CommonResult<T> {
  success: boolean;
  message: string;
  data: T;
}
