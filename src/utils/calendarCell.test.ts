import { describe, expect, it } from 'vitest'
import type { Execution } from '@/types/execution'
import type { Routine } from '@/types/routine'
import { classifyCalendarDay } from './calendarCell'

// 2026-11-08은 일요일
const TODAY = '2026-11-08'

const routine = (overrides: Partial<Routine> = {}): Routine => ({
  routineId: 1,
  routineTemplateId: null,
  title: '아침 러닝',
  challengeId: null,
  startedAt: '2026-11-01',
  endedAt: null,
  isActive: true,
  categoryCode: 'EXERCISE',
  scheduleType: 'DAILY',
  daysOfWeek: null,
  targetCount: null,
  ...overrides,
})

const execution = (overrides: Partial<Execution>): Execution => ({
  executionId: null,
  routineId: 1,
  title: '아침 러닝',
  scheduledDate: '2026-11-03',
  status: 'MISSED',
  completedAt: null,
  photoUrl: null,
  memo: null,
  feedCardId: null,
  backfillable: true,
  ...overrides,
})

describe('달력 칸 상태', () => {
  it('COMPLETED는 다 한 날이다', () => {
    const e = execution({ status: 'COMPLETED', executionId: 9 })
    expect(classifyCalendarDay('2026-11-03', routine(), e, TODAY)).toBe('completed')
  })

  it('미완료는 서버의 backfillable로만 가른다 — 날짜로 다시 재지 않는다', () => {
    // 개인 루틴의 한 달 전 날짜라도 서버가 false면 창이 지난 날이다
    expect(
      classifyCalendarDay('2026-11-03', routine(), execution({ backfillable: true }), TODAY)
    ).toBe('fillable')
    expect(
      classifyCalendarDay('2026-11-07', routine(), execution({ backfillable: false }), TODAY)
    ).toBe('expired')
  })

  it('미래의 PENDING은 창이 지난 날이 아니라 예정이다', () => {
    const e = execution({ status: 'PENDING', backfillable: false })
    expect(classifyCalendarDay('2026-11-10', routine(), e, TODAY)).toBe('upcoming')
  })

  it('SPECIFIC_DAYS의 지정하지 않은 요일은 해당 없음이다 (응답에 없는 날)', () => {
    const r = routine({ scheduleType: 'SPECIFIC_DAYS', daysOfWeek: ['MON', 'WED', 'FRI'] })
    expect(classifyCalendarDay('2026-11-03', r, undefined, TODAY)).toBe('notApplicable') // 화
    expect(classifyCalendarDay('2026-11-02', r, execution({}), TODAY)).toBe('fillable') // 월
  })

  it('빈도형의 응답에 없는 날은 기록 없음이다 — 해당 없음이 아니다', () => {
    const r = routine({ scheduleType: 'WEEKLY_COUNT', targetCount: 3 })
    expect(classifyCalendarDay('2026-11-03', r, undefined, TODAY)).toBe('noRecord')
    // 오늘의 PENDING도 같다 — 미달 주 강조는 #60 뒤에 켠다
    expect(
      classifyCalendarDay(TODAY, r, execution({ status: 'PENDING', scheduledDate: TODAY }), TODAY)
    ).toBe('noRecord')
    expect(classifyCalendarDay('2026-11-12', r, undefined, TODAY)).toBe('upcoming')
  })

  it('기간 밖은 비워 둔다', () => {
    const r = routine({ startedAt: '2026-11-02', endedAt: '2026-11-05' })
    expect(classifyCalendarDay('2026-11-01', r, undefined, TODAY)).toBe('blank')
    expect(classifyCalendarDay('2026-11-06', r, undefined, TODAY)).toBe('blank')
  })

  it('중단한 루틴은 서버가 미완료를 파생하지 않는다 — 비워 두고, 완료는 남긴다', () => {
    const r = routine({ isActive: false })
    expect(classifyCalendarDay('2026-11-03', r, undefined, TODAY)).toBe('blank')
    expect(classifyCalendarDay('2026-11-10', r, undefined, TODAY)).toBe('blank') // 미래도 예정이 아니다
    const weekly = routine({ isActive: false, scheduleType: 'WEEKLY_COUNT', targetCount: 3 })
    expect(classifyCalendarDay('2026-11-03', weekly, undefined, TODAY)).toBe('blank')
    const specific = routine({
      isActive: false,
      scheduleType: 'SPECIFIC_DAYS',
      daysOfWeek: ['MON'],
    })
    expect(classifyCalendarDay('2026-11-03', specific, undefined, TODAY)).toBe('blank') // 화요일
    expect(classifyCalendarDay('2026-11-04', r, execution({ status: 'COMPLETED' }), TODAY)).toBe(
      'completed'
    )
  })
})
