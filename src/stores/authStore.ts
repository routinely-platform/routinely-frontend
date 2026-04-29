import { create } from 'zustand'
import type { User } from '@/types/auth'

interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  setAuth: (token: string, user: User) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // 앱 초기 로드 시 토큰 검증 전까지 true
  user: null,
  setAuth: (token, user) => set({ accessToken: token, isAuthenticated: true, user }),
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ accessToken: null, isAuthenticated: false, user: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
