import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/api/client'
import type { ApiResponse, RefreshResponse } from '@/types/api'
import type { User } from '@/types/auth'

let hasInitializedAuth = false

async function initAuth() {
  const { setAuth, setAccessToken, setLoading, clearAuth } = useAuthStore.getState()

  try {
    // HttpOnly 쿠키의 refresh 토큰으로 새 accessToken 발급
    const refreshRes = await apiClient.post<ApiResponse<RefreshResponse>>('/auth/refresh')
    const token = refreshRes.data.data!.accessToken

    setAccessToken(token)

    // accessToken으로 유저 정보 조회
    const userRes = await apiClient.get<ApiResponse<User>>('/users/me')
    const user = userRes.data.data!

    setAuth(token, user)
  } catch {
    clearAuth()
  } finally {
    setLoading(false)
  }
}

export function useInitAuth() {
  useEffect(() => {
    if (hasInitializedAuth) {
      return
    }

    hasInitializedAuth = true
    initAuth()
  }, [])
}
