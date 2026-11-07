import { useEffect, useRef, useState } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * 대화상자 키보드 포커스 — 열릴 때 안으로 옮기고, Tab · Shift+Tab을 안에서만 돌리고, 닫히면 연 자리로 돌려준다.
 * 가두지 않으면 Shift+Tab으로 배경 링크에 닿아 대화상자를 연 채로 다른 화면으로 넘어간다.
 * 돌려준 ref를 role="dialog" 요소에 걸고, 그 요소에 tabIndex={-1}을 준다
 */
export function useDialogFocus<T extends HTMLElement>() {
  const dialogRef = useRef<T>(null)
  // 연 버튼 — 첫 렌더에서 잰다. 안쪽 autoFocus가 먼저 포커스를 옮기기 전이다
  const [opener] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    // 안쪽 autoFocus가 이미 잡았으면 그대로 둔다
    if (!dialog.contains(document.activeElement)) dialog.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
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

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (opener?.isConnected) opener.focus()
    }
  }, [opener])

  return dialogRef
}
