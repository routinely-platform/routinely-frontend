import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

/**
 * 조합이 끝난 뒤 이 시간(ms) 안에 온 키는 조합을 끝낸 키로 본다.
 * 브라우저가 붙여 보내는 키는 조합 확정 바로 뒤에 오고, 사람이 다시 누르는 데는 이보다 오래 걸린다
 */
export const COMPOSITION_END_GRACE_MS = 100

// 한글 자모 · 호환 자모 · 완성형 음절
const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힯]/

// 마지막 compositionend 시각 — 어느 입력에서 끝났든 문서 하나에서 잰다
let lastCompositionEndAt = Number.NEGATIVE_INFINITY

// 마지막 한글 바꿔 넣기(Safari textarea) — 시각과 일어난 요소를 함께 둔다
let lastHangulReplacement: { at: number; target: EventTarget | null } = {
  at: Number.NEGATIVE_INFINITY,
  target: null,
}

if (typeof document !== 'undefined') {
  // 캡처 단계 — 다른 리스너가 전파를 막아도 시각은 남긴다
  document.addEventListener(
    'compositionend',
    () => {
      lastCompositionEndAt = performance.now()
    },
    true
  )
  // Safari textarea는 한글을 조합 이벤트 없이 "바꿔 넣기"로 넣고, 조합을 확정할 때도 바꿔 넣기가 키보다 먼저 온다.
  // 자동 고침(영문 철자 교정)도 바꿔 넣기라서 한글이 들어 있을 때만 기록한다 (D18)
  document.addEventListener(
    'input',
    (event) => {
      if (
        event instanceof InputEvent &&
        event.inputType === 'insertReplacementText' &&
        event.data !== null &&
        HANGUL.test(event.data)
      ) {
        lastHangulReplacement = { at: performance.now(), target: event.target }
      }
    },
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
 * - Safari textarea(실측 2026-11-26): **조합 이벤트가 아예 없다.** 첫 자음은 insertText("ㄱ"),
 *   모음이 붙으면 insertReplacementText("기")로 바꿔 넣는다. Esc를 누르면 insertReplacementText(확정)가
 *   먼저 오고 1~2ms 뒤 keydown(isComposing: false, keyCode: 27)이 온다 — 위 둘 어느 신호도 없다
 * 그래서 isComposing · 229에 더해 조합 확정 직후인지도 본다.
 * 바꿔 넣기는 **한글을 바꿔 넣은 바로 그 요소에서 누른 키**만 본다 — 자동 고침 직후나 다른 버튼의 Esc · Enter는 삼키지 않는다 (D18)
 */
export function isComposingKeyEvent(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  const native = 'nativeEvent' in event ? event.nativeEvent : event
  const now = performance.now()
  return (
    native.isComposing ||
    native.keyCode === 229 ||
    now - lastCompositionEndAt < COMPOSITION_END_GRACE_MS ||
    (now - lastHangulReplacement.at < COMPOSITION_END_GRACE_MS &&
      native.target === lastHangulReplacement.target)
  )
}

/**
 * 폼의 onKeyDown에 건다 — 조합을 확정하는 Enter가 폼을 제출하지 않게 막는다.
 * macOS Chrome은 조합을 Enter로 확정하면 조합이 아닌 Enter를 한 번 더 보내고, 그 Enter가 폼의 기본 제출을 일으킨다
 */
export function preventComposingSubmit(event: ReactKeyboardEvent) {
  if (event.key === 'Enter' && isComposingKeyEvent(event)) event.preventDefault()
}
