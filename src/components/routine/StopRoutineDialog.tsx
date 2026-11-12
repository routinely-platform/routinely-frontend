import Dialog from '@/components/common/Dialog'
import dialogStyles from '@/components/common/Dialog.module.css'
import { useStopRoutine } from '@/hooks/useRoutines'
import type { Routine } from '@/types/routine'
import { cn } from '@/utils/cn'
import shared from './routine.module.css'

interface StopRoutineDialogProps {
  /** 개인 루틴만 — 챌린지 루틴은 중단 버튼 자체가 없다(서버 403) */
  routine: Routine
  onClose: () => void
}

// 다시 켜는 API가 없다 — 되돌릴 수 없는 행동이라 확인을 받는다
const StopRoutineDialog = ({ routine, onClose }: StopRoutineDialogProps) => {
  const { mutate, isPending, isError } = useStopRoutine(routine.routineId)

  return (
    <Dialog
      title={`‘${routine.title}’ 루틴을 중단할까요?`}
      onClose={onClose}
      isPending={isPending}
      closeOnBackdrop
      error={isError && '중단하지 못했어요. 잠시 후 다시 시도해 주세요.'}
      actions={
        <>
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
        </>
      }
    >
      <p className={dialogStyles.description}>
        지금까지의 기록은 달력에 그대로 남고, 달성률 계산에서만 빠집니다. 중단한 루틴은 다시 이어갈
        수 없어요 — 다시 하려면 새 루틴을 시작해 주세요.
      </p>
    </Dialog>
  )
}

export default StopRoutineDialog
