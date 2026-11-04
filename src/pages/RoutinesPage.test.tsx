import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { getCategories } from '@/api/category'
import {
  deleteRoutineTemplate,
  getMyRoutines,
  getRoutineTemplates,
  updateRoutineTemplate,
} from '@/api/routine'
import { networkError } from '@/test/axiosError'
import type { Category, Routine, RoutineTemplate } from '@/types/routine'
import RoutinesPage from './RoutinesPage'

vi.mock('@/api/routine', () => ({
  getMyRoutines: vi.fn(),
  getRoutineTemplates: vi.fn(),
  deleteRoutineTemplate: vi.fn(),
  updateRoutineTemplate: vi.fn(),
}))
vi.mock('@/api/category', () => ({ getCategories: vi.fn() }))

const mockedGetMyRoutines = vi.mocked(getMyRoutines)
const mockedGetTemplates = vi.mocked(getRoutineTemplates)
const mockedDeleteTemplate = vi.mocked(deleteRoutineTemplate)
const mockedUpdateTemplate = vi.mocked(updateRoutineTemplate)

const CATEGORIES: Category[] = [{ code: 'EXERCISE', name: '운동', icon: '🏃', displayOrder: 1 }]

const routine = (overrides: Partial<Routine>): Routine => ({
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

const TEMPLATE: RoutineTemplate = {
  templateId: 7,
  title: '물 2L',
  categoryCode: 'EXERCISE',
  scheduleType: 'WEEKLY_COUNT',
  daysOfWeek: null,
  targetCount: 3,
  challengeId: null,
}

// 오늘 2026-10-29(서울) 기준 — 진행 중 2 · 완료됨 1 · 중단됨 1
const ROUTINES: Routine[] = [
  routine({ routineId: 1, title: '자기 전 독서', startedAt: '2026-09-01' }),
  routine({ routineId: 2, title: '아침 러닝', startedAt: '2026-10-10', challengeId: 3 }),
  routine({ routineId: 3, title: '여름 수영', startedAt: '2026-05-01', endedAt: '2026-07-31' }),
  routine({ routineId: 4, title: '명상', isActive: false }),
]

const LocationProbe = () => {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

const renderPage = (initialEntry = '/routines') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="*" element={null} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('RoutinesPage', () => {
  beforeEach(() => {
    // Date만 고정한다 — 타이머까지 고정하면 React Query · userEvent가 멈춘다
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-29T03:00:00Z'))
    vi.mocked(getCategories).mockResolvedValue(CATEGORIES)
    mockedGetMyRoutines.mockReset()
    mockedGetTemplates.mockReset()
    mockedDeleteTemplate.mockReset()
    mockedGetMyRoutines.mockResolvedValue(ROUTINES)
    mockedGetTemplates.mockResolvedValue([TEMPLATE])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('진행 중이 기본이고, 시작일 최근순으로 보인다 · 상태별 개수를 센다', async () => {
    renderPage()

    const cards = await screen.findAllByRole('link', { name: /진행 중/ })
    expect(cards.map((c) => within(c).getByText(/러닝|독서/).textContent)).toEqual([
      '아침 러닝',
      '자기 전 독서',
    ])
    expect(screen.getByRole('button', { name: '진행 중 2' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: '완료 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '중단 1' })).toBeInTheDocument()
  })

  it('챌린지 루틴에만 챌린지 배지가 붙는다', async () => {
    renderPage()

    const running = await screen.findByRole('link', { name: /아침 러닝/ })
    expect(within(running).getByText('🏆 챌린지')).toBeInTheDocument()
    expect(
      within(screen.getByRole('link', { name: /자기 전 독서/ })).queryByText('🏆 챌린지')
    ).not.toBeInTheDocument()
  })

  it('완료됨 카드에만 기간을 쓴다 · 필터는 URL에 남는다', async () => {
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: '완료 1' }))

    const card = screen.getByRole('link', { name: /여름 수영/ })
    expect(within(card).getByText('5월 1일 ~ 7월 31일')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/routines?status=completed')
  })

  it('루틴이 하나도 없으면 시작 CTA와 템플릿 CTA를 함께 준다', async () => {
    mockedGetMyRoutines.mockResolvedValue([])
    renderPage()

    expect(await screen.findByText('아직 루틴이 없어요')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '+ 첫 루틴 만들기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '템플릿 보기' })).toBeInTheDocument()
  })

  it('필터 결과가 0이면 그 탭이 모으는 것을 알려 주고, 완료됨엔 생성 CTA가 없다', async () => {
    mockedGetMyRoutines.mockResolvedValue([ROUTINES[0]])
    renderPage('/routines?status=completed')

    expect(await screen.findByText('아직 완주한 루틴이 없어요')).toBeInTheDocument()
    expect(screen.queryByText('아직 루틴이 없어요')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '+ 새 루틴 만들기' })).not.toBeInTheDocument()
  })

  it('목록을 못 받으면 에러와 다시 시도를 보여 준다', async () => {
    mockedGetMyRoutines.mockRejectedValueOnce(networkError())
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: '다시 시도' }))

    expect(await screen.findByRole('link', { name: /아침 러닝/ })).toBeInTheDocument()
  })

  it('템플릿 스트립 칩은 시작 폼으로 가는 프리필 링크다', async () => {
    renderPage()

    const chip = await screen.findByRole('link', { name: /물 2L/ })
    expect(chip).toHaveAttribute('href', '/routines/new?templateId=7')
  })

  it('템플릿이 없으면 스트립을 그리지 않는다', async () => {
    mockedGetTemplates.mockResolvedValue([])
    renderPage()

    await screen.findByRole('link', { name: /자기 전 독서/ })
    expect(screen.queryByText(/저장된 템플릿/)).not.toBeInTheDocument()
  })

  it('템플릿 탭 — 삭제 확인 문구를 보여 주고, 지우면 목록을 다시 받는다', async () => {
    mockedDeleteTemplate.mockResolvedValue()
    renderPage('/routines?tab=templates')
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: '물 2L 템플릿 삭제' }))
    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText('템플릿만 삭제되고, 이 템플릿으로 시작한 루틴은 그대로 남아요.')
    ).toBeInTheDocument()

    mockedGetTemplates.mockResolvedValue([])
    await user.click(within(dialog).getByRole('button', { name: '삭제' }))

    expect(mockedDeleteTemplate).toHaveBeenCalledWith(7)
    expect(await screen.findByText('저장한 템플릿이 없어요')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('템플릿 수정 — 안내 문구를 보여 주고, 정의 5필드를 보낸다', async () => {
    mockedUpdateTemplate.mockResolvedValue({ ...TEMPLATE, title: '물 3L' })
    renderPage('/routines?tab=templates')
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: '물 2L 템플릿 수정' }))
    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText(
        '바꾼 내용은 다음에 시작하는 루틴부터 적용돼요. 이미 진행 중인 루틴은 바뀌지 않아요.'
      )
    ).toBeInTheDocument()

    const title = within(dialog).getByLabelText('루틴 이름')
    await user.clear(title)
    await user.type(title, '물 3L')
    await user.click(within(dialog).getByRole('button', { name: '저장' }))

    expect(mockedUpdateTemplate).toHaveBeenCalledWith(7, {
      title: '물 3L',
      categoryCode: 'EXERCISE',
      scheduleType: 'WEEKLY_COUNT',
      daysOfWeek: null,
      targetCount: 3,
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('삭제에 실패하면 대화상자를 남기고 알린다', async () => {
    mockedDeleteTemplate.mockRejectedValue(networkError())
    renderPage('/routines?tab=templates')
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: '물 2L 템플릿 삭제' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '삭제' }))

    expect(
      await screen.findByText('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.')
    ).toBeInTheDocument()
  })
})
