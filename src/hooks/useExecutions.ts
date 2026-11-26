import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'

import {
  cancelExecution,
  completeExecution,
  getExecutions,
  type CompleteExecutionInput,
} from '@/api/execution'
import { executionErrorCode, STALE_CACHE_CODES } from '@/components/execution/executionErrors'
import type { Routine } from '@/types/routine'
import { monthRange } from '@/utils/calendar'
import { addDays } from '@/utils/routine'

/** 루틴별로 묶는다 — 수정 · 중단 뒤 `[...EXECUTIONS_QUERY_KEY, routineId]`로 그 루틴 것만 무효화한다 */
export const EXECUTIONS_QUERY_KEY = ['executions'] as const

/**
 * 달력 한 달치 — 쿼리 키를 월 단위로 끊어 월을 오가면 받은 달이 캐시에 남는다.
 * `date`가 아니라 항상 범위로 보낸다(둘을 함께 보내면 400)
 */
export function useMonthExecutions(routineId: number, month: string) {
  return useQuery({
    queryKey: [...EXECUTIONS_QUERY_KEY, routineId, 'month', month],
    queryFn: () => getExecutions({ routineId, ...monthRange(month) }),
  })
}

// 서버의 조회 상한 — 양 끝 포함 366일
const MAX_RANGE_DAYS = 366

/**
 * 완료 기록 조회를 시작하는 날 — 시작일, 단 서버 상한(366일)보다 오래됐으면 최근 366일의 첫날.
 * 이 날이 루틴 시작일보다 뒤면 조회가 **전체 기간을 덮지 못한다** (`isLookbackTruncated`)
 */
export function completedLookbackStart(routine: Routine, today: string): string {
  const limit = addDays(today, -(MAX_RANGE_DAYS - 1))
  return routine.startedAt > limit ? routine.startedAt : limit
}

/** 조회가 시작일까지 닿지 못했나 — 그러면 빈 결과가 "0건"이 아니라 "모름"이다 */
export const isLookbackTruncated = (routine: Routine, today: string) =>
  completedLookbackStart(routine, today) > routine.startedAt

/**
 * 완료한 인증 — 최근 인증 목록 · 수정 잠금(기록이 있나 · 마지막 인증일)이 같은 응답을 쓴다.
 * 범위는 시작일부터 오늘까지인데 서버 상한이 366일이라 **최근 366일**로 자른다.
 * 잘렸는데 비어 있으면 그 앞에 기록이 있을 수 있다 — 화면은 잠그는 쪽으로 판정한다(#63 리뷰 3, 안 C)
 */
export function useCompletedExecutions(routine: Routine | null | undefined, today: string) {
  const startDate = routine ? completedLookbackStart(routine, today) : today

  return useQuery({
    queryKey: [...EXECUTIONS_QUERY_KEY, routine?.routineId, 'completed', startDate, today],
    queryFn: async () => {
      // 시작 전이면 startDate > endDate라 400이다 — 완료가 있을 수 없으니 묻지 않는다
      if (!routine || routine.startedAt > today) return []
      return getExecutions({
        routineId: routine.routineId,
        startDate,
        endDate: today,
        status: 'COMPLETED',
      })
    },
    enabled: !!routine,
  })
}

// ─── 완료 · 취소 ────────────────────────────────────────────────────────

/**
 * 실행 기록 전부를 다시 받는다 — 접두사 `['executions']` 하나로 루틴 상세 달력 · 최근 인증이 함께 따라오고,
 * 같은 접두사를 쓰는 화면(홈 · 통계)이 생기면 그대로 따라온다.
 * 캐시를 응답으로 직접 고치지 않는다 — 취소한 날이 PENDING인지 MISSED인지, 다시 인증할 수 있는지(`backfillable`)는
 * 서버가 파생한다. 클라이언트가 계산하면 그 규칙을 복제하게 된다 (WORKPLAN D7)
 */
const refreshExecutions = (queryClient: QueryClient) =>
  // 활성 쿼리 refetch가 실패해도 reject하지 않는다 — 완료 자체는 성공했으니 오류로 바꾸지 않는다
  queryClient.invalidateQueries({ queryKey: EXECUTIONS_QUERY_KEY })

/**
 * 완료 · 취소 결과 — 저장은 성공했다.
 * `savedAt`은 저장이 끝나고 다시 받기를 시작하기 직전 시각이다. 화면의 쿼리마다 `dataUpdatedAt`이 이보다 앞이면
 * 그 쿼리는 아직 저장 전 데이터다(다시 받기 실패 · 오프라인으로 멈춤 · 아직 안 받음) — 부르는 쪽이 그 날짜를 막는다 (D17)
 */
export interface ExecutionChangeResult {
  savedAt: number
}

/**
 * 저장 → 다시 받기를 한 요청처럼 묶는다 — 다시 받기가 끝날 때까지 isPending이 유지돼
 * 성공 화면이 뜰 때 달력이 이미 바뀌어 있다(D7). 다시 받기가 실패해도 오류로 바꾸지 않는다 — 판정은 쿼리마다 한다
 */
const changeThenRefresh = async (
  queryClient: QueryClient,
  change: () => Promise<unknown>
): Promise<ExecutionChangeResult> => {
  await change()
  const savedAt = Date.now()
  await refreshExecutions(queryClient)
  return { savedAt }
}

/**
 * 이 쿼리가 저장 뒤 새로 받은 데이터인가 — 다시 받기에 성공한 쿼리는 `dataUpdatedAt`이 저장 시각 이후다.
 * 실패하면 dataUpdatedAt이 그대로고, 오프라인이면 status는 success인 채 fetchStatus만 paused로 멈춘다 —
 * 둘 다 "저장 전 데이터"로 걸린다. 다른 달 · 다른 루틴 쿼리의 실패는 이 판정에 끼지 않는다
 */
export const isStaleSince = (savedAt: number | undefined, dataUpdatedAt: number) =>
  savedAt !== undefined && dataUpdatedAt < savedAt

/** 다른 곳에서 먼저 인증 · 취소해 캐시가 낡았다 — 오류는 보이고, 달력은 서버 상태로 돌린다 (D9) */
const refreshIfStale = (queryClient: QueryClient, error: unknown) => {
  const code = executionErrorCode(error)
  if (code && STALE_CACHE_CODES.has(code)) void refreshExecutions(queryClient)
}

export function useCompleteExecution(routineId: number, date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CompleteExecutionInput) =>
      changeThenRefresh(queryClient, () => completeExecution(routineId, date, input)),
    onError: (error) => refreshIfStale(queryClient, error),
  })
}

export function useCancelExecution(routineId: number, date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => changeThenRefresh(queryClient, () => cancelExecution(routineId, date)),
    onError: (error) => refreshIfStale(queryClient, error),
  })
}
