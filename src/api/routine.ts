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
  // record의 boolean isActive가 Jackson 설정에 따라 "active"로 나갈 수 있다 — 둘 다 받는다
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
