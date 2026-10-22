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
  const tooltip = screen.getByRole('tooltip', { hidden: true })
  const wrap = trigger.parentElement as HTMLElement
  return { trigger, tooltip, wrap }
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

  it('키보드 포커스로 열리고 Esc로 닫힌다', async () => {
    const user = userEvent.setup()
    const { wrap } = renderTooltip()

    await user.tab()
    expect(wrap).toHaveAttribute('data-state', 'open')

    await user.keyboard('{Escape}')
    expect(wrap).toHaveAttribute('data-state', 'closed')
  })

  it('탭하면 토글되고 바깥을 누르면 닫힌다', async () => {
    const user = userEvent.setup()
    const { trigger, wrap } = renderTooltip()
    const tap = () => user.pointer({ keys: '[TouchA]', target: trigger })

    await tap()
    expect(wrap).toHaveAttribute('data-state', 'open')
    await tap()
    expect(wrap).toHaveAttribute('data-state', 'closed')

    await tap()
    await user.pointer({ keys: '[TouchA]', target: screen.getByRole('button', { name: '바깥' }) })
    expect(wrap).toHaveAttribute('data-state', 'closed')
  })

  it.each([
    ['왼쪽 가장자리면 트리거 왼쪽에 붙인다', 4, 'start'],
    ['오른쪽 가장자리면 트리거 오른쪽에 붙인다', 1000, 'end'],
    ['여유가 있으면 가운데에 둔다', 500, 'center'],
  ])('뷰포트 보정 — %s', async (_, triggerLeft, expected) => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement
    ) {
      const isBody = this.getAttribute('role') === 'tooltip'
      return { left: isBody ? 0 : triggerLeft, width: isBody ? 240 : 16 } as DOMRect
    })
    const user = userEvent.setup()
    const { trigger, tooltip } = renderTooltip()

    await user.hover(trigger)

    expect(tooltip).toHaveAttribute('data-align', expected)
  })
})
