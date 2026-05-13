import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getMyProfile, updateProfile } from '@/api/user'
import { useAuthStore } from '@/stores/authStore'
import type { UpdateProfileRequest } from '@/types/user'

const MY_PROFILE_QUERY_KEY = ['myProfile'] as const

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

      const { user, setUser } = useAuthStore.getState()
      if (user) {
        setUser({ ...user, nickname: updatedProfile.nickname })
      }
    },
  })
}
