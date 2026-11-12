import { useEffect, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { useDialogFocus } from '@/hooks/useDialogFocus'
import { cn } from '@/utils/cn'
import { isComposingKeyEvent } from '@/utils/ime'
import styles from './Dialog.module.css'

interface DialogProps {
  title: ReactNode
  /** × · Esc · 배경 클릭이 부른다. 버튼 줄의 `취소`도 같은 함수를 넘긴다 */
  onClose: () => void
  /** 저장 · 삭제 중 — × · Esc · 배경 클릭으로 닫지 않는다. 결과를 못 보고 화면이 사라진다 */
  isPending?: boolean
  /**
   * 배경 클릭으로 닫을까 — 입력이 있는 대화상자는 false.
   * 실수로 바깥을 누르면 쓰던 내용이 사라진다
   */
  closeOnBackdrop?: boolean
  /** 입력이 들어가는 넓은 대화상자 — 640px, 머리말 · 버튼 줄에 경계선 */
  wide?: boolean
  /**
   * 주면 본문과 버튼 줄을 `<form>`으로 감싼다.
   * 저장 버튼(`type="submit"`)이 폼 안에 남아야 Enter 제출이 동작한다
   */
  formProps?: Omit<ComponentPropsWithoutRef<'form'>, 'className' | 'children'>
  /** 서버 오류 한 줄 — 버튼 줄 바로 위, 스크롤 밖에 그린다 */
  error?: ReactNode
  /** 버튼 줄 — `취소` · 주 동작 */
  actions: ReactNode
  /** 본문 — 길면 여기만 스크롤한다 */
  children: ReactNode
}

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)

/**
 * 공용 대화상자 — 머리말(제목 + ×) · 본문(스크롤) · 버튼 줄(고정).
 * 포커스 가두기 · 닫으면 연 자리로 복귀는 useDialogFocus가, Esc · ×의 닫기 규칙은 여기서 한 번에 다룬다
 */
const Dialog = ({
  title,
  onClose,
  isPending = false,
  closeOnBackdrop = false,
  wide = false,
  formProps,
  error,
  actions,
  children,
}: DialogProps) => {
  const titleId = useId()
  const dialogRef = useDialogFocus<HTMLDivElement>()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 조합 중 Esc는 IME가 조합을 취소하는 키다 — 닫지 않는다. 저장 중에도 닫지 않는다
      if (e.key === 'Escape' && !isComposingKeyEvent(e) && !isPending) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, isPending])

  const body = (
    <>
      <div className={styles.content}>{children}</div>
      <div className={styles.footer}>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.actions}>{actions}</div>
      </div>
    </>
  )

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        // 대화상자 안에서 일어난 클릭은 무시한다 — 배경 자체를 눌렀을 때만
        if (closeOnBackdrop && !isPending && e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(styles.dialog, wide && styles.wide)}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isPending}
            aria-label="닫기"
          >
            <CloseIcon />
          </button>
        </div>
        {formProps ? (
          <form {...formProps} className={styles.form}>
            {body}
          </form>
        ) : (
          body
        )}
      </div>
    </div>
  )
}

export default Dialog
