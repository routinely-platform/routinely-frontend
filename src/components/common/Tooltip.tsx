import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import styles from './Tooltip.module.css'

// 본문이 뷰포트 가장자리에서 띄울 최소 여백(px)
const VIEWPORT_MARGIN = 8

type Align = 'center' | 'start' | 'end'

interface TooltipProps {
  /** "왜"와 "규칙"만 담는다. 없으면 화면을 쓸 수 없는 정보는 넣지 않는다 */
  content: ReactNode
  /** 트리거의 aria-label — 이 툴팁이 답하는 질문. 예: '무엇을 세나요' */
  label: string
}

// jsdom처럼 :focus-visible을 모르는 환경에서는 포커스를 키보드로 본다
const isFocusVisible = (element: Element) => {
  try {
    return element.matches(':focus-visible')
  } catch {
    return true
  }
}

const Tooltip = ({ content, label }: TooltipProps) => {
  const [open, setOpen] = useState(false)
  const [align, setAlign] = useState<Align>('center')
  const tooltipId = useId()
  const wrapRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const bodyRef = useRef<HTMLSpanElement>(null)
  // 직전 click을 일으킨 포인터 종류 — 마우스 클릭은 hover가 이미 열었으므로 토글하지 않는다
  const lastPointerType = useRef<string | null>(null)

  // 열릴 때 가운데 정렬로 뷰포트를 벗어나는지 재고, 벗어나는 쪽 반대편 가장자리에 붙인다
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !bodyRef.current) return

    const trigger = triggerRef.current.getBoundingClientRect()
    const bodyWidth = bodyRef.current.getBoundingClientRect().width
    const centeredLeft = trigger.left + trigger.width / 2 - bodyWidth / 2

    if (centeredLeft < VIEWPORT_MARGIN) {
      setAlign('start')
    } else if (centeredLeft + bodyWidth > window.innerWidth - VIEWPORT_MARGIN) {
      setAlign('end')
    } else {
      setAlign('center')
    }
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
    if (event.pointerType === 'mouse') setOpen(false)
  }

  const handleClick = () => {
    const pointerType = lastPointerType.current
    lastPointerType.current = null
    if (pointerType === 'mouse') return
    // 터치 탭 · 펜 · 키보드(Enter/Space)는 토글
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
          lastPointerType.current = event.pointerType
        }}
        onClick={handleClick}
        // 마우스 클릭이나 탭으로 생긴 포커스는 열지 않는다 — 탭 토글과 겹친다
        onFocus={(event) => {
          if (isFocusVisible(event.currentTarget)) setOpen(true)
        }}
        onBlur={() => setOpen(false)}
      >
        <span aria-hidden="true">i</span>
      </button>
      <span ref={bodyRef} id={tooltipId} role="tooltip" className={styles.body} data-align={align}>
        {content}
      </span>
    </span>
  )
}

export default Tooltip
