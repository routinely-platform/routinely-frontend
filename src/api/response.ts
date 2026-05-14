import type { ApiResponse } from '@/types/api'

export function unwrapApiResponse<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (response.success && response.data !== undefined) {
    return response.data
  }

  throw new Error(response.message || fallbackMessage)
}
