import { apiClient } from './client'
import { unwrapApiResponse } from './response'
import type { ApiResponse } from '@/types/api'
import type { MyProfile, UpdateProfileRequest } from '@/types/user'

interface RawMyProfileResponse {
  userId: number
  email: string
  nickname: string
  bio: string | null
  profileImageUrl: string | null
  createdAt: string
  nickname_changeable_at: string | null
}

// backend returns nickname_changeable_at (snake_case via @JsonProperty)
// normalize to camelCase here so the rest of the app stays consistent
function normalizeProfile(raw: RawMyProfileResponse): MyProfile {
  return {
    userId: raw.userId,
    email: raw.email,
    nickname: raw.nickname,
    bio: raw.bio ?? null,
    profileImageUrl: raw.profileImageUrl ?? null,
    createdAt: raw.createdAt,
    nicknameChangeableAt: raw.nickname_changeable_at,
  }
}

export async function getMyProfile(): Promise<MyProfile> {
  const res = await apiClient.get<ApiResponse<RawMyProfileResponse>>('/users/me')
  const raw = unwrapApiResponse(res.data, '프로필 조회에 실패했습니다.')
  return normalizeProfile(raw)
}

export async function updateProfile(data: UpdateProfileRequest): Promise<MyProfile> {
  const res = await apiClient.patch<ApiResponse<RawMyProfileResponse>>('/users/me', data)
  const raw = unwrapApiResponse(res.data, '프로필 수정에 실패했습니다.')
  return normalizeProfile(raw)
}
