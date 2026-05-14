import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  applyValidationFieldErrors,
  getApiErrorPayload,
  type ValidationFieldErrors,
} from '@/components/auth/authFormErrors'
import { useUpdateProfile } from '@/hooks/useProfile'
import type { MyProfile } from '@/types/user'
import { editProfileSchema, type EditProfileFormValues } from './editProfileSchema'
import styles from './EditProfileModal.module.css'

interface Props {
  profile: MyProfile
  onClose: () => void
  onSaved: (message: string) => void
}

function nicknameRemainingDays(nicknameChangeableAt: string | null): number | null {
  if (!nicknameChangeableAt) return null
  const changeableAt = new Date(nicknameChangeableAt)
  if (changeableAt <= new Date()) return null
  const diffMs = changeableAt.getTime() - Date.now()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

const DEFAULT_SAVE_ERROR_MESSAGE = '저장 중 오류가 발생했습니다. 다시 시도해주세요.'

export default function EditProfileModal({ profile, onClose, onSaved }: Props) {
  const { mutateAsync, isPending } = useUpdateProfile()
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      nickname: profile.nickname,
      bio: profile.bio ?? '',
    },
  })

  const nickname = watch('nickname') ?? profile.nickname
  const bio = watch('bio') ?? profile.bio ?? ''

  const remainingDays = nicknameRemainingDays(profile.nicknameChangeableAt)
  const isNicknameLocked = remainingDays !== null
  const nicknameChanged = nickname.trim() !== profile.nickname
  const bioChanged = bio.trim() !== (profile.bio ?? '')
  const hasChanges = nicknameChanged || bioChanged

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const onSubmit = async (values: EditProfileFormValues) => {
    clearErrors('root')

    if (!hasChanges) {
      return
    }

    if (nicknameChanged && isNicknameLocked) {
      setError('nickname', { message: '현재 닉네임 변경이 제한된 기간입니다.' })
      return
    }

    try {
      await mutateAsync({
        nickname: isNicknameLocked ? profile.nickname : values.nickname.trim(),
        bio: values.bio.trim() || null,
      })
      onSaved('프로필이 저장되었어요.')
      onClose()
    } catch (err) {
      const apiError = getApiErrorPayload<ValidationFieldErrors>(err)

      if (!apiError) {
        const message = err instanceof Error ? err.message : DEFAULT_SAVE_ERROR_MESSAGE
        setError('root', { message })
        return
      }

      if (apiError.errorCode === 'VALIDATION_FAILED') {
        const fieldErrors = apiError.data ?? {}
        applyValidationFieldErrors(setError, fieldErrors)

        if (Object.keys(fieldErrors).length === 0) {
          setError('root', { message: apiError.message ?? DEFAULT_SAVE_ERROR_MESSAGE })
        }
        return
      }

      setError('root', { message: apiError.message ?? DEFAULT_SAVE_ERROR_MESSAGE })
    }
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
        <div className={styles.header}>
          <h3 id="edit-profile-title" className={styles.headerTitle}>프로필 수정</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.body}>
            <div className={styles.avatarRow}>
              <div className={styles.avatarPreview}>{nickname.trim()[0] ?? profile.nickname[0] ?? '?'}</div>
              <div>
                <div className={styles.avatarLabel}>프로필 사진</div>
                <div className={styles.avatarNote}>이미지 업로드는 추후 지원 예정입니다</div>
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <label htmlFor="edit-nickname" className={styles.label}>닉네임</label>
                {isNicknameLocked ? (
                  <span className={styles.cooldownBadge}>{remainingDays}일 후 변경 가능</span>
                ) : (
                  <span className={styles.hintText}>30일에 한 번 변경 가능</span>
                )}
              </div>
              <input
                id="edit-nickname"
                className={`${styles.input} ${errors.nickname ? styles.inputError : ''}`}
                maxLength={20}
                readOnly={isNicknameLocked}
                aria-readonly={isNicknameLocked}
                autoComplete="off"
                {...register('nickname')}
              />
              {errors.nickname && <span className={styles.fieldError}>{errors.nickname.message}</span>}
              {isNicknameLocked && (
                <span className={styles.cooldownMsg}>현재 닉네임 변경이 제한된 기간입니다</span>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <label htmlFor="edit-bio" className={styles.label}>한 줄 소개</label>
                <span className={styles.counter}>{bio.length}/100</span>
              </div>
              <textarea
                id="edit-bio"
                className={`${styles.textarea} ${errors.bio ? styles.textareaError : ''}`}
                maxLength={100}
                rows={2}
                {...register('bio')}
              />
              {errors.bio && <span className={styles.fieldError}>{errors.bio.message}</span>}
            </div>

            {errors.root && <p className={styles.errorMsg}>{errors.root.message}</p>}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isPending || !hasChanges || (nicknameChanged && isNicknameLocked)}
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
