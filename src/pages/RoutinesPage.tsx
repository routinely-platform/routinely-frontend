import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DeleteTemplateDialog from '@/components/routine/DeleteTemplateDialog'
import RoutineCard from '@/components/routine/RoutineCard'
import TemplateCard from '@/components/routine/TemplateCard'
import TemplateStrip from '@/components/routine/TemplateStrip'
import shared from '@/components/routine/routine.module.css'
import { useCategoryLookup } from '@/hooks/useCategories'
import { useMyRoutines, useRoutineTemplates } from '@/hooks/useRoutines'
import type { RoutineStatus, RoutineTemplate } from '@/types/routine'
import { cn } from '@/utils/cn'
import { deriveRoutineStatus, serverToday, sortByStartedAtDesc } from '@/utils/routine'
import styles from './RoutinesPage.module.css'

type Tab = 'routines' | 'templates'

const FILTERS: { status: RoutineStatus; label: string }[] = [
  { status: 'ongoing', label: '진행 중' },
  { status: 'completed', label: '완료됨' },
  { status: 'stopped', label: '중단됨' },
]

// 필터 결과가 0일 때 — "아직 시작한 루틴이 없어요"를 여기 쓰면 거짓말이다. 완료됨 · 중단됨엔 생성 CTA를 두지 않는다
const FILTER_EMPTY: Record<RoutineStatus, { art: string; title: string; body: string }> = {
  ongoing: {
    art: '🗂',
    title: '진행 중인 루틴이 없어요',
    body: '다른 탭에 끝났거나 중단한 루틴이 있어요.',
  },
  completed: {
    art: '🎉',
    title: '아직 완주한 루틴이 없어요',
    body: '종료일이 지난 루틴이 여기에 초록으로 모여요.',
  },
  stopped: {
    art: '🗂',
    title: '중단한 루틴이 없어요',
    body: '중단한 루틴의 기록은 달력에 그대로 남아요.',
  },
}

const parseTab = (value: string | null): Tab => (value === 'templates' ? 'templates' : 'routines')
const parseStatus = (value: string | null): RoutineStatus =>
  value === 'completed' || value === 'stopped' ? value : 'ongoing'

const LoadingState = () => (
  <div className={styles.state} role="status">
    <div className={styles.spinner} />
    <span className={styles.stateText}>불러오는 중...</span>
  </div>
)

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <div className={cn(shared.card, styles.state)} role="alert">
    <p className={styles.stateText}>{message}</p>
    <button
      type="button"
      className={cn(shared.btn, shared.btnOutline, shared.btnSm)}
      onClick={onRetry}
    >
      다시 시도
    </button>
  </div>
)

interface RoutinesTabProps {
  status: RoutineStatus
  onStatusChange: (status: RoutineStatus) => void
  onShowTemplates: () => void
}

const RoutinesTab = ({ status, onStatusChange, onShowTemplates }: RoutinesTabProps) => {
  const routinesQuery = useMyRoutines()
  const templatesQuery = useRoutineTemplates()
  const categoryOf = useCategoryLookup()
  const templates = templatesQuery.data ?? []

  // 스트립은 보조 입구라 템플릿 조회가 실패해도 화면을 막지 않는다 — 템플릿이 없을 때와 같이 숨긴다
  const strip = templates.length > 0 && (
    <div className={styles.section}>
      <TemplateStrip templates={templates} categoryOf={categoryOf} onManage={onShowTemplates} />
    </div>
  )

  const routines = routinesQuery.data
  if (!routines) {
    return (
      <>
        {strip}
        <div className={styles.section}>
          {routinesQuery.isError ? (
            <ErrorState
              message="루틴 목록을 불러오지 못했어요."
              onRetry={() => void routinesQuery.refetch()}
            />
          ) : (
            <LoadingState />
          )}
        </div>
      </>
    )
  }

  if (routines.length === 0) {
    return (
      <>
        {strip}
        <div className={cn(shared.card, styles.empty, styles.section)}>
          <div className={styles.emptyArt}>🌱</div>
          <h2 className={styles.emptyTitle}>아직 시작한 루틴이 없어요</h2>
          <p className={styles.emptyBody}>저장한 템플릿에서 바로 시작할 수도 있어요.</p>
          <div className={styles.emptyActions}>
            <Link to="/routines/new" className={cn(shared.btn, shared.btnPrimary)}>
              + 루틴 시작하기
            </Link>
            <button
              type="button"
              className={cn(shared.btn, shared.btnOutline)}
              onClick={onShowTemplates}
            >
              템플릿에서 시작
            </button>
          </div>
        </div>
      </>
    )
  }

  const today = serverToday()
  const withStatus = routines.map((routine) => ({
    routine,
    status: deriveRoutineStatus(routine, today),
  }))
  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.status, withStatus.filter((r) => r.status === f.status).length])
  ) as Record<RoutineStatus, number>
  const visible = sortByStartedAtDesc(
    withStatus.filter((r) => r.status === status).map((r) => r.routine)
  )
  const empty = FILTER_EMPTY[status]

  return (
    <>
      {strip}
      <div className={cn(shared.chips, styles.filters)} role="group" aria-label="루틴 상태">
        {FILTERS.map((f) => (
          <button
            key={f.status}
            type="button"
            aria-pressed={status === f.status}
            className={cn(shared.chip, status === f.status && shared.chipOn)}
            onClick={() => onStatusChange(f.status)}
          >
            {f.label} <span className={shared.count}>{counts[f.status]}</span>
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className={shared.grid}>
          {visible.map((routine) => (
            <RoutineCard
              key={routine.routineId}
              routine={routine}
              status={status}
              category={categoryOf(routine.categoryCode)}
            />
          ))}
        </div>
      ) : (
        <div className={cn(shared.card, styles.empty)}>
          <div className={styles.emptyArt}>{empty.art}</div>
          <h2 className={styles.emptyTitle}>{empty.title}</h2>
          <p className={styles.emptyBody}>{empty.body}</p>
          {status === 'ongoing' && (
            <div className={styles.emptyActions}>
              <Link to="/routines/new" className={cn(shared.btn, shared.btnPrimary)}>
                + 루틴 시작하기
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  )
}

const TemplatesTab = () => {
  const templatesQuery = useRoutineTemplates()
  const categoryOf = useCategoryLookup()
  const [deleting, setDeleting] = useState<RoutineTemplate | null>(null)

  const templates = templatesQuery.data
  if (!templates) {
    return (
      <div className={styles.section}>
        {templatesQuery.isError ? (
          <ErrorState
            message="템플릿 목록을 불러오지 못했어요."
            onRetry={() => void templatesQuery.refetch()}
          />
        ) : (
          <LoadingState />
        )}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className={cn(shared.card, styles.empty, styles.section)}>
        <div className={styles.emptyArt}>✦</div>
        <h2 className={styles.emptyTitle}>저장한 템플릿이 없어요</h2>
        <p className={styles.emptyBody}>
          자주 하는 루틴을 템플릿으로 저장해 두면 다시 시작하기 쉬워요
        </p>
      </div>
    )
  }

  return (
    <div className={styles.section}>
      <div className={shared.grid}>
        {templates.map((template) => (
          <TemplateCard
            key={template.templateId}
            template={template}
            category={categoryOf(template.categoryCode)}
            onDelete={setDeleting}
          />
        ))}
      </div>
      <div className={styles.note}>
        ✦ 템플릿은 <b>루틴을 만드는 도구</b>일 뿐이에요. 고치거나 지워도{' '}
        <b>이미 진행 중인 루틴은 그대로</b>
        입니다.
      </div>
      {deleting && <DeleteTemplateDialog template={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}

export default function RoutinesPage() {
  // 탭 · 필터는 URL에 둔다 — 새로고침 · 루틴 상세에서 뒤로가기 해도 보던 자리로 돌아온다
  const [params, setParams] = useSearchParams()
  const tab = parseTab(params.get('tab'))
  const status = parseStatus(params.get('status'))
  const templateCount = useRoutineTemplates().data?.length

  const showTab = (next: Tab) => setParams(next === 'templates' ? { tab: 'templates' } : {})
  const showStatus = (next: RoutineStatus) => setParams(next === 'ongoing' ? {} : { status: next })

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div>
            <h1 className={styles.title}>내 루틴</h1>
            <p className={styles.subtitle}>지금 돌아가는 것과, 다시 시작할 수 있는 것.</p>
          </div>
          <Link to="/routines/new" className={cn(shared.btn, shared.btnPrimary)}>
            + 루틴 시작
          </Link>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="내 루틴">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'routines'}
            className={cn(styles.tab, tab === 'routines' && styles.tabOn)}
            onClick={() => showTab('routines')}
          >
            루틴
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'templates'}
            className={cn(styles.tab, tab === 'templates' && styles.tabOn)}
            onClick={() => showTab('templates')}
          >
            템플릿{' '}
            {templateCount !== undefined && <span className={shared.count}>{templateCount}</span>}
          </button>
        </div>

        {tab === 'routines' ? (
          <RoutinesTab
            status={status}
            onStatusChange={showStatus}
            onShowTemplates={() => showTab('templates')}
          />
        ) : (
          <TemplatesTab />
        )}
      </div>
    </div>
  )
}
