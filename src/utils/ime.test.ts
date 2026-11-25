import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPOSITION_END_GRACE_MS, isComposingKeyEvent } from './ime'

const key = (init: KeyboardEventInit & { keyCode?: number }) => {
  const event = new KeyboardEvent('keydown', init)
  if (init.keyCode !== undefined) Object.defineProperty(event, 'keyCode', { value: init.keyCode })
  return event
}

const ESCAPE = () => key({ key: 'Escape', keyCode: 27 })

const typeInto = (el: HTMLElement, inputType: string, data: string) =>
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType, data }))

/** 마지막 조합 확정에서 충분히 지난 시점으로 옮긴다 — 앞 테스트의 시각이 남지 않게 */
const afterGrace = () => {
  const now = performance.now()
  vi.spyOn(performance, 'now').mockReturnValue(now + COMPOSITION_END_GRACE_MS * 10)
}

describe('isComposingKeyEvent', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('isComposing · keyCode 229는 조합 중이다', () => {
    expect(isComposingKeyEvent(key({ key: 'Escape', isComposing: true }))).toBe(true)
    expect(isComposingKeyEvent(key({ key: 'Escape', keyCode: 229 }))).toBe(true)
  })

  it('조합과 상관없는 Esc는 조합 중이 아니다', () => {
    afterGrace()
    expect(isComposingKeyEvent(ESCAPE())).toBe(false)
  })

  it('compositionend 직후의 키는 조합을 끝낸 키다 (macOS Chrome)', () => {
    const textarea = document.createElement('textarea')
    document.body.append(textarea)
    textarea.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '기' }))

    expect(isComposingKeyEvent(ESCAPE())).toBe(true)
    textarea.remove()
  })

  describe('Safari textarea — 조합 이벤트 없이 바꿔 넣기로 한글을 넣는다 (실측 2026-11-26)', () => {
    it('바꿔 넣기(insertReplacementText) 확정 직후의 Esc는 조합을 끝낸 키다', () => {
      // 앞 테스트의 compositionend 시각에서 멀리 떨어진 시점 — 바꿔 넣기만으로 참이 되는지 본다
      afterGrace()
      const textarea = document.createElement('textarea')
      document.body.append(textarea)

      // ㄱ → 기 → (Esc를 누르면) 확정 바꿔 넣기 → keydown 27
      typeInto(textarea, 'insertText', 'ㄱ')
      typeInto(textarea, 'insertReplacementText', '기')
      typeInto(textarea, 'insertReplacementText', '기')

      expect(isComposingKeyEvent(ESCAPE())).toBe(true)
      textarea.remove()
    })

    it('바꿔 넣기에서 시간이 지난 Esc는 일반 Esc다 — 닫을 수 있다', () => {
      const textarea = document.createElement('textarea')
      document.body.append(textarea)
      typeInto(textarea, 'insertReplacementText', '기')

      afterGrace()
      expect(isComposingKeyEvent(ESCAPE())).toBe(false)
      textarea.remove()
    })

    it('일반 입력(insertText) 직후의 Esc는 막지 않는다 — 영문을 치다 바로 Esc로 닫을 수 있다', () => {
      afterGrace()
      const textarea = document.createElement('textarea')
      document.body.append(textarea)
      typeInto(textarea, 'insertText', 'a')

      expect(isComposingKeyEvent(ESCAPE())).toBe(false)
      textarea.remove()
    })
  })
})
