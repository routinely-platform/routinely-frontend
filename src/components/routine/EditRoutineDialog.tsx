import { useId, useState } from 'react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getApiErrorPayload } from '@/components/auth/authFormErrors'
import Dialog from '@/components/common/Dialog'
import { useUpdateRoutine } from '@/hooks/useRoutines'
import type { Routine } from '@/types/routine'
import { cn } from '@/utils/cn'
import { preventComposingSubmit } from '@/utils/ime'
import { addDays, formatMonthDay, isCompleteDate, scheduleLabel } from '@/utils/routine'
import DefinitionFields, { FieldError } from './DefinitionFields'
import {
  routineEditDefaults,
  routineEditSchema,
  scheduleLockReason,
  startLockReason,
  toUpdateRoutineRequest,
  type RoutineEditFormValues,
  type RoutineEditLock,
} from './routineEditSchema'
import { PERIOD_LIMIT_DAYS } from './routineFormSchema'
import shared from './routine.module.css'
import styles from './RoutineForm.module.css'

interface EditRoutineDialogProps {
  /** 개인 루틴만 — 챌린지 루틴은 이 대화상자를 열지 않는다 */
  routine: Routine
  lock: RoutineEditLock
  onClose: () => void
}

/** 종료일 — 시작일을 구독해 min · max만 바꾼다. 값은 덮지 않는다(비제어 · §6-1) */
const EndDateInput = ({
  id,
  lastCompletedDate,
}: {
  id: string
  lastCompletedDate: string | null
}) => {
  const { control, register } = useFormContext<RoutineEditFormValues>()
  const startedAt = useWatch({ control, name: 'startedAt' })
  const hasStart = isCompleteDate(startedAt)
  const min =
    hasStart && lastCompletedDate !== null && lastCompletedDate > startedAt
      ? lastCompletedDate
      : hasStart
        ? startedAt
        : undefined

  return (
    <input
      id={id}
      type="date"
      className={styles.input}
      min={min}
      max={hasStart ? addDays(startedAt, PERIOD_LIMIT_DAYS - 1) : undefined}
      {...register('endedAt')}
    />
  )
}

const DEFAULT_ERROR = '저장하지 못했어요. 잠시 후 다시 시도해 주세요.'

const EditRoutineDialog = ({ routine, lock, onClose }: EditRoutineDialogProps) => {
  const startedAtId = useId()
  const endedAtId = useId()
  const { mutateAsync, isPending } = useUpdateRoutine(routine.routineId)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const methods = useForm<RoutineEditFormValues>({
    resolver: zodResolver(routineEditSchema(routine, lock)),
    defaultValues: routineEditDefaults(routine),
  })

  const onSubmit = async (values: RoutineEditFormValues) => {
    setSubmitError(null)
    const body = toUpdateRoutineRequest(values, routine, lock)
    // 바뀐 게 없으면 요청하지 않는다
    if (Object.keys(body).length === 0) {
      onClose()
      return
    }
    try {
      await mutateAsync(body)
      onClose()
    } catch (error) {
      setSubmitError(getApiErrorPayload(error)?.message || DEFAULT_ERROR)
    }
  }

  return (
    // FormProvider는 DOM을 그리지 않는다 — 폼 태그는 Dialog가 본문과 버튼 줄을 감싸 그린다
    <FormProvider {...methods}>
      <Dialog
        title="루틴 설정 수정"
        onClose={onClose}
        isPending={isPending}
        wide
        formProps={{
          onSubmit: methods.handleSubmit(onSubmit),
          onKeyDown: preventComposingSubmit,
          noValidate: true,
        }}
        error={submitError}
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
        <div className={styles.fields}>
          <DefinitionFields
            scheduleLock={
              lock.hasHistory
                ? { value: scheduleLabel(routine), reason: scheduleLockReason(lock) }
                : undefined
            }
          />

          <div className={styles.field}>
            <span className={styles.label}>기간</span>
            <div className={styles.dateRow}>
              <div className={styles.field}>
                {lock.hasHistory ? (
                  <>
                    <span className={styles.label}>시작일</span>
                    <p className={styles.lockedValue}>{formatMonthDay(routine.startedAt)}</p>
                    <p className={styles.lockReason}>
                      <span aria-hidden="true">🔒</span> <span>{startLockReason(lock)}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <label htmlFor={startedAtId} className={styles.label}>
                      시작일
                    </label>
                    <input
                      id={startedAtId}
                      type="date"
                      className={styles.input}
                      {...methods.register('startedAt')}
                    />
                    <FieldError name="startedAt" />
                  </>
                )}
              </div>
              <div className={styles.field}>
                <label htmlFor={endedAtId} className={styles.label}>
                  종료일 <span className={styles.optional}>(선택)</span>
                </label>
                <EndDateInput id={endedAtId} lastCompletedDate={lock.lastCompletedDate} />
                <FieldError name="endedAt" />
              </div>
            </div>
            <p className={styles.hint}>
              종료일을 비워 두면 기한 없이 계속돼요.
              {lock.lastCompletedDate !== null &&
                ` 늘리는 건 언제든 되고, 줄이는 건 마지막 인증일(${formatMonthDay(lock.lastCompletedDate)})까지만 돼요.`}
            </p>
          </div>
        </div>
      </Dialog>
    </FormProvider>
  )
}

export default EditRoutineDialog
