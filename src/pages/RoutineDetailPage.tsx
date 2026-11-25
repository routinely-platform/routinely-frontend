import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ExecutionDetailDialog from '@/components/execution/ExecutionDetailDialog'
import ExecutionDialog from '@/components/execution/ExecutionDialog'
import EditRoutineDialog from '@/components/routine/EditRoutineDialog'
import RoutineCalendar from '@/components/routine/RoutineCalendar'
import StopRoutineDialog from '@/components/routine/StopRoutineDialog'
import shared from '@/components/routine/routine.module.css'
import {
  scheduleLockReason,
  startLockReason,
  toEditLock,
  type RoutineEditLock,
} from '@/components/routine/routineEditSchema'
import { useCategoryLookup } from '@/hooks/useCategories'
import {
  isLookbackTruncated,
  useCompletedExecutions,
  useMonthExecutions,
} from '@/hooks/useExecutions'
import { useRoutineDetail } from '@/hooks/useRoutines'
import type { Execution } from '@/types/execution'
import type { Routine, RoutineStatus } from '@/types/routine'
import { cn } from '@/utils/cn'
import { formatFullDate, formatShortDate, isMonth, monthOf } from '@/utils/calendar'
import { canCompleteDate, classifyCalendarDay, type CalendarCellState } from '@/utils/calendarCell'
import {
  addDays,
  deriveRoutineStatus,
  formatMonthDay,
  scheduleLabel,
  serverToday,
} from '@/utils/routine'
import NotFoundPage from './NotFoundPage'
import styles from './RoutineDetailPage.module.css'

const STATUS_META: Record<RoutineStatus, { label: string; className: string }> = {
  ongoing: { label: '진행 중', className: shared.badgeOngoing },
  completed: { label: '🎉 완료', className: shared.badgeCompleted },
  stopped: { label: '중단', className: shared.badgeStopped },
}

const RECENT_COUNT = 3

/** 열려 있는 인증 대화상자 — 인증 모달(날짜) 또는 인증 상세(완료한 기록) */
type ExecutionTarget = { kind: 'complete'; date: string } | { kind: 'detail'; execution: Execution }

/**
 * 저장은 됐는데 다시 받지 못한 날짜 → 잠근 시각 (D13).
 * 그 날짜를 그리는 쿼리가 이 시각보다 새로 받아질 때까지 버튼을 막는다 — 낡은 버튼으로 같은 요청을 다시 보내지 않게.
 * 쿼리마다(이번 달 · 보는 달 · 최근 인증) 자기 `dataUpdatedAt`으로 따로 판정하므로 따로 지우지 않아도 된다
 */
type StaleLocks = ReadonlyMap<string, number>

const isLocked = (locks: StaleLocks, date: string, dataUpdatedAt: number) => {
  const lockedAt = locks.get(date)
  return lockedAt !== undefined && dataUpdatedAt <= lockedAt
}

/** 데이터는 있는데 다시 받기가 실패했다 — 화면은 남기고 낡았다는 것만 알린다 (D13) */
const StaleNotice = ({ onRetry }: { onRetry: () => void }) => (
  <p className={styles.staleNotice} role="alert">
    최신 기록을 불러오지 못했어요. 방금 바꾼 날짜는 다시 불러온 뒤에 누를 수 있어요.{' '}
    <button type="button" className={styles.inlineButton} onClick={onRetry}>
      다시 시도
    </button>
  </p>
)

/** 범례 — 루틴 유형에 없는 상태는 싣지 않는다 */
function legendFor(routine: Routine): CalendarCellState[] {
  // 중단한 루틴은 완료 말고는 전부 기간 밖이다 — 없는 "채울 수 있는 날"을 설명하지 않는다
  if (!routine.isActive) return ['completed', 'blank']
  if (routine.scheduleType === 'WEEKLY_COUNT' || routine.scheduleType === 'MONTHLY_COUNT') {
    return ['completed', 'noRecord']
  }
  return [
    'fillable',
    'completed',
    ...(routine.scheduleType === 'SPECIFIC_DAYS' ? (['notApplicable'] as const) : []),
    // 백필 창은 챌린지 루틴에만 있다 — 개인 루틴은 기간 제한이 없다
    ...(routine.challengeId !== null ? (['expired'] as const) : []),
  ]
}

/** 처음 열 달 — 끝난 루틴은 마지막 달, 나머지는 이번 달. 시작 전이면 시작 달 */
function defaultMonth(routine: Routine, today: string): string {
  const base = routine.endedAt !== null && routine.endedAt < today ? routine.endedAt : today
  const month = monthOf(base)
  return month < monthOf(routine.startedAt) ? monthOf(routine.startedAt) : month
}

const LoadingState = () => (
  <div className={styles.state} role="status">
    <div className={styles.spinner} />
    <span className={styles.stateText}>불러오는 중...</span>
  </div>
)

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className={cn(shared.card, styles.state)} role="alert">
    <p className={styles.stateText}>{message}</p>
    <button
      type="button"
      className={cn(shared.btn, shared.btnOutline, shared.btnSm)}
      onClick={onRetry}
    >
      다시 시도
    </button>
  </div>
)

// ─── 달력 ──────────────────────────────────────────────────────────────

interface CalendarSectionProps {
  routine: Routine
  today: string
  locks: StaleLocks
  onOpen: (target: ExecutionTarget) => void
}

const CalendarSection = ({ routine, today, locks, onOpen }: CalendarSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const minMonth = monthOf(routine.startedAt)
  const maxMonth = monthOf(today) > minMonth ? monthOf(today) : minMonth
  const requested = searchParams.get('month')
  // URL의 달이 범위 밖이면 범위 안으로 당긴다 — 손으로 고친 주소로 빈 달력을 보여 주지 않는다
  const month = !isMonth(requested)
    ? defaultMonth(routine, today)
    : requested < minMonth
      ? minMonth
      : requested > maxMonth
        ? maxMonth
        : requested

  const query = useMonthExecutions(routine.routineId, month)
  const byDate = new Map<string, Execution>(query.data?.map((e) => [e.scheduledDate, e]))

  return (
    <section className={styles.section} aria-labelledby="calendar-heading">
      {/* tabIndex -1 — 대화상자를 연 칸이 사라졌을 때 포커스가 돌아올 자리 (D12) */}
      <h2 id="calendar-heading" className={styles.sectionTitle} tabIndex={-1}>
        인증 달력
      </h2>
      {query.isError && query.data && <StaleNotice onRetry={() => void query.refetch()} />}
      <RoutineCalendar
        month={month}
        // 새로고침해도 보던 달이 남는다. 달마다 기록을 쌓으면 뒤로 가기가 달을 하나씩 되감는다 — 바꿔 쓴다
        onMonthChange={(next) =>
          setSearchParams(
            (prev) => {
              const params = new URLSearchParams(prev)
              params.set('month', next)
              return params
            },
            { replace: true }
          )
        }
        minMonth={minMonth}
        maxMonth={maxMonth}
        headerAside={`${formatFullDate(routine.startedAt)} 시작`}
        today={today}
        status={query.data ? 'ready' : query.isError ? 'error' : 'loading'}
        onRetry={() => void query.refetch()}
        getCellState={(date) => classifyCalendarDay(date, routine, byDate.get(date), today)}
        legend={legendFor(routine)}
        // 달력을 대칭으로 쓴다 — 완료한 날은 인증 상세(→ 취소), 아닌 날은 인증 모달(백필) (screens §6)
        isDateClickable={(date, state) =>
          !isLocked(locks, date, query.dataUpdatedAt) &&
          (state === 'completed' || canCompleteDate(routine, byDate.get(date)))
        }
        onDateClick={(date, state) => {
          const execution = byDate.get(date)
          if (state === 'completed' && execution) onOpen({ kind: 'detail', execution })
          else onOpen({ kind: 'complete', date })
        }}
        // renderWeekAside(주 게이지)는 넘기지 않는다 — #60 주별 집계 뒤에 켠다
      />
    </section>
  )
}

// ─── 최근 인증 ─────────────────────────────────────────────────────────

const dateLabel = (date: string, today: string) =>
  date === today ? '오늘' : date === addDays(today, -1) ? '어제' : formatShortDate(date, today)

/** 그날 바로 인증했을 때만 시각을 붙인다 — 백필은 완료 시각이 그 날짜와 달라 "8월 21일 11:02"가 오해를 낳는다 */
const completedTime = (execution: Execution) =>
  execution.completedAt && execution.completedAt.slice(0, 10) === execution.scheduledDate
    ? execution.completedAt.slice(11, 16)
    : null

interface RecentItemProps {
  execution: Execution
  today: string
  /** 방금 취소했는데 다시 받지 못했다 — 이미 없는 기록이다 (D13) */
  locked: boolean
  onOpen: (target: ExecutionTarget) => void
}

const RecentItem = ({ execution, today, locked, onOpen }: RecentItemProps) => {
  const time = completedTime(execution)
  const firstLine = execution.memo?.split('\n')[0].trim()

  return (
    // 누르면 인증 상세 — 취소까지 이어진다 (screens §6)
    <li className={styles.recentItem}>
      <button
        type="button"
        className={styles.recentButton}
        onClick={() => onOpen({ kind: 'detail', execution })}
        disabled={locked}
      >
        {execution.photoUrl ? (
          <img className={styles.recentThumb} src={execution.photoUrl} alt="" />
        ) : (
          <span className={cn(styles.recentThumb, styles.recentCheck)} aria-hidden="true">
            ✓
          </span>
        )}
        <span className={styles.recentText}>
          <span className={styles.recentHead}>
            <b>{dateLabel(execution.scheduledDate, today)}</b>
            {time && <span className={styles.recentTime}>{time}</span>}
            {execution.photoUrl && (
              <span className={styles.recentClip} aria-label="사진 있음">
                📎
              </span>
            )}
          </span>
          <span className={cn(styles.recentMemo, !firstLine && styles.recentMemoEmpty)}>
            {firstLine || '메모 없이 인증'}
          </span>
        </span>
        <span className={styles.recentChevron} aria-hidden="true">
          ›
        </span>
      </button>
    </li>
  )
}

interface RecentSectionProps {
  query: ReturnType<typeof useCompletedExecutions>
  today: string
  locks: StaleLocks
  onOpen: (target: ExecutionTarget) => void
  /** 조회가 시작일까지 닿지 못했나 — 비어 있어도 "아직 없다"고 단정하지 않는다 */
  truncated: boolean
}

const RecentSection = ({ query, today, truncated, locks, onOpen }: RecentSectionProps) => {
  const recent = query.data?.slice(0, RECENT_COUNT)

  return (
    <section className={styles.section} aria-labelledby="recent-heading">
      <div className={styles.sectionHead}>
        <h2 id="recent-heading" className={styles.sectionTitle}>
          최근 인증
        </h2>
        <span className={styles.sectionNote}>· 최근 {RECENT_COUNT}건</span>
        <span className={styles.spacer} />
        {/* 자리만 둔다 — 피드 화면이 플레이스홀더이고 루틴별 필터도 없다. 피드 화면 이슈에서 켠다 */}
        <button type="button" className={cn(shared.btn, shared.btnGhost, shared.btnSm)} disabled>
          피드에서 보기 →
        </button>
      </div>
      {query.isError && query.data && <StaleNotice onRetry={() => void query.refetch()} />}
      {recent === undefined ? (
        query.isError ? (
          <ErrorState
            message="인증 기록을 불러오지 못했어요."
            onRetry={() => void query.refetch()}
          />
        ) : (
          <LoadingState />
        )
      ) : recent.length === 0 ? (
        <div className={cn(shared.card, styles.recentEmpty)}>
          {truncated
            ? '최근 1년 동안 인증 기록이 없어요.'
            : `아직 인증 기록이 없어요. 인증하면 여기에 최근 ${RECENT_COUNT}건이 보여요.`}
        </div>
      ) : (
        // 사진 그리드가 아니라 목록이다 — 사진은 선택이라 대부분의 인증에 사진이 없다
        <ul className={cn(shared.card, styles.recentList)}>
          {recent.map((execution) => (
            <RecentItem
              key={execution.scheduledDate}
              execution={execution}
              today={today}
              locked={isLocked(locks, execution.scheduledDate, query.dataUpdatedAt)}
              onOpen={onOpen}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

// ─── 사이드 — 설정 · 중단 ───────────────────────────────────────────────

const SettingRow = ({
  label,
  children,
  lockReason,
}: {
  label: string
  children: ReactNode
  lockReason?: string
}) => (
  <div className={styles.settingRow}>
    <dt className={styles.settingLabel}>{label}</dt>
    <dd className={styles.settingValue}>
      <span className={cn(lockReason && styles.settingLocked)}>{children}</span>
      {lockReason && (
        <span className={styles.lockReason}>
          <span aria-hidden="true">🔒</span> <span>{lockReason}</span>
        </span>
      )}
    </dd>
  </div>
)

interface SettingsCardProps {
  routine: Routine
  categoryName: string
  completedQuery: ReturnType<typeof useCompletedExecutions>
  today: string
  onEdit: (lock: RoutineEditLock) => void
}

const SettingsCard = ({
  routine,
  categoryName,
  completedQuery,
  today,
  onEdit,
}: SettingsCardProps) => {
  const isChallenge = routine.challengeId !== null
  const completed = completedQuery.data
  // 잠금은 완료 기록으로만 판정한다 — 기록을 못 받았으면 수정을 열지 않는다(잠긴 걸 열린 것처럼 보이지 않게)
  // 중단은 끝 상태다 — 서버가 파생을 멈춰 주기 · 기간을 바꿔도 화면에 효과가 없다 (#63 확인 결과 3-B)
  const stopped = !routine.isActive
  const lock: RoutineEditLock | null = completed
    ? toEditLock(completed, isLookbackTruncated(routine, today))
    : null
  const locked = !isChallenge && !stopped && lock !== null && lock.hasHistory

  return (
    <div className={cn(shared.card, styles.settings)}>
      <h2 className={styles.asideTitle}>설정</h2>
      <dl className={styles.settingList}>
        <SettingRow label="제목">{routine.title}</SettingRow>
        <SettingRow label="카테고리">{categoryName}</SettingRow>
        <SettingRow label="반복 주기" lockReason={locked ? scheduleLockReason(lock) : undefined}>
          {scheduleLabel(routine)}
        </SettingRow>
        <SettingRow label="시작일" lockReason={locked ? startLockReason(lock) : undefined}>
          {formatFullDate(routine.startedAt)}
        </SettingRow>
        <SettingRow label="종료일">
          {routine.endedAt ? (
            formatFullDate(routine.endedAt)
          ) : (
            // 비어 있는 게 오류처럼 보이지 않게 — 무기한이 기본이다 (ADR-0041)
            <span className={styles.dim}>없음 — 계속 이어져요</span>
          )}
        </SettingRow>
      </dl>

      {isChallenge ? (
        // 서버가 정의 · 기간 수정을 403으로 막는다 — 수정 버튼을 두지 않는다
        <p className={styles.lockReason}>
          <span aria-hidden="true">🔒</span>{' '}
          <span>챌린지 루틴의 정의와 기간은 챌린지를 따라가요. 바꿀 수 없어요.</span>
        </p>
      ) : stopped ? (
        // 중단 확인창이 "다시 이어갈 수 없어요"라고 약속했다 — 수정도 열지 않는다
        <p className={styles.lockReason}>
          <span aria-hidden="true">🔒</span> <span>중단한 루틴은 바꿀 수 없어요.</span>
        </p>
      ) : (
        <>
          {completedQuery.isError && !completed && (
            <p className={styles.settingError} role="alert">
              인증 기록을 확인하지 못해 지금은 수정할 수 없어요.{' '}
              <button
                type="button"
                className={styles.inlineButton}
                onClick={() => void completedQuery.refetch()}
              >
                다시 시도
              </button>
            </p>
          )}
          <button
            type="button"
            className={cn(shared.btn, shared.btnOutline, shared.btnSm, styles.editButton)}
            disabled={lock === null}
            onClick={() => lock && onEdit(lock)}
          >
            설정 수정
          </button>
        </>
      )}
    </div>
  )
}

/** 중단은 사이드 맨 아래 안내 문구 안에만 — 제목 옆에 두면 매일 그만두라고 권하는 셈이다 (screens.md §6) */
const StopNote = ({
  routine,
  status,
  onStop,
}: {
  routine: Routine
  status: RoutineStatus
  onStop: () => void
}) => {
  if (routine.challengeId !== null) {
    // 버튼 자체를 감춘다 — 눌렀다가 403을 받게 하지 않는다.
    // 챌린지로 가는 링크는 챌린지 상세 라우트가 생기면 단다 (지금은 /challenges가 플레이스홀더)
    return (
      <p className={styles.note}>
        <b>챌린지 루틴은 개별로 중단할 수 없어요.</b> 챌린지에서 나가면 함께 정리됩니다.
      </p>
    )
  }
  if (status !== 'ongoing') return null

  return (
    <p className={styles.note}>
      중단해도 <b>기록은 달력에 남아요.</b> 달성률 계산에서만 빠집니다.{' '}
      <button type="button" className={cn(styles.inlineButton, styles.stopButton)} onClick={onStop}>
        → 루틴 중단하기
      </button>
    </p>
  )
}

// ─── 오늘 인증하기 ─────────────────────────────────────────────────────

/**
 * 사이드 맨 위 — 오늘 아직 인증하지 않았고 오늘이 인증할 수 있는 날일 때만 둔다.
 * 오늘의 행은 이번 달 조회에 있다(달력이 이번 달을 보고 있으면 같은 캐시다).
 * 오늘 행이 없으면(지정형의 쉬는 요일 · 기간 밖 · 아직 못 받음) 버튼을 두지 않는다
 */
const TodayButton = ({
  routine,
  today,
  locks,
  onOpen,
}: {
  routine: Routine
  today: string
  locks: StaleLocks
  onOpen: (target: ExecutionTarget) => void
}) => {
  const query = useMonthExecutions(routine.routineId, monthOf(today))
  const todayExecution = query.data?.find((e) => e.scheduledDate === today)
  if (!todayExecution || !canCompleteDate(routine, todayExecution)) return null
  // 방금 인증했는데 다시 받지 못했다 — 낡은 버튼으로 다시 보내지 않게 감춘다 (D13)
  if (isLocked(locks, today, query.dataUpdatedAt)) return null

  return (
    <button
      type="button"
      className={cn(shared.btn, shared.btnPrimary, styles.todayButton)}
      onClick={() => onOpen({ kind: 'complete', date: today })}
    >
      ✓ 오늘 인증하기
    </button>
  )
}

// ─── 화면 ──────────────────────────────────────────────────────────────

const RoutineDetail = ({ routine }: { routine: Routine }) => {
  // 오늘은 렌더마다 다시 잰다 — 화면을 켜 둔 채 자정을 넘겨도 서버와 같은 기준이다
  const today = serverToday()
  const status = deriveRoutineStatus(routine, today)
  const meta = STATUS_META[status]
  const category = useCategoryLookup()(routine.categoryCode)
  const completedQuery = useCompletedExecutions(routine, today)
  const [editLock, setEditLock] = useState<RoutineEditLock | null>(null)
  const [stopping, setStopping] = useState(false)
  const [target, setTarget] = useState<ExecutionTarget | null>(null)
  const [locks, setLocks] = useState<StaleLocks>(new Map())
  const lockDate = (date: string) => setLocks((prev) => new Map(prev).set(date, Date.now()))

  /**
   * 대화상자를 연 자리가 닫는 사이 사라질 수 있다 — 인증하면 "오늘 인증하기"가, 취소하면 최근 인증 항목이 없어진다.
   * 공용 훅(useDialogFocus)은 연 자리가 남아 있을 때만 돌려주므로, 포커스가 body에 남았으면 여기서 옮긴다:
   * 같은 날짜의 달력 칸 → 달력 제목 (D12)
   */
  const calendarRef = useRef<HTMLDivElement>(null)
  const returnFocusDate = useRef<string | null>(null)
  const closeTarget = () => {
    if (target) {
      returnFocusDate.current =
        target.kind === 'complete' ? target.date : target.execution.scheduledDate
    }
    setTarget(null)
  }
  // 닫힌 대화상자의 정리(연 자리로 포커스)가 끝난 뒤에 돈다 — React는 지우는 effect를 먼저 모두 돌린다
  useEffect(() => {
    const date = returnFocusDate.current
    if (target !== null || date === null) return
    returnFocusDate.current = null
    if (document.activeElement && document.activeElement !== document.body) return
    const root = calendarRef.current
    const cell = root?.querySelector<HTMLElement>(`button[aria-label^="${formatMonthDay(date)} "]`)
    const heading = root?.querySelector<HTMLElement>('#calendar-heading')
    ;(cell ?? heading)?.focus()
  }, [target])

  return (
    <div className={styles.split}>
      <div className={styles.main}>
        <div className={styles.badges}>
          <span className={cn(shared.badge, meta.className)}>{meta.label}</span>
          {routine.challengeId !== null && (
            <span className={cn(shared.badge, shared.badgeChallenge)}>🏆 챌린지</span>
          )}
        </div>
        {/* 제목 옆에는 아무 버튼도 두지 않는다 (screens.md §6) */}
        <div className={styles.hero}>
          <span className={styles.icon} aria-hidden="true">
            {category?.icon ?? '✦'}
          </span>
          <div className={styles.heroText}>
            <h1 className={styles.title}>{routine.title}</h1>
            <p className={styles.meta}>
              {category?.name ?? routine.categoryCode} · {scheduleLabel(routine)} ·{' '}
              {/* 올해가 아니면 연도를 붙인다 — 작년 시작이 "한 달 전"으로 읽히지 않게 */}
              {formatShortDate(routine.startedAt, today)} ~{' '}
              {routine.endedAt ? formatShortDate(routine.endedAt, today) : '계속'}
            </p>
          </div>
        </div>
        {/* 스트릭 · 최장 스트릭 · 달성률은 자리를 만들지 않는다 — 통계 API(#60) 뒤에 붙인다 (#63 결정 2-A) */}

        <div ref={calendarRef}>
          <CalendarSection routine={routine} today={today} locks={locks} onOpen={setTarget} />
        </div>
        <RecentSection
          query={completedQuery}
          today={today}
          truncated={isLookbackTruncated(routine, today)}
          locks={locks}
          onOpen={setTarget}
        />
      </div>

      <aside className={styles.aside}>
        {status === 'ongoing' && (
          <TodayButton routine={routine} today={today} locks={locks} onOpen={setTarget} />
        )}
        <SettingsCard
          routine={routine}
          categoryName={category?.name ?? routine.categoryCode}
          completedQuery={completedQuery}
          today={today}
          onEdit={setEditLock}
        />
        <StopNote routine={routine} status={status} onStop={() => setStopping(true)} />
      </aside>

      {editLock && (
        <EditRoutineDialog routine={routine} lock={editLock} onClose={() => setEditLock(null)} />
      )}
      {stopping && <StopRoutineDialog routine={routine} onClose={() => setStopping(false)} />}
      {target?.kind === 'complete' && (
        <ExecutionDialog
          // 다른 날짜를 열면 새 모달이다 — 사진 · 메모 · 단계가 이어지지 않게
          key={target.date}
          routine={routine}
          date={target.date}
          today={today}
          onClose={closeTarget}
          onStale={lockDate}
        />
      )}
      {target?.kind === 'detail' && (
        <ExecutionDetailDialog
          key={target.execution.scheduledDate}
          routine={routine}
          execution={target.execution}
          today={today}
          onClose={closeTarget}
          onStale={lockDate}
        />
      )}
    </div>
  )
}

const RoutineDetailPage = () => {
  const { id } = useParams()
  const routineId = Number(id)
  const valid = Number.isInteger(routineId) && routineId > 0
  // 단건 API가 없어 목록에서 찾는다 — 목록에서 들어오면 캐시라 네트워크를 타지 않는다 (#63 결정 1-A)
  const query = useRoutineDetail(valid ? routineId : -1)

  if (!valid) return <NotFoundPage />

  // data — 찾음(Routine) · 목록에 없음(null) · 아직 목록 없음(undefined).
  // "없음"은 최신 목록으로만 판정한다 — 옛 캐시에 없다고 404를 내면 방금 만든 루틴이 재조회 동안 404가 된다
  const routine = query.data
  const content = routine ? (
    // data가 있으면 배경 refetch 오류에도 화면을 그대로 둔다 — 수정 대화상자 입력이 날아가지 않게 (§6-1)
    <RoutineDetail routine={routine} />
  ) : query.isFetching ? (
    <LoadingState />
  ) : query.isError ? (
    <ErrorState message="루틴을 불러오지 못했어요." onRetry={() => void query.refetch()} />
  ) : routine === null ? null : (
    <LoadingState />
  )

  if (content === null) return <NotFoundPage />

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/routines" className={styles.crumb}>
          ← 내 루틴
        </Link>
        {content}
      </div>
    </div>
  )
}

export default RoutineDetailPage
