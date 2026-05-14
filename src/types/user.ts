export interface MyProfile {
  userId: number
  email: string
  nickname: string
  bio: string | null
  profileImageUrl: string | null
  createdAt: string
  nicknameChangeableAt: string | null
}

export interface UpdateProfileRequest {
  nickname: string
  bio: string | null
}
