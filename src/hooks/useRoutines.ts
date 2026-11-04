import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRoutineTemplate,
  deleteRoutineTemplate,
  getMyRoutines,
  getRoutineTemplates,
  startRoutine,
  updateRoutineTemplate,
  type RoutineDefinitionRequest,
  type StartRoutineRequest,
} from '@/api/routine'

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

// 템플릿을 고쳐도 진행 중인 루틴에는 적용되지 않는다(ADR-0040) — 루틴 목록은 다시 받지 않는다
export function useUpdateRoutineTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, body }: { templateId: number; body: RoutineDefinitionRequest }) =>
      updateRoutineTemplate(templateId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROUTINE_TEMPLATES_QUERY_KEY })
    },
  })
}

export function useCreateRoutineTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: RoutineDefinitionRequest) => createRoutineTemplate(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROUTINE_TEMPLATES_QUERY_KEY })
    },
  })
}

export function useStartRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: StartRoutineRequest) => startRoutine(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_ROUTINES_QUERY_KEY })
    },
  })
}
