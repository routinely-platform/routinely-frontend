import { useId, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import CharCounter from '@/components/common/CharCounter'
import Dialog from '@/components/common/Dialog'
import formStyles from '@/components/routine/RoutineForm.module.css'
import shared from '@/components/routine/routine.module.css'
import { useCompleteExecution } from '@/hooks/useExecutions'
import type { Routine } from '@/types/routine'
import { formatDateWithWeekday } from '@/utils/calendar'
import { cn } from '@/utils/cn'
import { executionErrorCode, executionErrorMessage, PHOTO_ERROR_CODES } from './executionErrors'
import { EXECUTION_PHOTO_ACCEPT, validateExecutionPhoto } from './executionPhoto'
import PhotoPreview from './PhotoPreview'
import styles from './execution.module.css'

export const MEMO_MAX_LENGTH = 500

/**
 * 챌린지 루틴 백필 창 — 문구에만 쓴다. 인증할 수 있는지는 서버의 `backfillable`로만 정한다.
 * 백엔드 `routine.challenge.backfill-days`와 같은 값이다
 */
export const CHALLENGE_BACKFILL_DAYS = 3

interface ExecutionDialogProps {
  routine: Routine
  /** 인증할 날짜 YYYY-MM-DD — 오늘이 아니면 백필 */
  date: string
  today: string
  onClose: () => void
  /**
   * 저장이 끝났다 — 부르는 쪽이 이 날짜를 그리는 쿼리마다 `savedAt` 뒤에 새로 받았는지 보고 낡은 버튼을 막는다 (D17)
   */
  onSaved?: (date: string, savedAt: number) => void
}

interface MemoForm {
  memo: string
}

/**
 * 인증 모달 — 오늘 인증과 백필이 같은 모달이다(screens §7). 완료하면 **같은 대화상자 자리에서** 성공 단계로 바뀐다(D6).
 * 대화상자를 새로 열지 않는 이유: 연 자리(누른 달력 칸)는 대화상자가 처음 그려질 때 한 번 잡힌다.
 * 닫고 새로 열면 새 대화상자는 사라지는 모달 안의 버튼을 연 자리로 잡아, 닫은 뒤 포커스가 갈 곳이 없다
 */
const ExecutionDialog = ({ routine, date, today, onClose, onSaved }: ExecutionDialogProps) => {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // [사진 빼기]를 누르면 그 버튼이 사라진다 — 다음에 나타나는 [사진 올리기]로 포커스를 넘긴다 (D15)
  const focusPickerOnMount = useRef(false)
  const memoId = useId()
  const photoErrorId = useId()
  const { register, handleSubmit, control } = useForm<MemoForm>({ defaultValues: { memo: '' } })
  const { mutate, isPending, error, reset } = useCompleteExecution(routine.routineId, date)

  const isBackfill = date !== today
  const dateLabel = formatDateWithWeekday(date, today)
  const isChallenge = routine.challengeId !== null

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // 같은 파일을 다시 골라도 change가 오게 비운다 — 지운 뒤 같은 사진을 다시 고르는 경우
    e.target.value = ''
    if (!file) return
    const message = validateExecutionPhoto(file)
    // 거부한 파일은 상태에 넣지 않는다 — 미리보기도 전송도 되지 않는다. 이전에 고른 사진은 그대로 둔다
    setPhotoError(message)
    if (message === null) {
      setPhoto(file)
      // 사진 오류(서버)가 떠 있었다면 새 사진으로 다시 보낼 수 있게 지운다
      reset()
    }
  }

  const removePhoto = () => {
    focusPickerOnMount.current = true
    setPhoto(null)
    setPhotoError(null)
    // 방금 뺀 사진 때문에 난 서버 오류도 함께 지운다 — 남겨 두면 "사진 없이 기록돼요" 위에 사진 오류가 보인다.
    // 네트워크 오류처럼 사진과 상관없는 오류는 남긴다 (D19)
    const code = executionErrorCode(error)
    if (code && PHOTO_ERROR_CODES.has(code)) reset()
  }

  const onSubmit = handleSubmit(({ memo }) =>
    mutate(
      { photo, memo },
      {
        onSuccess: ({ savedAt }) => {
          // 저장은 성공했다 — 성공 단계는 그대로 보이고, 다시 받지 못한 화면은 부르는 쪽이 막는다
          onSaved?.(date, savedAt)
          setStep('success')
        },
      }
    )
  )

  if (step === 'success') {
    // 같은 <Dialog> 자리 — 위 주석의 이유로 컴포넌트를 바꾸지 않고 props만 바꾼다
    return (
      <Dialog
        title={isBackfill ? '지난 날짜를 채웠어요' : '오늘도 해냈어요!'}
        onClose={onClose}
        // 입력이 없는 창이라 바깥을 눌러 닫아도 잃을 것이 없다
        closeOnBackdrop
        actions={
          <button
            type="button"
            className={cn(shared.btn, shared.btnPrimary, shared.btnSm)}
            onClick={onClose}
            // 방금 누른 [인증 완료]가 사라졌다 — 포커스를 대화상자 안에 붙잡아 둔다
            autoFocus
          >
            닫기
          </button>
        }
      >
        <div className={styles.success}>
          <span className={styles.successEmoji} aria-hidden="true">
            {isBackfill ? '📅' : '🎉'}
          </span>
          <p className={styles.successSub}>
            {routine.title} · {dateLabel}
          </p>
          <p className={styles.successNote}>피드에 카드가 만들어졌어요.</p>
          {/* 스트릭은 서버 값이 없어 그리지 않는다(BE #60) · "피드에서 보기"는 피드 화면(FE #21) 뒤에 켠다 — D4 */}
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog
      title={routine.title}
      onClose={onClose}
      isPending={isPending}
      wide
      // 한 줄 입력이 없어 Enter 제출은 없다(textarea의 Enter는 줄바꿈). 제출은 [인증 완료]로만 한다
      formProps={{ onSubmit, noValidate: true }}
      error={
        error && executionErrorMessage(error, '인증하지 못했어요. 잠시 후 다시 시도해 주세요.')
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
            {isPending ? '인증하는 중...' : '인증 완료'}
          </button>
          {/* 완료 버튼은 하나다 — 사진이 선택이라는 것은 이 한 줄이 말한다 (screens §7) */}
          <p className={styles.submitHint}>
            {photo ? '사진과 함께 기록돼요' : '사진 없이 기록돼요'}
          </p>
        </>
      }
    >
      <p className={styles.meta}>
        {isBackfill ? (
          <>
            <span className={cn(styles.badge, styles.badgeBackfill)}>{dateLabel} 인증</span>
            <span>지난 날짜를 채우는 중이에요</span>
          </>
        ) : (
          <span>오늘 · {dateLabel}</span>
        )}
      </p>

      <div className={styles.stack}>
        {isBackfill && (
          <p className={cn(styles.note, styles.noteWarn)}>
            <b>오늘이 아니라 {dateLabel}의 인증으로 저장돼요.</b>
            {isChallenge &&
              ` 챌린지 루틴은 지난 ${CHALLENGE_BACKFILL_DAYS}일까지만 채울 수 있어요.`}
          </p>
        )}

        <div className={formStyles.field}>
          <span className={formStyles.label}>
            사진 <span className={formStyles.optional}>— 선택</span>
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept={EXECUTION_PHOTO_ACCEPT}
            className={styles.fileInput}
            onChange={handlePhotoChange}
            disabled={isPending}
            aria-label="사진"
            aria-describedby={photoError ? photoErrorId : undefined}
            tabIndex={-1}
          />
          {photo ? (
            <div className={styles.preview}>
              <PhotoPreview file={photo} className={styles.previewImage} />
              <div className={styles.photoActions}>
                <button
                  type="button"
                  className={styles.photoAction}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                >
                  다른 사진 고르기
                </button>
                <button
                  type="button"
                  className={styles.photoAction}
                  onClick={removePhoto}
                  disabled={isPending}
                >
                  사진 빼기
                </button>
              </div>
            </div>
          ) : (
            <button
              ref={(el) => {
                if (el && focusPickerOnMount.current) {
                  focusPickerOnMount.current = false
                  el.focus()
                }
              }}
              type="button"
              className={styles.picker}
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              aria-describedby={photoError ? photoErrorId : undefined}
            >
              <span className={styles.pickerIcon} aria-hidden="true">
                🖼
              </span>
              <span>사진 올리기 · JPG · PNG · WEBP · 5MB</span>
            </button>
          )}
          {photoError && (
            <p className={formStyles.error} id={photoErrorId} role="alert">
              {photoError}
            </p>
          )}
        </div>

        <div className={formStyles.field}>
          <div className={formStyles.fieldHeader}>
            <label className={formStyles.label} htmlFor={memoId}>
              메모 <span className={formStyles.optional}>— 선택</span>
            </label>
            {/* 값 구독은 카운터 안에서 한다 — 이 대화상자가 매 키 재렌더하지 않는다 (AGENTS §6-1) */}
            <CharCounter
              control={control}
              name="memo"
              max={MEMO_MAX_LENGTH}
              className={formStyles.counter}
            />
          </div>
          <textarea
            id={memoId}
            className={cn(formStyles.input, styles.textarea)}
            rows={3}
            placeholder="오늘 어땠나요?"
            // 넘으면 더 입력되지 않는다(screens §7). 붙여넣기가 넘치면 브라우저가 앞 500자만 넣는다 — D10
            maxLength={MEMO_MAX_LENGTH}
            readOnly={isPending}
            {...register('memo')}
          />
        </div>

        <p className={cn(styles.note, styles.noteInfo)}>
          완료하면 <b>피드에 카드가 자동으로 만들어져요.</b> 따로 공유하지 않아도 됩니다.
        </p>
      </div>
    </Dialog>
  )
}

export default ExecutionDialog
