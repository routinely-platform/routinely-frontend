import { useState } from 'react'
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

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '3px solid var(--border-strong)',
            borderTopColor: 'var(--coral-500)',
            animation: 'spin 0.7s linear infinite',
          }}
        />
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
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.pageHeading}>
            <h1 className={styles.pageTitle}>마이페이지</h1>
            <p className={styles.pageSubtitle}>프로필 정보를 관리하세요</p>
          </div>

          <div className={styles.card}>
            <div className={styles.halo} aria-hidden="true" />
            <div className={styles.cardBody}>
              <div className={styles.avatar}>{initial}</div>

              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <h2 className={styles.nickname}>{profile.nickname}</h2>
                  <span className={styles.daysTag}>
                    · 함께한 지 <span className={styles.daysNum}>{days}일째</span>
                  </span>
                </div>

                {profile.bio ? (
                  <p className={styles.bio}>{profile.bio}</p>
                ) : (
                  <p className={styles.bioEmpty}>한 줄 소개를 추가해보세요</p>
                )}

                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <span>✉</span>
                    <span>{profile.email}</span>
                  </span>
                  <span className={styles.metaDot} />
                  <span className={styles.metaItem}>
                    <span>📅</span>
                    <span>{formatJoinDate(profile.createdAt)} 가입</span>
                  </span>
                </div>
              </div>

              <button type="button" className={styles.editBtn} onClick={() => setIsModalOpen(true)}>
                ✎ 프로필 수정
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && <EditProfileModal profile={profile} onClose={() => setIsModalOpen(false)} />}
    </>
  )
}
