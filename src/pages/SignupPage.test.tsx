import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import SignupPage from './SignupPage'

vi.mock('@/api/auth', () => ({ postSignup: vi.fn() }))

describe('SignupPage', () => {
  it('입력마다 시각 라벨이 있다', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText('이메일')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('닉네임')).toHaveAttribute('autocomplete', 'nickname')
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('autocomplete', 'new-password')
  })
})
