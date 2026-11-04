import { useId, useState } from 'react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { getApiErrorPayload } from '@/components/auth/authFormErrors'
import { useCreateRoutineTemplate, useMyRoutines, useStartRoutine } from '@/hooks/useRoutines'
import type { RoutineTemplate } from '@/types/routine'
import { cn } from '@/utils/cn'
import {
  addDays,
  daysBetween,
  deriveRoutineStatus,
  formatMonthDay,
  isCompleteDate,
  serverToday,
} from '@/utils/routine'
import DefinitionFields, { FieldError } from './DefinitionFields'
import {
  BACKDATE_LIMIT_DAYS,
  PERIOD_LIMIT_DAYS,
  definitionDefaults,
  isDefinitionEdited,
  routineFormSchema,
  toDefinitionRequest,
  type RoutineFormValues,
} from './routineFormSchema'
import shared from './routine.module.css'
import styles from './RoutineForm.module.css'

interface RoutineFormProps {
  /** 템플릿에서 시작했으면 그 템플릿 — 없으면 빈 폼 */
  template?: RoutineTemplate
  /** 출처 배지의 "연결 끊기" — 폼을 비운다 */
  onDisconnect: () => void
}

/** 정의를 템플릿에서 고쳤는가 — 배지 문구 · 체크박스가 각자 구독한다 */
const useEditedFromTemplate = (template: RoutineTemplate | undefined) => {
  const { control } = useFormContext<RoutineFormValues>()
  const [title, categoryCode, scheduleType, daysOfWeek, weeklyCount, monthlyCount] = useWatch({
    control,
    name: ['title', 'categoryCode', 'scheduleType', 'daysOfWeek', 'weeklyCount', 'monthlyCount'],
  })
  if (!template) return false
  return isDefinitionEdited(
    { title, categoryCode, scheduleType, daysOfWeek, weeklyCount, monthlyCount },
    template
  )
}

/** 어디서 왔는지 — 프리필된 값의 출처를 모르면 지우기가 무섭다 */
const SourceBadge = ({ template, onDisconnect }: Required<RoutineFormProps>) => {
  const edited = useEditedFromTemplate(template)

  return (
    <div className={cn(shared.card, styles.source)}>
      <span aria-hidden="true">✦</span>
      <span className={styles.sourceText}>
        {edited ? (
          // 고치면 템플릿 ID를 보낼 수 없다(isSourceExclusive) — 연결이 조용히 끊기지 않게 알린다 (#19 G1)
          <b>설정을 바꿨어요. 이 루틴은 템플릿과 연결되지 않고 따로 기록돼요.</b>
        ) : (
          <>
            <b>‘{template.title}’</b> 템플릿의 설정을 불러왔어요. 여기서 바꿔도 템플릿은 그대로예요.
          </>
        )}
      </span>
      <button
        type="button"
        className={cn(shared.btn, shared.btnGhost, shared.btnSm)}
        onClick={onDisconnect}
      >
        처음부터 만들기
      </button>
    </div>
  )
}

/** 과거 시작일 경고 — 주기마다 세는 단위가 다르다. 틀린 경고는 경고를 안 믿게 만든다 */
const BackdateWarning = () => {
  const { control } = useFormContext<RoutineFormValues>()
  const [startedAt, scheduleType] = useWatch({ control, name: ['startedAt', 'scheduleType'] })
  if (!isCompleteDate(startedAt)) return null
  const back = daysBetween(startedAt, serverToday())
  if (back <= 0) return null

  const from = `${formatMonthDay(startedAt)}부터 시작하면`
  const body =
    scheduleType === 'DAILY'
      ? `${from} 지난 ${back}일이 미완료로 기록돼요.`
      : scheduleType === 'SPECIFIC_DAYS'
        ? `${from} 지난 ${back}일 중 고른 요일이 미완료로 기록돼요.`
        : scheduleType === 'WEEKLY_COUNT'
          ? `${from} 지난 ${Math.ceil(back / 7)}주는 목표 미달성으로 기록돼요.`
          : `${from} 지난 ${Math.ceil(back / 30)}달은 목표 미달성으로 기록돼요.`

  return (
    <p className={styles.warning} role="status">
      ⚠ <b>{body}</b>
      <br />
      지난 날짜의 인증은 나중에 채울 수 있어요.{' '}
      <span className={styles.warningDim}>
        시작일은 최대 {BACKDATE_LIMIT_DAYS}일 전까지 정할 수 있어요.
      </span>
    </p>
  )
}

/** 종료일 — 시작일을 구독해 min · max만 바꾼다. 값은 덮지 않는다(비제어) */
const EndDateInput = ({ id }: { id: string }) => {
  const { control, register } = useFormContext<RoutineFormValues>()
  const startedAt = useWatch({ control, name: 'startedAt' })
  const hasStart = isCompleteDate(startedAt)

  return (
    <input
      id={id}
      type="date"
      className={styles.input}
      min={hasStart ? startedAt : undefined}
      max={hasStart ? addDays(startedAt, PERIOD_LIMIT_DAYS - 1) : undefined}
      {...register('endedAt')}
    />
  )
}

/** 같은 이름의 진행 중 루틴 — 막지 않고 알리기만 한다. 비교는 이미 받아 둔 목록으로 한다 */
const DuplicateWarning = () => {
  const { control } = useFormContext<RoutineFormValues>()
  const title = useWatch({ control, name: 'title' }).trim()
  const { data: routines } = useMyRoutines()
  if (!title || !routines) return null

  const today = serverToday()
  const duplicated = routines.some(
    (r) => r.title === title && deriveRoutineStatus(r, today) === 'ongoing'
  )
  if (!duplicated) return null

  return (
    <p className={styles.warning} role="status">
      ⚠ <b>이미 진행 중인 ‘{title}’ 루틴이 있어요.</b> 같은 이름으로 하나 더 만들 수도 있어요.
    </p>
  )
}

/** 템플릿으로도 저장 — 템플릿에서 시작해 안 고쳤으면 같은 템플릿이 하나 더 생기므로 끈다 (#19 G2) */
const SaveAsTemplateField = ({ template }: { template?: RoutineTemplate }) => {
  const { register } = useFormContext<RoutineFormValues>()
  const edited = useEditedFromTemplate(template)
  const disabled = template !== undefined && !edited

  return (
    <label className={cn(styles.checkboxRow, disabled && styles.checkboxDisabled)}>
      <input type="checkbox" disabled={disabled} {...register('saveAsTemplate')} />이 설정을
      템플릿으로도 저장
      {disabled && <span className={styles.checkboxNote}>· 템플릿에서 불러온 설정이에요</span>}
    </label>
  )
}

const DEFAULT_ERROR = '루틴을 만들지 못했어요. 잠시 후 다시 시도해 주세요.'
const PARTIAL_ERROR = '템플릿은 저장했지만 루틴을 시작하지 못했어요. 다시 시도해 주세요.'

const RoutineForm = ({ template, onDisconnect }: RoutineFormProps) => {
  const navigate = useNavigate()
  const startedAtId = useId()
  const endedAtId = useId()
  const { mutateAsync: startRoutine } = useStartRoutine()
  const { mutateAsync: createTemplate } = useCreateRoutineTemplate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  // ①(템플릿 생성)만 성공했을 때의 템플릿 — 다시 시작하면 ②만 부른다. 정의를 또 고쳤으면 버린다
  const [savedTemplate, setSavedTemplate] = useState<{
    templateId: number
    definitionKey: string
  } | null>(null)

  const methods = useForm<RoutineFormValues>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: {
      ...definitionDefaults(template),
      startedAt: serverToday(),
      endedAt: '',
      saveAsTemplate: false,
    },
  })
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = methods

  const onSubmit = async (values: RoutineFormValues) => {
    setSubmitError(null)
    const period = { startedAt: values.startedAt, endedAt: values.endedAt || null }
    const definition = toDefinitionRequest(values)
    const edited = template ? isDefinitionEdited(values, template) : true

    try {
      if (template && !edited) {
        // 안 고쳤으면 템플릿 ID만 — 정의를 함께 보내면 400 (#19 G1)
        await startRoutine({ routineTemplateId: template.templateId, ...period })
      } else if (values.saveAsTemplate) {
        // 시작 API에 저장 옵션이 없다 — ① 템플릿 생성 → ② 받은 ID로 시작 (#19 G2)
        const definitionKey = JSON.stringify(definition)
        let savedTemplateId =
          savedTemplate?.definitionKey === definitionKey ? savedTemplate.templateId : null
        if (savedTemplateId === null) {
          const created = await createTemplate(definition)
          savedTemplateId = created.templateId
          setSavedTemplate({ templateId: savedTemplateId, definitionKey })
        }
        try {
          await startRoutine({ routineTemplateId: savedTemplateId, ...period })
        } catch {
          setSubmitError(PARTIAL_ERROR)
          return
        }
      } else {
        await startRoutine({ ...definition, ...period })
      }
      navigate('/routines')
    } catch (error) {
      setSubmitError(getApiErrorPayload(error)?.message || DEFAULT_ERROR)
    }
  }

  return (
    <FormProvider {...methods}>
      <form className={styles.fields} onSubmit={handleSubmit(onSubmit)} noValidate>
        {template && <SourceBadge template={template} onDisconnect={onDisconnect} />}

        <DefinitionFields />

        <div className={styles.field}>
          <span className={styles.label}>기간</span>
          <div className={styles.dateRow}>
            <div className={styles.field}>
              <label htmlFor={startedAtId} className={styles.label}>
                시작일
              </label>
              {/* 날짜 입력은 비제어로 둔다 — 직접 타이핑하는 값을 매 키 덮으면 글자마다 리셋된다 (§6-1) */}
              <input
                id={startedAtId}
                type="date"
                className={styles.input}
                min={addDays(serverToday(), -BACKDATE_LIMIT_DAYS)}
                {...register('startedAt')}
              />
              <FieldError name="startedAt" />
            </div>
            <div className={styles.field}>
              <label htmlFor={endedAtId} className={styles.label}>
                종료일 <span className={styles.optional}>(선택)</span>
              </label>
              <EndDateInput id={endedAtId} />
              <FieldError name="endedAt" />
            </div>
          </div>
          {/* 습관에는 끝이 없다 — 강제하면 해마다 다시 시작하고 그때마다 스트릭이 끊긴다 */}
          <p className={styles.hint}>종료일을 비워 두면 기한 없이 계속돼요.</p>
          <BackdateWarning />
        </div>

        <DuplicateWarning />
        <SaveAsTemplateField template={template} />

        {submitError && (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        )}

        <div>
          <button
            type="submit"
            className={cn(shared.btn, shared.btnPrimary, styles.submit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? '만드는 중...' : '루틴 만들기'}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

export default RoutineForm
