import { apiClient } from './client'
import type { ApiResponse } from '@/types/api'
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types/auth'

function unwrapApiResponse<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.message || fallbackMessage)
}

export async function postSignup(data: SignupRequest): Promise<SignupResponse> {
  const res = await apiClient.post<ApiResponse<SignupResponse>>('/auth/signup', data)
  return unwrapApiResponse(res.data, '회원가입에 실패했습니다.')
}

export async function postLogin(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data)
  return unwrapApiResponse(res.data, '로그인에 실패했습니다.')
}
