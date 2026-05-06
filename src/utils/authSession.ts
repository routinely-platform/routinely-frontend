import { useAuthStore } from '@/stores/authStore'

export const clearAuthSession = () => {
  useAuthStore.getState().clearAuth()
}

export const redirectToLogin = () => {
  window.location.href = '/login'
}

export const clearAuthSessionAndRedirect = () => {
  clearAuthSession()
  redirectToLogin()
}
