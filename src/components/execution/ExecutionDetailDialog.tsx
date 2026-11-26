import { useState } from 'react'
import Dialog from '@/components/common/Dialog'
import shared from '@/components/routine/routine.module.css'
import { useCancelExecution } from '@/hooks/useExecutions'
import type { Execution } from '@/types/execution'
import type { Routine } from '@/types/routine'
import { formatDateWithWeekday, formatShortDate } from '@/utils/calendar'
import { cn } from '@/utils/cn'
import { executionErrorMessage } from './executionErrors'
import styles from './execution.module.css'

interface ExecutionDetailDialogProps {
  routine: Routine
  /** 완료한 기록 — 달력 칸 · 최근 인증 항목이 넘긴다 */
  execution: Execution
  today: string
  onClose: () => void
  /**
   * 저장이 끝났다 — 부르는 쪽이 이 날짜를 그리는 쿼리마다 `savedAt` 뒤에 새로 받았는지 보고 낡은 버튼을 막는다 (D17)
   */
  onSaved?: (date: string, savedAt: number) => void
}

/**
 * 인증 상세 — 사진 · 메모 + [인증 취소]. 취소는 이 창 위에 확인창을 **겹쳐** 연다.
 * 확인창을 닫으면 포커스는 [인증 취소]로, 취소가 끝나면 두 창이 함께 닫히고 이 창을 연 자리(달력 칸)로 간다
 */
const ExecutionDetailDialog = ({
  routine,
  execution,
  today,
  onClose,
  onSaved,
}: ExecutionDetailDialogProps) => {
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <Dialog
        title={routine.title}
        // 배경 클릭으로 닫지 않는다 — 배경 닫기는 확인창만이다(screens §17-3 규칙 4, D15)
        onClose={onClose}
        actions={
          <>
            <button
              type="button"
              className={cn(shared.btn, shared.btnOutline, shared.btnSm)}
              onClick={onClose}
            >
              닫기
            </button>
            <button
              type="button"
              className={cn(shared.btn, shared.btnOutline, shared.btnSm, styles.dangerOutline)}
              onClick={() => setConfirming(true)}
            >
              인증 취소
            </button>
          </>
        }
      >
        <p className={styles.meta}>
          {/* 경쟁하는 액션이 같은 자리에 없어 채운 배지를 써도 된다 (screens §3) */}
          <span className={cn(styles.badge, styles.badgeDone)}>✓ 인증함</span>
          <span>{formatDateWithWeekday(execution.scheduledDate, today)}</span>
        </p>
        <div className={styles.stack}>
          {execution.photoUrl && (
            <img
              className={styles.detailPhoto}
              src={execution.photoUrl}
              alt={`${formatShortDate(execution.scheduledDate, today)} 인증 사진`}
            />
          )}
          <p className={cn(styles.memo, !execution.memo && styles.memoEmpty)}>
            {execution.memo || '메모 없이 인증'}
          </p>
          {/* 리액션 수는 그리지 않는다 — 피드 · 리액션(BE #59 · FE #21)이 없어 항상 0이다 (D4) */}
        </div>
      </Dialog>
      {confirming && (
        <CancelExecutionDialog
          routine={routine}
          execution={execution}
          today={today}
          onClose={() => setConfirming(false)}
          // 기록이 사라졌다 — 상세도 함께 닫는다
          onCancelled={(savedAt) => {
            onSaved?.(execution.scheduledDate, savedAt)
            onClose()
          }}
        />
      )}
    </>
  )
}

interface CancelExecutionDialogProps {
  routine: Routine
  execution: Execution
  today: string
  onClose: () => void
  /** 취소가 저장됐다 — `savedAt`은 저장 직후 · 다시 받기 전 시각 */
  onCancelled: (savedAt: number) => void
}

/**
 * 다시 인증할 수 있나 — 서버의 `backfillable`로만 가른다(날짜를 재지 않는다).
 * 중단한 루틴은 이유가 확실하다(`isActive`). 챌린지 루틴은 3일 창이 지났는지 챌린지가 끝났는지 서버가 알려 주지
 * 않는다 — 이유를 단정하지 않고 결과만 말한다 (D15)
 */
const reinstateLine = (routine: Routine, execution: Execution) => {
  if (execution.backfillable) {
    return (
      <>
        <b>되돌릴 수 없어요.</b> 다시 인증하면 새 카드가 만들어집니다.
      </>
    )
  }
  if (!routine.isActive) {
    return (
      <>
        ⚠️ <b>중단한 루틴이라</b> 다시 인증할 수 없어요.
      </>
    )
  }
  return (
    <>
      ⚠️ <b>취소하면 이 날짜는 다시 인증할 수 없어요.</b>
    </>
  )
}

/** 인증 취소 확인창 — 되돌릴 수 없는 삭제라 필수다(screens §6) */
const CancelExecutionDialog = ({
  routine,
  execution,
  today,
  onClose,
  onCancelled,
}: CancelExecutionDialogProps) => {
  const { mutate, isPending, error } = useCancelExecution(
    routine.routineId,
    execution.scheduledDate
  )

  return (
    <Dialog
      title={`${formatShortDate(execution.scheduledDate, today)} 인증을 취소할까요?`}
      onClose={onClose}
      isPending={isPending}
      closeOnBackdrop
      error={
        error && executionErrorMessage(error, '취소하지 못했어요. 잠시 후 다시 시도해 주세요.')
      }
      actions={
        <>
          <button
            type="button"
            className={cn(shared.btn, shared.btnOutline, shared.btnSm)}
            onClick={onClose}
            disabled={isPending}
            // 확인창은 [취소]에 포커스 — Enter 한 번에 삭제되지 않게 (§17-3 규칙 5)
            autoFocus
          >
            취소
          </button>
          <button
            type="button"
            className={cn(shared.btn, shared.btnDanger, shared.btnSm)}
            onClick={() => mutate(undefined, { onSuccess: ({ savedAt }) => onCancelled(savedAt) })}
            disabled={isPending}
          >
            {isPending ? '취소하는 중...' : '인증 취소하기'}
          </button>
        </>
      }
    >
      <div className={styles.stack}>
        <ul className={styles.effects}>
          <li className={styles.effect}>
            <span aria-hidden="true">🗑</span>
            <span>피드 카드가 삭제됩니다</span>
          </li>
          {/* "리액션 N개" 줄은 피드 · 리액션이 생기면 켠다 — 지금은 항상 0이라 틀린 안심을 준다 (D4) */}
          {routine.challengeId !== null && (
            <li className={styles.effect}>
              <span aria-hidden="true">📉</span>
              <span>챌린지 랭킹에서 이 인증이 빠집니다</span>
            </li>
          )}
        </ul>
        <p className={cn(styles.note, styles.noteWarn)}>{reinstateLine(routine, execution)}</p>
      </div>
    </Dialog>
  )
}

export default ExecutionDetailDialog
