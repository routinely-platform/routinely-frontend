import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, createEvent, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { getCategories } from '@/api/category'
import {
  createRoutineTemplate,
  getMyRoutines,
  getRoutineTemplates,
  startRoutine,
} from '@/api/routine'
import { apiError } from '@/test/axiosError'
import type { Category, Routine, RoutineTemplate } from '@/types/routine'
import { COMPOSITION_END_GRACE_MS } from '@/utils/ime'
import RoutineNewPage from './RoutineNewPage'

vi.mock('@/api/routine', () => ({
  getMyRoutines: vi.fn(),
  getRoutineTemplates: vi.fn(),
  startRoutine: vi.fn(),
  createRoutineTemplate: vi.fn(),
}))
vi.mock('@/api/category', () => ({ getCategories: vi.fn() }))

const mockedStart = vi.mocked(startRoutine)
const mockedCreateTemplate = vi.mocked(createRoutineTemplate)

const TODAY = '2026-11-04'

const CATEGORIES: Category[] = [
  { code: 'EXERCISE', name: '운동', icon: '🏃', displayOrder: 1 },
  { code: 'READING', name: '독서', icon: '📚', displayOrder: 2 },
]

const TEMPLATE: RoutineTemplate = {
  templateId: 7,
  title: '아침 러닝',
  categoryCode: 'EXERCISE',
  scheduleType: 'WEEKLY_COUNT',
  daysOfWeek: null,
  targetCount: 3,
  challengeId: null,
}

const ONGOING: Routine = {
  routineId: 1,
  routineTemplateId: null,
  title: '자기 전 독서',
  challengeId: null,
  startedAt: '2026-10-01',
  endedAt: null,
  isActive: true,
  categoryCode: 'READING',
  scheduleType: 'DAILY',
  daysOfWeek: null,
  targetCount: null,
}

const LocationProbe = () => {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

let queryClient: QueryClient

const renderPage = (initialEntry = '/routines/new') => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/routines/new" element={<RoutineNewPage />} />
          <Route path="/routines" element={<div>목록 화면</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return userEvent.setup()
}

const titleInput = () => screen.getByLabelText('루틴 이름')
const startInput = () => screen.getByLabelText('시작일')
const endInput = () => screen.getByLabelText(/종료일/)
const setDate = (el: HTMLElement, value: string) => fireEvent.change(el, { target: { value } })

describe('RoutineNewPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(`${TODAY}T03:00:00Z`))
    vi.mocked(getCategories).mockResolvedValue(CATEGORIES)
    vi.mocked(getRoutineTemplates).mockResolvedValue([TEMPLATE])
    vi.mocked(getMyRoutines).mockResolvedValue([ONGOING])
    mockedStart.mockReset()
    mockedCreateTemplate.mockReset()
    mockedStart.mockResolvedValue(ONGOING)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('빈 폼은 출처 배지 없이 열리고, 정의를 직접 보내 시작한다', async () => {
    const user = renderPage()

    await user.type(titleInput(), '물 2L')
    await user.click(await screen.findByRole('button', { name: '🏃 운동' }))
    await user.click(screen.getByRole('button', { name: '요일 지정' }))
    await user.click(screen.getByRole('button', { name: '금' }))
    await user.click(screen.getByRole('button', { name: '월' }))
    expect(screen.queryByRole('button', { name: '처음부터 만들기' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '루틴 만들기' }))

    expect(mockedStart).toHaveBeenCalledWith({
      title: '물 2L',
      categoryCode: 'EXERCISE',
      scheduleType: 'SPECIFIC_DAYS',
      daysOfWeek: ['MON', 'FRI'],
      targetCount: null,
      startedAt: TODAY,
      endedAt: null,
    })
    expect(await screen.findByText('목록 화면')).toBeInTheDocument()
  })

  it('필수 값이 비면 보내지 않고 알린다', async () => {
    const user = renderPage()

    await user.click(screen.getByRole('button', { name: '루틴 만들기' }))

    expect(await screen.findByText('루틴 이름을 입력해 주세요.')).toBeInTheDocument()
    expect(screen.getByText('카테고리를 선택해 주세요.')).toBeInTheDocument()
    expect(mockedStart).not.toHaveBeenCalled()
  })

  describe('템플릿에서 시작 (#19 G1 · G2)', () => {
    // macOS Chrome은 조합을 Enter로 확정하면 조합이 아닌 Enter를 한 번 더 보낸다 — 그 Enter가 폼을 제출하면 안 된다
    it('조합을 확정한 Enter는 제출을 막고, 조합과 무관한 Enter는 막지 않는다', async () => {
      renderPage('/routines/new?templateId=7')
      const title = await screen.findByDisplayValue('아침 러닝')

      fireEvent.compositionEnd(title, { data: '런' })
      const composedEnter = createEvent.keyDown(title, { key: 'Enter' })
      fireEvent(title, composedEnter)
      expect(composedEnter.defaultPrevented).toBe(true)

      await new Promise((resolve) => setTimeout(resolve, COMPOSITION_END_GRACE_MS + 20))
      const plainEnter = createEvent.keyDown(title, { key: 'Enter' })
      fireEvent(title, plainEnter)
      expect(plainEnter.defaultPrevented).toBe(false)
    })

    it('작성 중 원본 템플릿이 지워져 다시 조회돼도 폼과 입력값이 남는다', async () => {
      const user = renderPage('/routines/new?templateId=7')
      const title = await screen.findByDisplayValue('아침 러닝')
      await user.type(title, ' 5km')

      vi.mocked(getRoutineTemplates).mockClear().mockResolvedValue([])
      await act(() => queryClient.refetchQueries())

      expect(vi.mocked(getRoutineTemplates)).toHaveBeenCalledTimes(1)
      expect(screen.queryByText(/템플릿을 찾을 수 없어요/)).not.toBeInTheDocument()
      expect(titleInput()).toBe(title)
      expect(title).toHaveValue('아침 러닝 5km')
    })

    it('프리필하고, 안 고쳤으면 템플릿 ID만 보낸다 · 템플릿으로도 저장은 꺼져 있다', async () => {
      const user = renderPage('/routines/new?templateId=7')

      expect(await screen.findByDisplayValue('아침 러닝')).toBeInTheDocument()
      expect(screen.getByText(/여기서 바꿔도 템플릿은 그대로예요/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '3회' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('checkbox', { name: /템플릿으로도 저장/ })).toBeDisabled()

      await user.click(screen.getByRole('button', { name: '루틴 만들기' }))

      expect(mockedStart).toHaveBeenCalledWith({
        routineTemplateId: 7,
        startedAt: TODAY,
        endedAt: null,
      })
    })

    it('고치면 배지가 바뀌고, 템플릿 ID 없이 정의만 보낸다', async () => {
      const user = renderPage('/routines/new?templateId=7')

      await user.click(await screen.findByRole('button', { name: '4회' }))

      expect(
        screen.getByText('설정을 바꿨어요. 이 루틴은 템플릿과 연결되지 않고 따로 기록돼요.')
      ).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /템플릿으로도 저장/ })).toBeEnabled()

      await user.click(screen.getByRole('button', { name: '루틴 만들기' }))

      const body = mockedStart.mock.calls[0][0]
      expect(body).not.toHaveProperty('routineTemplateId')
      expect(body).toMatchObject({ scheduleType: 'WEEKLY_COUNT', targetCount: 4 })
    })

    it('고쳤다가 되돌리면 다시 템플릿 ID로 보낸다', async () => {
      const user = renderPage('/routines/new?templateId=7')

      await user.click(await screen.findByRole('button', { name: '4회' }))
      await user.click(screen.getByRole('button', { name: '3회' }))

      expect(screen.getByText(/여기서 바꿔도 템플릿은 그대로예요/)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: '루틴 만들기' }))
      expect(mockedStart).toHaveBeenCalledWith({
        routineTemplateId: 7,
        startedAt: TODAY,
        endedAt: null,
      })
    })

    it('연결 끊기 — 폼을 비운다', async () => {
      const user = renderPage('/routines/new?templateId=7')

      await user.click(await screen.findByRole('button', { name: '처음부터 만들기' }))

      expect(titleInput()).toHaveValue('')
      expect(screen.queryByRole('button', { name: '처음부터 만들기' })).not.toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent(/^\/routines\/new$/)
    })

    it('없는 템플릿이면 알리고 빈 폼으로 보낸다', async () => {
      const user = renderPage('/routines/new?templateId=99')

      await user.click(await screen.findByRole('button', { name: '처음부터 만들기' }))

      expect(titleInput()).toHaveValue('')
    })
  })

  describe('템플릿으로도 저장 (#19 G2)', () => {
    const fillAndCheck = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(titleInput(), '물 2L')
      await user.click(await screen.findByRole('button', { name: '🏃 운동' }))
      await user.click(screen.getByRole('checkbox', { name: /템플릿으로도 저장/ }))
    }

    it('템플릿을 먼저 만들고, 받은 ID로 시작한다', async () => {
      mockedCreateTemplate.mockResolvedValue({ ...TEMPLATE, templateId: 42, title: '물 2L' })
      const user = renderPage()
      await fillAndCheck(user)

      await user.click(screen.getByRole('button', { name: '루틴 만들기' }))

      expect(mockedCreateTemplate).toHaveBeenCalledWith({
        title: '물 2L',
        categoryCode: 'EXERCISE',
        scheduleType: 'DAILY',
        daysOfWeek: null,
        targetCount: null,
      })
      expect(mockedStart).toHaveBeenCalledWith({
        routineTemplateId: 42,
        startedAt: TODAY,
        endedAt: null,
      })
    })

    it('②만 실패하면 알리고, 다시 시작하면 ②만 부른다', async () => {
      mockedCreateTemplate.mockResolvedValue({ ...TEMPLATE, templateId: 42, title: '물 2L' })
      mockedStart.mockRejectedValueOnce(apiError(500, { success: false, message: '서버 오류' }))
      const user = renderPage()
      await fillAndCheck(user)

      await user.click(screen.getByRole('button', { name: '루틴 만들기' }))
      expect(
        await screen.findByText('템플릿은 저장했지만 루틴을 시작하지 못했어요. 다시 시도해 주세요.')
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: '루틴 만들기' }))

      expect(mockedCreateTemplate).toHaveBeenCalledTimes(1)
      expect(mockedStart).toHaveBeenCalledTimes(2)
      expect(mockedStart).toHaveBeenLastCalledWith(
        expect.objectContaining({ routineTemplateId: 42 })
      )
    })
  })

  describe('목표 횟수 — 주 1~6 · 월 1~28', () => {
    it('주 N회 칩은 6회까지다', async () => {
      const user = renderPage()

      await user.click(screen.getByRole('button', { name: '주 N회' }))

      expect(screen.getByRole('button', { name: '6회' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '7회' })).not.toBeInTheDocument()
    })

    it('월 N회는 기본 10, 29는 막는다', async () => {
      const user = renderPage()
      await user.type(titleInput(), '수영')
      await user.click(await screen.findByRole('button', { name: '🏃 운동' }))
      await user.click(screen.getByRole('button', { name: '월 N회' }))

      const count = screen.getByLabelText('한 달에')
      expect(count).toHaveValue(10)
      await user.clear(count)
      await user.type(count, '29')
      await user.click(screen.getByRole('button', { name: '루틴 만들기' }))

      expect(await screen.findByText('횟수는 1~28회 사이로 입력해 주세요.')).toBeInTheDocument()
      expect(mockedStart).not.toHaveBeenCalled()
    })
  })

  describe('기간', () => {
    it('과거 시작일 경고 — 매일형은 일, 주 N회는 주로 센다', async () => {
      const user = renderPage()

      setDate(startInput(), '2026-09-03')
      expect(
        screen.getByText('9월 3일부터 시작하면 지난 62일이 미완료로 기록돼요.')
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: '주 N회' }))
      expect(
        screen.getByText('9월 3일부터 시작하면 지난 9주는 목표 미달성으로 기록돼요.')
      ).toBeInTheDocument()
    })

    it('오늘이나 미래 시작일에는 경고하지 않는다', () => {
      renderPage()

      setDate(startInput(), '2026-11-10')

      expect(screen.queryByText(/미완료로 기록돼요/)).not.toBeInTheDocument()
    })

    it('90일보다 앞 · 종료일이 시작일보다 앞 · 366일 초과를 막는다', async () => {
      const user = renderPage()
      await user.type(titleInput(), '수영')
      await user.click(await screen.findByRole('button', { name: '🏃 운동' }))

      setDate(startInput(), '2026-08-05')
      setDate(endInput(), '2026-08-01')
      await user.click(screen.getByRole('button', { name: '루틴 만들기' }))
      expect(
        await screen.findByText('시작일은 오늘부터 최대 90일 전까지 정할 수 있어요.')
      ).toBeInTheDocument()
      expect(screen.getByText('종료일은 시작일과 같거나 그 이후여야 해요.')).toBeInTheDocument()

      setDate(startInput(), '2026-11-04')
      // 시작일 포함 367일째 — 366일째(2027-11-04)까지 된다
      setDate(endInput(), '2027-11-05')
      await user.click(screen.getByRole('button', { name: '루틴 만들기' }))
      expect(
        await screen.findByText('기간은 시작일부터 최대 366일까지 정할 수 있어요.')
      ).toBeInTheDocument()
      expect(mockedStart).not.toHaveBeenCalled()
    })

    it('종료일 범위는 시작일을 따른다', () => {
      renderPage()

      setDate(startInput(), '2026-11-10')

      expect(endInput()).toHaveAttribute('min', '2026-11-10')
      expect(endInput()).toHaveAttribute('max', '2027-11-10')
    })

    // 날짜 입력은 비제어다 — 다른 필드가 재렌더를 일으켜도 친 날짜가 덮이지 않고 노드도 그대로다 (§6-1)
    it('날짜를 친 뒤 다른 입력이 재렌더를 일으켜도 날짜 노드 · 값이 그대로다', async () => {
      const user = renderPage()
      const start = startInput()

      setDate(start, '2026-10-20')
      await user.type(titleInput(), '아침')
      await user.click(screen.getByRole('button', { name: '주 N회' }))

      expect(startInput()).toBe(start)
      expect(start).toHaveValue('2026-10-20')
    })
  })

  it('같은 이름의 진행 중 루틴이 있으면 경고만 하고 막지 않는다', async () => {
    const user = renderPage()

    await user.type(titleInput(), '자기 전 독서')
    expect(
      await screen.findByText('이미 진행 중인 ‘자기 전 독서’ 루틴이 있어요.')
    ).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: '📚 독서' }))
    await user.click(screen.getByRole('button', { name: '루틴 만들기' }))

    expect(mockedStart).toHaveBeenCalled()
  })

  it('서버가 거절하면 그 문구를 보여 주고 폼을 남긴다', async () => {
    mockedStart.mockRejectedValue(
      apiError(400, { success: false, message: '시작일은 오늘부터 90일 전까지여야 합니다.' })
    )
    const user = renderPage()
    await user.type(titleInput(), '수영')
    await user.click(await screen.findByRole('button', { name: '🏃 운동' }))

    await user.click(screen.getByRole('button', { name: '루틴 만들기' }))

    expect(await screen.findByText('시작일은 오늘부터 90일 전까지여야 합니다.')).toBeInTheDocument()
    expect(titleInput()).toHaveValue('수영')
  })
})
