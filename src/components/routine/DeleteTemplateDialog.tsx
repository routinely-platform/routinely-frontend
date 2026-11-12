import Dialog from '@/components/common/Dialog'
import dialogStyles from '@/components/common/Dialog.module.css'
import { useDeleteRoutineTemplate } from '@/hooks/useRoutines'
import type { RoutineTemplate } from '@/types/routine'
import { cn } from '@/utils/cn'
import shared from './routine.module.css'

interface DeleteTemplateDialogProps {
  template: RoutineTemplate
  onClose: () => void
}

const DeleteTemplateDialog = ({ template, onClose }: DeleteTemplateDialogProps) => {
  const { mutate, isPending, isError } = useDeleteRoutineTemplate()

  return (
    <Dialog
      title={`‘${template.title}’ 템플릿을 삭제할까요?`}
      onClose={onClose}
      // 지우는 중에는 닫지 않는다 — 결과를 못 보고 화면이 사라진다
      isPending={isPending}
      closeOnBackdrop
      error={isError && '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.'}
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
            onClick={() => mutate(template.templateId, { onSuccess: onClose })}
            disabled={isPending}
          >
            {isPending ? '삭제 중...' : '삭제'}
          </button>
        </>
      }
    >
      {/* 없으면 "루틴도 지워질까 봐" 못 지운다. MVP는 시작 횟수가 없어 개수를 쓰지 않는다 */}
      <p className={dialogStyles.description}>
        템플릿만 삭제되고, 이 템플릿으로 시작한 루틴은 그대로 남아요.
      </p>
    </Dialog>
  )
}

export default DeleteTemplateDialog
