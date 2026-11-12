import { useEffect, useId } from 'react'
import { useDialogFocus } from '@/hooks/useDialogFocus'
import { useStopRoutine } from '@/hooks/useRoutines'
import type { Routine } from '@/types/routine'
import { cn } from '@/utils/cn'
import { isComposingKeyEvent } from '@/utils/ime'
import shared from './routine.module.css'
import styles from './DeleteTemplateDialog.module.css'

interface StopRoutineDialogProps {
  /** 개인 루틴만 — 챌린지 루틴은 중단 버튼 자체가 없다(서버 403) */
  routine: Routine
  onClose: () => void
}

// 다시 켜는 API가 없다 — 되돌릴 수 없는 행동이라 확인을 받는다
const StopRoutineDialog = ({ routine, onClose }: StopRoutineDialogProps) => {
  const titleId = useId()
  const dialogRef = useDialogFocus<HTMLDivElement>()
  const { mutate, isPending, isError } = useStopRoutine(routine.routineId)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isComposingKeyEvent(e) && !isPending) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, isPending])

  return (
    <div className={styles.backdrop} onClick={() => !isPending && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className={styles.title}>
          ‘{routine.title}’ 루틴을 중단할까요?
        </h2>
        <p className={styles.body}>
          지금까지의 기록은 달력에 그대로 남고, 달성률 계산에서만 빠집니다. 중단한 루틴은 다시
          이어갈 수 없어요 — 다시 하려면 새 루틴을 시작해 주세요.
        </p>
        {isError && <p className={styles.error}>중단하지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
        <div className={styles.actions}>
          <button
            type="button"
            className={cn(shared.btn, shared.btnOutline, shared.btnSm)}
            onClick={onClose}
            disabled={isPending}
            autoFocus
          >
            취소
          </button>
          <button
            type="button"
            className={cn(shared.btn, shared.btnDanger, shared.btnSm)}
            onClick={() => mutate(undefined, { onSuccess: onClose })}
            disabled={isPending}
          >
            {isPending ? '중단하는 중...' : '루틴 중단하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StopRoutineDialog
