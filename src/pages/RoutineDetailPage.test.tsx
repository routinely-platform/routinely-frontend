import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MY_ROUTINES_QUERY_KEY } from '@/hooks/useRoutines'
import { getCategories } from '@/api/category'
import { getExecutions, type ExecutionRangeParams } from '@/api/execution'
import { getMyRoutines, stopRoutine, updateRoutine } from '@/api/routine'
import type { Execution } from '@/types/execution'
import type { Routine } from '@/types/routine'
import RoutineDetailPage from './RoutineDetailPage'

vi.mock('@/api/routine', () => ({
  getMyRoutines: vi.fn(),
  updateRoutine: vi.fn(),
  stopRoutine: vi.fn(),
}))
vi.mock('@/api/execution', () => ({ getExecutions: vi.fn() }))
vi.mock('@/api/category', () => ({ getCategories: vi.fn() }))

const mockedGetRoutines = vi.mocked(getMyRoutines)
const mockedGetExecutions = vi.mocked(getExecutions)
const mockedUpdate = vi.mocked(updateRoutine)
const mockedStop = vi.mocked(stopRoutine)

// 2026-11-08(일)
const TODAY = '2026-11-08'

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

const execution = (overrides: Partial<Execution>): Execution => ({
  executionId: null,
  routineId: 1,
  title: '아침 러닝',
  scheduledDate: '2026-11-03',
  status: 'MISSED',
  completedAt: null,
  photoUrl: null,
  memo: null,
  feedCardId: null,
  backfillable: true,
  ...overrides,
})

const completed = (date: string, overrides: Partial<Execution> = {}) =>
  execution({
    executionId: Number(date.slice(8)),
    scheduledDate: date,
    status: 'COMPLETED',
    completedAt: `${date}T07:02:00`,
    ...overrides,
  })

/** 서버처럼 날짜 내림차순 */
const COMPLETED: Execution[] = [
  completed('2026-11-08', {
    photoUrl: 'https://cdn.example.com/a.jpg',
    memo: '해 뜨는 거 보고 왔다\n둘째 줄',
  }),
  completed('2026-11-07', { memo: null }),
  completed('2026-11-02', { completedAt: '2026-11-05T21:00:00', memo: '늦게 채웠다' }),
  completed('2026-10-20'),
]

const MONTH: Execution[] = [
  COMPLETED[0],
  COMPLETED[1],
  execution({ scheduledDate: '2026-11-06', backfillable: true }),
  execution({ scheduledDate: '2026-11-05', backfillable: false }),
  COMPLETED[2],
]

let completedRows: Execution[]

const newClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderPage = (path = '/routines/1', queryClient = newClient()) => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/routines/:id" element={<RoutineDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
  return userEvent.setup()
}

const cell = (label: RegExp) => screen.findByLabelText(label)

describe('RoutineDetailPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(`${TODAY}T03:00:00Z`))
    completedRows = COMPLETED
    mockedGetRoutines.mockResolvedValue([routine()])
    mockedGetExecutions.mockReset()
    mockedGetExecutions.mockImplementation(async (params: ExecutionRangeParams) =>
      params.status === 'COMPLETED'
        ? completedRows
        : params.startDate.startsWith('2026-11')
          ? MONTH
          : []
    )
    mockedUpdate.mockReset()
    mockedStop.mockReset()
    vi.mocked(getCategories).mockResolvedValue([
      { code: 'EXERCISE', name: '운동', icon: '🏃', displayOrder: 1 },
    ])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('내 루틴에 없는 id면 404 화면이다', async () => {
    renderPage('/routines/99')
    expect(await screen.findByText('ERROR · 404')).toBeInTheDocument()
  })

  it('옛 목록 캐시에 없는 id는 재조회가 끝날 때까지 404를 내지 않는다 (#63 리뷰 1)', async () => {
    const client = newClient()
    client.setQueryData(MY_ROUTINES_QUERY_KEY, [routine()])
    mockedGetRoutines.mockResolvedValue([routine(), routine({ routineId: 2, title: '새 루틴' })])
    renderPage('/routines/2', client)

    expect(screen.queryByText('ERROR · 404')).not.toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1, name: '새 루틴' })).toBeInTheDocument()
  })

  it('옛 캐시에 없고 재조회도 실패하면 404가 아니라 다시 시도', async () => {
    const client = newClient()
    client.setQueryData(MY_ROUTINES_QUERY_KEY, [routine()])
    mockedGetRoutines.mockRejectedValue(new Error('fail'))
    renderPage('/routines/2', client)

    expect(await screen.findByText('루틴을 불러오지 못했어요.')).toBeInTheDocument()
    expect(screen.queryByText('ERROR · 404')).not.toBeInTheDocument()
  })

  it('올해가 아닌 시작일은 메타 줄에 연도를 붙인다 (확인 결과 2-A)', async () => {
    mockedGetRoutines.mockResolvedValue([routine({ startedAt: '2025-10-04' })])
    renderPage()
    expect(await screen.findByText(/매일 · 2025년 10월 4일 ~ 계속/)).toBeInTheDocument()
  })

  it('상세 정보 — 종료일이 없으면 "없음 — 계속 이어져요"', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { level: 1, name: '아침 러닝' })).toBeInTheDocument()
    expect(screen.getByText('진행 중')).toBeInTheDocument()
    expect(screen.getByText('없음 — 계속 이어져요')).toBeInTheDocument()
    // 스트릭 · 달성률은 자리를 만들지 않는다 (#60 대기)
    expect(screen.queryByText(/스트릭|달성률 \d/)).not.toBeInTheDocument()
  })

  describe('달력', () => {
    it('이번 달을 범위로 조회하고 서버 응답대로 칸을 칠한다', async () => {
      renderPage()

      expect(await cell(/^11월 6일 · 채울 수 있는 날/)).toBeInTheDocument()
      expect(screen.getByLabelText(/^11월 5일 · 인증 가능 기간이 지났어요/)).toBeInTheDocument()
      expect(screen.getByLabelText(/^11월 7일 · 다 한 날/)).toBeInTheDocument()
      expect(screen.getByLabelText(/^11월 8일 오늘 · 다 한 날/)).toBeInTheDocument()
      expect(screen.getByLabelText(/^11월 9일 · 예정/)).toBeInTheDocument()
      // date와 범위를 함께 보내면 400 — 항상 범위만
      expect(mockedGetExecutions).toHaveBeenCalledWith({
        routineId: 1,
        startDate: '2026-11-01',
        endDate: '2026-11-30',
      })
    })

    it('칸은 눌리지 않는다 — 인증 모달은 #20이 배선한다', async () => {
      renderPage()
      const grid = await screen.findByRole('grid', { name: '2026년 11월 인증 달력' })
      expect(within(grid).queryAllByRole('button')).toHaveLength(0)
    })

    it('격자는 일요일 시작이다', async () => {
      renderPage()
      const grid = await screen.findByRole('grid')
      const headers = within(grid)
        .getAllByRole('columnheader')
        .map((h) => h.textContent)
      expect(headers).toEqual(['일', '월', '화', '수', '목', '금', '토'])
    })

    it('월 이동 — 시작 달 앞으로, 이번 달 뒤로는 못 간다', async () => {
      const user = renderPage()
      await screen.findByRole('grid')
      expect(screen.getByRole('button', { name: '다음 달' })).toBeDisabled()

      await user.click(screen.getByRole('button', { name: '이전 달' }))

      expect(await screen.findByRole('grid', { name: '2026년 10월 인증 달력' })).toBeInTheDocument()
      expect(mockedGetExecutions).toHaveBeenCalledWith({
        routineId: 1,
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      })
      expect(screen.getByRole('button', { name: '이전 달' })).toBeDisabled()
      expect(screen.getByText('2026년 10월 1일 시작')).toBeInTheDocument()
    })

    it('SPECIFIC_DAYS의 지정하지 않은 요일은 해당 없음', async () => {
      mockedGetRoutines.mockResolvedValue([
        routine({ scheduleType: 'SPECIFIC_DAYS', daysOfWeek: ['MON', 'FRI'] }),
      ])
      renderPage()
      // 11월 3일은 화요일 — 응답에 없는 날
      expect(await cell(/^11월 3일 · 해당 없음/)).toBeInTheDocument()
      expect(screen.getByText('해당 없음')).toBeInTheDocument() // 범례
    })

    it('빈도형의 빈 날은 "기록 없음 — 결석이 아니에요"', async () => {
      mockedGetRoutines.mockResolvedValue([
        routine({ scheduleType: 'WEEKLY_COUNT', targetCount: 3 }),
      ])
      renderPage()
      expect(await cell(/^11월 4일 · 기록 없음/)).toBeInTheDocument()
      // 범례에 "채울 수 있는 날"이 없다 — 미달 주 강조는 #60 뒤에 켠다
      expect(screen.queryByText('채울 수 있는 날')).not.toBeInTheDocument()
    })

    it('조회에 실패하면 다시 시도할 수 있다', async () => {
      mockedGetExecutions.mockImplementation(async (params) => {
        if (params.status === 'COMPLETED') return completedRows
        throw new Error('fail')
      })
      renderPage()
      expect(await screen.findByText('인증 기록을 불러오지 못했어요.')).toBeInTheDocument()
    })
  })

  describe('최근 인증 — 목록', () => {
    it('최근 3건 — 사진 · 메모만 · 둘 다 없음', async () => {
      renderPage()
      expect(await screen.findByText('해 뜨는 거 보고 왔다')).toBeInTheDocument()
      expect(screen.getByLabelText('사진 있음')).toBeInTheDocument()
      expect(screen.getByText('메모 없이 인증')).toBeInTheDocument()
      expect(screen.getByText('늦게 채웠다')).toBeInTheDocument()
      // 4번째는 보이지 않는다
      expect(screen.getAllByText(/^(오늘|어제|11월 2일)$/)).toHaveLength(3)
      // 백필은 완료 시각이 그 날짜와 달라 시각을 붙이지 않는다
      expect(screen.getAllByText('07:02')).toHaveLength(2)
    })

    it('"피드에서 보기"는 자리만 있고 눌리지 않는다', async () => {
      renderPage()
      expect(await screen.findByRole('button', { name: '피드에서 보기 →' })).toBeDisabled()
    })

    it('기록이 없으면 빈 상태', async () => {
      completedRows = []
      renderPage()
      expect(await screen.findByText(/아직 인증 기록이 없어요/)).toBeInTheDocument()
    })
  })

  describe('수정 잠금', () => {
    it('개인 · 기록 있음 — 주기 · 시작일이 잠기고 이유를 보여 준다', async () => {
      const user = renderPage()
      expect(
        await screen.findByText(/인증 기록이 있어 반복 주기를 바꿀 수 없어요/)
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: '설정 수정' }))
      const dialog = await screen.findByRole('dialog')
      expect(
        within(dialog).getByText(/인증 기록이 있어 반복 주기를 바꿀 수 없어요/)
      ).toBeInTheDocument()
      expect(within(dialog).queryByRole('button', { name: '요일 지정' })).not.toBeInTheDocument()
      expect(within(dialog).queryByLabelText('시작일')).not.toBeInTheDocument()
      expect(within(dialog).getByText(/마지막 인증일\(11월 8일\)/)).toBeInTheDocument()
    })

    it('개인 · 기록 0건 — 주기 · 시작일을 고칠 수 있다', async () => {
      completedRows = []
      const user = renderPage()
      await user.click(await screen.findByRole('button', { name: '설정 수정' }))
      const dialog = await screen.findByRole('dialog')
      expect(within(dialog).getByRole('button', { name: '요일 지정' })).toBeInTheDocument()
      expect(within(dialog).getByLabelText('시작일')).toBeInTheDocument()
    })

    it('바꾼 필드만 보낸다', async () => {
      mockedUpdate.mockResolvedValue(routine({ title: '저녁 러닝' }))
      const user = renderPage()
      await user.click(await screen.findByRole('button', { name: '설정 수정' }))
      const dialog = await screen.findByRole('dialog')
      const title = within(dialog).getByLabelText('루틴 이름')
      await user.clear(title)
      await user.type(title, '저녁 러닝')
      await user.click(within(dialog).getByRole('button', { name: '저장' }))

      expect(mockedUpdate).toHaveBeenCalledWith(1, { title: '저녁 러닝' })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('종료일은 마지막 인증일보다 앞당길 수 없다', async () => {
      mockedGetRoutines.mockResolvedValue([routine({ endedAt: '2026-12-31' })])
      const user = renderPage()
      await user.click(await screen.findByRole('button', { name: '설정 수정' }))
      const dialog = await screen.findByRole('dialog')
      const end = within(dialog).getByLabelText(/종료일/)
      // 날짜 입력은 비제어다 — 값을 한 번에 넣는다
      fireEvent.change(end, { target: { value: '2026-11-07' } })
      await user.click(within(dialog).getByRole('button', { name: '저장' }))

      expect(
        await within(dialog).findByText(/마지막 인증일\(11월 8일\)보다 앞당길 수 없어요/)
      ).toBeInTheDocument()
      expect(mockedUpdate).not.toHaveBeenCalled()
    })

    it('1년보다 오래된 루틴은 조회 구간이 비어도 "0건"으로 보지 않고 잠근다 (#63 리뷰 3)', async () => {
      mockedGetRoutines.mockResolvedValue([routine({ startedAt: '2025-09-01' })])
      completedRows = []
      const user = renderPage()

      expect(
        await screen.findByText(/1년보다 오래된 기록은 확인하지 못해 반복 주기를 바꿀 수 없어요/)
      ).toBeInTheDocument()
      expect(screen.getByText('최근 1년 동안 인증 기록이 없어요.')).toBeInTheDocument()
      // 서버 상한(366일)에 맞춰 조회한다
      expect(mockedGetExecutions).toHaveBeenCalledWith({
        routineId: 1,
        startDate: '2025-11-08',
        endDate: TODAY,
        status: 'COMPLETED',
      })

      await user.click(screen.getByRole('button', { name: '설정 수정' }))
      const dialog = await screen.findByRole('dialog')
      expect(within(dialog).queryByRole('button', { name: '요일 지정' })).not.toBeInTheDocument()
      expect(within(dialog).queryByLabelText('시작일')).not.toBeInTheDocument()
    })

    it('챌린지 루틴 — 수정 버튼도 중단 버튼도 없다', async () => {
      mockedGetRoutines.mockResolvedValue([routine({ challengeId: 3 })])
      renderPage()
      expect(await screen.findByText('챌린지 루틴은 개별로 중단할 수 없어요.')).toBeInTheDocument()
      expect(screen.getByText('🏆 챌린지')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '설정 수정' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /루틴 중단하기/ })).not.toBeInTheDocument()
    })
  })

  describe('중단', () => {
    it('사이드 안내 문구 안의 텍스트 버튼 → 확인 → 중단', async () => {
      mockedStop.mockResolvedValue()
      const user = renderPage()
      // 제목 옆에는 버튼이 없다
      const heading = await screen.findByRole('heading', { level: 1 })
      expect(
        within(heading.parentElement as HTMLElement).queryByRole('button')
      ).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: '→ 루틴 중단하기' }))
      const dialog = await screen.findByRole('dialog')
      await user.click(within(dialog).getByRole('button', { name: '루틴 중단하기' }))

      expect(mockedStop).toHaveBeenCalledWith(1)
    })

    it('중단한 루틴 — 중단 · 수정 버튼이 없고 범례는 칸과 같다 (확인 결과 1-A · 3-B)', async () => {
      mockedGetRoutines.mockResolvedValue([routine({ isActive: false })])
      renderPage()
      expect(await screen.findByText('중단')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /루틴 중단하기/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '설정 수정' })).not.toBeInTheDocument()
      expect(screen.getByText('중단한 루틴은 바꿀 수 없어요.')).toBeInTheDocument()
      // 칸별 잠금 이유는 두지 않는다 — 중단 문구 하나로 충분하다
      expect(screen.queryByText(/인증 기록이 있어 반복 주기를/)).not.toBeInTheDocument()

      expect(await screen.findByText('기간 밖')).toBeInTheDocument()
      expect(screen.queryByText('채울 수 있는 날')).not.toBeInTheDocument()
    })

    it('끝난(종료일이 지난) 개인 루틴은 수정을 연다 — 종료일 연장으로 다시 이어진다', async () => {
      mockedGetRoutines.mockResolvedValue([routine({ endedAt: '2026-11-05' })])
      renderPage()
      expect(await screen.findByText('🎉 완료')).toBeInTheDocument()
      expect(await screen.findByRole('button', { name: '설정 수정' })).toBeEnabled()
    })
  })
})
