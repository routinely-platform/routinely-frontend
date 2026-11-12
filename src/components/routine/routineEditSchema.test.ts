import { describe, expect, it } from 'vitest'
import type { Routine } from '@/types/routine'
import { routineEditDefaults, toEditLock, toUpdateRoutineRequest } from './routineEditSchema'

const ROUTINE: Routine = {
  routineId: 1,
  routineTemplateId: null,
  title: '아침 러닝',
  challengeId: null,
  startedAt: '2026-11-01',
  endedAt: '2026-12-31',
  isActive: true,
  categoryCode: 'EXERCISE',
  scheduleType: 'SPECIFIC_DAYS',
  daysOfWeek: ['MON', 'WED'],
  targetCount: null,
}

const NO_HISTORY = { hasHistory: false, historyUnverified: false, lastCompletedDate: null }
const HISTORY = { hasHistory: true, historyUnverified: false, lastCompletedDate: '2026-11-04' }

describe('루틴 수정 요청 — 바뀐 필드만 보낸다', () => {
  it('아무것도 안 바꾸면 빈 요청이다', () => {
    expect(toUpdateRoutineRequest(routineEditDefaults(ROUTINE), ROUTINE, NO_HISTORY)).toEqual({})
  })

  it('주기를 바꾸면 세 필드를 함께 보낸다', () => {
    const values = { ...routineEditDefaults(ROUTINE), scheduleType: 'WEEKLY_COUNT' as const }
    expect(toUpdateRoutineRequest(values, ROUTINE, NO_HISTORY)).toEqual({
      scheduleType: 'WEEKLY_COUNT',
      daysOfWeek: null,
      targetCount: 3,
    })
  })

  it('기록이 있으면 주기 · 시작일은 싣지 않는다 — 보내기만 해도 서버가 400을 낸다', () => {
    const values = {
      ...routineEditDefaults(ROUTINE),
      title: '저녁 러닝',
      scheduleType: 'DAILY' as const,
      startedAt: '2026-11-02',
    }
    expect(toUpdateRoutineRequest(values, ROUTINE, HISTORY)).toEqual({ title: '저녁 러닝' })
  })

  it('종료일을 비우면 clearEndedAt — endedAt과 함께 보내지 않는다', () => {
    const values = { ...routineEditDefaults(ROUTINE), endedAt: '' }
    expect(toUpdateRoutineRequest(values, ROUTINE, HISTORY)).toEqual({ clearEndedAt: true })
  })

  it('요일 순서만 다르면 바뀐 게 아니다', () => {
    const values = { ...routineEditDefaults(ROUTINE), daysOfWeek: ['WED' as const, 'MON' as const] }
    expect(toUpdateRoutineRequest(values, ROUTINE, NO_HISTORY)).toEqual({})
  })
})

describe('수정 잠금 판정', () => {
  it('기록이 있으면 잠그고 마지막 인증일을 남긴다', () => {
    expect(
      toEditLock([{ scheduledDate: '2026-11-02' }, { scheduledDate: '2026-11-07' }], false)
    ).toEqual({
      hasHistory: true,
      historyUnverified: false,
      lastCompletedDate: '2026-11-07',
    })
  })

  it('조회가 시작일까지 닿았고 비어 있으면 연다', () => {
    expect(toEditLock([], false)).toEqual(NO_HISTORY)
  })

  it('조회가 잘렸는데 비어 있으면 "0건"이 아니라 "모름" — 잠근다 (#63 리뷰 3)', () => {
    expect(toEditLock([], true)).toEqual({
      hasHistory: true,
      historyUnverified: true,
      lastCompletedDate: null,
    })
  })

  it('조회가 잘렸어도 구간 안에 기록이 있으면 평소 문구로 잠근다', () => {
    expect(toEditLock([{ scheduledDate: '2026-10-01' }], true).historyUnverified).toBe(false)
  })
})
