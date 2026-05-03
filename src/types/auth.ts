export interface User {
  userId: number
  email: string
  nickname: string
  profileImageUrl: string | null
}

export interface AuthSessionResponse {
  accessToken: string
  user: User
}

export interface SignupRequest {
  email: string
  nickname: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupResponse {
  userId: number
  email: string
  nickname: string
}

export type LoginResponse = AuthSessionResponse
