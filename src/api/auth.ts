import { apiClient } from './client'
import { unwrapApiResponse } from './response'
import type { ApiResponse } from '@/types/api'
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types/auth'

export async function postSignup(data: SignupRequest): Promise<SignupResponse> {
  const res = await apiClient.post<ApiResponse<SignupResponse>>('/auth/signup', data)
  return unwrapApiResponse(res.data, '회원가입에 실패했습니다.')
}

export async function postLogin(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data)
  return unwrapApiResponse(res.data, '로그인에 실패했습니다.')
}

export async function postLogout(): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/auth/logout')
}
