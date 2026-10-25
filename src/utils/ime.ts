import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

/**
 * 이 키 입력이 IME 조합에 속하는가 — Enter 제출 · Escape 닫기 같은 단축키는 이때 무시한다.
 *
 * 브라우저마다 조합을 끝내는 순서가 다르다.
 * - Chrome: keydown(isComposing: true) → compositionend
 * - Safari: compositionend → keydown(isComposing: false, keyCode: 229)
 * isComposing만 보면 Safari에서 조합을 끝내는 키가 단축키로 샌다. 229는 "IME가 처리 중인 키"다
 */
export function isComposingKeyEvent(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  const native = 'nativeEvent' in event ? event.nativeEvent : event
  return native.isComposing || native.keyCode === 229
}
