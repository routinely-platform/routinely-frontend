import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

/**
 * compositionend 뒤 이 시간(ms) 안에 온 키는 조합을 끝낸 키로 본다.
 * 브라우저가 붙여 보내는 키는 compositionend 바로 뒤에 오고, 사람이 다시 누르는 데는 이보다 오래 걸린다
 */
export const COMPOSITION_END_GRACE_MS = 100

// 마지막 compositionend 시각 — 어느 입력에서 끝났든 문서 하나에서 잰다
let lastCompositionEndAt = Number.NEGATIVE_INFINITY

if (typeof document !== 'undefined') {
  document.addEventListener(
    'compositionend',
    () => {
      lastCompositionEndAt = performance.now()
    },
    // 캡처 단계 — 다른 리스너가 전파를 막아도 시각은 남긴다
    true
  )
}

/**
 * 이 키 입력이 IME 조합에 속하는가 — Enter 제출 · Escape 닫기 같은 단축키는 이때 무시한다.
 *
 * 브라우저마다 조합을 끝내는 순서가 다르다.
 * - Chrome: keydown(isComposing: true, 229) → compositionend.
 *   macOS Chrome은 그 뒤 **같은 키를 keydown(isComposing: false, 원래 keyCode)로 한 번 더 보낸다**
 *   — 키 한 번에 keydown이 두 번 온다(실측: Esc 한 번에 229 → compositionend → 27)
 * - Safari: compositionend → keydown(isComposing: false, keyCode: 229)
 * 그래서 isComposing · 229에 더해 compositionend 직후인지도 본다
 */
export function isComposingKeyEvent(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  const native = 'nativeEvent' in event ? event.nativeEvent : event
  return (
    native.isComposing ||
    native.keyCode === 229 ||
    performance.now() - lastCompositionEndAt < COMPOSITION_END_GRACE_MS
  )
}
