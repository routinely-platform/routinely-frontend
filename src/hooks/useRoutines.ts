import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteRoutineTemplate, getMyRoutines, getRoutineTemplates } from '@/api/routine'

export const MY_ROUTINES_QUERY_KEY = ['routines', 'mine'] as const
export const ROUTINE_TEMPLATES_QUERY_KEY = ['routineTemplates'] as const

export function useMyRoutines() {
  return useQuery({
    queryKey: MY_ROUTINES_QUERY_KEY,
    queryFn: getMyRoutines,
  })
}

export function useRoutineTemplates() {
  return useQuery({
    queryKey: ROUTINE_TEMPLATES_QUERY_KEY,
    queryFn: getRoutineTemplates,
  })
}

// 템플릿을 지워도 루틴은 그대로다(ADR-0040) — 루틴 목록은 다시 받지 않는다
export function useDeleteRoutineTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: number) => deleteRoutineTemplate(templateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROUTINE_TEMPLATES_QUERY_KEY })
    },
  })
}
