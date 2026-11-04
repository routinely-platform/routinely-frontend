import { useCategories } from '@/hooks/useCategories'
import shared from '@/components/routine/routine.module.css'
import { cn } from '@/utils/cn'

interface CategoryPickerProps {
  value: string
  onChange: (code: string) => void
  /** 칩 묶음의 접근성 이름을 가리킨다 — 바깥 라벨의 id */
  labelledBy: string
}

/**
 * 카테고리 칩 — 루틴 폼과 (#15에서) 챌린지 폼이 함께 쓴다.
 * 12개라도 칩을 줄바꿈해 둔다 — 드롭다운은 고르기 전에 무엇이 있는지 보여 주지 않는다 (2026-10-30 결정)
 */
const CategoryPicker = ({ value, onChange, labelledBy }: CategoryPickerProps) => {
  const { data: categories, isError, refetch } = useCategories()

  if (!categories) {
    return isError ? (
      <div className={shared.dim} role="alert">
        카테고리를 불러오지 못했어요.{' '}
        <button
          type="button"
          className={cn(shared.btn, shared.btnGhost, shared.btnSm)}
          onClick={() => void refetch()}
        >
          다시 시도
        </button>
      </div>
    ) : (
      <div className={shared.dim}>카테고리를 불러오는 중...</div>
    )
  }

  return (
    <div className={shared.chips} role="group" aria-labelledby={labelledBy}>
      {categories.map((c) => (
        <button
          key={c.code}
          type="button"
          aria-pressed={value === c.code}
          className={cn(shared.chip, value === c.code && shared.chipOn)}
          onClick={() => onChange(c.code)}
        >
          {c.icon} {c.name}
        </button>
      ))}
    </div>
  )
}

export default CategoryPicker
