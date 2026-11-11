import type { Execution } from '@/types/execution'
import type { Routine, Weekday } from '@/types/routine'
import { dayOfWeek } from './calendar'

/**
 * 달력 칸 하나의 상태 — 루틴 상세(#63)와 통계 달력(#22)이 같은 규칙을 쓴다 (screens.md §6).
 *
 * | 상태 | 근거 |
 * |---|---|
 * | completed     | 응답에 COMPLETED |
 * | fillable      | 응답에 PENDING/MISSED + `backfillable: true` |
 * | expired       | 응답에 PENDING/MISSED + `backfillable: false` (챌린지 백필 창 밖 · 챌린지 종료) |
 * | notApplicable | 응답에 없음 + SPECIFIC_DAYS의 지정하지 않은 요일 |
 * | noRecord      | 빈도형(주 N회 · 월 N회)의 완료하지 않은 지난 날 · 오늘 — 결석이 아니다 |
 * | upcoming      | 기간 안의 미래 |
 * | blank         | 기간 밖, 또는 중단한 루틴의 완료가 아닌 모든 날(서버가 파생하지 않는다) |
 */
export type CalendarCellState =
  | 'completed'
  | 'fillable'
  | 'expired'
  | 'notApplicable'
  | 'noRecord'
  | 'upcoming'
  | 'blank'

// dayOfWeek()의 0 = 일요일
const WEEKDAY_BY_INDEX: Weekday[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const isFrequency = (routine: Routine) =>
  routine.scheduleType === 'WEEKLY_COUNT' || routine.scheduleType === 'MONTHLY_COUNT'

/**
 * "해당 없음"과 "기록 없음"은 둘 다 응답에 없는 날이다 — **루틴의 주기로만** 갈린다.
 * 인증 가능 여부는 서버의 `backfillable`만 본다. 챌린지 3일 창을 날짜로 다시 재지 않는다(#58)
 */
export function classifyCalendarDay(
  date: string,
  routine: Routine,
  execution: Execution | undefined,
  today: string
): CalendarCellState {
  // 완료는 중단 · 기간과 상관없이 이력으로 남는다
  if (execution?.status === 'COMPLETED') return 'completed'
  // 중단한 루틴은 서버가 미완료를 파생하지 않고 완료만 준다 — 요일 · 미래 · 빈도형 판정보다 먼저 거른다.
  // 중단 시각을 저장하지 않아 "중단 전의 빈 날"과 "중단 후"를 가를 수 없다
  if (!routine.isActive) return 'blank'

  if (date < routine.startedAt || (routine.endedAt !== null && date > routine.endedAt)) {
    return 'blank'
  }
  if (
    routine.scheduleType === 'SPECIFIC_DAYS' &&
    !routine.daysOfWeek?.includes(WEEKDAY_BY_INDEX[dayOfWeek(date)])
  ) {
    return 'notApplicable'
  }
  // 미래의 PENDING은 "예정"이다 — backfillable이 false라도 창이 지난 게 아니다
  if (date > today) return 'upcoming'

  // 빈도형은 날짜 칸을 미완료로 칠할 근거가 없다. 미달 주 강조는 #60(주별 집계) 뒤에 켠다
  if (isFrequency(routine)) return 'noRecord'

  // 활성 지정형인데 응답에 없는 날 — 파생 규칙상 생기지 않지만, 빈 칸으로 둔다
  if (!execution) return 'blank'
  return execution.backfillable ? 'fillable' : 'expired'
}

/** 칸의 접근성 이름 · 범례 문구 — 두 곳이 같은 말을 쓴다 */
export const CELL_LABEL: Record<CalendarCellState, string> = {
  completed: '다 한 날',
  fillable: '채울 수 있는 날',
  expired: '인증 가능 기간이 지났어요',
  notApplicable: '해당 없음',
  noRecord: '기록 없음 — 결석이 아니에요',
  upcoming: '예정',
  blank: '기간 밖',
}
