import { useEffect, useRef, useState } from 'react'
import { useUpdateProfile } from '@/hooks/useProfile'
import type { MyProfile } from '@/types/user'
import styles from './EditProfileModal.module.css'

interface Props {
  profile: MyProfile
  onClose: () => void
}

function nicknameRemainingDays(nicknameChangeableAt: string | null): number | null {
  if (!nicknameChangeableAt) return null
  const changeableAt = new Date(nicknameChangeableAt)
  if (changeableAt <= new Date()) return null
  const diffMs = changeableAt.getTime() - Date.now()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export default function EditProfileModal({ profile, onClose }: Props) {
  const [nickname, setNickname] = useState(profile.nickname)
  const [bio, setBio] = useState(profile.bio ?? '')
  const dialogRef = useRef<HTMLDivElement>(null)

  const { mutate, isPending, error } = useUpdateProfile()

  const remainingDays = nicknameRemainingDays(profile.nicknameChangeableAt)
  const isNicknameLocked = remainingDays !== null
  const nicknameChanged = nickname.trim() !== profile.nickname

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isPending) return
    if (nicknameChanged && isNicknameLocked) return
    mutate(
      { nickname: nickname.trim(), bio: bio.trim() || null },
      { onSuccess: onClose },
    )
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
      >
        <div className={styles.header}>
          <h3 id="edit-profile-title" className={styles.headerTitle}>프로필 수정</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            {/* Avatar preview */}
            <div className={styles.avatarRow}>
              <div className={styles.avatarPreview}>{profile.nickname[0]}</div>
              <div>
                <div className={styles.avatarLabel}>프로필 사진</div>
                <div className={styles.avatarNote}>이미지 업로드는 추후 지원 예정입니다</div>
              </div>
            </div>

            {/* Nickname */}
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
                className={styles.input}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                disabled={isNicknameLocked}
                autoComplete="off"
              />
              {isNicknameLocked && (
                <span className={styles.cooldownMsg}>현재 닉네임 변경이 제한된 기간입니다</span>
              )}
            </div>

            {/* Bio */}
            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <label htmlFor="edit-bio" className={styles.label}>한 줄 소개</label>
                <span className={styles.counter}>{bio.length}/100</span>
              </div>
              <textarea
                id="edit-bio"
                className={styles.textarea}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={100}
                rows={2}
              />
            </div>

            {error && (
              <p className={styles.errorMsg}>저장 중 오류가 발생했습니다. 다시 시도해주세요.</p>
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isPending || (nicknameChanged && isNicknameLocked)}
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
