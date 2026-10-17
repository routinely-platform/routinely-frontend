import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { postLogin } from '@/api/auth'
import { apiError, networkError } from '@/test/axiosError'
import LoginPage from './LoginPage'

vi.mock('@/api/auth', () => ({ postLogin: vi.fn() }))

const mockedPostLogin = vi.mocked(postLogin)

const INVALID_CREDENTIALS = '이메일 또는 비밀번호가 올바르지 않습니다.'
const SERVER_ERROR = '일시적인 서버 문제로 요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.'

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>홈 화면</div>} />
      </Routes>
    </MemoryRouter>,
  )

const submitLogin = async (email = 'me@example.com', password = 'secret123') => {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('이메일 주소'), email)
  await user.type(screen.getByLabelText('비밀번호'), password)
  await user.click(screen.getByRole('button', { name: '로그인 →' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockedPostLogin.mockReset()
  })

  it('입력마다 시각 라벨이 있다', () => {
    renderLogin()

    expect(screen.getByLabelText('이메일 주소')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('autocomplete', 'current-password')
  })

  it('지어낸 숫자 대신 제품 미리보기를 보여준다', () => {
    renderLogin()

    expect(screen.queryByText(/2,341/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Day 21/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/21일째/)).not.toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: '로그인 후 오늘 화면 미리보기' }),
    ).toBeInTheDocument()
  })

  it('INVALID_CREDENTIALS면 고정 문구를 띄우고 비밀번호만 비운다', async () => {
    mockedPostLogin.mockRejectedValue(
      apiError(401, {
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        message: '존재하지 않는 회원입니다.',
      }),
    )
    renderLogin()

    await submitLogin()

    expect(await screen.findByRole('alert')).toHaveTextContent(INVALID_CREDENTIALS)
    expect(screen.queryByText('존재하지 않는 회원입니다.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('이메일 주소')).toHaveValue('me@example.com')
    expect(screen.getByLabelText('비밀번호')).toHaveValue('')
  })

  it('네트워크 오류면 고정 문구를 띄우고 입력을 그대로 둔다', async () => {
    mockedPostLogin.mockRejectedValue(networkError())
    renderLogin()

    await submitLogin()

    expect(await screen.findByRole('alert')).toHaveTextContent(SERVER_ERROR)
    expect(screen.queryByText('Network Error')).not.toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toHaveValue('secret123')
  })

  it('그 외 서버 오류는 서버 문구 대신 고정 문구를 띄운다', async () => {
    mockedPostLogin.mockRejectedValue(
      apiError(500, { success: false, errorCode: 'INTERNAL_ERROR', message: 'DB connection lost' }),
    )
    renderLogin()

    await submitLogin()

    expect(await screen.findByRole('alert')).toHaveTextContent(SERVER_ERROR)
    expect(screen.queryByText('DB connection lost')).not.toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toHaveValue('secret123')
  })

  it('VALIDATION_FAILED면 해당 필드 아래에 표시하고 비밀번호를 비우지 않는다', async () => {
    mockedPostLogin.mockRejectedValue(
      apiError(400, {
        success: false,
        errorCode: 'VALIDATION_FAILED',
        message: '입력값 오류',
        data: { password: '비밀번호 형식이 올바르지 않습니다.' },
      }),
    )
    renderLogin()

    await submitLogin()

    expect(await screen.findByText('비밀번호 형식이 올바르지 않습니다.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toHaveValue('secret123')
  })

  it('성공하면 홈으로 이동한다', async () => {
    mockedPostLogin.mockResolvedValue({
      accessToken: 'token',
      user: { userId: 1, email: 'me@example.com', nickname: '나', profileImageUrl: null },
    })
    renderLogin()

    await submitLogin()

    expect(await screen.findByText('홈 화면')).toBeInTheDocument()
  })
})
