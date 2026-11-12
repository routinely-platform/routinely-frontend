import { useEffect, useRef, useState } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface OpenDialog {
  element: HTMLElement
  /** 최신 Esc 처리 함수 — 렌더마다 바뀌어도 쌓인 자리는 그대로 둔다 */
  onEscape: { current: ((event: KeyboardEvent) => void) | undefined }
}

/**
 * 열린 대화상자 — 나중에 연 것이 뒤에 온다. Esc · Tab은 맨 뒤(맨 위 창)만 받는다.
 *
 * 창마다 document 리스너를 따로 걸면 키 한 번에 모든 창이 반응한다(위 창 Esc에 아래 창도 닫힌다).
 * "내가 맨 위인가"를 각 리스너가 따지게 해도 막히지 않는다 — 실제 브라우저는 리스너 사이에
 * 마이크로태스크를 비워서, 위 창 리스너가 닫기를 부르면 React가 그 창을 먼저 지우고
 * 다음 리스너(아래 창)는 자기가 맨 위라고 본다. 그래서 리스너를 하나만 두고 맨 위에만 넘긴다
 */
const openDialogs: OpenDialog[] = []

const trapTab = (dialog: HTMLElement, event: KeyboardEvent) => {
  const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
  if (items.length === 0) {
    event.preventDefault()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  const outside = !dialog.contains(active)
  // 대화상자 자체(처음 포커스 자리)에서 Shift+Tab도 마지막으로 보낸다
  if (event.shiftKey && (active === first || active === dialog || outside)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (active === last || outside)) {
    event.preventDefault()
    first.focus()
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  const top = openDialogs[openDialogs.length - 1]
  if (!top) return
  if (event.key === 'Tab') trapTab(top.element, event)
  else if (event.key === 'Escape') top.onEscape.current?.(event)
}

interface DialogFocusOptions {
  /** 이 창이 맨 위일 때만 불린다. 조합 중 · 저장 중 판단은 부르는 쪽이 한다 */
  onEscape?: (event: KeyboardEvent) => void
}

/**
 * 대화상자 키보드 — 열릴 때 안으로 포커스를 옮기고, Tab · Shift+Tab을 안에서만 돌리고,
 * Esc를 맨 위 창에만 넘기고, 닫히면 연 자리로 포커스를 돌려준다.
 * 가두지 않으면 Shift+Tab으로 배경 링크에 닿아 대화상자를 연 채로 다른 화면으로 넘어간다.
 * 돌려준 ref를 role="dialog" 요소에 걸고, 그 요소에 tabIndex={-1}을 준다
 */
export function useDialogFocus<T extends HTMLElement>({ onEscape }: DialogFocusOptions = {}) {
  const dialogRef = useRef<T>(null)
  const onEscapeRef = useRef(onEscape)
  // 연 버튼 — 첫 렌더에서 잰다. 안쪽 autoFocus가 먼저 포커스를 옮기기 전이다
  const [opener] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null
  )

  useEffect(() => {
    onEscapeRef.current = onEscape
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    // 안쪽 autoFocus가 이미 잡았으면 그대로 둔다
    if (!dialog.contains(document.activeElement)) dialog.focus()

    const entry: OpenDialog = { element: dialog, onEscape: onEscapeRef }
    openDialogs.push(entry)
    if (openDialogs.length === 1) document.addEventListener('keydown', handleKeyDown)

    return () => {
      openDialogs.splice(openDialogs.indexOf(entry), 1)
      if (openDialogs.length === 0) document.removeEventListener('keydown', handleKeyDown)
      if (opener?.isConnected) opener.focus()
    }
  }, [opener])

  return dialogRef
}
