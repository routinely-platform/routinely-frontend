import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { AuthSessionResponse } from '@/types/auth'

let hasInitializedAuth = false

async function initAuth() {
  const { setAuth, setLoading, clearAuth } = useAuthStore.getState()

  try {
    // HttpOnly 쿠키의 refresh 토큰으로 세션을 복구
    const refreshRes = await apiClient.post<ApiResponse<AuthSessionResponse>>('/auth/refresh')
    const session = refreshRes.data.data!

    setAuth(session.accessToken, session.user)
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
