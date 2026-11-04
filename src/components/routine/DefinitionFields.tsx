import { useId } from 'react'
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form'
import CategoryPicker from '@/components/common/CategoryPicker'
import CharCounter from '@/components/common/CharCounter'
import Tooltip from '@/components/common/Tooltip'
import type { ScheduleType, Weekday } from '@/types/routine'
import { cn } from '@/utils/cn'
import {
  MONTHLY_COUNT_MAX,
  SCHEDULE_TYPES,
  WEEKDAYS,
  WEEKLY_COUNT_MAX,
  type DefinitionFormValues,
} from './routineFormSchema'
import shared from './routine.module.css'
import styles from './RoutineForm.module.css'

const SCHEDULE_META: Record<ScheduleType, { label: string; hint: string }> = {
  DAILY: { label: '매일', hint: '안 하면 미완료로 남아요' },
  SPECIFIC_DAYS: { label: '요일 지정', hint: '고른 요일에만 떠요' },
  WEEKLY_COUNT: { label: '주 N회', hint: '요일은 자유, 횟수만 채우면 돼요' },
  MONTHLY_COUNT: { label: '월 N회', hint: '한 달 안에 N번, 날짜는 자유예요' },
}

const WEEKDAY_LABELS: Record<Weekday, string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
}

const SCHEDULE_TOOLTIP = (
  <>
    <b>매일·요일 지정</b>은 그 날 안 하면 미완료로 남아요. <b>주 N회·월 N회</b>는 그 기간 안에
    횟수만 채우면 되고, 특정일 미완료가 없어요.
  </>
)

/** 필드 하나의 오류 — 오류 구독을 이 조각에 두어 필드 묶음이 재렌더하지 않게 한다 */
export const FieldError = ({ name }: { name: string }) => {
  const { errors } = useFormState()
  const message = errors[name]?.message
  return typeof message === 'string' ? (
    <p className={styles.error} role="alert">
      {message}
    </p>
  ) : null
}

/** 고른 주기에 딸린 입력 — 주기 유형을 구독하는 건 이 조각뿐이다 */
const ScheduleDetail = () => {
  const { control, register } = useFormContext<DefinitionFormValues>()
  const scheduleType = useWatch({ control, name: 'scheduleType' })
  const countId = useId()

  return (
    <>
      {scheduleType === 'SPECIFIC_DAYS' && (
        <Controller
          control={control}
          name="daysOfWeek"
          render={({ field }) => (
            <div className={shared.chips} role="group" aria-label="수행 요일">
              {WEEKDAYS.map((day) => {
                const on = field.value.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={on}
                    className={cn(shared.chip, styles.dayChip, on && shared.chipOn)}
                    onClick={() =>
                      field.onChange(
                        on ? field.value.filter((d) => d !== day) : [...field.value, day]
                      )
                    }
                  >
                    {WEEKDAY_LABELS[day]}
                  </button>
                )
              })}
            </div>
          )}
        />
      )}

      {scheduleType === 'WEEKLY_COUNT' && (
        <>
          <Controller
            control={control}
            name="weeklyCount"
            render={({ field }) => (
              <div className={shared.chips} role="group" aria-label="주 목표 횟수">
                {Array.from({ length: WEEKLY_COUNT_MAX }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={field.value === n}
                    className={cn(
                      shared.chip,
                      styles.countChip,
                      field.value === n && shared.chipOn
                    )}
                    onClick={() => field.onChange(n)}
                  >
                    {n}회
                  </button>
                ))}
              </div>
            )}
          />
          {/* 주 7회는 매일과 같은 행동인데 스트릭을 세는 단위가 달라진다(주 vs 일) */}
          <p className={styles.hint}>주 7회는 고를 수 없어요 — 그건 매일과 같아요</p>
        </>
      )}

      {scheduleType === 'MONTHLY_COUNT' && (
        <>
          <div className={styles.countRow}>
            <label htmlFor={countId}>한 달에</label>
            <input
              id={countId}
              type="number"
              inputMode="numeric"
              min={1}
              max={MONTHLY_COUNT_MAX}
              className={cn(styles.input, styles.countInput)}
              {...register('monthlyCount')}
            />
            <span>회</span>
          </div>
          {/* 31로 두면 2월에 물리적으로 채울 수 없는 목표가 된다 */}
          <p className={styles.hint}>
            1~{MONTHLY_COUNT_MAX}회. 달마다 날 수가 달라 28일을 기준으로 둡니다
          </p>
          <FieldError name="monthlyCount" />
        </>
      )}

      <p className={styles.hint}>{SCHEDULE_META[scheduleType].hint}</p>
      <FieldError name="daysOfWeek" />
    </>
  )
}

/**
 * 정의 5필드 — 제목 · 카테고리 · 반복 주기. 루틴 시작 폼과 템플릿 수정이 같은 조각을 쓴다.
 * 이 컴포넌트는 값을 구독하지 않는다 — 제목을 칠 때마다 재렌더하면 안 된다 (AGENTS.md §6-1)
 */
const DefinitionFields = () => {
  const { control, register } = useFormContext<DefinitionFormValues>()
  const titleId = useId()
  const categoryLabelId = useId()
  const scheduleLabelId = useId()

  return (
    <>
      <div className={styles.field}>
        <div className={styles.fieldHeader}>
          <label htmlFor={titleId} className={styles.label}>
            루틴 이름
          </label>
          <CharCounter control={control} name="title" max={100} className={styles.counter} />
        </div>
        <input
          id={titleId}
          className={styles.input}
          maxLength={100}
          autoComplete="off"
          placeholder="예: 아침 러닝"
          {...register('title')}
        />
        <FieldError name="title" />
      </div>

      <div className={styles.field}>
        <span id={categoryLabelId} className={styles.label}>
          카테고리
        </span>
        <Controller
          control={control}
          name="categoryCode"
          render={({ field }) => (
            <CategoryPicker
              value={field.value}
              onChange={field.onChange}
              labelledBy={categoryLabelId}
            />
          )}
        />
        <FieldError name="categoryCode" />
      </div>

      <div className={styles.field}>
        <span id={scheduleLabelId} className={styles.label}>
          반복 주기
          <Tooltip content={SCHEDULE_TOOLTIP} label="주기마다 무엇이 다른가요" />
        </span>
        <Controller
          control={control}
          name="scheduleType"
          render={({ field }) => (
            <div className={shared.chips} role="group" aria-labelledby={scheduleLabelId}>
              {SCHEDULE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={field.value === type}
                  className={cn(shared.chip, field.value === type && shared.chipOn)}
                  onClick={() => field.onChange(type)}
                >
                  {SCHEDULE_META[type].label}
                </button>
              ))}
            </div>
          )}
        />
        <ScheduleDetail />
      </div>
    </>
  )
}

export default DefinitionFields
