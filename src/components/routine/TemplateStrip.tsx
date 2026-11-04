import { Link } from 'react-router-dom'
import Tooltip from '@/components/common/Tooltip'
import type { Category, RoutineTemplate } from '@/types/routine'
import { cn } from '@/utils/cn'
import { scheduleLabel } from '@/utils/routine'
import shared from './routine.module.css'
import styles from './TemplateStrip.module.css'

interface TemplateStripProps {
  templates: RoutineTemplate[]
  categoryOf: (code: string) => Category | undefined
  onManage: () => void
}

const TEMPLATE_TOOLTIP = (
  <>
    템플릿은 자주 쓰는 루틴 설정을 저장해 둔 거예요. 템플릿을 고치거나 지워도{' '}
    <b>이미 시작한 루틴에는 영향이 없어요.</b>
  </>
)

/** 루틴 탭 위 — 탭을 옮기지 않고 템플릿에서 바로 시작한다. 템플릿이 없으면 부모가 그리지 않는다 */
const TemplateStrip = ({ templates, categoryOf, onManage }: TemplateStripProps) => (
  <>
    <div className={cn(shared.card, styles.strip)}>
      <span className={styles.label}>
        템플릿으로 빠르게 시작
        <Tooltip content={TEMPLATE_TOOLTIP} label="템플릿이란" />
      </span>
      <div className={cn(shared.chips, styles.chipList)}>
        {templates.map((t) => (
          <Link
            key={t.templateId}
            to={`/routines/new?templateId=${t.templateId}`}
            className={shared.chip}
          >
            {categoryOf(t.categoryCode)?.icon} {t.title}
            <span className={styles.chipSchedule}>· {scheduleLabel(t)}</span>
          </Link>
        ))}
      </div>
      <button
        type="button"
        className={cn(shared.btn, shared.btnGhost, shared.btnSm)}
        onClick={onManage}
      >
        템플릿 관리 ›
      </button>
    </div>

    <button type="button" className={cn(shared.card, styles.collapsed)} onClick={onManage}>
      <span aria-hidden="true">✦</span>
      <span className={styles.collapsedText}>
        <b>템플릿으로 빠르게 시작</b>{' '}
        <span className={shared.dim}>· 저장된 템플릿 {templates.length}개</span>
      </span>
      <span aria-hidden="true">›</span>
    </button>
  </>
)

export default TemplateStrip
