import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMyProfile } from '@/api/user'
import { networkError } from '@/test/axiosError'
import type { MyProfile } from '@/types/user'
import { COMPOSITION_END_GRACE_MS } from '@/utils/ime'
import ProfilePage from './ProfilePage'

vi.mock('@/api/user', () => ({
  getMyProfile: vi.fn(),
  updateProfile: vi.fn(),
  uploadProfileImage: vi.fn(),
  deleteProfileImage: vi.fn(),
}))

const mockedGetMyProfile = vi.mocked(getMyProfile)

const PROFILE: MyProfile = {
  userId: 1,
  email: 'me@example.com',
  nickname: '루티',
  bio: null,
  profileImageUrl: null,
  createdAt: '2026-10-01T00:00:00',
  nicknameChangeableAt: null,
}

const renderProfile = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
    </QueryClientProvider>
  )
  return queryClient
}

const openModal = async () => {
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: /프로필 수정/ }))
  await screen.findByRole('dialog')
  return user
}

describe('ProfilePage', () => {
  beforeEach(() => {
    mockedGetMyProfile.mockReset()
  })

  it('처음 불러오기에 실패하면 에러 화면을 보여준다', async () => {
    mockedGetMyProfile.mockRejectedValue(networkError())
    renderProfile()

    expect(await screen.findByText('프로필을 불러오지 못했습니다.')).toBeInTheDocument()
  })

  it('수정 중 배경 refetch가 실패해도 모달과 입력값이 남는다', async () => {
    mockedGetMyProfile.mockResolvedValue(PROFILE)
    const queryClient = renderProfile()
    const user = await openModal()

    await user.type(screen.getByLabelText('한 줄 소개'), '아침형 인간')

    // 이미지 업로드 뒤 invalidate · 창 포커스 refetch가 실패한 상황 — v5는 data를 둔 채 isError가 된다
    mockedGetMyProfile.mockRejectedValue(networkError())
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: ['myProfile'] })
      // React Query는 구독자 알림을 다음 틱으로 미룬다 — 재렌더까지 기다린다
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(queryClient.getQueryState(['myProfile'])?.status).toBe('error')

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('한 줄 소개')).toHaveValue('아침형 인간')
  })
})

describe('EditProfileModal — Escape', () => {
  beforeEach(() => {
    mockedGetMyProfile.mockReset()
    mockedGetMyProfile.mockResolvedValue(PROFILE)
  })

  it('조합 중이 아닌 Escape는 모달을 닫는다', async () => {
    renderProfile()
    await openModal()

    fireEvent.keyDown(screen.getByLabelText('닉네임'), { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('조합 중 Escape(Chrome — isComposing)는 모달을 닫지 않는다', async () => {
    renderProfile()
    await openModal()

    fireEvent.keyDown(screen.getByLabelText('닉네임'), { key: 'Escape', isComposing: true })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('조합 직후 Escape(Safari — keyCode 229)는 모달을 닫지 않는다', async () => {
    renderProfile()
    await openModal()

    fireEvent.keyDown(screen.getByLabelText('닉네임'), { key: 'Escape', keyCode: 229 })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  // macOS Chrome 실측 — Esc 한 번에 keydown(229, isComposing) → compositionend → keyup →
  // keydown(27, isComposing 아님) → keyup. 조합을 확정한 키를 일반 키로 한 번 더 보낸다
  const pressEscapeWhileComposing = (el: HTMLElement) => {
    fireEvent.compositionStart(el)
    fireEvent.compositionUpdate(el, { data: '기' })
    fireEvent.keyDown(el, { key: 'Escape', keyCode: 229, isComposing: true })
    fireEvent.compositionEnd(el, { data: '기' })
    fireEvent.keyUp(el, { key: 'Escape', keyCode: 27 })
    fireEvent.keyDown(el, { key: 'Escape', keyCode: 27 })
    fireEvent.keyUp(el, { key: 'Escape', keyCode: 27 })
  }

  it('조합을 확정한 Escape를 다시 보내도(Chrome — macOS) 모달을 닫지 않는다', async () => {
    renderProfile()
    await openModal()

    pressEscapeWhileComposing(screen.getByLabelText('한 줄 소개'))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('조합이 끝나고 잠시 뒤 누른 Escape는 모달을 닫는다', async () => {
    renderProfile()
    await openModal()
    const bio = screen.getByLabelText('한 줄 소개')

    pressEscapeWhileComposing(bio)
    await act(() => new Promise((resolve) => setTimeout(resolve, COMPOSITION_END_GRACE_MS + 50)))
    fireEvent.keyDown(bio, { key: 'Escape', keyCode: 27 })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
