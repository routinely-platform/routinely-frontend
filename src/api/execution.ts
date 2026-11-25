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

// ─── 완료 · 취소 ────────────────────────────────────────────────────────

/** POST · DELETE …/complete 응답 — 조회 응답에서 title · memo · backfillable이 빠진 모양 */
interface RawExecutionCompleteResponse {
  executionId: number | null
  routineId: number
  scheduledDate: string
  status: ExecutionStatus
  completedAt: string | null
  photoUrl: string | null
  feedCardId: number | null
}

export interface CompleteExecutionInput {
  /** 클라이언트 검증(`validateExecutionPhoto`)을 통과한 파일만 */
  photo?: File | null
  memo?: string
}

const completePath = (routineId: number, date: string) =>
  `/routines/${routineId}/executions/${date}/complete`

/**
 * 인증 완료 — `routineId` + `date`(YYYY-MM-DD)로 지정한다(ADR-0038, executionId를 쓰지 않는다).
 * 사진 · 메모는 둘 다 선택이고 multipart 파트로 보낸다. 메모를 query로 보내지 않는다 — URL · 로그에 남는다.
 * apiClient 기본 헤더가 application/json이라 요청별로 multipart를 지정한다 — 브라우저에서는 axios가
 * 이 값을 비워 브라우저가 boundary를 붙인다(`uploadProfileImage`와 같은 방식)
 */
export async function completeExecution(
  routineId: number,
  date: string,
  { photo, memo }: CompleteExecutionInput = {}
): Promise<RawExecutionCompleteResponse> {
  const formData = new FormData()
  if (photo) formData.append('photo', photo)
  // 공백뿐인 메모는 보내지 않는다 — 서버가 null로 저장한다. 내용이 있으면 손대지 않고 그대로 보낸다
  if (memo?.trim()) formData.append('memo', memo)

  const res = await apiClient.post<ApiResponse<RawExecutionCompleteResponse>>(
    completePath(routineId, date),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return unwrapApiResponse(res.data, '인증하지 못했습니다.')
}

/** 인증 취소 — 날짜 · 중단 여부 제한이 없다. 피드 카드와 사진이 함께 지워진다 */
export async function cancelExecution(routineId: number, date: string): Promise<void> {
  const res = await apiClient.delete<ApiResponse<RawExecutionCompleteResponse>>(
    completePath(routineId, date)
  )
  unwrapApiResponse(res.data, '인증을 취소하지 못했습니다.')
}
