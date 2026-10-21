import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import App from './App'

// 세션 복구 요청을 보내지 않고, 로그인된 상태를 직접 만든다
vi.mock('@/hooks/useInitAuth', () => ({ useInitAuth: () => {} }))

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

describe('알림은 v2 — MVP에서는 숨긴다', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isLoading: false,
      isAuthenticated: true,
      accessToken: 'token',
      user: { userId: 1, email: 'me@example.com', nickname: '나', profileImageUrl: null },
    })
  })

  it('앱바에 알림 링크가 없다', () => {
    renderAt('/feed')

    expect(screen.getByRole('navigation', { name: '주 메뉴' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '알림' })).not.toBeInTheDocument()
  })

  it('/notifications로 들어오면 404를 보여준다', () => {
    renderAt('/notifications')

    expect(screen.getByText('ERROR · 404')).toBeInTheDocument()
  })
})
