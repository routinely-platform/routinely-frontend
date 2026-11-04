import type { Routine, RoutineStatus, ScheduleDefinition, Weekday } from '@/types/routine'

// 서버(routine-service)가 날짜를 자르는 기준 — 로컬 시간대로 자르면 자정 무렵 경계일이 어긋난다
const SERVER_TIME_ZONE = 'Asia/Seoul'

/** 서버 시간대 기준 오늘 — YYYY-MM-DD */
export function serverToday(now: Date = new Date()): string {
  // en-CA는 YYYY-MM-DD로 포맷한다
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SERVER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/**
 * 상태는 저장하지 않고 날짜로 파생한다 (#19).
 * 비활성이면 중단됨, 활성인데 종료일이 오늘보다 앞이면 완료됨, 나머지는 진행 중.
 * YYYY-MM-DD 문자열은 사전순 비교가 곧 날짜 비교다.
 */
export function deriveRoutineStatus(routine: Routine, today: string): RoutineStatus {
  if (!routine.isActive) return 'stopped'
  if (routine.endedAt !== null && routine.endedAt < today) return 'completed'
  return 'ongoing'
}

/** 최근 시작순 고정 — 정렬 UI를 두지 않는다. 시작일이 같으면 나중에 만든 것이 위 */
export function sortByStartedAtDesc(routines: Routine[]): Routine[] {
  return [...routines].sort(
    (a, b) => b.startedAt.localeCompare(a.startedAt) || b.routineId - a.routineId
  )
}

const WEEKDAY_LABELS: Record<Weekday, string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
}
const WEEKDAY_ORDER: Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export function scheduleLabel({
  scheduleType,
  daysOfWeek,
  targetCount,
}: ScheduleDefinition): string {
  switch (scheduleType) {
    case 'DAILY':
      return '매일'
    case 'SPECIFIC_DAYS':
      return WEEKDAY_ORDER.filter((d) => daysOfWeek?.includes(d))
        .map((d) => WEEKDAY_LABELS[d])
        .join('·')
    case 'WEEKLY_COUNT':
      return `주 ${targetCount}회`
    case 'MONTHLY_COUNT':
      return `월 ${targetCount}회`
  }
}

/** YYYY-MM-DD → "5월 1일" */
export function formatMonthDay(date: string): string {
  const [, month, day] = date.split('-').map(Number)
  return `${month}월 ${day}일`
}
