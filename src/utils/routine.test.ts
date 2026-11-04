import { describe, expect, it } from 'vitest'
import type { Routine } from '@/types/routine'
import { deriveRoutineStatus, scheduleLabel, serverToday, sortByStartedAtDesc } from './routine'

const routine = (overrides: Partial<Routine> = {}): Routine => ({
  routineId: 1,
  routineTemplateId: null,
  title: '아침 러닝',
  challengeId: null,
  startedAt: '2026-10-01',
  endedAt: null,
  isActive: true,
  categoryCode: 'EXERCISE',
  scheduleType: 'DAILY',
  daysOfWeek: null,
  targetCount: null,
  ...overrides,
})

describe('serverToday', () => {
  it('서버 시간대(Asia/Seoul)로 자른다 — UTC 15시는 서울의 다음 날이다', () => {
    expect(serverToday(new Date('2026-10-28T15:00:00Z'))).toBe('2026-10-29')
    expect(serverToday(new Date('2026-10-28T14:59:59Z'))).toBe('2026-10-28')
  })
})

describe('deriveRoutineStatus', () => {
  const today = '2026-10-29'

  it('비활성이면 종료일과 상관없이 중단됨', () => {
    expect(deriveRoutineStatus(routine({ isActive: false, endedAt: '2026-10-01' }), today)).toBe(
      'stopped'
    )
  })

  it('활성 + 종료일이 오늘보다 앞이면 완료됨', () => {
    expect(deriveRoutineStatus(routine({ endedAt: '2026-10-28' }), today)).toBe('completed')
  })

  it('종료일이 오늘이거나 없으면 진행 중', () => {
    expect(deriveRoutineStatus(routine({ endedAt: today }), today)).toBe('ongoing')
    expect(deriveRoutineStatus(routine({ endedAt: null }), today)).toBe('ongoing')
  })
})

describe('sortByStartedAtDesc', () => {
  it('시작일 내림차순, 같으면 나중에 만든 것이 위', () => {
    const sorted = sortByStartedAtDesc([
      routine({ routineId: 1, startedAt: '2026-09-01' }),
      routine({ routineId: 2, startedAt: '2026-10-01' }),
      routine({ routineId: 3, startedAt: '2026-10-01' }),
    ])
    expect(sorted.map((r) => r.routineId)).toEqual([3, 2, 1])
  })
})

describe('scheduleLabel', () => {
  it('네 가지 주기를 화면 문구로 바꾼다', () => {
    expect(scheduleLabel({ scheduleType: 'DAILY', daysOfWeek: null, targetCount: null })).toBe(
      '매일'
    )
    expect(
      scheduleLabel({
        scheduleType: 'SPECIFIC_DAYS',
        daysOfWeek: ['FRI', 'MON', 'WED'],
        targetCount: null,
      })
    ).toBe('월·수·금')
    expect(scheduleLabel({ scheduleType: 'WEEKLY_COUNT', daysOfWeek: null, targetCount: 3 })).toBe(
      '주 3회'
    )
    expect(
      scheduleLabel({ scheduleType: 'MONTHLY_COUNT', daysOfWeek: null, targetCount: 10 })
    ).toBe('월 10회')
  })
})
