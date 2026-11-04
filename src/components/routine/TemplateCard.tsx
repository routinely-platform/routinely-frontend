import { Link } from 'react-router-dom'
import type { Category, RoutineTemplate } from '@/types/routine'
import { cn } from '@/utils/cn'
import { scheduleLabel } from '@/utils/routine'
import shared from './routine.module.css'
import styles from './TemplateCard.module.css'

interface TemplateCardProps {
  template: RoutineTemplate
  category: Category | undefined
  onDelete: (template: RoutineTemplate) => void
}

// "N번 시작했어요"는 v2 — 템플릿 응답에 횟수가 없다 (#19 MVP 범위)
const TemplateCard = ({ template, category, onDelete }: TemplateCardProps) => (
  <div className={cn(shared.card, styles.card)}>
    <div className={styles.head}>
      {category && (
        <span className={styles.emoji} aria-hidden="true">
          {category.icon}
        </span>
      )}
      <div className={styles.text}>
        <div className={styles.title}>{template.title}</div>
        <div className={styles.meta}>
          {category?.name ?? template.categoryCode} · {scheduleLabel(template)}
        </div>
      </div>
    </div>
    <div className={styles.actions}>
      <Link
        to={`/routines/new?templateId=${template.templateId}`}
        className={cn(shared.btn, shared.btnPrimary, shared.btnSm, styles.start)}
      >
        이 템플릿으로 시작
      </Link>
      <button
        type="button"
        className={cn(shared.btn, shared.btnGhost, shared.btnSm)}
        aria-label={`${template.title} 템플릿 삭제`}
        onClick={() => onDelete(template)}
      >
        🗑
      </button>
    </div>
  </div>
)

export default TemplateCard
