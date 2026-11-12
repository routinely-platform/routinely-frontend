import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Dialog from './Dialog'

interface HarnessProps {
  isPending?: boolean
  closeOnBackdrop?: boolean
  onSubmit?: () => void
}

/** 연 버튼 → 대화상자. 닫으면 언마운트돼 포커스 복귀까지 본다 */
const Harness = ({ isPending = false, closeOnBackdrop = false, onSubmit }: HarnessProps) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        열기
      </button>
      {open && (
        <Dialog
          title="루틴 설정 수정"
          onClose={close}
          isPending={isPending}
          closeOnBackdrop={closeOnBackdrop}
          formProps={
            onSubmit
              ? {
                  onSubmit: (e) => {
                    e.preventDefault()
                    onSubmit()
                  },
                }
              : undefined
          }
          error={isPending ? null : '저장하지 못했어요.'}
          actions={
            <>
              <button type="button" onClick={close} disabled={isPending}>
                취소
              </button>
              <button type={onSubmit ? 'submit' : 'button'} disabled={isPending}>
                저장
              </button>
            </>
          }
        >
          <input aria-label="제목" />
        </Dialog>
      )}
    </>
  )
}

const openDialog = async (props: HarnessProps = {}) => {
  const user = userEvent.setup()
  render(<Harness {...props} />)
  const opener = screen.getByRole('button', { name: '열기' })
  await user.click(opener)
  return { user, opener, dialog: screen.getByRole('dialog', { name: '루틴 설정 수정' }) }
}

describe('Dialog', () => {
  it('닫기 버튼에 접근 가능한 이름이 있다', async () => {
    await openDialog()
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument()
  })

  it('닫기 버튼을 누르면 닫히고 연 버튼으로 포커스가 돌아간다', async () => {
    const { user, opener } = await openDialog()
    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  it('열면 대화상자 자체에 포커스가 가고, 첫 Tab이 닫기 버튼에 닿는다', async () => {
    const { user, dialog } = await openDialog()
    expect(dialog).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus()
  })

  it('Esc로 닫히고 포커스가 돌아간다', async () => {
    const { user, opener } = await openDialog()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  it('조합 중 Esc로는 닫히지 않는다', async () => {
    await openDialog()
    fireEvent.keyDown(screen.getByRole('textbox', { name: '제목' }), {
      key: 'Escape',
      isComposing: true,
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  describe('저장 중', () => {
    it('닫기 버튼이 비활성이라 눌러도 닫히지 않는다', async () => {
      const { user } = await openDialog({ isPending: true })
      const close = screen.getByRole('button', { name: '닫기' })
      expect(close).toBeDisabled()
      await user.click(close)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('Esc로 닫히지 않는다', async () => {
      const { user } = await openDialog({ isPending: true })
      await user.keyboard('{Escape}')
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('배경을 눌러도 닫히지 않는다', async () => {
      const { user, dialog } = await openDialog({ isPending: true, closeOnBackdrop: true })
      await user.click(dialog.parentElement as HTMLElement)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('배경 클릭', () => {
    it('closeOnBackdrop이 없으면 닫히지 않는다 — 입력이 있는 대화상자', async () => {
      const { user, dialog } = await openDialog()
      await user.click(dialog.parentElement as HTMLElement)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('closeOnBackdrop이면 닫힌다 — 확인창', async () => {
      const { user, dialog } = await openDialog({ closeOnBackdrop: true })
      await user.click(dialog.parentElement as HTMLElement)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('closeOnBackdrop이어도 대화상자 안을 누르면 닫히지 않는다', async () => {
      const { user } = await openDialog({ closeOnBackdrop: true })
      await user.click(screen.getByRole('textbox', { name: '제목' }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('서버 오류는 버튼 줄과 같은 고정 영역에 알림으로 그린다', async () => {
    await openDialog()
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('저장하지 못했어요.')
    // 본문(스크롤 영역) 밖 — 버튼 줄과 같은 부모
    expect(alert.parentElement).toContainElement(screen.getByRole('button', { name: '저장' }))
    expect(alert.parentElement).not.toContainElement(screen.getByRole('textbox', { name: '제목' }))
  })

  it('formProps를 주면 버튼 줄의 저장 버튼이 폼을 제출한다 — 본문 입력에서 Enter도', async () => {
    const onSubmit = vi.fn()
    const { user } = await openDialog({ onSubmit })
    await user.click(screen.getByRole('button', { name: '저장' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await user.type(screen.getByRole('textbox', { name: '제목' }), '아침{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })
})
