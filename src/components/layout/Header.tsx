import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { RoutinelyWordmark } from '@/components/common/Logo'
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

export default function Header() {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const notificationCount = 0

  const isActive = (path: string): boolean => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const initial = user?.nickname?.[0] ?? '?'

  return (
    <header className={styles.appHeader}>
      <Link to="/" aria-label="홈으로" className={styles.brand}>
        <RoutinelyWordmark size={24} />
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
          {notificationCount > 0 && (
            <span className={styles.badge}>{notificationCount}</span>
          )}
        </Link>

        <Link to="/profile" aria-label="프로필" className={styles.profile}>
          {initial}
        </Link>
      </div>
    </header>
  )
}
