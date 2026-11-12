import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { addMonths, buildMonthGrid, formatMonthLabel } from '@/utils/calendar'
import { CELL_LABEL, type CalendarCellState } from '@/utils/calendarCell'
import { formatMonthDay } from '@/utils/routine'
import shared from './routine.module.css'
import styles from './RoutineCalendar.module.css'

const WEEKDAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토']

const CELL_CLASS: Record<CalendarCellState, string> = {
  completed: styles.completed,
  fillable: styles.fillable,
  expired: styles.expired,
  notApplicable: styles.notApplicable,
  noRecord: styles.noRecord,
  upcoming: styles.upcoming,
  blank: styles.blank,
}

export interface RoutineCalendarProps {
  /** YYYY-MM */
  month: string
  onMonthChange: (month: string) => void
  /** 이보다 앞 달로 못 간다 — 보통 시작일의 달 */
  minMonth: string
  /** 이보다 뒤 달로 못 간다 */
  maxMonth: string
  /** 헤더 오른쪽 — 루틴 상세는 시작일을 둔다 */
  headerAside?: ReactNode
  /** YYYY-MM-DD */
  today: string
  status: 'loading' | 'error' | 'ready'
  onRetry?: () => void
  getCellState: (date: string) => CalendarCellState
  /** 범례에 둘 상태 — 루틴 유형마다 다르다 */
  legend: CalendarCellState[]
  /**
   * 칸을 눌렀을 때 — 넘기지 않으면 칸은 눌리지 않는다.
   * #63은 넘기지 않는다. 인증 모달 · 인증 상세는 #20이 배선한다
   */
  onDateClick?: (date: string, state: CalendarCellState) => void
  /**
   * 8번째 열 — 주 게이지 자리(#60 주별 집계 뒤에 켠다). 넘기지 않으면 열 자체가 없다.
   * 인자는 그 주의 7칸(그 달이 아닌 칸은 null)
   */
  renderWeekAside?: (week: (string | null)[]) => ReactNode
}

/** 상태별로 누를 수 있는가 — 해당 없음 · 기간 밖 · 창이 지난 날 · 미래는 누를 일이 없다 */
const CLICKABLE: Record<CalendarCellState, boolean> = {
  completed: true,
  fillable: true,
  noRecord: true,
  expired: false,
  notApplicable: false,
  upcoming: false,
  blank: false,
}

const RoutineCalendar = ({
  month,
  onMonthChange,
  minMonth,
  maxMonth,
  headerAside,
  today,
  status,
  onRetry,
  getCellState,
  legend,
  onDateClick,
  renderWeekAside,
}: RoutineCalendarProps) => {
  const weeks = buildMonthGrid(month)
  const withAside = renderWeekAside !== undefined

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navButton}
            aria-label="이전 달"
            disabled={month <= minMonth}
            onClick={() => onMonthChange(addMonths(month, -1))}
          >
            ‹
          </button>
          <span className={styles.monthLabel} aria-live="polite">
            {formatMonthLabel(month)}
          </span>
          <button
            type="button"
            className={styles.navButton}
            aria-label="다음 달"
            disabled={month >= maxMonth}
            onClick={() => onMonthChange(addMonths(month, 1))}
          >
            ›
          </button>
        </div>
        {headerAside && <span className={styles.headerAside}>{headerAside}</span>}
      </div>

      <div className={cn(shared.card, styles.body)}>
        {status === 'loading' && (
          <div className={styles.state} role="status">
            불러오는 중...
          </div>
        )}
        {status === 'error' && (
          <div className={styles.state} role="alert">
            <p>인증 기록을 불러오지 못했어요.</p>
            {onRetry && (
              <button
                type="button"
                className={cn(shared.btn, shared.btnOutline, shared.btnSm)}
                onClick={onRetry}
              >
                다시 시도
              </button>
            )}
          </div>
        )}
        {status === 'ready' && (
          <div
            className={cn(styles.grid, withAside && styles.gridWithAside)}
            role="grid"
            aria-label={`${formatMonthLabel(month)} 인증 달력`}
          >
            <div className={styles.row} role="row">
              {WEEKDAY_HEADERS.map((label) => (
                <div key={label} className={styles.weekday} role="columnheader">
                  {label}
                </div>
              ))}
              {withAside && <div className={styles.weekday} role="columnheader" aria-label="주" />}
            </div>
            {weeks.map((week) => (
              <div key={week.find((d) => d !== null)} className={styles.row} role="row">
                {week.map((date, i) => {
                  if (date === null) {
                    return <div key={`empty-${i}`} className={styles.outside} role="gridcell" />
                  }
                  const state = getCellState(date)
                  const day = Number(date.slice(8))
                  const label = `${formatMonthDay(date)}${date === today ? ' 오늘' : ''} · ${CELL_LABEL[state]}`
                  const className = cn(
                    styles.cell,
                    CELL_CLASS[state],
                    date === today && styles.today
                  )
                  const clickable = onDateClick !== undefined && CLICKABLE[state]
                  return (
                    <div key={date} role="gridcell" className={styles.cellWrap}>
                      {clickable ? (
                        <button
                          type="button"
                          className={cn(className, styles.clickable)}
                          aria-label={label}
                          onClick={() => onDateClick(date, state)}
                        >
                          {day}
                        </button>
                      ) : (
                        <span className={className} aria-label={label} title={CELL_LABEL[state]}>
                          {day}
                        </span>
                      )}
                    </div>
                  )
                })}
                {withAside && (
                  <div role="gridcell" className={styles.aside}>
                    {renderWeekAside(week)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ul className={styles.legend}>
        {legend.map((state) => (
          <li key={state} className={styles.legendItem}>
            <span className={cn(styles.swatch, CELL_CLASS[state])} aria-hidden="true" />
            {CELL_LABEL[state]}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RoutineCalendar
