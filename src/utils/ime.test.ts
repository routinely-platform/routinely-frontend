import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * ime.ts는 마지막 조합 확정 시각을 모듈 상태로 들고 있다 — 테스트마다 모듈을 새로 불러와 상태를 비운다 (D20).
 * 시계도 테스트가 정한다: 0에서 시작해 `advance`로만 움직인다
 */
type ImeModule = typeof import('./ime')
let ime: ImeModule
let clock = 0
const advance = (ms: number) => {
  clock += ms
}

beforeEach(async () => {
  clock = 1_000
  vi.spyOn(performance, 'now').mockImplementation(() => clock)
  vi.resetModules()
  ime = await import('./ime')
})

afterEach(() => {
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

const keydown = (
  target: HTMLElement,
  init: { key: string; keyCode: number; isComposing?: boolean }
) => {
  const event = new KeyboardEvent('keydown', {
    key: init.key,
    isComposing: init.isComposing,
    bubbles: true,
  })
  Object.defineProperty(event, 'keyCode', { value: init.keyCode })
  // isComposingKeyEvent는 target을 본다 — 실제 키처럼 요소에서 보낸다
  target.dispatchEvent(event)
  return event
}

const escapeOn = (target: HTMLElement) => keydown(target, { key: 'Escape', keyCode: 27 })

const typeInto = (el: HTMLElement, inputType: string, data: string) =>
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType, data }))

const textarea = () => {
  const el = document.createElement('textarea')
  document.body.append(el)
  return el
}

describe('isComposingKeyEvent', () => {
  it('isComposing · keyCode 229는 조합 중이다', () => {
    const el = textarea()
    expect(
      ime.isComposingKeyEvent(keydown(el, { key: 'Escape', keyCode: 27, isComposing: true }))
    ).toBe(true)
    expect(ime.isComposingKeyEvent(keydown(el, { key: 'Escape', keyCode: 229 }))).toBe(true)
  })

  it('조합과 상관없는 Esc는 조합 중이 아니다', () => {
    expect(ime.isComposingKeyEvent(escapeOn(textarea()))).toBe(false)
  })

  describe('compositionend 직후 (macOS Chrome)', () => {
    it('100ms 안의 키는 조합을 끝낸 키다', () => {
      const el = textarea()
      el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '기' }))
      advance(1)
      expect(ime.isComposingKeyEvent(escapeOn(el))).toBe(true)
    })

    it('100ms가 지난 키는 일반 키다', () => {
      const el = textarea()
      el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '기' }))
      advance(ime.COMPOSITION_END_GRACE_MS)
      expect(ime.isComposingKeyEvent(escapeOn(el))).toBe(false)
    })
  })

  describe('Safari textarea — 조합 이벤트 없이 바꿔 넣기로 한글을 넣는다 (실측 2026-11-26)', () => {
    it('한글 바꿔 넣기 확정 직후, 같은 요소의 Esc는 조합을 끝낸 키다', () => {
      const el = textarea()
      // ㄱ → 기 → (Esc를 누르면) 확정 바꿔 넣기 → 1~2ms 뒤 keydown 27
      typeInto(el, 'insertText', 'ㄱ')
      typeInto(el, 'insertReplacementText', '기')
      advance(800)
      typeInto(el, 'insertReplacementText', '기')
      advance(2)
      expect(ime.isComposingKeyEvent(escapeOn(el))).toBe(true)
    })

    it('100ms가 지난 Esc는 일반 Esc다 — 닫을 수 있다', () => {
      const el = textarea()
      typeInto(el, 'insertReplacementText', '기')
      advance(ime.COMPOSITION_END_GRACE_MS)
      expect(ime.isComposingKeyEvent(escapeOn(el))).toBe(false)
    })

    it('일반 입력(insertText) 직후의 Esc는 막지 않는다', () => {
      const el = textarea()
      typeInto(el, 'insertText', 'a')
      advance(1)
      expect(ime.isComposingKeyEvent(escapeOn(el))).toBe(false)
    })
  })

  describe('자동 고침 · 다른 요소 — 정상 키를 삼키지 않는다 (D18)', () => {
    it('영문 자동 고침(바꿔 넣기) 직후의 Esc는 일반 Esc다', () => {
      const el = textarea()
      typeInto(el, 'insertReplacementText', 'the')
      advance(1)
      expect(ime.isComposingKeyEvent(escapeOn(el))).toBe(false)
    })

    it('한글 바꿔 넣기 직후라도 다른 요소에서 누른 Esc · Enter는 일반 키다', () => {
      const memo = textarea()
      const button = document.createElement('button')
      document.body.append(button)
      typeInto(memo, 'insertReplacementText', '기')
      advance(1)
      expect(ime.isComposingKeyEvent(escapeOn(button))).toBe(false)
      expect(ime.isComposingKeyEvent(keydown(button, { key: 'Enter', keyCode: 13 }))).toBe(false)
    })
  })
})
