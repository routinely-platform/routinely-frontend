import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRoutineTemplate,
  deleteRoutineTemplate,
  getMyRoutines,
  getRoutineTemplates,
  startRoutine,
  stopRoutine,
  updateRoutine,
  updateRoutineTemplate,
  type RoutineDefinitionRequest,
  type StartRoutineRequest,
  type UpdateRoutineRequest,
} from '@/api/routine'
import type { Routine } from '@/types/routine'
import { EXECUTIONS_QUERY_KEY } from './useExecutions'

export const MY_ROUTINES_QUERY_KEY = ['routines', 'mine'] as const
export const ROUTINE_TEMPLATES_QUERY_KEY = ['routineTemplates'] as const

export function useMyRoutines() {
  return useQuery({
    queryKey: MY_ROUTINES_QUERY_KEY,
    queryFn: getMyRoutines,
  })
}

/**
 * 루틴 한 건 — 단건 조회 API가 없어 내 루틴 목록에서 찾는다 (#63 결정 1-A).
 * 목록은 중단 · 완료 루틴까지 다 오고(파라미터 없음) 같은 쿼리 키라, 목록에서 들어오면 네트워크를 타지 않는다.
 * 단건 API가 생기면 이 훅 안만 바꾼다. `data`가 null이면 내 루틴 중에 없는 id다
 */
export function useRoutineDetail(routineId: number) {
  return useQuery({
    queryKey: MY_ROUTINES_QUERY_KEY,
    queryFn: getMyRoutines,
    select: (routines): Routine | null => routines.find((r) => r.routineId === routineId) ?? null,
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
    onSuccess: (created) => {
      // 만들면 바로 상세로 간다(#63) — 상세는 목록 캐시에서 찾으므로, 재조회를 기다리지 않게 응답을 먼저 넣는다.
      // 목록을 아직 안 받았으면(undefined) 두고 재조회에 맡긴다
      queryClient.setQueryData<Routine[]>(
        MY_ROUTINES_QUERY_KEY,
        (routines) =>
          routines && [...routines.filter((r) => r.routineId !== created.routineId), created]
      )
      void queryClient.invalidateQueries({ queryKey: MY_ROUTINES_QUERY_KEY })
    },
  })
}

// 주기 · 기간이 바뀌면 서버가 파생하는 PENDING · MISSED도 바뀐다 — 이 루틴의 인증 기록도 다시 받는다
export function useUpdateRoutine(routineId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateRoutineRequest) => updateRoutine(routineId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_ROUTINES_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: [...EXECUTIONS_QUERY_KEY, routineId] })
    },
  })
}

// 중단하면 서버가 미완료 파생을 멈추고 backfillable이 전부 false가 된다 — 인증 기록도 다시 받는다
export function useStopRoutine(routineId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => stopRoutine(routineId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_ROUTINES_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: [...EXECUTIONS_QUERY_KEY, routineId] })
    },
  })
}
