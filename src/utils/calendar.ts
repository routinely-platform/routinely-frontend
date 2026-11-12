// 달력 날짜 계산 — YYYY-MM-DD · YYYY-MM 문자열끼리만 다룬다. 시간대가 끼지 않게 UTC 자정으로만 센다

/** YYYY-MM */
export const isMonth = (value: string | null): value is string =>
  value !== null && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)

/** YYYY-MM-DD → YYYY-MM */
export const monthOf = (date: string) => date.slice(0, 7)

const pad = (n: number) => String(n).padStart(2, '0')

/** YYYY-MM에 n달을 더한다 */
export function addMonths(month: string, months: number): string {
  const [year, m] = month.split('-').map(Number)
  const index = year * 12 + (m - 1) + months
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`
}

const daysInMonth = (month: string) => {
  const [year, m] = month.split('-').map(Number)
  // 다음 달 0일 = 이번 달 마지막 날
  return new Date(Date.UTC(year, m, 0)).getUTCDate()
}

/** 그 달의 첫날 ~ 마지막 날 (양 끝 포함) */
export function monthRange(month: string): { startDate: string; endDate: string } {
  return { startDate: `${month}-01`, endDate: `${month}-${pad(daysInMonth(month))}` }
}

/** YYYY-MM → "2026년 8월" */
export function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number)
  return `${year}년 ${m}월`
}

/** 0 = 일요일 … 6 = 토요일 */
export function dayOfWeek(date: string): number {
  const [year, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(year, m - 1, d)).getUTCDay()
}

/**
 * 월 격자 — **일요일 시작** 7열. 서버의 주 경계(일~토, policies.md §2)와 같아야
 * 나중에 붙을 주 게이지(#60)가 행과 맞는다. 그 달이 아닌 칸은 null
 */
export function buildMonthGrid(month: string): (string | null)[][] {
  const { startDate } = monthRange(month)
  const leading = dayOfWeek(startDate)
  const cells: (string | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth(month) }, (_, i) => `${month}-${pad(i + 1)}`),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

/** YYYY-MM-DD → "2026년 8월 1일" — 해를 넘는 루틴이 있어 기간에는 해를 붙인다 */
export function formatFullDate(date: string): string {
  const [year, m, d] = date.split('-').map(Number)
  return `${year}년 ${m}월 ${d}일`
}

/**
 * 올해(`today`의 해)면 "8월 1일", 아니면 "2025년 8월 1일".
 * 해를 넘는 기간 · 작년 기록이 올해로 읽히지 않게 한다 (#63 확인 결과 2-A)
 */
export function formatShortDate(date: string, today: string): string {
  if (date.slice(0, 4) !== today.slice(0, 4)) return formatFullDate(date)
  const [, m, d] = date.split('-').map(Number)
  return `${m}월 ${d}일`
}
