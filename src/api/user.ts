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

// 백엔드 #95: PUT /users/me/profile-image (multipart, field=image) → 갱신된 전체 프로필
// apiClient 기본 헤더가 application/json 이라, 이대로 두면 axios 가 FormData 를 JSON 으로
// 직렬화해버린다. 이를 막기 위해 요청별로 Content-Type 을 multipart/form-data 로 재정의한다.
// (브라우저 환경에선 axios 가 전송 직전 이 헤더를 비워, 브라우저가 boundary 를 채운다.)
export async function uploadProfileImage(file: File): Promise<MyProfile> {
  const formData = new FormData()
  formData.append('image', file)

  const res = await apiClient.put<ApiResponse<RawMyProfileResponse>>(
    '/users/me/profile-image',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  const raw = unwrapApiResponse(res.data, '프로필 이미지 업로드에 실패했습니다.')
  return normalizeProfile(raw)
}

// 백엔드 #95: DELETE /users/me/profile-image → 이미지가 제거된 전체 프로필
export async function deleteProfileImage(): Promise<MyProfile> {
  const res = await apiClient.delete<ApiResponse<RawMyProfileResponse>>('/users/me/profile-image')
  const raw = unwrapApiResponse(res.data, '프로필 이미지 삭제에 실패했습니다.')
  return normalizeProfile(raw)
}
