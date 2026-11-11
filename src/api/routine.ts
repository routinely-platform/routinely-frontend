import { apiClient } from './client'
import { unwrapApiResponse } from './response'
import type { ApiResponse } from '@/types/api'
import type { Routine, RoutineTemplate, ScheduleType, Weekday } from '@/types/routine'

interface RawRoutineResponse {
  routineId: number
  routineTemplateId: number | null
  title: string
  challengeId: number | null
  startedAt: string
  endedAt: string | null
  isActive?: boolean
  // record의 boolean isActive — Jackson 3.1.0 기본 설정에서 "isActive" 그대로 나간다(2026-11-08 실측).
  // 설정이 바뀌어 "active"로 나가도 깨지지 않게 둘 다 받는다
  active?: boolean
  categoryCode: string
  scheduleType: ScheduleType
  daysOfWeek: Weekday[] | null
  targetCount: number | null
}

// preferredTime · preferredDays도 오지만 알림이 v2라 화면에서 쓰지 않는다 — 타입에서 뺀다
function normalizeRoutine(raw: RawRoutineResponse): Routine {
  return {
    routineId: raw.routineId,
    routineTemplateId: raw.routineTemplateId ?? null,
    title: raw.title,
    challengeId: raw.challengeId ?? null,
    startedAt: raw.startedAt,
    endedAt: raw.endedAt ?? null,
    isActive: raw.isActive ?? raw.active ?? true,
    categoryCode: raw.categoryCode,
    scheduleType: raw.scheduleType,
    daysOfWeek: raw.daysOfWeek ?? null,
    targetCount: raw.targetCount ?? null,
  }
}

// isActive를 넘기지 않으면 진행 중 · 완료됨 · 중단됨을 한 번에 받는다 — 필터 칩 개수를 한 응답으로 센다
export async function getMyRoutines(): Promise<Routine[]> {
  const res = await apiClient.get<ApiResponse<RawRoutineResponse[]>>('/routines')
  return unwrapApiResponse(res.data, '루틴 목록을 불러오지 못했습니다.').map(normalizeRoutine)
}

export async function getRoutineTemplates(): Promise<RoutineTemplate[]> {
  const res = await apiClient.get<ApiResponse<RoutineTemplate[]>>('/routine-templates')
  return unwrapApiResponse(res.data, '템플릿 목록을 불러오지 못했습니다.')
}

export async function deleteRoutineTemplate(templateId: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/routine-templates/${templateId}`)
}

/** 정의 5필드 — 루틴 직접 시작 · 템플릿 생성 · 템플릿 수정이 같은 모양으로 보낸다 */
export interface RoutineDefinitionRequest {
  title: string
  categoryCode: string
  scheduleType: ScheduleType
  daysOfWeek: Weekday[] | null
  targetCount: number | null
}

interface RoutinePeriodRequest {
  /** YYYY-MM-DD */
  startedAt: string
  endedAt: string | null
}

/**
 * 템플릿 ID와 정의는 하나만 보낸다 — 둘 다 보내면 400 (`StartRoutineRequest.isSourceExclusive`).
 * 선호 시각 · 선호 요일은 알림이 v2라 보내지 않는다
 */
export type StartRoutineRequest = RoutinePeriodRequest &
  ({ routineTemplateId: number } | RoutineDefinitionRequest)

export async function startRoutine(body: StartRoutineRequest): Promise<Routine> {
  const res = await apiClient.post<ApiResponse<RawRoutineResponse>>('/routines', body)
  return normalizeRoutine(unwrapApiResponse(res.data, '루틴을 시작하지 못했습니다.'))
}

export async function createRoutineTemplate(
  body: RoutineDefinitionRequest
): Promise<RoutineTemplate> {
  const res = await apiClient.post<ApiResponse<RoutineTemplate>>('/routine-templates', body)
  return unwrapApiResponse(res.data, '템플릿을 저장하지 못했습니다.')
}

export async function updateRoutineTemplate(
  templateId: number,
  body: RoutineDefinitionRequest
): Promise<RoutineTemplate> {
  const res = await apiClient.patch<ApiResponse<RoutineTemplate>>(
    `/routine-templates/${templateId}`,
    body
  )
  return unwrapApiResponse(res.data, '템플릿을 수정하지 못했습니다.')
}

/**
 * PATCH /routines/{routineId} — 보낸 필드만 바뀐다.
 * 주기는 세 필드를 함께 보내야 한다(`isScheduleValid`). 종료일을 비우려면 `clearEndedAt`(`endedAt`과 동시 불가).
 * 주기 · 시작일은 완료 기록이 있으면 400, 챌린지 루틴은 정의 · 기간을 보내면 403이다
 */
export interface UpdateRoutineRequest {
  title?: string
  categoryCode?: string
  scheduleType?: ScheduleType
  daysOfWeek?: Weekday[] | null
  targetCount?: number | null
  startedAt?: string
  endedAt?: string
  clearEndedAt?: true
}

export async function updateRoutine(
  routineId: number,
  body: UpdateRoutineRequest
): Promise<Routine> {
  const res = await apiClient.patch<ApiResponse<RawRoutineResponse>>(`/routines/${routineId}`, body)
  return normalizeRoutine(unwrapApiResponse(res.data, '루틴을 수정하지 못했습니다.'))
}

/** DELETE /routines/{routineId} — 삭제가 아니라 중단이다(isActive=false). 챌린지 루틴은 403 */
export async function stopRoutine(routineId: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/routines/${routineId}`)
}
