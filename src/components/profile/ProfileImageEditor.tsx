import { useEffect, useRef, useState } from 'react'

import { useDeleteProfileImage, useUploadProfileImage } from '@/hooks/useProfile'
import type { MyProfile } from '@/types/user'
import {
  ALLOWED_PROFILE_IMAGE_TYPES,
  resolveProfileImageErrorMessage,
  validateProfileImageFile,
} from './profileImage'
import styles from './ProfileImageEditor.module.css'

interface Props {
  profile: MyProfile
}

export default function ProfileImageEditor({ profile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [stagedFile, setStagedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const upload = useUploadProfileImage()
  const remove = useDeleteProfileImage()
  const isBusy = upload.isPending || remove.isPending

  // objectURL 생성/해제를 ref 한 곳에서 관리한다.
  // 새 URL 을 만들기 전 항상 이전 URL 을 해제하므로 중복 revoke 가 발생하지 않는다.
  const setPreview = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    const url = file ? URL.createObjectURL(file) : null
    previewUrlRef.current = url
    setPreviewUrl(url)
  }

  // 언마운트 시 남아있는 objectURL 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const initial = profile.nickname[0] ?? '?'
  const displayImageUrl = previewUrl ?? profile.profileImageUrl
  const hasCurrentImage = Boolean(profile.profileImageUrl)

  const clearStaged = () => {
    setStagedFile(null)
    setPreview(null)
  }

  const handlePickClick = () => {
    setError(null)
    setStatus(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // 같은 파일을 다시 선택해도 onChange가 발생하도록 값 초기화
    e.target.value = ''
    if (!file) {
      return
    }

    const validationError = validateProfileImageFile(file)
    if (validationError) {
      clearStaged()
      setError(validationError)
      return
    }

    setError(null)
    setStatus(null)
    setPreview(file)
    setStagedFile(file)
  }

  const handleUpload = async () => {
    if (!stagedFile) {
      return
    }
    setError(null)
    try {
      await upload.mutateAsync(stagedFile)
      clearStaged()
      setStatus('프로필 이미지가 변경되었습니다.')
    } catch (err) {
      setError(resolveProfileImageErrorMessage(err, '이미지 업로드에 실패했습니다.'))
    }
  }

  const handleDelete = async () => {
    setError(null)
    setStatus(null)
    try {
      await remove.mutateAsync()
      setStatus('프로필 이미지가 삭제되었습니다.')
    } catch (err) {
      setError(resolveProfileImageErrorMessage(err, '이미지 삭제에 실패했습니다.'))
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.avatar}>
          {displayImageUrl ? (
            <img src={displayImageUrl} alt="프로필 이미지 미리보기" className={styles.avatarImage} />
          ) : (
            <span className={styles.avatarInitial}>{initial}</span>
          )}
        </div>

        <div className={styles.controls}>
          <div className={styles.label}>프로필 사진</div>

          {stagedFile ? (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleUpload}
                disabled={isBusy}
              >
                {upload.isPending ? '업로드 중...' : '이 사진으로 변경'}
              </button>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={clearStaged}
                disabled={isBusy}
              >
                취소
              </button>
            </div>
          ) : (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handlePickClick}
                disabled={isBusy}
              >
                {hasCurrentImage ? '사진 변경' : '사진 업로드'}
              </button>
              {hasCurrentImage && (
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={handleDelete}
                  disabled={isBusy}
                >
                  {remove.isPending ? '삭제 중...' : '삭제'}
                </button>
              )}
            </div>
          )}

          <div className={styles.note}>JPEG · PNG · WEBP / 최대 5MB</div>
          {error && <div className={styles.error}>{error}</div>}
          {status && !error && <div className={styles.status}>{status}</div>}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_PROFILE_IMAGE_TYPES.join(',')}
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />
    </div>
  )
}
