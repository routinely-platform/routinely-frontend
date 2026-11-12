import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  deleteProfileImage,
  getMyProfile,
  updateProfile,
  uploadProfileImage,
} from '@/api/user'
import { useAuthStore } from '@/stores/authStore'
import type { MyProfile, UpdateProfileRequest } from '@/types/user'

const MY_PROFILE_QUERY_KEY = ['myProfile'] as const

// 헤더 아바타는 authStore.user 를 바라보므로, 프로필 이미지 변경 시 함께 갱신한다.
function syncAuthUserImage(profileImageUrl: string | null) {
  const { user, setUser } = useAuthStore.getState()
  if (user) {
    setUser({ ...user, profileImageUrl })
  }
}

export function useMyProfile() {
  return useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    queryFn: getMyProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(MY_PROFILE_QUERY_KEY, updatedProfile)
      void queryClient.invalidateQueries({ queryKey: MY_PROFILE_QUERY_KEY })

      const { user, setUser } = useAuthStore.getState()
      if (user) {
        setUser({ ...user, nickname: updatedProfile.nickname })
      }
    },
  })
}

function useProfileImageMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<MyProfile>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(MY_PROFILE_QUERY_KEY, updatedProfile)
      void queryClient.invalidateQueries({ queryKey: MY_PROFILE_QUERY_KEY })
      syncAuthUserImage(updatedProfile.profileImageUrl)
    },
  })
}

export function useUploadProfileImage() {
  return useProfileImageMutation((file: File) => uploadProfileImage(file))
}

export function useDeleteProfileImage() {
  return useProfileImageMutation<void>(() => deleteProfileImage())
}
