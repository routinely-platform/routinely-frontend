import { apiClient } from './client'
import { unwrapApiResponse } from './response'
import type { ApiResponse } from '@/types/api'
import type { Execution, ExecutionStatus } from '@/types/execution'

interface RawExecutionResponse {
  executionId: number | null
  routineId: number
  title: string
  scheduledDate: string
  status: ExecutionStatus
  completedAt: string | null
  photoUrl: string | null
  memo: string | null
  feedCardId: number | null
  // record의 boolean 컴포넌트 — Jackson 3.1.0 기본 설정에서 이름 그대로 "backfillable"로 나간다(2026-11-08 실측).
  // 빠지면 "인증할 수 없음" 쪽으로 둔다 — 눌렀다가 거절당하는 것보다 낫다
  backfillable?: boolean
}

function normalizeExecution(raw: RawExecutionResponse): Execution {
  return {
    executionId: raw.executionId ?? null,
    routineId: raw.routineId,
    title: raw.title,
    scheduledDate: raw.scheduledDate,
    status: raw.status,
    completedAt: raw.completedAt ?? null,
    photoUrl: raw.photoUrl ?? null,
    memo: raw.memo ?? null,
    feedCardId: raw.feedCardId ?? null,
    backfillable: raw.backfillable ?? false,
  }
}

/**
 * 기간 조회 — `date`와 `startDate`/`endDate`를 함께 보내면 400이라 이 함수는 범위만 받는다.
 * 범위는 양 끝 포함, 최대 366일. 응답은 날짜 내림차순이다
 */
export interface ExecutionRangeParams {
  routineId: number
  /** YYYY-MM-DD */
  startDate: string
  /** YYYY-MM-DD */
  endDate: string
  status?: ExecutionStatus
}

export async function getExecutions(params: ExecutionRangeParams): Promise<Execution[]> {
  const res = await apiClient.get<ApiResponse<RawExecutionResponse[]>>('/routine-executions', {
    params,
  })
  return unwrapApiResponse(res.data, '인증 기록을 불러오지 못했습니다.').map(normalizeExecution)
}
