import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api'

/** 서버가 ApiResponse 실패 바디로 응답한 axios 에러 */
export function apiError<T>(status: number, body: ApiResponse<T>) {
  const config = { headers: new AxiosHeaders() }
  const response: AxiosResponse<ApiResponse<T>> = {
    data: body,
    status,
    statusText: '',
    headers: {},
    config,
  }
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, response)
}

/** 응답 자체가 없는 axios 에러 — 네트워크 끊김 */
export function networkError() {
  return new AxiosError('Network Error', 'ERR_NETWORK', { headers: new AxiosHeaders() })
}
