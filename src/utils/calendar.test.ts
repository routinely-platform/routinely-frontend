import { describe, expect, it } from 'vitest'
import {
  addMonths,
  buildMonthGrid,
  formatMonthLabel,
  formatShortDate,
  isMonth,
  monthRange,
} from './calendar'

describe('달력 날짜 계산', () => {
  it('격자는 일요일 시작이다 — 서버 주 경계(일~토)와 같다', () => {
    // 2026-08-01은 토요일 — 첫 줄은 빈 칸 6개 뒤 1일
    const weeks = buildMonthGrid('2026-08')
    expect(weeks[0]).toEqual([null, null, null, null, null, null, '2026-08-01'])
    expect(weeks[1][0]).toBe('2026-08-02') // 일요일
    expect(weeks.every((w) => w.length === 7)).toBe(true)
    expect(weeks.at(-1)).toContain('2026-08-31')
  })

  it('1일이 일요일이면 앞 칸이 비지 않는다', () => {
    expect(buildMonthGrid('2026-11')[0][0]).toBe('2026-11-01')
  })

  it('월 범위는 양 끝 포함 — 윤년 2월도 맞다', () => {
    expect(monthRange('2026-02')).toEqual({ startDate: '2026-02-01', endDate: '2026-02-28' })
    expect(monthRange('2028-02')).toEqual({ startDate: '2028-02-01', endDate: '2028-02-29' })
  })

  it('달 이동은 해를 넘는다', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(formatMonthLabel('2026-08')).toBe('2026년 8월')
  })

  it('URL의 달은 형식이 맞을 때만 받는다', () => {
    expect(isMonth('2026-08')).toBe(true)
    expect(isMonth('2026-13')).toBe(false)
    expect(isMonth('2026-8')).toBe(false)
    expect(isMonth(null)).toBe(false)
  })

  it('올해가 아니면 연도를 붙인다 — 작년 시작 · 해를 넘는 기간이 올해로 읽히지 않게', () => {
    expect(formatShortDate('2026-10-04', '2026-11-09')).toBe('10월 4일')
    expect(formatShortDate('2025-10-04', '2026-11-09')).toBe('2025년 10월 4일')
    expect(formatShortDate('2027-01-31', '2026-12-20')).toBe('2027년 1월 31일')
  })
})
