import axios, { type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/stores/authStore'
import type { ApiResponse } from '@/types/api'
import type { AuthSessionResponse } from '@/types/auth'
import { clearAuthSessionAndRedirect } from '@/utils/authSession'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is not defined.')
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean // "이 요청은 이미 한 번 재시도했다"는 표시
}

let isRefreshing = false // 현재 토큰 갱신 중인지 여부
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (reason: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

const retryRequest = (request: RetryableConfig, token: string) => {
  request._retry = true
  request.headers.set('Authorization', `Bearer ${token}`)
  return apiClient(request)
}

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response, // 성공 응답은 그냥 통과
  async (error: unknown) => {
    if (!axios.isAxiosError<ApiResponse<unknown>>(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as RetryableConfig

    // refresh/logout 자체의 401은 처리하지 않음 (데드락/무한루프 방지)
    if (
      originalRequest.url === '/auth/refresh' ||
      originalRequest.url === '/auth/logout' ||
      originalRequest.url === '/auth/login'
    ) {
      return Promise.reject(error)
    }

    // 재시도한 요청도 401이면 바로 로그아웃
    if (originalRequest._retry) {
      clearAuthSessionAndRedirect()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        return retryRequest(originalRequest, token)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await apiClient.post<ApiResponse<AuthSessionResponse>>('/auth/refresh')
      const session = data.data!

      useAuthStore.getState().setAuth(session.accessToken, session.user)
      processQueue(null, session.accessToken)

      return retryRequest(originalRequest, session.accessToken)
    } catch (refreshError) {
      processQueue(refreshError)

      try {
        await apiClient.post('/auth/logout')
      } catch {
        // best-effort: 로그아웃 API 실패해도 클라이언트는 로그아웃 처리
      }

      clearAuthSessionAndRedirect()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
