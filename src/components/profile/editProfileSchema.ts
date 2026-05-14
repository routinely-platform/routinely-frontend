import { z } from 'zod'

export const editProfileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, '닉네임을 입력해주세요.')
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(20, '닉네임은 20자 이하여야 합니다.'),
  bio: z.string().max(100, '한 줄 소개는 100자 이하여야 합니다.'),
})

export type EditProfileFormValues = z.infer<typeof editProfileSchema>
