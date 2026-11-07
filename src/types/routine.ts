export type ScheduleType = 'DAILY' | 'SPECIFIC_DAYS' | 'WEEKLY_COUNT' | 'MONTHLY_COUNT'

export type Weekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

/** 반복 주기 정의 — 루틴과 템플릿이 같은 모양으로 갖는다 (ADR-0039) */
export interface ScheduleDefinition {
  scheduleType: ScheduleType
  /** SPECIFIC_DAYS일 때만 */
  daysOfWeek: Weekday[] | null
  /** WEEKLY_COUNT · MONTHLY_COUNT일 때만 */
  targetCount: number | null
}

/** GET /api/v1/routines 항목 */
export interface Routine extends ScheduleDefinition {
  routineId: number
  routineTemplateId: number | null
  title: string
  challengeId: number | null
  /** YYYY-MM-DD */
  startedAt: string
  /** YYYY-MM-DD · null이면 종료일 없이 계속 */
  endedAt: string | null
  isActive: boolean
  categoryCode: string
}

/** 화면에서 날짜로 파생하는 상태 — 서버에 저장하지 않는다 */
export type RoutineStatus = 'ongoing' | 'completed' | 'stopped'

/** GET /api/v1/routine-templates 항목 */
export interface RoutineTemplate extends ScheduleDefinition {
  templateId: number
  title: string
  categoryCode: string
  challengeId: number | null
}

/** GET /api/v1/categories 항목 */
export interface Category {
  code: string
  name: string
  icon: string
  displayOrder: number
}
