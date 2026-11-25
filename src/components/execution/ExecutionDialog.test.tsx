import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { completeExecution } from '@/api/execution'
import { apiError } from '@/test/axiosError'
import type { Routine } from '@/types/routine'
import { COMPOSITION_END_GRACE_MS } from '@/utils/ime'
import ExecutionDialog from './ExecutionDialog'
import { MAX_EXECUTION_PHOTO_BYTES, PHOTO_MESSAGES } from './executionPhoto'

vi.mock('@/api/execution', () => ({
  getExecutions: vi.fn(),
  completeExecution: vi.fn(),
  cancelExecution: vi.fn(),
}))

const mockedComplete = vi.mocked(completeExecution)

const TODAY = '2026-11-08' // 일요일

const routine = (overrides: Partial<Routine> = {}): Routine => ({
  routineId: 1,
  routineTemplateId: null,
  title: '아침 러닝',
  challengeId: null,
  startedAt: '2026-10-01',
  endedAt: null,
  isActive: true,
  categoryCode: 'EXERCISE',
  scheduleType: 'DAILY',
  daysOfWeek: null,
  targetCount: null,
  ...overrides,
})

const photoOf = (type: string, size = 1024, name = 'a.png') => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

const DONE = {
  executionId: 10,
  routineId: 1,
  scheduledDate: '2026-11-06',
  status: 'COMPLETED' as const,
  completedAt: '2026-11-08T09:00:00',
  photoUrl: null,
  feedCardId: 20,
}

let onClose: ReturnType<typeof vi.fn<() => void>>

const renderDialog = (props: { date?: string; routine?: Routine } = {}) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const view = render(
    <QueryClientProvider client={client}>
      <ExecutionDialog
        routine={props.routine ?? routine()}
        date={props.date ?? '2026-11-06'}
        today={TODAY}
        onClose={onClose}
      />
    </QueryClientProvider>
  )
  // accept를 무시해야 gif 같은 파일을 고른 상황을 만들 수 있다 — 파일 창의 accept는 우회할 수 있다
  return { ...view, user: userEvent.setup({ applyAccept: false }) }
}

const photoInput = () => screen.getByLabelText<HTMLInputElement>('사진')

describe('ExecutionDialog — 인증 모달', () => {
  let created: string[]
  let revoked: string[]

  beforeEach(() => {
    onClose = vi.fn<() => void>()
    mockedComplete.mockReset()
    mockedComplete.mockResolvedValue(DONE)
    created = []
    revoked = []
    // jsdom에는 object URL이 없다 — 만든 것과 지운 것을 센다
    let seq = 0
    URL.createObjectURL = vi.fn(() => {
      const url = `blob:test/${++seq}`
      created.push(url)
      return url
    })
    URL.revokeObjectURL = vi.fn((url: string) => {
      revoked.push(url)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('대상 날짜', () => {
    it('백필 — 날짜 배지와 "오늘이 아니라 … 저장돼요" 경고', () => {
      renderDialog()
      expect(screen.getByRole('dialog', { name: '아침 러닝' })).toBeInTheDocument()
      expect(screen.getByText('11월 6일(금) 인증')).toBeInTheDocument()
      expect(
        screen.getByText(/오늘이 아니라 11월 6일\(금\)의 인증으로 저장돼요/)
      ).toBeInTheDocument()
      // 개인 루틴에는 창이 없다
      expect(screen.queryByText(/지난 3일까지만/)).not.toBeInTheDocument()
    })

    it('챌린지 루틴 백필 — 3일 창 문구를 붙인다', () => {
      renderDialog({ routine: routine({ challengeId: 5 }) })
      expect(screen.getByText(/챌린지 루틴은 지난 3일까지만 채울 수 있어요/)).toBeInTheDocument()
    })

    it('오늘 — 경고 없이 "오늘 · 날짜"', () => {
      renderDialog({ date: TODAY })
      expect(screen.getByText('오늘 · 11월 8일(일)')).toBeInTheDocument()
      expect(screen.queryByText(/오늘이 아니라/)).not.toBeInTheDocument()
    })
  })

  describe('사진 — 클라이언트 검증', () => {
    it.each([
      ['image/jpeg', 'a.jpg'],
      ['image/png', 'a.png'],
      ['image/webp', 'a.webp'],
    ])('%s — 미리보기가 뜨고 안내가 "사진과 함께 기록돼요"로 바뀐다', async (type, name) => {
      const { user } = renderDialog()
      expect(screen.getByText('사진 없이 기록돼요')).toBeInTheDocument()

      await user.upload(photoInput(), photoOf(type, 1024, name))

      expect(screen.getByRole('img', { name: '고른 사진 미리보기' })).toHaveAttribute(
        'src',
        'blob:test/1'
      )
      expect(screen.getByText('사진과 함께 기록돼요')).toBeInTheDocument()
    })

    it.each([
      ['gif', photoOf('image/gif'), PHOTO_MESSAGES.type],
      ['MIME 없음(HEIC 등)', photoOf(''), PHOTO_MESSAGES.type],
      ['5MB + 1바이트', photoOf('image/png', MAX_EXECUTION_PHOTO_BYTES + 1), PHOTO_MESSAGES.size],
      ['0바이트', photoOf('image/png', 0), PHOTO_MESSAGES.empty],
    ])('%s — 사진 옆에 문구, 미리보기 · 전송 없음', async (_, file, message) => {
      const { user } = renderDialog()

      await user.upload(photoInput(), file)

      expect(screen.getByRole('alert')).toHaveTextContent(message)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
      expect(URL.createObjectURL).not.toHaveBeenCalled()

      await user.click(screen.getByRole('button', { name: '인증 완료' }))
      expect(mockedComplete).toHaveBeenCalledWith(1, '2026-11-06', { photo: null, memo: '' })
    })

    it('정확히 5MB는 받는다', async () => {
      const { user } = renderDialog()
      await user.upload(photoInput(), photoOf('image/png', MAX_EXECUTION_PHOTO_BYTES))
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.getByRole('img', { name: '고른 사진 미리보기' })).toBeInTheDocument()
    })

    it('거부한 파일은 이미 고른 사진을 지우지 않는다', async () => {
      const { user } = renderDialog()
      const good = photoOf('image/png', 1024, 'good.png')
      await user.upload(photoInput(), good)
      await user.upload(photoInput(), photoOf('image/gif'))

      expect(screen.getByRole('alert')).toHaveTextContent(PHOTO_MESSAGES.type)
      await user.click(screen.getByRole('button', { name: '인증 완료' }))
      expect(mockedComplete).toHaveBeenCalledWith(1, '2026-11-06', { photo: good, memo: '' })
    })

    it('고른 사진을 함께 보낸다', async () => {
      const { user } = renderDialog()
      const file = photoOf('image/webp', 2048, 'run.webp')
      await user.upload(photoInput(), file)
      await user.click(screen.getByRole('button', { name: '인증 완료' }))
      expect(mockedComplete).toHaveBeenCalledWith(1, '2026-11-06', { photo: file, memo: '' })
    })
  })

  describe('사진 — object URL 해제 (D8)', () => {
    it('바꾸기 · 빼기 · 닫기마다 이전 URL을 지운다 — 만든 수와 지운 수가 같다', async () => {
      const { user, unmount } = renderDialog()

      await user.upload(photoInput(), photoOf('image/png', 1024, 'a.png'))
      await user.upload(photoInput(), photoOf('image/png', 1024, 'b.png'))
      // 바꾸면 첫 URL이 지워진다
      expect(revoked).toEqual(['blob:test/1'])

      await user.click(screen.getByRole('button', { name: '사진 빼기' }))
      expect(revoked).toEqual(['blob:test/1', 'blob:test/2'])
      expect(screen.getByText('사진 없이 기록돼요')).toBeInTheDocument()

      await user.upload(photoInput(), photoOf('image/png', 1024, 'c.png'))
      unmount()

      expect(created).toHaveLength(3)
      expect(revoked).toEqual(created)
    })
  })

  describe('사진 빼기 — 포커스 (D15)', () => {
    it('[사진 빼기]가 사라지면 포커스는 새로 나타난 [사진 올리기]로', async () => {
      const { user } = renderDialog()
      await user.upload(photoInput(), photoOf('image/png'))

      await user.click(screen.getByRole('button', { name: '사진 빼기' }))

      expect(screen.getByRole('button', { name: /사진 올리기/ })).toHaveFocus()
    })

    it('처음 열 때는 [사진 올리기]가 포커스를 가져가지 않는다', () => {
      renderDialog()
      expect(screen.getByRole('button', { name: /사진 올리기/ })).not.toHaveFocus()
    })
  })

  describe('메모', () => {
    it('500자에서 막는다(maxLength) · 글자 수를 보여 준다 · 그대로 보낸다', async () => {
      const { user } = renderDialog()
      const memo = screen.getByLabelText(/메모/)
      expect(memo).toHaveAttribute('maxLength', '500')

      await user.type(memo, '좋았다')
      expect(screen.getByText('3/500')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: '인증 완료' }))
      expect(mockedComplete).toHaveBeenCalledWith(1, '2026-11-06', { photo: null, memo: '좋았다' })
    })

    /**
     * Safari 실측(2026-11-26) — textarea에서 조합 이벤트가 없다.
     * "기" 입력 뒤 Esc 한 번: insertReplacementText("기") 확정 → 1~2ms 뒤 keydown(27, isComposing: false)
     */
    const typeGiThenEscapeInSafari = (memo: HTMLElement) => {
      const input = (inputType: string, data: string) => {
        fireEvent.change(memo, { target: { value: data } })
        memo.dispatchEvent(new InputEvent('input', { bubbles: true, inputType, data }))
      }
      input('insertText', 'ㄱ')
      fireEvent.keyDown(memo, { key: 'ㄱ', keyCode: 229 })
      input('insertReplacementText', '기')
      fireEvent.keyDown(memo, { key: 'ㅣ', keyCode: 229 })
      // Esc — IME가 먼저 확정하고 일반 Esc가 온다
      input('insertReplacementText', '기')
      fireEvent.keyDown(memo, { key: 'Escape', keyCode: 27 })
    }

    it('Safari — 한글을 쓰다 Esc를 한 번 누르면 조합만 확정되고 모달은 닫히지 않는다 (D16)', () => {
      renderDialog()
      const memo = screen.getByLabelText(/메모/)

      typeGiThenEscapeInSafari(memo)

      expect(onClose).not.toHaveBeenCalled()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('Safari — 확정하고 잠시 뒤 누른 Esc는 모달을 닫는다', async () => {
      renderDialog()
      const memo = screen.getByLabelText(/메모/)

      typeGiThenEscapeInSafari(memo)
      await act(() => new Promise((resolve) => setTimeout(resolve, COMPOSITION_END_GRACE_MS + 50)))
      fireEvent.keyDown(memo, { key: 'Escape', keyCode: 27 })

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('저장 중', () => {
    it('× · Esc · 취소로 닫히지 않고, 입력도 잠긴다', async () => {
      mockedComplete.mockReturnValue(new Promise(() => {}))
      const { user } = renderDialog()

      await user.click(screen.getByRole('button', { name: '인증 완료' }))

      expect(screen.getByRole('button', { name: '인증하는 중...' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '닫기' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '취소' })).toBeDisabled()
      expect(screen.getByLabelText(/메모/)).toHaveAttribute('readOnly')
      expect(photoInput()).toBeDisabled()

      fireEvent.keyDown(document, { key: 'Escape' })
      await user.click(screen.getByRole('button', { name: '닫기' }))
      expect(onClose).not.toHaveBeenCalled()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('완료 → 성공 단계 (D6)', () => {
    it('백필 — "지난 날짜를 채웠어요", 닫기에 포커스, 바깥을 눌러도 닫힌다', async () => {
      const { user } = renderDialog()
      await user.click(screen.getByRole('button', { name: '인증 완료' }))

      const dialog = await screen.findByRole('dialog', { name: '지난 날짜를 채웠어요' })
      expect(dialog).toHaveTextContent('아침 러닝 · 11월 6일(금)')
      // 머리말 ×와 버튼 줄 [닫기] — 버튼 줄 쪽이 포커스를 받는다
      const closeButtons = screen.getAllByRole('button', { name: '닫기' })
      expect(closeButtons).toHaveLength(2)
      expect(closeButtons[1]).toHaveFocus()
      // 피드 카드는 서버가 만든다 — 성공 화면에서 알린다 (D15)
      expect(dialog).toHaveTextContent('피드에 카드가 만들어졌어요.')
      // 스트릭 · 피드 버튼은 서버 값 · 화면이 없어 두지 않는다 (D4)
      expect(screen.queryByText(/스트릭|피드에서 보기/)).not.toBeInTheDocument()

      await user.click(dialog.parentElement!)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('오늘 — "오늘도 해냈어요!"', async () => {
      const { user } = renderDialog({ date: TODAY })
      await user.click(screen.getByRole('button', { name: '인증 완료' }))
      expect(await screen.findByRole('dialog', { name: '오늘도 해냈어요!' })).toBeInTheDocument()
    })

    it('입력 단계에서는 바깥을 눌러도 닫히지 않는다', async () => {
      const { user } = renderDialog()
      await user.click(screen.getByRole('dialog').parentElement!)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('서버 오류', () => {
    it('버튼 줄 위에 매핑한 문구 — 모달은 열린 채, 다시 누르면 다시 보낸다', async () => {
      mockedComplete.mockRejectedValueOnce(
        apiError(400, { success: false, errorCode: 'UNSUPPORTED_IMAGE_TYPE', message: 'x' })
      )
      const { user } = renderDialog()
      await user.upload(photoInput(), photoOf('image/png'))
      await user.click(screen.getByRole('button', { name: '인증 완료' }))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        '이 형식은 올릴 수 없어요 — 사진 파일이 맞는지 확인해 주세요'
      )
      expect(onClose).not.toHaveBeenCalled()

      // 다른 사진을 고르면 서버 오류를 지운다 — 새 사진으로 다시 보낼 수 있다
      await user.upload(photoInput(), photoOf('image/jpeg', 1024, 'b.jpg'))
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: '인증 완료' }))
      expect(
        await screen.findByRole('dialog', { name: '지난 날짜를 채웠어요' })
      ).toBeInTheDocument()
      expect(mockedComplete).toHaveBeenCalledTimes(2)
    })

    it('VALIDATION_FAILED — 서버 문구 그대로', async () => {
      mockedComplete.mockRejectedValueOnce(
        apiError(400, {
          success: false,
          errorCode: 'VALIDATION_FAILED',
          message: '중단한 루틴은 완료할 수 없습니다.',
        })
      )
      const { user } = renderDialog()
      await user.click(screen.getByRole('button', { name: '인증 완료' }))
      expect(await screen.findByRole('alert')).toHaveTextContent(
        '중단한 루틴은 완료할 수 없습니다.'
      )
    })
  })
})
