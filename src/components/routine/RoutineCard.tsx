import { Link } from 'react-router-dom'
import type { Category, Routine, RoutineStatus } from '@/types/routine'
import { cn } from '@/utils/cn'
import { formatMonthDay, scheduleLabel } from '@/utils/routine'
import shared from './routine.module.css'
import styles from './RoutineCard.module.css'

interface RoutineCardProps {
  routine: Routine
  status: RoutineStatus
  /** 카테고리 목록을 아직 못 받았으면 없다 — 코드만 보인다 */
  category: Category | undefined
}

const STATUS_META: Record<RoutineStatus, { label: string; className: string }> = {
  ongoing: { label: '진행 중', className: shared.badgeOngoing },
  completed: { label: '🎉 완료', className: shared.badgeCompleted },
  stopped: { label: '중단', className: shared.badgeStopped },
}

// 달성률 · 스트릭 · 빈도형 진척은 응답에 없어 그리지 않는다 — 자리도 비워 두지 않는다 (#19 MVP 범위, 백엔드 #60 짝 작업)
const RoutineCard = ({ routine, status, category }: RoutineCardProps) => {
  const meta = STATUS_META[status]

  return (
    <Link
      to={`/routines/${routine.routineId}`}
      className={cn(
        shared.card,
        styles.card,
        status === 'completed' && styles.completed,
        status === 'stopped' && styles.stopped
      )}
    >
      <div className={styles.badges}>
        <span className={cn(shared.badge, meta.className)}>{meta.label}</span>
        {/* 챌린지 루틴은 중단 · 수정이 안 된다 — 할 수 있는 일이 달라 배지로 구분한다 */}
        {routine.challengeId !== null && (
          <span className={cn(shared.badge, shared.badgeChallenge)}>🏆 챌린지</span>
        )}
        <span className={styles.spacer} />
        {category && (
          <span className={styles.emoji} aria-hidden="true">
            {category.icon}
          </span>
        )}
      </div>
      <div className={styles.title}>{routine.title}</div>
      <div className={styles.meta}>
        {category?.name ?? routine.categoryCode} · {scheduleLabel(routine)}
        {/* 기간은 완료됨에만 — 진행 중은 대부분 "~ 계속"이라 한 줄을 쓰고도 알려 주는 게 없다 */}
        {status === 'completed' && routine.endedAt && (
          <span className={styles.period}>
            {formatMonthDay(routine.startedAt)} ~ {formatMonthDay(routine.endedAt)}
          </span>
        )}
      </div>
    </Link>
  )
}

export default RoutineCard
