import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import PasswordField from './PasswordField'

describe('PasswordField 보기 토글', () => {
  it('포인터로 토글해도 입력의 포커스와 캐럿 위치가 그대로다', async () => {
    const user = userEvent.setup()
    render(<PasswordField label="비밀번호" />)
    const input = screen.getByLabelText<HTMLInputElement>('비밀번호')

    await user.type(input, 'secret123')
    input.setSelectionRange(3, 3)
    await user.click(screen.getByRole('button', { name: '비밀번호 보기' }))

    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('비밀번호')).toBe(input)
    expect(document.activeElement).toBe(input)
    expect(input.selectionStart).toBe(3)
    expect(input.selectionEnd).toBe(3)
  })

  it('키보드로 토글하면 포커스는 버튼에 남는다', async () => {
    const user = userEvent.setup()
    render(<PasswordField label="비밀번호" />)
    const toggle = screen.getByRole('button', { name: '비밀번호 보기' })

    toggle.focus()
    await user.keyboard(' ')

    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('type', 'text')
    expect(document.activeElement).toBe(toggle)
  })

  it('바깥에서 넘긴 ref가 입력 노드를 받는다', () => {
    const ref = createRef<HTMLInputElement>()
    render(<PasswordField label="비밀번호" ref={ref} />)

    expect(ref.current).toBe(screen.getByLabelText('비밀번호'))
  })
})
