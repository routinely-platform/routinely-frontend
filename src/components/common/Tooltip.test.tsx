import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Tooltip from './Tooltip'

const renderTooltip = () => {
  render(
    <div>
      <Tooltip
        label="무엇을 세나요"
        content={
          <>
            매일 루틴만 셉니다. <b>주 N회는 빠져요</b>
          </>
        }
      />
      <button type="button">바깥</button>
    </div>
  )
  const trigger = screen.getByRole('button', { name: '무엇을 세나요' })
  const outside = screen.getByRole('button', { name: '바깥' })
  const tooltip = screen.getByRole('tooltip', { hidden: true })
  const wrap = trigger.parentElement as HTMLElement
  return { trigger, outside, tooltip, wrap }
}

// jsdom의 :focus-visible은 테스트 사이에 상태가 남는 휴리스틱이라 판정을 직접 정한다
const mockFocusVisible = (result: boolean | 'throw') => {
  const originalMatches = Element.prototype.matches
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
    this: Element,
    selector: string
  ) {
    if (selector !== ':focus-visible') return originalMatches.call(this, selector)
    if (result === 'throw') throw new SyntaxError('unsupported selector')
    return result
  })
}

describe('Tooltip', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('트리거에 aria-label이 있고 본문은 role="tooltip"으로 연결된다', () => {
    const { trigger, tooltip } = renderTooltip()

    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)
    expect(tooltip).toHaveTextContent('주 N회는 빠져요')
  })

  it('마우스를 올리면 열리고 떼면 닫힌다', async () => {
    const user = userEvent.setup()
    const { trigger, wrap } = renderTooltip()

    await user.hover(trigger)
    expect(wrap).toHaveAttribute('data-state', 'open')

    await user.unhover(trigger)
    expect(wrap).toHaveAttribute('data-state', 'closed')
  })

  it('마우스로 올려 연 뒤 클릭해도 닫히지 않는다', async () => {
    const user = userEvent.setup()
    const { trigger, wrap } = renderTooltip()

    await user.click(trigger)

    expect(wrap).toHaveAttribute('data-state', 'open')
  })

  it('키보드 포커스로 열리고 Esc로 닫힌다', async () => {
    mockFocusVisible(true)
    const user = userEvent.setup()
    const { wrap } = renderTooltip()

    await user.tab()
    expect(wrap).toHaveAttribute('data-state', 'open')

    await user.keyboard('{Escape}')
    expect(wrap).toHaveAttribute('data-state', 'closed')
  })

  it('키보드 포커스 상태에서 Enter로 토글된다', async () => {
    mockFocusVisible(true)
    const user = userEvent.setup()
    const { wrap } = renderTooltip()

    await user.tab()
    await user.keyboard('{Enter}')
    expect(wrap).toHaveAttribute('data-state', 'closed')

    await user.keyboard('{Enter}')
    expect(wrap).toHaveAttribute('data-state', 'open')
  })

  it('탭하면 토글되고 바깥을 누르면 닫힌다', async () => {
    const user = userEvent.setup()
    const { trigger, outside, wrap } = renderTooltip()
    const tap = () => user.pointer({ keys: '[TouchA]', target: trigger })

    await tap()
    expect(wrap).toHaveAttribute('data-state', 'open')
    await tap()
    expect(wrap).toHaveAttribute('data-state', 'closed')

    await tap()
    await user.pointer({ keys: '[TouchA]', target: outside })
    expect(wrap).toHaveAttribute('data-state', 'closed')
  })

  it.each([
    ['visible로 판정돼도', true],
    ['판정할 수 없어도', 'throw'],
  ] as const)('탭으로 생긴 포커스가 :focus-visible %s 첫 탭에 열린다', async (_, result) => {
    mockFocusVisible(result)
    const user = userEvent.setup()
    const { trigger, wrap } = renderTooltip()

    await user.pointer({ keys: '[TouchA]', target: trigger })

    expect(wrap).toHaveAttribute('data-state', 'open')
  })

  it('마우스를 누른 채 벗어난 뒤에도 키보드 Enter가 토글된다', async () => {
    mockFocusVisible(true)
    const user = userEvent.setup()
    const { trigger, outside, wrap } = renderTooltip()

    await user.pointer([
      { keys: '[MouseLeft>]', target: trigger },
      { target: outside },
      { keys: '[/MouseLeft]' },
    ])
    await user.tab()
    await user.tab({ shift: true })
    expect(wrap).toHaveAttribute('data-state', 'open')

    await user.keyboard('{Enter}')
    expect(wrap).toHaveAttribute('data-state', 'closed')
  })

  it('마우스를 누른 채 벗어났다가 돌아와 놓아도 닫히지 않는다', async () => {
    const user = userEvent.setup()
    const { trigger, outside, wrap } = renderTooltip()

    await user.pointer([
      { keys: '[MouseLeft>]', target: trigger },
      { target: outside },
      { target: trigger },
      { keys: '[/MouseLeft]' },
    ])

    expect(wrap).toHaveAttribute('data-state', 'open')
  })

  it('마우스로 클릭한 뒤에도 키보드 Enter는 토글된다', async () => {
    const user = userEvent.setup()
    const { trigger, wrap } = renderTooltip()

    await user.click(trigger)
    await user.keyboard('{Enter}')

    expect(wrap).toHaveAttribute('data-state', 'closed')
  })

  describe('뷰포트 보정 — 본문은 스크롤바를 뺀 화면 여백 8px 안에 들어가고 화살표는 트리거를 가리킨다', () => {
    // 세로 스크롤바 15px — innerWidth는 스크롤바를 포함하고 clientWidth는 뺀다
    const INNER_WIDTH = 1024
    const VIEWPORT = 1009
    const BODY_WIDTH = 240
    const TRIGGER_WIDTH = 16

    it.each([
      // [설명, 트리거 left, 기대 본문 viewport left, 기대 화살표 left]
      ['왼쪽 가장자리면 왼쪽 여백에 붙인다', 4, 8, 12],
      ['오른쪽 가장자리면 오른쪽 여백에 붙인다', 1000, 761, 228],
      ['스크롤바 바로 앞이어도 스크롤바 아래로 들어가지 않는다', 980, 761, 227],
      ['여유가 있으면 트리거 가운데에 둔다', 500, 388, 120],
    ])('%s', async (_, triggerLeft, expectedLeft, expectedArrow) => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(INNER_WIDTH)
      vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(VIEWPORT)
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement
      ) {
        if (this.getAttribute('role') === 'tooltip') {
          return { left: 0, width: BODY_WIDTH } as DOMRect
        }
        // wrap과 트리거는 같은 자리에 있다
        return { left: triggerLeft, width: TRIGGER_WIDTH } as DOMRect
      })
      const user = userEvent.setup()
      const { trigger, tooltip } = renderTooltip()

      await user.hover(trigger)

      const bodyLeft = triggerLeft + parseFloat(tooltip.style.left)
      const arrow = tooltip.lastElementChild as HTMLElement
      expect(bodyLeft).toBe(expectedLeft)
      expect(bodyLeft).toBeGreaterThanOrEqual(8)
      expect(bodyLeft + BODY_WIDTH).toBeLessThanOrEqual(VIEWPORT - 8)
      expect(parseFloat(arrow.style.left)).toBe(expectedArrow)
    })
  })
})
