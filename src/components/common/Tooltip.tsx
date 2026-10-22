import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent, ReactNode } from 'react'
import styles from './Tooltip.module.css'

// 본문이 뷰포트 가장자리에서 띄울 최소 여백(px)
const VIEWPORT_MARGIN = 8
// 화살표가 본문의 둥근 모서리 밖으로 나가지 않게 두는 안쪽 여백(px)
const ARROW_INSET = 12

interface TooltipProps {
  /** "왜"와 "규칙"만 담는다. 없으면 화면을 쓸 수 없는 정보는 넣지 않는다 */
  content: ReactNode
  /** 트리거의 aria-label — 이 툴팁이 답하는 질문. 예: '무엇을 세나요' */
  label: string
}

/** 본문 위치 — wrap 기준 본문 left와, 본문 기준 화살표 left(px) */
interface Placement {
  bodyLeft: number
  arrowLeft: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

// :focus-visible을 모르는 구형 브라우저에서는 포커스를 키보드로 본다
const isFocusVisible = (element: Element) => {
  try {
    return element.matches(':focus-visible')
  } catch {
    return true
  }
}

const Tooltip = ({ content, label }: TooltipProps) => {
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<Placement | null>(null)
  const tooltipId = useId()
  const wrapRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const bodyRef = useRef<HTMLSpanElement>(null)
  // 트리거를 누르고 있는 포인터 종류. 누름이 끝나는 click · blur · 이탈 · 취소에서 비운다
  const pressingPointer = useRef<string | null>(null)

  // 열릴 때 가운데 정렬 위치를 재고, 뷰포트 여백 안으로 밀어 넣는다
  useLayoutEffect(() => {
    if (!open || !wrapRef.current || !triggerRef.current || !bodyRef.current) return

    const wrap = wrapRef.current.getBoundingClientRect()
    const trigger = triggerRef.current.getBoundingClientRect()
    const bodyWidth = bodyRef.current.getBoundingClientRect().width
    const triggerCenter = trigger.left + trigger.width / 2

    // 뷰포트 기준 본문 왼쪽. 본문이 뷰포트보다 넓으면 왼쪽 여백을 우선한다
    const viewportLeft = clamp(
      triggerCenter - bodyWidth / 2,
      VIEWPORT_MARGIN,
      window.innerWidth - VIEWPORT_MARGIN - bodyWidth
    )

    setPlacement({
      bodyLeft: viewportLeft - wrap.left,
      arrowLeft: clamp(triggerCenter - viewportLeft, ARROW_INSET, bodyWidth - ARROW_INSET),
    })
  }, [open])

  // 열려 있는 동안만 Esc와 바깥 누름을 듣는다
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open])

  // hover는 마우스일 때만 — 터치는 pointerenter가 탭과 함께 와서 토글과 겹친다
  const handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') setOpen(true)
  }
  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    setOpen(false)
    // 누른 채 벗어나면 트리거에 click이 오지 않는다 — 남겨 두면 다음 포커스를 막는다
    pressingPointer.current = null
  }

  const handleClick = (event: MouseEvent) => {
    const pointerType = pressingPointer.current
    pressingPointer.current = null
    // detail 0은 키보드(Enter/Space)가 일으킨 click이다 — 직전 포인터와 상관없이 토글
    // 마우스 클릭은 hover가 이미 열었으므로 토글하지 않는다
    if (event.detail !== 0 && pointerType === 'mouse') return
    setOpen((prev) => !prev)
  }

  return (
    <span
      ref={wrapRef}
      className={styles.wrap}
      data-state={open ? 'open' : 'closed'}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-describedby={tooltipId}
        onPointerDown={(event) => {
          pressingPointer.current = event.pointerType
        }}
        onPointerCancel={() => {
          pressingPointer.current = null
        }}
        onClick={handleClick}
        // 포인터로 누르며 생긴 포커스는 열지 않는다 — 이어지는 click의 토글과 겹친다
        onFocus={(event) => {
          if (pressingPointer.current === null && isFocusVisible(event.currentTarget)) {
            setOpen(true)
          }
        }}
        onBlur={() => {
          setOpen(false)
          pressingPointer.current = null
        }}
      >
        <span aria-hidden="true">i</span>
      </button>
      <span
        ref={bodyRef}
        id={tooltipId}
        role="tooltip"
        className={styles.body}
        style={placement ? { left: placement.bodyLeft, transform: 'none' } : undefined}
      >
        {content}
        <span
          className={styles.arrow}
          aria-hidden="true"
          style={placement ? { left: placement.arrowLeft } : undefined}
        />
      </span>
    </span>
  )
}

export default Tooltip
