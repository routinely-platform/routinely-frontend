import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState, type ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCategories } from '@/api/category'
import { getExecutions } from '@/api/execution'
import { getMyRoutines, getRoutineTemplates } from '@/api/routine'
import { getMyProfile } from '@/api/user'
import LoginPage from '@/pages/LoginPage'
import ProfilePage from '@/pages/ProfilePage'
import RoutineDetailPage from '@/pages/RoutineDetailPage'
import RoutineNewPage from '@/pages/RoutineNewPage'
import RoutinesPage from '@/pages/RoutinesPage'
import SignupPage from '@/pages/SignupPage'
import type { RoutineTemplate } from '@/types/routine'
import type { MyProfile } from '@/types/user'
import { expectImeSafe, findTextInputs, labelOf } from './ime'

vi.mock('@/api/auth', () => ({ postLogin: vi.fn(), postSignup: vi.fn() }))
vi.mock('@/api/user', () => ({
  getMyProfile: vi.fn(),
  updateProfile: vi.fn(),
  uploadProfileImage: vi.fn(),
  deleteProfileImage: vi.fn(),
}))
vi.mock('@/api/routine', () => ({
  getMyRoutines: vi.fn(),
  getRoutineTemplates: vi.fn(),
  startRoutine: vi.fn(),
  createRoutineTemplate: vi.fn(),
  updateRoutineTemplate: vi.fn(),
  deleteRoutineTemplate: vi.fn(),
  updateRoutine: vi.fn(),
  stopRoutine: vi.fn(),
}))
vi.mock('@/api/execution', () => ({ getExecutions: vi.fn() }))
vi.mock('@/api/category', () => ({ getCategories: vi.fn() }))

const TEMPLATE: RoutineTemplate = {
  templateId: 7,
  title: '아침 러닝',
  categoryCode: 'EXERCISE',
  scheduleType: 'MONTHLY_COUNT',
  daysOfWeek: null,
  targetCount: 10,
  challengeId: null,
}

const withQuery = (ui: ReactElement) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {ui}
  </QueryClientProvider>
)

const PROFILE: MyProfile = {
  userId: 1,
  email: 'me@example.com',
  nickname: '루티',
  bio: null,
  profileImageUrl: null,
  createdAt: '2026-10-01T00:00:00',
  nicknameChangeableAt: null,
}

interface ImeScenario {
  name: string
  /** 이 시나리오가 훑는 입력을 가진 파일 — 커버리지 가드가 본다 */
  files: string[]
  render: () => ReactElement
  /** 입력이 보일 때까지 화면을 연다 — 모달 열기 클릭 등 */
  open?: () => Promise<void>
}

/**
 * 입력이 있는 화면은 여기에 시나리오를 등록한다.
 * 등록하지 않으면 아래 커버리지 가드가 실패한다.
 */
const SCENARIOS: ImeScenario[] = [
  {
    name: '로그인',
    files: ['/src/pages/LoginPage.tsx', '/src/components/auth/PasswordField.tsx'],
    render: () => (
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    ),
  },
  {
    name: '회원가입',
    files: ['/src/pages/SignupPage.tsx', '/src/components/auth/PasswordField.tsx'],
    render: () => (
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    ),
  },
  {
    name: '프로필 수정 모달',
    files: ['/src/components/profile/EditProfileModal.tsx'],
    render: () => (
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <ProfilePage />
      </QueryClientProvider>
    ),
    open: async () => {
      await userEvent.setup().click(await screen.findByRole('button', { name: /프로필 수정/ }))
      await screen.findByRole('dialog')
    },
  },
  {
    // 템플릿 프리필 — 출처 배지 · 중복 경고 · 체크박스가 제목을 구독해도 제목 입력은 그대로여야 한다
    name: '루틴 시작 폼',
    files: [
      '/src/components/routine/RoutineForm.tsx',
      '/src/components/routine/DefinitionFields.tsx',
    ],
    render: () =>
      withQuery(
        <MemoryRouter initialEntries={['/routines/new?templateId=7']}>
          <RoutineNewPage />
        </MemoryRouter>
      ),
    open: async () => {
      await screen.findByDisplayValue('아침 러닝')
    },
  },
  {
    name: '템플릿 수정 대화상자',
    files: ['/src/components/routine/DefinitionFields.tsx'],
    render: () =>
      withQuery(
        <MemoryRouter initialEntries={['/routines?tab=templates']}>
          <RoutinesPage />
        </MemoryRouter>
      ),
    open: async () => {
      await userEvent.setup().click(await screen.findByRole('button', { name: /템플릿 수정/ }))
      await screen.findByRole('dialog')
    },
  },
  {
    // 인증 기록 0건 — 주기 · 시작일까지 열린 가장 넓은 폼. 수정 중 배경 refetch가 화면을 갈아엎으면 안 된다
    name: '루틴 수정 대화상자',
    files: [
      '/src/components/routine/EditRoutineDialog.tsx',
      '/src/components/routine/DefinitionFields.tsx',
    ],
    render: () => {
      vi.mocked(getMyRoutines).mockResolvedValue([
        {
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
        },
      ])
      return withQuery(
        <MemoryRouter initialEntries={['/routines/1']}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetailPage />} />
          </Routes>
        </MemoryRouter>
      )
    },
    open: async () => {
      await userEvent.setup().click(await screen.findByRole('button', { name: '설정 수정' }))
      await screen.findByRole('dialog')
    },
  },
]

/** 입력이 있지만 조합 입력이 아니어서 시나리오가 필요 없는 파일 — 사유를 함께 적는다 */
const EXCLUDED: Record<string, string> = {
  '/src/components/profile/ProfileImageEditor.tsx': 'type="file"만 있다 — 조합이 없다',
}

describe('한글 IME — 조합 중 입력 노드 · 포커스 · 값이 유지된다', () => {
  beforeEach(() => {
    vi.mocked(getMyProfile).mockResolvedValue(PROFILE)
    vi.mocked(getMyRoutines).mockResolvedValue([])
    vi.mocked(getRoutineTemplates).mockResolvedValue([TEMPLATE])
    vi.mocked(getExecutions).mockResolvedValue([])
    vi.mocked(getCategories).mockResolvedValue([
      { code: 'EXERCISE', name: '운동', icon: '🏃', displayOrder: 1 },
    ])
  })

  it.each(SCENARIOS)('$name', async (scenario) => {
    render(scenario.render())
    await scenario.open?.()

    const inputs = findTextInputs(document.body)
    expect(inputs.length).toBeGreaterThan(0)

    for (const el of inputs) {
      const label = labelOf(el)
      const isPassword = el.getAttribute('type') === 'password'
      expectImeSafe(el, {
        requery: () => screen.getByLabelText(label),
        // 비밀번호는 ASCII만 받는다 — 한글은 지워지는 게 정답이라 값은 보지 않는다
        expectedValue: isPassword ? null : undefined,
      })
    }
  })

  it('프로필 수정 — 한 줄 소개를 조합하면 글자 수 카운터도 갱신된다', async () => {
    render(SCENARIOS[2].render())
    await SCENARIOS[2].open?.()

    const bio = screen.getByLabelText('한 줄 소개')
    expectImeSafe(bio, { requery: () => screen.getByLabelText('한 줄 소개') })
    expect(screen.getByText('1/100')).toBeInTheDocument()
  })
})

describe('IME 검사 자체 — 공짜로 통과하지 않는다', () => {
  // 값이 바뀔 때마다 key가 바뀌어 입력이 매 글자 새로 만들어진다
  const RemountingInput = () => {
    const [value, setValue] = useState('')
    return (
      <label>
        이름
        <input key={value} value={value} onChange={(e) => setValue(e.target.value)} />
      </label>
    )
  }

  it('입력이 리마운트되면 실패한다', () => {
    render(<RemountingInput />)
    const el = screen.getByLabelText('이름')

    expect(() => expectImeSafe(el, { requery: () => screen.getByLabelText('이름') })).toThrow(
      /새로 만들어졌다/
    )
  })

  it('조합 입력만 찾는다 — 편집 영역은 포함하고 file · date · 편집 불가 영역은 뺀다', () => {
    render(
      <form>
        <input aria-label="제목" />
        <textarea aria-label="설명" />
        <div contentEditable aria-label="메모" suppressContentEditableWarning />
        <div contentEditable={false} aria-label="읽기 전용" />
        <input type="file" aria-label="사진" />
        <input type="date" aria-label="시작일" />
      </form>
    )

    expect(findTextInputs(document.body).map(labelOf)).toEqual(['제목', '설명', '메모'])
  })

  // 편집 영역도 값이 바뀔 때마다 key가 바뀌면 매 글자 새로 만들어진다
  const RemountingEditable = () => {
    const [text, setText] = useState('')
    return (
      <div
        key={text}
        contentEditable
        suppressContentEditableWarning
        aria-label="메모"
        onInput={(e) => setText(e.currentTarget.textContent ?? '')}
      />
    )
  }

  it('편집 영역이 리마운트되면 실패한다', () => {
    render(<RemountingEditable />)
    const [el] = findTextInputs(document.body)

    expect(() => expectImeSafe(el, { requery: () => screen.getByLabelText('메모') })).toThrow(
      /새로 만들어졌다/
    )
  })
})

describe('IME 커버리지 가드', () => {
  const sources = import.meta.glob<string>(['/src/**/*.tsx', '!/src/**/*.test.tsx'], {
    query: '?raw',
    import: 'default',
    eager: true,
  })
  const registered = new Set(SCENARIOS.flatMap((s) => s.files))

  it('입력이 있는 파일은 모두 IME 시나리오에 등록되어 있다', () => {
    const withInputs = Object.entries(sources)
      .filter(([, source]) => /<input\b|<textarea\b|contentEditable/.test(source))
      .map(([path]) => path)

    const missing = withInputs.filter((path) => !registered.has(path) && !(path in EXCLUDED))
    expect(missing, '위 파일에 입력이 있다 — SCENARIOS에 시나리오를 등록한다').toEqual([])
  })

  it('등록 · 제외 목록에 없는 파일이 남아 있지 않다', () => {
    const stale = [...registered, ...Object.keys(EXCLUDED)].filter((path) => !(path in sources))
    expect(stale).toEqual([])
  })
})
