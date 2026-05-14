import { useEffect, useState } from 'react'
import { useMyProfile } from '@/hooks/useProfile'
import EditProfileModal from '@/components/profile/EditProfileModal'
import styles from './ProfilePage.module.css'

// function maskEmail(email: string): string {
//   const atIndex = email.indexOf('@')
//   if (atIndex <= 2) return email
//   return email.slice(0, 2) + '•••' + email.slice(atIndex)
// }

function daysSinceJoined(createdAt: string): number {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
}

function formatJoinDate(createdAt: string): string {
  const d = new Date(createdAt)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useMyProfile()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [successMessage])

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className={styles.loadingWrapper}>
        <p className={styles.errorText}>프로필을 불러오지 못했습니다.</p>
      </div>
    )
  }

  const initial = profile.nickname[0]
  const days = daysSinceJoined(profile.createdAt)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeading}>
          <h1 className={styles.pageTitle}>마이페이지</h1>
          <p className={styles.pageSubtitle}>프로필 정보를 관리하세요</p>
        </div>

        {successMessage && <div className={styles.successBanner}>{successMessage}</div>}

        <div className={styles.card}>
          <div className={styles.halo} aria-hidden="true" />
          <div className={styles.cardBody}>
            <div className={styles.avatar}>{initial}</div>

            <div className={styles.info}>
              <div className={styles.nameRow}>
                <h2 className={styles.nickname}>{profile.nickname}</h2>
                <span className={styles.daysBadge}>
                  함께한 지 <span className={styles.daysNum}>{days}일째</span>
                </span>
              </div>

              {profile.bio ? (
                <p className={styles.bio}>{profile.bio}</p>
              ) : (
                <p className={styles.bioEmpty}>한 줄 소개를 추가해보세요</p>
              )}

              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <svg className={styles.metaIcon} width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1.5 5.5L8 9.5L14.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{profile.email}</span>
                </div>
                <div className={styles.metaItem}>
                  <svg className={styles.metaIcon} width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1.5 7H14.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M5 1.5V4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M11 1.5V4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <span>{formatJoinDate(profile.createdAt)} 가입</span>
                </div>
              </div>
            </div>

            <button type="button" className={styles.editBtn} onClick={() => setIsModalOpen(true)}>
              ✎ 프로필 수정
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsModalOpen(false)}
          onSaved={setSuccessMessage}
        />
      )}
    </div>
  )
}
