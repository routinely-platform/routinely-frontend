import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MY_ROUTINES_QUERY_KEY } from '@/hooks/useRoutines'
import { getCategories } from '@/api/category'
import {
  cancelExecution,
  completeExecution,
  getExecutions,
  type ExecutionRangeParams,
} from '@/api/execution'
import { getMyRoutines, stopRoutine, updateRoutine } from '@/api/routine'
import { apiError } from '@/test/axiosError'
import type { Execution } from '@/types/execution'
import type { Routine } from '@/types/routine'
import RoutineDetailPage from './RoutineDetailPage'

vi.mock('@/api/routine', () => ({
  getMyRoutines: vi.fn(),
  updateRoutine: vi.fn(),
  stopRoutine: vi.fn(),
}))
vi.mock('@/api/execution', () => ({
  getExecutions: vi.fn(),
  completeExecution: vi.fn(),
  cancelExecution: vi.fn(),
}))
vi.mock('@/api/category', () => ({ getCategories: vi.fn() }))

const mockedGetRoutines = vi.mocked(getMyRoutines)
const mockedGetExecutions = vi.mocked(getExecutions)
const mockedUpdate = vi.mocked(updateRoutine)
const mockedStop = vi.mocked(stopRoutine)
const mockedComplete = vi.mocked(completeExecution)
const mockedCancel = vi.mocked(cancelExecution)

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
let monthRows: Execution[]

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

/** 밖에서 푸는 promise — 다시 받기를 하나씩 끝내 본다 */
function deferred<T>() {
  let resolve: (value: T) => void = () => {}
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

/** 기본 응답 — 완료 조회는 completedRows, 11월은 monthRows */
const serveRows = async (params: ExecutionRangeParams) =>
  params.status === 'COMPLETED'
    ? completedRows
    : params.startDate.startsWith('2026-11')
      ? monthRows
      : []

/** 11월 6일을 완료한 뒤의 서버 상태 */
const MONTH_AFTER_6 = MONTH.map((e) =>
  e.scheduledDate === '2026-11-06' ? completed('2026-11-06') : e
)
/** 11월 7일을 취소한 뒤의 서버 상태 — 지정형 지난 날이라 MISSED로 파생된다 */
const MONTH_AFTER_CANCEL_7 = MONTH.map((e) =>
  e.scheduledDate === '2026-11-07' ? execution({ scheduledDate: '2026-11-07' }) : e
)

describe('RoutineDetailPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(`${TODAY}T03:00:00Z`))
    completedRows = COMPLETED
    monthRows = MONTH
    mockedGetRoutines.mockResolvedValue([routine()])
    mockedGetExecutions.mockReset()
    mockedGetExecutions.mockImplementation(serveRows)
    mockedUpdate.mockReset()
    mockedStop.mockReset()
    mockedComplete.mockReset()
    mockedCancel.mockReset()
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

    it('누를 수 있는 칸 — 완료한 날 · 채울 수 있는 날만 (#20)', async () => {
      renderPage()
      const grid = await screen.findByRole('grid', { name: '2026년 11월 인증 달력' })
      const labels = within(grid)
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label'))
      expect(labels).toEqual([
        '11월 2일 · 다 한 날',
        '11월 6일 · 채울 수 있는 날',
        '11월 7일 · 다 한 날',
        '11월 8일 오늘 · 다 한 날',
      ])
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

    it('아무것도 바꾸지 않고 저장하면 요청 없이 닫힌다', async () => {
      const user = renderPage()
      await user.click(await screen.findByRole('button', { name: '설정 수정' }))
      const dialog = await screen.findByRole('dialog')
      await user.click(within(dialog).getByRole('button', { name: '저장' }))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(mockedUpdate).not.toHaveBeenCalled()
    })

    it('저장 실패 — 서버 문구를 버튼 줄 위에 보여 주고, 다시 저장하면 지운다 (#85 리뷰 4)', async () => {
      mockedUpdate.mockRejectedValueOnce(
        apiError(400, { success: false, message: '종료일을 확인해 주세요.' })
      )
      let resolveRetry: (value: Routine) => void = () => {}
      mockedUpdate.mockImplementationOnce(
        () => new Promise<Routine>((resolve) => (resolveRetry = resolve))
      )
      const user = renderPage()
      await user.click(await screen.findByRole('button', { name: '설정 수정' }))
      const dialog = await screen.findByRole('dialog')
      const title = within(dialog).getByLabelText('루틴 이름')
      await user.clear(title)
      await user.type(title, '저녁 러닝')
      const save = within(dialog).getByRole('button', { name: '저장' })
      await user.click(save)

      // 실패해도 창은 남고, 오류는 본문(스크롤 영역)이 아니라 버튼 줄과 같은 고정 영역에 있다
      const alert = await within(dialog).findByRole('alert')
      expect(alert).toHaveTextContent('종료일을 확인해 주세요.')
      expect(alert.parentElement).toContainElement(save)
      expect(alert.parentElement).not.toContainElement(title)

      // 다시 저장 — 요청이 도는 동안 이전 오류는 지워진다
      await user.click(save)
      expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument()
      expect(within(dialog).getByRole('button', { name: '저장 중...' })).toBeDisabled()

      resolveRetry(routine({ title: '저녁 러닝' }))
      await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(mockedUpdate).toHaveBeenCalledTimes(2)
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

  describe('인증 — 모달 · 상세 · 취소 (#20)', () => {
    const cellButton = (label: RegExp) => screen.findByRole('button', { name: label })

    const DONE_6 = {
      executionId: 6,
      routineId: 1,
      scheduledDate: '2026-11-06',
      status: 'COMPLETED' as const,
      completedAt: '2026-11-08T09:00:00',
      photoUrl: null,
      feedCardId: 60,
    }

    it('채울 수 있는 날 → 인증 모달(백필) → 성공 → 닫으면 누른 칸으로 포커스', async () => {
      mockedComplete.mockResolvedValue(DONE_6)
      const user = renderPage()
      await user.click(await cellButton(/^11월 6일 · 채울 수 있는 날/))

      const dialog = await screen.findByRole('dialog', { name: '아침 러닝' })
      expect(within(dialog).getByText('11월 6일(금) 인증')).toBeInTheDocument()

      monthRows = MONTH_AFTER_6
      await user.click(within(dialog).getByRole('button', { name: '인증 완료' }))

      expect(
        await screen.findByRole('dialog', { name: '지난 날짜를 채웠어요' })
      ).toBeInTheDocument()
      expect(mockedComplete).toHaveBeenCalledWith(1, '2026-11-06', { photo: null, memo: '' })
      // 성공 단계가 뜰 때 달력은 이미 서버 상태다 (D7)
      expect(screen.getByLabelText(/^11월 6일 · 다 한 날/)).toBeInTheDocument()

      await user.click(screen.getAllByRole('button', { name: '닫기' })[1])
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(await cellButton(/^11월 6일 · 다 한 날/)).toHaveFocus()
    })

    it('성공 단계는 달력 · 최근 인증을 둘 다 다시 받은 뒤에 뜬다 — 그동안 저장 중이다 (D7)', async () => {
      mockedComplete.mockResolvedValue(DONE_6)
      const user = renderPage()
      await user.click(await cellButton(/^11월 6일 · 채울 수 있는 날/))
      const dialog = await screen.findByRole('dialog')

      const month = deferred<Execution[]>()
      const recent = deferred<Execution[]>()
      mockedGetExecutions.mockImplementation((params) =>
        params.status === 'COMPLETED' ? recent.promise : month.promise
      )
      await user.click(within(dialog).getByRole('button', { name: '인증 완료' }))
      await vi.waitFor(() => expect(mockedComplete).toHaveBeenCalled())

      const pending = () => within(dialog).getByRole('button', { name: '인증하는 중...' })
      expect(pending()).toBeDisabled()

      await act(async () => month.resolve(MONTH_AFTER_6))
      // 달력만 받았다 — 최근 인증이 남아 아직 저장 중이다
      expect(pending()).toBeDisabled()
      expect(screen.getAllByRole('button', { name: '닫기' })[0]).toBeDisabled()
      expect(screen.queryByRole('dialog', { name: '지난 날짜를 채웠어요' })).not.toBeInTheDocument()

      await act(async () => recent.resolve(COMPLETED))
      expect(
        await screen.findByRole('dialog', { name: '지난 날짜를 채웠어요' })
      ).toBeInTheDocument()
    })

    it('409 이미 인증 — 오류를 보이고, 다시 받은 서버 상태로 칸이 바뀐다 · 모달은 열린 채 (D9)', async () => {
      mockedComplete.mockRejectedValue(
        apiError(409, {
          success: false,
          errorCode: 'EXECUTION_ALREADY_COMPLETED',
          message: '이미 완료된 수행 기록입니다.',
        })
      )
      const user = renderPage()
      await user.click(await cellButton(/^11월 6일 · 채울 수 있는 날/))
      const dialog = await screen.findByRole('dialog')

      // 다른 기기에서 먼저 인증했다
      monthRows = MONTH_AFTER_6
      await user.click(within(dialog).getByRole('button', { name: '인증 완료' }))

      expect(await within(dialog).findByRole('alert')).toHaveTextContent('이미 인증한 날짜예요.')
      expect(await screen.findByLabelText(/^11월 6일 · 다 한 날/)).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('저장 뒤 다시 받기가 실패해도 성공은 보이고, 달력에 안내 · 그 날짜는 다시 받을 때까지 막는다 (D13)', async () => {
      mockedComplete.mockResolvedValue(DONE_6)
      const user = renderPage()
      await user.click(await cellButton(/^11월 6일 · 채울 수 있는 날/))
      const dialog = await screen.findByRole('dialog')

      mockedGetExecutions.mockImplementation(async (params) => {
        if (params.status === 'COMPLETED') return completedRows
        throw new Error('fail')
      })
      // 저장은 처음 조회보다 뒤에 일어난다 — 멈춘 시계에서는 둘이 같은 시각이 된다
      vi.setSystemTime(new Date(`${TODAY}T03:00:30Z`))
      await user.click(within(dialog).getByRole('button', { name: '인증 완료' }))
      expect(
        await screen.findByRole('dialog', { name: '지난 날짜를 채웠어요' })
      ).toBeInTheDocument()
      await user.click(screen.getAllByRole('button', { name: '닫기' })[1])

      expect(screen.getByText(/최신 기록을 불러오지 못했어요/)).toBeInTheDocument()
      // 칸은 저장 전 모습(채울 수 있는 날)이지만 버튼이 아니다 — 같은 요청을 다시 보내지 않는다
      const stale = screen.getByLabelText(/^11월 6일 · 채울 수 있는 날/)
      expect(stale.tagName).not.toBe('BUTTON')
      // 연 칸이 버튼에서 빠져 포커스는 달력 제목으로 (D12)
      expect(screen.getByRole('heading', { name: '인증 달력' })).toHaveFocus()

      // 다시 받으면 풀린다
      vi.setSystemTime(new Date(`${TODAY}T03:01:00Z`))
      monthRows = MONTH_AFTER_6
      mockedGetExecutions.mockImplementation(serveRows)
      await user.click(screen.getByRole('button', { name: '다시 시도' }))

      expect(await cellButton(/^11월 6일 · 다 한 날/)).toBeInTheDocument()
      expect(screen.queryByText(/최신 기록을 불러오지 못했어요/)).not.toBeInTheDocument()
    })

    it('다른 쿼리(최근 인증)만 다시 받기에 실패하면 새로 받은 달력 칸은 막지 않는다 (D17)', async () => {
      mockedComplete.mockResolvedValue(DONE_6)
      const user = renderPage()
      await user.click(await cellButton(/^11월 6일 · 채울 수 있는 날/))
      const dialog = await screen.findByRole('dialog')

      mockedGetExecutions.mockImplementation(async (params) => {
        if (params.status === 'COMPLETED') throw new Error('fail')
        return MONTH_AFTER_6
      })
      vi.setSystemTime(new Date(`${TODAY}T03:00:30Z`))
      await user.click(within(dialog).getByRole('button', { name: '인증 완료' }))
      await screen.findByRole('dialog', { name: '지난 날짜를 채웠어요' })
      await user.click(screen.getAllByRole('button', { name: '닫기' })[1])

      // 달력은 저장 뒤 새로 받았다 — 칸은 버튼이고 상세를 열 수 있다
      expect(await cellButton(/^11월 6일 · 다 한 날/)).toHaveFocus()
      // 실패한 최근 인증 쪽에만 안내가 뜬다
      expect(screen.getAllByText(/최신 기록을 불러오지 못했어요/)).toHaveLength(1)
    })

    it('오프라인으로 다시 받기가 멈추면 그 날짜를 막고, 다시 연결되어 받으면 푼다 (D17)', async () => {
      // 저장은 성공했고, 응답을 받은 직후 · 다시 받기 전에 연결이 끊긴다
      mockedComplete.mockImplementation(async () => {
        onlineManager.setOnline(false)
        return DONE_6
      })
      const user = renderPage()
      await user.click(await cellButton(/^11월 6일 · 채울 수 있는 날/))
      const dialog = await screen.findByRole('dialog')

      vi.setSystemTime(new Date(`${TODAY}T03:00:30Z`))
      monthRows = MONTH_AFTER_6
      try {
        await user.click(within(dialog).getByRole('button', { name: '인증 완료' }))
        await screen.findByRole('dialog', { name: '지난 날짜를 채웠어요' })
        await user.click(screen.getAllByRole('button', { name: '닫기' })[1])

        // 다시 받기가 멈춰 칸은 저장 전 모습 — 같은 요청을 다시 보내지 않게 버튼이 아니다
        expect(screen.getByLabelText(/^11월 6일 · 채울 수 있는 날/).tagName).not.toBe('BUTTON')
      } finally {
        await act(async () => onlineManager.setOnline(true))
      }
      vi.setSystemTime(new Date(`${TODAY}T03:01:00Z`))
      expect(await cellButton(/^11월 6일 · 다 한 날/)).toBeInTheDocument()
    })

    it('클릭이 버튼에 포커스를 주지 않아도(Safari) 닫으면 실제로 누른 버튼으로 돌아간다 (D19)', async () => {
      renderPage()
      const item = (await screen.findByText('해 뜨는 거 보고 왔다')).closest('button')!
      // Safari처럼 포커스 없이 누른다 — 대화상자가 기억하는 연 자리는 body다
      ;(document.activeElement as HTMLElement | null)?.blur()
      fireEvent.click(item)
      const detail = await screen.findByRole('dialog', { name: '아침 러닝' })
      fireEvent.click(within(detail).getAllByRole('button', { name: '닫기' })[0])

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(item).toHaveFocus()
    })

    it('달력 칸은 날짜를 data-date로 정확히 가진다 — aria-label에는 연도가 없다 (D19)', async () => {
      renderPage()
      const cellEl = await cellButton(/^11월 6일 · 채울 수 있는 날/)
      expect(cellEl).toHaveAttribute('data-date', '2026-11-06')
    })

    it('완료한 날 → 인증 상세 위에 취소 확인창 — 맨 위 창을 닫으면 [인증 취소]로, 상세를 닫으면 칸으로 (PR #87 후속)', async () => {
      const user = renderPage()
      await user.click(await cellButton(/^11월 7일 · 다 한 날/))

      const detail = await screen.findByRole('dialog', { name: '아침 러닝' })
      expect(within(detail).getByText('✓ 인증함')).toBeInTheDocument()
      expect(within(detail).getByText('메모 없이 인증')).toBeInTheDocument()
      const cancelButton = within(detail).getByRole('button', { name: '인증 취소' })
      await user.click(cancelButton)

      const confirm = await screen.findByRole('dialog', { name: '11월 7일 인증을 취소할까요?' })
      // 확인창은 [취소]에 포커스 — Enter 한 번에 지워지지 않게
      expect(within(confirm).getByRole('button', { name: '취소' })).toHaveFocus()
      expect(within(confirm).getByText('피드 카드가 삭제됩니다')).toBeInTheDocument()
      // 개인 루틴 — 랭킹 줄이 없다. 리액션 줄은 피드가 생기면 켠다 (D4)
      expect(within(confirm).queryByText(/랭킹|리액션/)).not.toBeInTheDocument()
      expect(within(confirm).getByText(/다시 인증하면 새 카드가 만들어집니다/)).toBeInTheDocument()

      // Tab은 맨 위 창 안에서만 돈다
      await user.tab()
      await user.tab()
      await user.tab()
      expect(confirm.contains(document.activeElement)).toBe(true)

      // Esc는 맨 위 창만 닫는다 — 포커스는 확인창을 연 [인증 취소]로
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('dialog', { name: /취소할까요/ })).not.toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: '아침 러닝' })).toBeInTheDocument()
      expect(cancelButton).toHaveFocus()

      // 상세를 닫으면 상세를 연 달력 칸으로
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(await cellButton(/^11월 7일 ·/)).toHaveFocus()
    })

    it('인증 취소하기 → 두 창이 함께 닫히고, 다시 받은 상태의 칸으로 포커스', async () => {
      mockedCancel.mockResolvedValue(undefined)
      const user = renderPage()
      await user.click(await cellButton(/^11월 7일 · 다 한 날/))
      await user.click(await screen.findByRole('button', { name: '인증 취소' }))
      const confirm = await screen.findByRole('dialog', { name: /취소할까요/ })

      monthRows = MONTH_AFTER_CANCEL_7
      completedRows = COMPLETED.filter((e) => e.scheduledDate !== '2026-11-07')
      await user.click(within(confirm).getByRole('button', { name: '인증 취소하기' }))

      await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(mockedCancel).toHaveBeenCalledWith(1, '2026-11-07')
      // 닫힐 때 달력은 이미 서버 상태다 — 취소한 날은 다시 채울 수 있는 날
      expect(await cellButton(/^11월 7일 · 채울 수 있는 날/)).toHaveFocus()
    })

    it('인증 상세는 배경을 눌러도 닫히지 않는다 — 배경 닫기는 확인창만 (§17-3 규칙 4)', async () => {
      const user = renderPage()
      await user.click(await cellButton(/^11월 7일 · 다 한 날/))
      const detail = await screen.findByRole('dialog', { name: '아침 러닝' })
      await user.click(detail.parentElement!)
      expect(screen.getByRole('dialog', { name: '아침 러닝' })).toBeInTheDocument()

      // 확인창은 배경으로 닫힌다
      await user.click(within(detail).getByRole('button', { name: '인증 취소' }))
      const confirm = await screen.findByRole('dialog', { name: /취소할까요/ })
      await user.click(confirm.parentElement!)
      expect(screen.queryByRole('dialog', { name: /취소할까요/ })).not.toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: '아침 러닝' })).toBeInTheDocument()
    })

    it('최근 인증에서 연 상세를 취소하면 그 항목이 사라진다 — 칸도 못 누르면 포커스는 달력 제목 (D12)', async () => {
      mockedCancel.mockResolvedValue(undefined)
      const user = renderPage()
      await user.click((await screen.findByText('해 뜨는 거 보고 왔다')).closest('button')!)
      await user.click(await screen.findByRole('button', { name: '인증 취소' }))
      const confirm = await screen.findByRole('dialog', { name: /취소할까요/ })

      // 다시 받으면 11월 8일은 인증할 수 없는 날로 바뀐다(칸이 버튼이 아니다)
      monthRows = [
        execution({ scheduledDate: TODAY, status: 'PENDING', backfillable: false }),
        ...MONTH.slice(1),
      ]
      completedRows = COMPLETED.slice(1)
      await user.click(within(confirm).getByRole('button', { name: '인증 취소하기' }))

      await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(screen.queryByText('해 뜨는 거 보고 왔다')).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { name: '인증 달력' })).toHaveFocus()
    })

    it('취소 중에는 확인창이 닫히지 않는다 · 실패하면 버튼 줄 위에 오류', async () => {
      let rejectCancel: (e: unknown) => void = () => {}
      mockedCancel.mockReturnValue(new Promise((_, reject) => (rejectCancel = reject)))
      const user = renderPage()
      await user.click(await cellButton(/^11월 7일 · 다 한 날/))
      await user.click(await screen.findByRole('button', { name: '인증 취소' }))
      const confirm = await screen.findByRole('dialog', { name: /취소할까요/ })

      await user.click(within(confirm).getByRole('button', { name: '인증 취소하기' }))
      expect(within(confirm).getByRole('button', { name: '취소하는 중...' })).toBeDisabled()
      await user.keyboard('{Escape}')
      await user.click(confirm.parentElement!)
      expect(screen.getByRole('dialog', { name: /취소할까요/ })).toBeInTheDocument()

      // 다른 기기에서 먼저 취소했다
      monthRows = MONTH_AFTER_CANCEL_7
      rejectCancel(
        apiError(404, { success: false, errorCode: 'EXECUTION_NOT_FOUND', message: 'x' })
      )
      expect(await within(confirm).findByRole('alert')).toHaveTextContent('이미 취소된 인증이에요.')
      // 오류를 보이면서 달력은 다시 받은 서버 상태로 바뀐다 (D9)
      expect(await screen.findByLabelText(/^11월 7일 · 채울 수 있는 날/)).toBeInTheDocument()
    })

    it('챌린지 루틴 · 다시 인증할 수 없는 날 — 랭킹 줄과 "다시 인증할 수 없어요"', async () => {
      mockedGetRoutines.mockResolvedValue([routine({ challengeId: 5, endedAt: '2026-12-31' })])
      monthRows = [completed('2026-11-02', { backfillable: false })]
      const user = renderPage()
      await user.click(await cellButton(/^11월 2일 · 다 한 날/))
      await user.click(await screen.findByRole('button', { name: '인증 취소' }))

      const confirm = await screen.findByRole('dialog', { name: /11월 2일 인증을 취소할까요/ })
      expect(within(confirm).getByText('챌린지 랭킹에서 이 인증이 빠집니다')).toBeInTheDocument()
      // 3일 창이 지났는지 챌린지가 끝났는지 서버가 알려 주지 않는다 — 이유 없이 결과만 (D15)
      expect(
        within(confirm).getByText('취소하면 이 날짜는 다시 인증할 수 없어요.')
      ).toBeInTheDocument()
      expect(within(confirm).queryByText(/3일/)).not.toBeInTheDocument()
    })

    it('중단한 루틴의 완료 기록 — 취소할 수 있고 "중단한 루틴이라" 다시 인증할 수 없다고 알린다', async () => {
      mockedGetRoutines.mockResolvedValue([routine({ isActive: false })])
      monthRows = [completed('2026-11-07', { backfillable: false })]
      const user = renderPage()
      await user.click(await cellButton(/^11월 7일 · 다 한 날/))
      await user.click(await screen.findByRole('button', { name: '인증 취소' }))
      expect(await screen.findByText(/중단한 루틴이라/)).toBeInTheDocument()
    })

    it('최근 인증 항목 → 인증 상세(사진 · 메모 전체)', async () => {
      const user = renderPage()
      const item = (await screen.findByText('해 뜨는 거 보고 왔다')).closest('button')!
      await user.click(item)

      const detail = await screen.findByRole('dialog', { name: '아침 러닝' })
      expect(within(detail).getByRole('img', { name: '11월 8일 인증 사진' })).toHaveAttribute(
        'src',
        'https://cdn.example.com/a.jpg'
      )
      expect(within(detail).getByText(/해 뜨는 거 보고 왔다\s+둘째 줄/)).toBeInTheDocument()
      expect(within(detail).getByText('11월 8일(일)')).toBeInTheDocument()
    })

    it('오늘 인증하기 — 오늘이 미완료이고 인증할 수 있을 때만 사이드 맨 위에', async () => {
      monthRows = [
        execution({ scheduledDate: TODAY, status: 'PENDING', backfillable: true }),
        ...MONTH.slice(1),
      ]
      completedRows = COMPLETED.slice(1)
      const user = renderPage()

      await user.click(await screen.findByRole('button', { name: '✓ 오늘 인증하기' }))
      const dialog = await screen.findByRole('dialog', { name: '아침 러닝' })
      expect(within(dialog).getByText('오늘 · 11월 8일(일)')).toBeInTheDocument()
    })

    it('오늘 인증하기 → 성공 뒤 그 버튼이 사라지면 포커스는 오늘 칸으로 (D12)', async () => {
      mockedComplete.mockResolvedValue({ ...DONE_6, scheduledDate: TODAY })
      monthRows = [
        execution({ scheduledDate: TODAY, status: 'PENDING', backfillable: true }),
        ...MONTH.slice(1),
      ]
      completedRows = COMPLETED.slice(1)
      const user = renderPage()
      await user.click(await screen.findByRole('button', { name: '✓ 오늘 인증하기' }))
      const dialog = await screen.findByRole('dialog')

      monthRows = MONTH
      completedRows = COMPLETED
      await user.click(within(dialog).getByRole('button', { name: '인증 완료' }))
      await screen.findByRole('dialog', { name: '오늘도 해냈어요!' })
      expect(screen.queryByRole('button', { name: /오늘 인증하기/ })).not.toBeInTheDocument()

      await user.click(screen.getAllByRole('button', { name: '닫기' })[1])
      expect(await cellButton(/^11월 8일 오늘 · 다 한 날/)).toHaveFocus()
    })

    it('오늘 이미 인증했으면 오늘 인증하기가 없다', async () => {
      renderPage()
      await cellButton(/^11월 8일 오늘 · 다 한 날/)
      expect(screen.queryByRole('button', { name: /오늘 인증하기/ })).not.toBeInTheDocument()
    })

    it('빈도형 지난 날 — 개인 루틴은 눌러 인증, 챌린지 루틴은 3일 창 값이 없어 누를 수 없다', async () => {
      mockedGetRoutines.mockResolvedValue([
        routine({ scheduleType: 'WEEKLY_COUNT', targetCount: 3 }),
      ])
      const user = renderPage()
      await user.click(await cellButton(/^11월 4일 · 기록 없음/))
      expect(await screen.findByText('11월 4일(수) 인증')).toBeInTheDocument()
    })

    it('챌린지 빈도형의 지난 날은 버튼이 아니다', async () => {
      mockedGetRoutines.mockResolvedValue([
        routine({
          scheduleType: 'WEEKLY_COUNT',
          targetCount: 3,
          challengeId: 5,
          endedAt: '2026-12-31',
        }),
      ])
      renderPage()
      const label = await cell(/^11월 4일 · 기록 없음/)
      expect(label.tagName).not.toBe('BUTTON')
    })
  })
})
