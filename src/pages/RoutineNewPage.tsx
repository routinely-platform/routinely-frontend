import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import RoutineForm from '@/components/routine/RoutineForm'
import shared from '@/components/routine/routine.module.css'
import { useRoutineTemplates } from '@/hooks/useRoutines'
import type { RoutineTemplate } from '@/types/routine'
import { cn } from '@/utils/cn'
import styles from './RoutineNewPage.module.css'

const parseTemplateId = (value: string | null) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export default function RoutineNewPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const templateId = parseTemplateId(params.get('templateId'))
  const templatesQuery = useRoutineTemplates()
  // 연결 끊기 — 쿼리를 지우면 아래 key가 바뀌어 폼이 빈 상태로 다시 만들어진다
  const disconnect = () => navigate('/routines/new', { replace: true })

  // 한 번 찾은 템플릿은 이 화면에서 붙잡아 둔다. 작성 중에 다른 탭에서 원본을 지우면 배경 재조회 결과에서
  // 빠지는데, 그때마다 다시 찾으면 폼이 안내 화면으로 바뀌어 입력값째 사라진다 (§6-1)
  const [heldTemplate, setHeldTemplate] = useState<RoutineTemplate>()
  const found = templatesQuery.data?.find((t) => t.templateId === templateId)
  if (found && found.templateId !== heldTemplate?.templateId) setHeldTemplate(found)
  const template = heldTemplate?.templateId === templateId ? heldTemplate : found

  let content
  if (templateId === null) {
    content = <RoutineForm key="blank" onDisconnect={disconnect} />
  } else if (template) {
    content = (
      <RoutineForm key={template.templateId} template={template} onDisconnect={disconnect} />
    )
  } else if (!templatesQuery.data) {
    // 프리필할 값이 오기 전에는 폼을 그리지 않는다 — 다 친 뒤에 값이 덮이면 안 된다
    content = templatesQuery.isError ? (
      <div className={cn(shared.card, styles.state)} role="alert">
        <p className={styles.stateText}>템플릿을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>
        <div className={styles.stateActions}>
          <button
            type="button"
            className={cn(shared.btn, shared.btnOutline, shared.btnSm)}
            onClick={() => void templatesQuery.refetch()}
          >
            다시 시도
          </button>
          <button
            type="button"
            className={cn(shared.btn, shared.btnGhost, shared.btnSm)}
            onClick={disconnect}
          >
            처음부터 만들기
          </button>
        </div>
      </div>
    ) : (
      <div className={styles.state} role="status">
        <p className={styles.stateText}>템플릿을 불러오는 중...</p>
      </div>
    )
  } else {
    // 처음 열 때부터 없을 때만 — 지워진 템플릿 주소로 바로 들어온 경우
    content = (
      <div className={cn(shared.card, styles.state)} role="alert">
        <p className={styles.stateText}>템플릿을 찾을 수 없어요. 이미 삭제되었을 수 있어요.</p>
        <button
          type="button"
          className={cn(shared.btn, shared.btnOutline, shared.btnSm)}
          onClick={disconnect}
        >
          처음부터 만들기
        </button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/routines" className={styles.back}>
          ‹ 내 루틴
        </Link>
        <h1 className={styles.title}>새 루틴 만들기</h1>
        <div className={cn(shared.card, styles.card)}>{content}</div>
      </div>
    </div>
  )
}
