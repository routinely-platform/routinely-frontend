import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { postLogout } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { RoutinelyWordmark } from '@/components/common/Logo'
import { clearAuthSessionAndRedirect } from '@/utils/authSession'
import { cn } from '@/utils/cn'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { id: 'home', label: '홈', path: '/', icon: 'home' },
  { id: 'routines', label: '내 루틴', path: '/routines', icon: 'repeat' },
  { id: 'challenges', label: '챌린지', path: '/challenges', icon: 'trophy' },
  { id: 'feed', label: '피드', path: '/feed', icon: 'feed' },
  { id: 'stats', label: '통계', path: '/statistics', icon: 'chart' },
] as const

const ICON_PATHS: Record<string, ReactNode> = {
  home: <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z" />,
  repeat: (
    <>
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v6a4 4 0 01-8 0V4z" />
      <path d="M16 6h3v2a3 3 0 01-3 3M8 6H5v2a3 3 0 003 3" />
      <path d="M9 19h6M10 14v5h4v-5" />
    </>
  ),
  feed: <path d="M4 6h16M4 12h10M4 18h16" />,
  chart: (
    <>
      <path d="M3 21h18" />
      <rect x="5" y="11" width="3" height="8" />
      <rect x="11" y="6" width="3" height="13" />
      <rect x="17" y="14" width="3" height="5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9z" />
      <path d="M10 21a2 2 0 004 0" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  user: (
    <>
      <path d="M12 13a4 4 0 100-8 4 4 0 000 8z" />
      <path d="M5 21a7 7 0 0114 0" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
}

function NavIcon({ name }: { name: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  )
}

function BellIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS.bell}
    </svg>
  )
}

function ProfileMenuIcon({ name }: { name: 'chevronDown' | 'user' | 'logout' }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  )
}

export default function Header() {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationCount = 0

  const isActive = (path: string): boolean => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const initial = user?.nickname?.[0] ?? '?'

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileMenuOpen])

  const handleProfileMenuToggle = () => {
    setIsProfileMenuOpen((prev) => !prev)
  }

  const handleMenuClose = () => {
    setIsProfileMenuOpen(false)
  }

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await postLogout()
    } catch {
      // best-effort: 서버 로그아웃 실패와 무관하게 클라이언트 세션은 종료한다.
    } finally {
      handleMenuClose()
      clearAuthSessionAndRedirect()
      setIsLoggingOut(false)
    }
  }

  return (
    <header className={styles.appHeader}>
      <Link to="/" aria-label="홈으로" className={styles.brand}>
        <RoutinelyWordmark size={26} />
      </Link>

      <nav className={styles.nav} aria-label="주 메뉴">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(styles.navItem, active ? styles.navItemActive : styles.navItemInactive)}
            >
              <div className={styles.navContent}>
                <NavIcon name={item.icon} />
                {item.label}
              </div>
              <div className={cn(styles.navIndicator, active && styles.navIndicatorActive)} />
            </Link>
          )
        })}
      </nav>

      <div className={styles.actions}>
        <Link to="/notifications" aria-label="알림" className={styles.iconLink}>
          <BellIcon />
          {notificationCount > 0 && <span className={styles.badge}>{notificationCount}</span>}
        </Link>

        <div className={styles.profileMenuWrapper} ref={profileMenuRef}>
          <button
            type="button"
            aria-label="프로필 메뉴"
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="menu"
            className={cn(styles.profileTrigger, isProfileMenuOpen && styles.profileTriggerOpen)}
            onClick={handleProfileMenuToggle}
          >
            <span className={styles.profileAvatar}>{initial}</span>
            <span className={styles.profileMenuChevron}>
              <ProfileMenuIcon name="chevronDown" />
            </span>
          </button>

          {isProfileMenuOpen && (
            <div className={styles.profileMenu} role="menu" aria-label="프로필 메뉴">
              <Link
                to="/profile"
                role="menuitem"
                className={styles.profileMenuItem}
                onClick={handleMenuClose}
              >
                <ProfileMenuIcon name="user" />
                <span>마이페이지</span>
              </Link>

              <button
                type="button"
                role="menuitem"
                className={cn(styles.profileMenuItem, styles.profileMenuItemDanger)}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <ProfileMenuIcon name="logout" />
                <span>{isLoggingOut ? '로그아웃 중...' : '로그아웃'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
