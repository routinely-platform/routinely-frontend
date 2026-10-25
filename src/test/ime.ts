import { act, fireEvent } from '@testing-library/react'
import { expect } from 'vitest'

/** 한글 IME 조합이 일어나는 input type — date · number · file 등은 조합이 없어 제외한다 */
const TEXT_INPUT_TYPES = ['', 'text', 'email', 'password', 'search', 'tel', 'url']

export type TextInput = HTMLInputElement | HTMLTextAreaElement | HTMLElement

export function isTextInput(el: Element): el is TextInput {
  if (el instanceof HTMLTextAreaElement) return true
  if (el instanceof HTMLInputElement) {
    return TEXT_INPUT_TYPES.includes((el.getAttribute('type') ?? '').toLowerCase())
  }
  // jsdom은 isContentEditable을 구현하지 않아(undefined) 속성으로 판별한다. 'false'만 편집 불가다
  const editable = el.getAttribute('contenteditable')
  return el instanceof HTMLElement && editable !== null && editable.toLowerCase() !== 'false'
}

/** 렌더된 트리에서 조합 입력을 스스로 찾는다 — 화면에 필드가 늘면 검사도 자동으로 늘어난다 */
export function findTextInputs(root: ParentNode): TextInput[] {
  return Array.from(root.querySelectorAll('input, textarea, [contenteditable]')).filter(isTextInput)
}

/** 입력의 시각 라벨 — 조합 뒤 같은 라벨로 다시 찾아 노드 동일성을 본다 */
export function labelOf(el: TextInput): string {
  const fromLabel =
    'labels' in el && el.labels && el.labels.length > 0 ? el.labels[0].textContent : null
  const label = (fromLabel ?? el.getAttribute('aria-label') ?? '').trim()
  if (!label) throw new Error(`라벨이 없는 입력이다: ${el.outerHTML}`)
  return label
}

const valueOf = (el: TextInput) =>
  el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : el.textContent

/**
 * ㄱ → 기 → 김 처럼 조합 이벤트를 흘려 넣는다.
 *
 * 값은 fireEvent.input의 target.value로 넣는다 — 네이티브 setter로 넣어 React의 value tracker를
 * 우회한다. `el.value = v`로 넣으면 tracker까지 갱신돼 onChange가 불리지 않고, 폼 라이브러리가
 * 변화를 못 봐 재렌더가 안 일어나 **검사가 공짜로 통과한다.**
 */
export function composeInto(el: TextInput, steps: string[]) {
  act(() => {
    el.focus()
  })
  fireEvent.compositionStart(el, { data: '' })
  for (const step of steps) {
    fireEvent.compositionUpdate(el, { data: step })
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      fireEvent.input(el, { target: { value: step } })
    } else {
      el.textContent = step
      fireEvent.input(el)
    }
  }
  fireEvent.compositionEnd(el, { data: steps[steps.length - 1] ?? '' })
}

interface ExpectImeSafeOptions {
  /** 조합 뒤 같은 입력을 다시 찾는다 */
  requery: () => Element
  /** 기대 값. 생략하면 마지막 조합 글자. null이면 값을 보지 않는다(비밀번호 — ASCII만 받는다) */
  expectedValue?: string | null
  steps?: string[]
}

/** 조합 전후로 노드 동일성 · 포커스 · 값을 본다 */
export function expectImeSafe(el: TextInput, options: ExpectImeSafeOptions) {
  const steps = options.steps ?? ['ㄱ', '기', '김']
  const expectedValue =
    options.expectedValue === undefined ? steps[steps.length - 1] : options.expectedValue

  composeInto(el, steps)

  expect(options.requery(), '입력 노드가 새로 만들어졌다 — 조합 버퍼가 날아간다').toBe(el)
  expect(document.contains(el), '입력 노드가 문서에서 빠졌다').toBe(true)
  expect(document.activeElement, '조합 중 포커스를 잃었다').toBe(el)
  if (expectedValue !== null) expect(valueOf(el)).toBe(expectedValue)
}
