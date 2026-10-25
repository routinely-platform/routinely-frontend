import { useWatch, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

interface CharCounterProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  max: number
  className?: string
}

/**
 * 글자 수 카운터 — 값 구독(useWatch)을 이 조각 안에 둔다.
 * 입력이 속한 폼은 매 키 재렌더하지 않고, 카운터는 스스로 구독하므로 갱신을 빠뜨릴 수 없다
 */
const CharCounter = <T extends FieldValues>({
  control,
  name,
  max,
  className,
}: CharCounterProps<T>) => {
  const value: unknown = useWatch({ control, name })
  const length = typeof value === 'string' ? value.length : 0

  return (
    <span className={className}>
      {length}/{max}
    </span>
  )
}

export default CharCounter
