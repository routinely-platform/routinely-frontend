import { useQuery } from '@tanstack/react-query'

import { getExecutions } from '@/api/execution'
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
