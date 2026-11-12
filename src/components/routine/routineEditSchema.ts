import { z } from 'zod'
import type { UpdateRoutineRequest } from '@/api/routine'
import type { Routine } from '@/types/routine'
import { addDays, daysBetween, formatMonthDay, isCompleteDate, serverToday } from '@/utils/routine'
import {
  BACKDATE_LIMIT_DAYS,
  PERIOD_LIMIT_DAYS,
  checkSchedule,
  definitionDefaults,
  definitionShape,
  sortDays,
  toDefinitionRequest,
} from './routineFormSchema'

/** 이슈 #63 문구 그대로 — 왜 잠겼는지 모르면 "버그인가?"가 된다 */
export const SCHEDULE_LOCK_REASON =
  '인증 기록이 있어 반복 주기를 바꿀 수 없어요. 지난 기록의 달성률이 달라지기 때문이에요. 주기를 바꾸려면 새 루틴을 시작해 주세요.'
export const START_LOCK_REASON = '인증 기록이 있어 시작일을 바꿀 수 없어요.'
// 1년보다 오래된 루틴은 조회가 시작일까지 닿지 않는다 — "기록 없음"이라고 단정하지 않고 잠근다
export const UNVERIFIED_SCHEDULE_LOCK_REASON =
  '1년보다 오래된 기록은 확인하지 못해 반복 주기를 바꿀 수 없어요. 주기를 바꾸려면 새 루틴을 시작해 주세요.'
export const UNVERIFIED_START_LOCK_REASON =
  '1년보다 오래된 기록은 확인하지 못해 시작일을 바꿀 수 없어요.'

/**
 * 개인 루틴의 수정 잠금 (screens.md §6 · ADR-0040).
 * 챌린지 루틴은 정의 · 기간이 전부 잠겨 수정 폼 자체를 열지 않는다
 */
export interface RoutineEditLock {
  /**
   * 주기 · 시작일을 잠그나 — 완료 기록이 있거나, 있는지 확인하지 못했으면 잠근다.
   * 지난 기록의 달성률이 소급해서 다시 채점되기 때문이다
   */
  hasHistory: boolean
  /** 조회가 시작일까지 닿지 못했고 그 안에 기록이 없다 — 잠금 이유 문구만 다르다 */
  historyUnverified: boolean
  /** 확인한 마지막 인증일 — 종료일은 이보다 앞당길 수 없다. 못 찾았으면 null(서버가 최종 판정) */
  lastCompletedDate: string | null
}

/** 완료 기록 조회 결과 → 잠금. `truncated`는 조회가 시작일까지 닿지 못했는가 */
export function toEditLock(
  completed: { scheduledDate: string }[],
  truncated: boolean
): RoutineEditLock {
  const historyUnverified = truncated && completed.length === 0
  return {
    hasHistory: completed.length > 0 || historyUnverified,
    historyUnverified,
    lastCompletedDate: completed.reduce<string | null>(
      (max, e) => (max === null || e.scheduledDate > max ? e.scheduledDate : max),
      null
    ),
  }
}

export const scheduleLockReason = (lock: RoutineEditLock) =>
  lock.historyUnverified ? UNVERIFIED_SCHEDULE_LOCK_REASON : SCHEDULE_LOCK_REASON
export const startLockReason = (lock: RoutineEditLock) =>
  lock.historyUnverified ? UNVERIFIED_START_LOCK_REASON : START_LOCK_REASON

export const routineEditSchema = (routine: Routine, lock: RoutineEditLock) =>
  z
    .object({
      ...definitionShape,
      startedAt: z.string(),
      // 비우면 종료일 없이 계속 이어진다
      endedAt: z.string(),
    })
    .superRefine((values, ctx) => {
      checkSchedule(values, ctx)

      if (!isCompleteDate(values.startedAt)) {
        ctx.addIssue({ code: 'custom', path: ['startedAt'], message: '시작일을 선택해 주세요.' })
        return
      }
      // 서버는 보낸 시작일만 검사한다 — 그대로 둔 시작일이 90일보다 오래됐어도 막지 않는다
      if (
        values.startedAt !== routine.startedAt &&
        values.startedAt < addDays(serverToday(), -BACKDATE_LIMIT_DAYS)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['startedAt'],
          message: `시작일은 오늘부터 최대 ${BACKDATE_LIMIT_DAYS}일 전까지 정할 수 있어요.`,
        })
      }

      if (values.endedAt === '') return
      if (!isCompleteDate(values.endedAt)) {
        ctx.addIssue({
          code: 'custom',
          path: ['endedAt'],
          message: '종료일을 정확히 입력해 주세요.',
        })
      } else if (values.endedAt < values.startedAt) {
        ctx.addIssue({
          code: 'custom',
          path: ['endedAt'],
          message: '종료일은 시작일과 같거나 그 이후여야 해요.',
        })
      } else if (daysBetween(values.startedAt, values.endedAt) >= PERIOD_LIMIT_DAYS) {
        ctx.addIssue({
          code: 'custom',
          path: ['endedAt'],
          message: `기간은 시작일부터 최대 ${PERIOD_LIMIT_DAYS}일까지 정할 수 있어요.`,
        })
      } else if (lock.lastCompletedDate !== null && values.endedAt < lock.lastCompletedDate) {
        ctx.addIssue({
          code: 'custom',
          path: ['endedAt'],
          message: `마지막 인증일(${formatMonthDay(lock.lastCompletedDate)})보다 앞당길 수 없어요.`,
        })
      }
    })

export type RoutineEditFormValues = z.infer<ReturnType<typeof routineEditSchema>>

export function routineEditDefaults(routine: Routine): RoutineEditFormValues {
  return {
    ...definitionDefaults(routine),
    startedAt: routine.startedAt,
    endedAt: routine.endedAt ?? '',
  }
}

/**
 * 바뀐 필드만 보낸다 — PATCH는 보낸 것만 고친다.
 * 잠긴 주기 · 시작일은 값이 같아도 싣지 않는다: 서버가 "보냈는가"로 잠금을 검사해 400을 낸다
 */
export function toUpdateRoutineRequest(
  values: RoutineEditFormValues,
  routine: Routine,
  lock: RoutineEditLock
): UpdateRoutineRequest {
  const body: UpdateRoutineRequest = {}
  const definition = toDefinitionRequest(values)

  if (definition.title !== routine.title) body.title = definition.title
  if (definition.categoryCode !== routine.categoryCode) body.categoryCode = definition.categoryCode

  const scheduleChanged =
    definition.scheduleType !== routine.scheduleType ||
    (definition.daysOfWeek ?? []).join() !== sortDays(routine.daysOfWeek ?? []).join() ||
    (definition.targetCount ?? null) !== (routine.targetCount ?? null)
  if (!lock.hasHistory && scheduleChanged) {
    // 주기는 세 필드를 함께 보내야 한다 (`isScheduleValid`)
    body.scheduleType = definition.scheduleType
    body.daysOfWeek = definition.daysOfWeek
    body.targetCount = definition.targetCount
  }

  if (!lock.hasHistory && values.startedAt !== routine.startedAt) body.startedAt = values.startedAt

  if (values.endedAt === '') {
    // 빈 값은 "안 바꿈"이 아니라 "종료일 없음"이다 — 해제는 clearEndedAt으로만 된다
    if (routine.endedAt !== null) body.clearEndedAt = true
  } else if (values.endedAt !== routine.endedAt) {
    body.endedAt = values.endedAt
  }

  return body
}
