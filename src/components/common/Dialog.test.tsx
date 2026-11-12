import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

  describe('겹친 대화상자 (#85 리뷰 1)', () => {
    /** 아래 창(수정) 안에서 위 창(확인)을 연다 — #20 인증 상세 → 인증 취소 확인창 모양 */
    const Stacked = ({ topPending = false }: { topPending?: boolean }) => {
      const [lower, setLower] = useState(true)
      const [upper, setUpper] = useState(false)
      return (
        <>
          {lower && (
            <Dialog
              title="아래 창"
              onClose={() => setLower(false)}
              actions={
                <button type="button" onClick={() => setUpper(true)}>
                  위 창 열기
                </button>
              }
            >
              <p>본문</p>
            </Dialog>
          )}
          {upper && (
            <Dialog
              title="위 창"
              onClose={() => setUpper(false)}
              isPending={topPending}
              actions={<button type="button">확인</button>}
            >
              <p>확인할까요?</p>
            </Dialog>
          )}
        </>
      )
    }

    const openStacked = async (topPending = false) => {
      const user = userEvent.setup()
      render(<Stacked topPending={topPending} />)
      const opener = screen.getByRole('button', { name: '위 창 열기' })
      await user.click(opener)
      return { user, opener }
    }

    it('Esc는 위 창만 닫고, 포커스는 위 창을 연 버튼으로 돌아간다', async () => {
      const { user, opener } = await openStacked()
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('dialog', { name: '위 창' })).not.toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: '아래 창' })).toBeInTheDocument()
      expect(opener).toHaveFocus()

      // 이제 아래 창이 맨 위다
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('위 창이 저장 중이면 Esc에 아무 창도 닫히지 않는다', async () => {
      const { user } = await openStacked(true)
      await user.keyboard('{Escape}')
      expect(screen.getByRole('dialog', { name: '위 창' })).toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: '아래 창' })).toBeInTheDocument()
    })

    it('Tab은 위 창 안에서만 돈다', async () => {
      const { user } = await openStacked()
      const upper = screen.getByRole('dialog', { name: '위 창' })
      for (let i = 0; i < 4; i += 1) {
        await user.tab()
        expect(upper).toContainElement(document.activeElement as HTMLElement)
      }
      await user.tab({ shift: true })
      expect(upper).toContainElement(document.activeElement as HTMLElement)
    })
  })

  describe('겹친 대화상자 — 2차 리뷰', () => {
    it('부모 창과 그 안의 자식 창이 함께 열려도 Esc는 자식(안쪽) 창만 닫는다', async () => {
      const Nested = () => {
        const [parent, setParent] = useState(true)
        const [child, setChild] = useState(true)
        return parent ? (
          <Dialog
            title="부모 창"
            onClose={() => setParent(false)}
            actions={<button type="button">부모 버튼</button>}
          >
            {child && (
              <Dialog
                title="자식 창"
                onClose={() => setChild(false)}
                actions={<button type="button">자식 버튼</button>}
              >
                <p>자식 본문</p>
              </Dialog>
            )}
          </Dialog>
        ) : null
      }
      const user = userEvent.setup()
      render(<Nested />)
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('dialog', { name: '자식 창' })).not.toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: '부모 창' })).toBeInTheDocument()
    })

    it('아래 창만 먼저 닫히면 포커스를 옮기지 않고, 위 창을 닫을 때 맨 처음 연 자리로 돌아간다', async () => {
      /** 페이지가 두 창을 형제로 따로 들고 있다가 아래 창만 치우는 경우 */
      const Siblings = () => {
        const [lower, setLower] = useState(false)
        const [upper, setUpper] = useState(false)
        return (
          <>
            <button type="button" onClick={() => setLower(true)}>
              배경 열기
            </button>
            {lower && (
              <Dialog
                title="아래 창"
                onClose={() => setLower(false)}
                actions={
                  <button type="button" onClick={() => setUpper(true)}>
                    위 창 열기
                  </button>
                }
              >
                <p>본문</p>
              </Dialog>
            )}
            {upper && (
              <Dialog
                title="위 창"
                onClose={() => setUpper(false)}
                actions={
                  <button type="button" onClick={() => setLower(false)}>
                    아래 창 치우기
                  </button>
                }
              >
                <p>확인할까요?</p>
              </Dialog>
            )}
          </>
        )
      }
      const user = userEvent.setup()
      render(<Siblings />)
      const background = screen.getByRole('button', { name: '배경 열기' })
      await user.click(background)
      await user.click(screen.getByRole('button', { name: '위 창 열기' }))

      const removeLower = screen.getByRole('button', { name: '아래 창 치우기' })
      await user.click(removeLower)
      expect(screen.queryByRole('dialog', { name: '아래 창' })).not.toBeInTheDocument()
      // 위 창이 열려 있다 — 포커스가 배경으로 빠지지 않는다
      expect(removeLower).toHaveFocus()

      // 위 창을 연 버튼은 아래 창과 함께 사라졌다 — 아래 창을 연 자리로 돌아간다
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(background).toHaveFocus()
    })
  })

  describe('긴 서버 오류', () => {
    // jsdom은 레이아웃을 재지 않는다 — 높이를 정해 넘침 여부를 흉내 낸다
    const mockHeights = (scrollHeight: number, clientHeight: number) => {
      vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(scrollHeight)
      vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(clientHeight)
    }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('넘치면 Tab으로 닿는다 — 키보드로 나머지를 스크롤할 수 있다', async () => {
      mockHeights(120, 63)
      await openDialog()
      expect(screen.getByRole('alert')).toHaveAttribute('tabindex', '0')
    })

    it('넘치지 않으면 Tab 정거장을 만들지 않는다', async () => {
      mockHeights(21, 63)
      await openDialog()
      expect(screen.getByRole('alert')).not.toHaveAttribute('tabindex')
    })
  })
})
