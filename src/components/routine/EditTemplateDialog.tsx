import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getApiErrorPayload } from '@/components/auth/authFormErrors'
import Dialog from '@/components/common/Dialog'
import dialogStyles from '@/components/common/Dialog.module.css'
import { useUpdateRoutineTemplate } from '@/hooks/useRoutines'
import type { RoutineTemplate } from '@/types/routine'
import { cn } from '@/utils/cn'
import { preventComposingSubmit } from '@/utils/ime'
import DefinitionFields from './DefinitionFields'
import {
  definitionDefaults,
  definitionSchema,
  toDefinitionRequest,
  type DefinitionFormValues,
} from './routineFormSchema'
import shared from './routine.module.css'
import styles from './RoutineForm.module.css'

interface EditTemplateDialogProps {
  template: RoutineTemplate
  onClose: () => void
}

const EditTemplateDialog = ({ template, onClose }: EditTemplateDialogProps) => {
  const { mutateAsync, isPending, error } = useUpdateRoutineTemplate()
  const methods = useForm<DefinitionFormValues>({
    resolver: zodResolver(definitionSchema),
    defaultValues: definitionDefaults(template),
  })

  const onSubmit = async (values: DefinitionFormValues) => {
    try {
      await mutateAsync({ templateId: template.templateId, body: toDefinitionRequest(values) })
      onClose()
    } catch {
      // 오류 문구는 mutation 상태로 그린다
    }
  }

  return (
    // FormProvider는 DOM을 그리지 않는다 — 폼 태그는 Dialog가 본문과 버튼 줄을 감싸 그린다
    <FormProvider {...methods}>
      <Dialog
        title="템플릿 수정"
        onClose={onClose}
        isPending={isPending}
        wide
        formProps={{
          onSubmit: methods.handleSubmit(onSubmit),
          onKeyDown: preventComposingSubmit,
          noValidate: true,
        }}
        error={
          error &&
          (getApiErrorPayload(error)?.message || '저장하지 못했어요. 잠시 후 다시 시도해 주세요.')
        }
        actions={
          <>
            <button
              type="button"
              className={cn(shared.btn, shared.btnOutline, shared.btnSm)}
              onClick={onClose}
              disabled={isPending}
            >
              취소
            </button>
            <button
              type="submit"
              className={cn(shared.btn, shared.btnPrimary, shared.btnSm)}
              disabled={isPending}
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
          </>
        }
      >
        {/* 없으면 "고쳤는데 왜 안 바뀌지?"가 된다 — 루틴은 시작할 때 정의를 복사해 간다(ADR-0040) */}
        <p className={dialogStyles.description}>
          바꾼 내용은 다음에 시작하는 루틴부터 적용돼요. 이미 진행 중인 루틴은 바뀌지 않아요.
        </p>
        <div className={cn(styles.fields, dialogStyles.fields)}>
          <DefinitionFields />
        </div>
      </Dialog>
    </FormProvider>
  )
}

export default EditTemplateDialog
