import { z } from 'zod'
import type { RoutineDefinitionRequest } from '@/api/routine'
import type { RoutineTemplate, ScheduleType, Weekday } from '@/types/routine'
import { addDays, daysBetween, isCompleteDate, serverToday } from '@/utils/routine'

export const SCHEDULE_TYPES = ['DAILY', 'SPECIFIC_DAYS', 'WEEKLY_COUNT', 'MONTHLY_COUNT'] as const
export const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

// 서버 RoutineDefinition과 같은 범위 — 주 7회는 매일과 같고, 월 29회 이상은 2월에 채울 수 없다
export const WEEKLY_COUNT_MAX = 6
export const MONTHLY_COUNT_MAX = 28
// 서버 StartRoutineRequest와 같은 기간 규칙 — 다르면 통과한 폼이 400을 맞는다
export const BACKDATE_LIMIT_DAYS = 90
export const PERIOD_LIMIT_DAYS = 366

const definitionShape = {
  title: z
    .string()
    .trim()
    .min(1, '루틴 이름을 입력해 주세요.')
    .max(100, '루틴 이름은 100자 이하여야 해요.'),
  categoryCode: z.string().min(1, '카테고리를 골라 주세요.'),
  scheduleType: z.enum(SCHEDULE_TYPES),
  daysOfWeek: z.array(z.enum(WEEKDAYS)),
  // 주 N회는 칩이라 늘 숫자다
  weeklyCount: z.number().int().min(1).max(WEEKLY_COUNT_MAX),
  // 월 N회는 숫자 입력이다 — 지우면 빈 문자열이라 문자열로 받고 아래에서 범위를 본다
  monthlyCount: z.string(),
}

type DefinitionShapeValues = z.infer<z.ZodObject<typeof definitionShape>>

/** 주기 유형에 딸린 값 — 고른 유형의 값만 본다. 다른 유형의 값은 남아 있어도 보내지 않는다 */
const checkSchedule = (values: DefinitionShapeValues, ctx: z.RefinementCtx) => {
  if (values.scheduleType === 'SPECIFIC_DAYS' && values.daysOfWeek.length === 0) {
    ctx.addIssue({ code: 'custom', path: ['daysOfWeek'], message: '요일을 하나 이상 골라 주세요.' })
  }
  if (values.scheduleType === 'MONTHLY_COUNT') {
    const count = Number(values.monthlyCount)
    if (!/^\d+$/.test(values.monthlyCount) || count < 1 || count > MONTHLY_COUNT_MAX) {
      ctx.addIssue({
        code: 'custom',
        path: ['monthlyCount'],
        message: `1~${MONTHLY_COUNT_MAX}회 사이로 입력해 주세요.`,
      })
    }
  }
}

export const definitionSchema = z.object(definitionShape).superRefine(checkSchedule)

export type DefinitionFormValues = z.infer<typeof definitionSchema>

export const routineFormSchema = z
  .object({
    ...definitionShape,
    startedAt: z.string(),
    // 비우면 계속 이어진다
    endedAt: z.string(),
    saveAsTemplate: z.boolean(),
  })
  .superRefine((values, ctx) => {
    checkSchedule(values, ctx)

    if (!isCompleteDate(values.startedAt)) {
      ctx.addIssue({ code: 'custom', path: ['startedAt'], message: '시작일을 골라 주세요.' })
      return
    }
    // 오늘은 제출하는 순간에 다시 잰다 — 폼을 열어 둔 채 자정을 넘겨도 서버와 같은 기준이다
    if (values.startedAt < addDays(serverToday(), -BACKDATE_LIMIT_DAYS)) {
      ctx.addIssue({
        code: 'custom',
        path: ['startedAt'],
        message: `시작일은 ${BACKDATE_LIMIT_DAYS}일 전까지 고를 수 있어요.`,
      })
    }
    if (values.endedAt === '') return
    if (!isCompleteDate(values.endedAt)) {
      ctx.addIssue({ code: 'custom', path: ['endedAt'], message: '종료일을 끝까지 입력해 주세요.' })
    } else if (values.endedAt < values.startedAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['endedAt'],
        message: '종료일은 시작일보다 빠를 수 없어요.',
      })
    } else if (daysBetween(values.startedAt, values.endedAt) >= PERIOD_LIMIT_DAYS) {
      ctx.addIssue({
        code: 'custom',
        path: ['endedAt'],
        message: `종료일은 시작일 포함 ${PERIOD_LIMIT_DAYS}일 이내여야 해요.`,
      })
    }
  })

export type RoutineFormValues = z.infer<typeof routineFormSchema>

const DEFAULT_WEEKLY_COUNT = 3
const DEFAULT_MONTHLY_COUNT = 10

/** 빈 폼 또는 템플릿 프리필의 정의 기본값 */
export function definitionDefaults(template?: RoutineTemplate): DefinitionFormValues {
  const type: ScheduleType = template?.scheduleType ?? 'DAILY'
  return {
    title: template?.title ?? '',
    categoryCode: template?.categoryCode ?? '',
    scheduleType: type,
    daysOfWeek: template?.daysOfWeek ?? [],
    weeklyCount:
      type === 'WEEKLY_COUNT' && template?.targetCount
        ? template.targetCount
        : DEFAULT_WEEKLY_COUNT,
    monthlyCount: String(
      type === 'MONTHLY_COUNT' && template?.targetCount
        ? template.targetCount
        : DEFAULT_MONTHLY_COUNT
    ),
  }
}

const sortDays = (days: Weekday[]) => WEEKDAYS.filter((d) => days.includes(d))

/** 폼 값 → 정의 5필드. 고른 유형에 딸린 값만 싣는다 */
export function toDefinitionRequest(values: DefinitionFormValues): RoutineDefinitionRequest {
  const base = { title: values.title.trim(), categoryCode: values.categoryCode }
  switch (values.scheduleType) {
    case 'DAILY':
      return { ...base, scheduleType: 'DAILY', daysOfWeek: null, targetCount: null }
    case 'SPECIFIC_DAYS':
      return {
        ...base,
        scheduleType: 'SPECIFIC_DAYS',
        daysOfWeek: sortDays(values.daysOfWeek),
        targetCount: null,
      }
    case 'WEEKLY_COUNT':
      return {
        ...base,
        scheduleType: 'WEEKLY_COUNT',
        daysOfWeek: null,
        targetCount: values.weeklyCount,
      }
    case 'MONTHLY_COUNT':
      return {
        ...base,
        scheduleType: 'MONTHLY_COUNT',
        daysOfWeek: null,
        targetCount: Number(values.monthlyCount),
      }
  }
}

/**
 * 템플릿에서 프리필한 정의를 고쳤는가 (#19 G1).
 * 안 고쳤으면 템플릿 ID만, 고쳤으면 정의만 보낸다 — 서버가 둘을 함께 받지 않는다.
 * 폼의 dirty 표시 대신 실제 값을 비교한다 — 요일을 껐다 켜면 dirty가 남아도 같은 정의다
 */
export function isDefinitionEdited(values: DefinitionFormValues, template: RoutineTemplate) {
  const next = toDefinitionRequest(values)
  return (
    next.title !== template.title ||
    next.categoryCode !== template.categoryCode ||
    next.scheduleType !== template.scheduleType ||
    (next.daysOfWeek ?? []).join() !== sortDays(template.daysOfWeek ?? []).join() ||
    (next.targetCount ?? null) !== (template.targetCount ?? null)
  )
}
