import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentPropsWithRef,
} from 'react'
import styles from './authForm.module.css'

// React 19에서 ref는 일반 prop이다 — register()의 ref가 여기로 들어온다
interface PasswordFieldProps extends Omit<ComponentPropsWithRef<'input'>, 'type'> {
  /** 입력 위 시각 라벨. placeholder는 입력을 시작하면 사라지므로 라벨이 칸의 이름을 맡는다 */
  label?: string
  errorMessage?: string
}

const ASCII_PRINTABLE_PATTERN = /[ -~]/g

/** 토글 직전 입력의 선택 영역 — 입력에 포커스가 있었을 때만 남긴다 */
interface SavedSelection {
  start: number | null
  end: number | null
  direction: 'forward' | 'backward' | 'none' | null
}

export default function PasswordField({
  label,
  errorMessage,
  id,
  className,
  onChange,
  onPaste,
  ref,
  ...props
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const savedSelection = useRef<SavedSelection | null>(null)
  const generatedId = useId()
  const inputId = id ?? generatedId
  const inputClassName = [styles.input, errorMessage ? styles.inputError : '', className]
    .filter(Boolean)
    .join(' ')

  // 내부 ref(캐럿 복원)와 바깥 ref(register)를 함께 건다
  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  // type을 바꾸면 브라우저가 캐럿을 끝으로 보내거나 선택을 지운다 — 칠하기 전에 되돌린다
  useLayoutEffect(() => {
    const input = inputRef.current
    const selection = savedSelection.current
    savedSelection.current = null
    if (!input || !selection || selection.start === null || selection.end === null) return

    input.focus()
    input.setSelectionRange(selection.start, selection.end, selection.direction ?? undefined)
  }, [isVisible])

  const handleToggle = () => {
    const input = inputRef.current
    // 키보드(Space/Enter)로 누르면 포커스는 버튼에 있다 — 그때는 키보드 사용자의 위치를 옮기지 않는다
    savedSelection.current =
      input && document.activeElement === input
        ? { start: input.selectionStart, end: input.selectionEnd, direction: input.selectionDirection }
        : null
    setIsVisible((prev) => !prev)
  }

  const sanitizeValue = (value: string) => value.match(ASCII_PRINTABLE_PATTERN)?.join('') ?? ''

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeValue(event.currentTarget.value)

    if (sanitizedValue !== event.currentTarget.value) {
      event.currentTarget.value = sanitizedValue
    }

    onChange?.(event)
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData('text')
    const sanitizedText = sanitizeValue(pastedText)

    if (sanitizedText !== pastedText) {
      event.preventDefault()

      const input = event.currentTarget
      const selectionStart = input.selectionStart ?? input.value.length
      const selectionEnd = input.selectionEnd ?? input.value.length
      const nextValue =
        input.value.slice(0, selectionStart) + sanitizedText + input.value.slice(selectionEnd)

      input.value = nextValue
      input.setSelectionRange(
        selectionStart + sanitizedText.length,
        selectionStart + sanitizedText.length,
      )
      input.dispatchEvent(new Event('input', { bubbles: true }))
      return
    }

    onPaste?.(event)
  }

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.passwordInputWrap}>
        <input
          {...props}
          ref={setInputRef}
          id={inputId}
          type={isVisible ? 'text' : 'password'}
          className={inputClassName}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          lang="en"
          onChange={handleChange}
          onPaste={handlePaste}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          // 포인터로 눌러도 입력의 포커스를 뺏지 않는다 — 입력하던 자리에서 그대로 이어 친다
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleToggle}
          aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
          aria-pressed={isVisible}
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {errorMessage && <span className={styles.fieldError}>{errorMessage}</span>}
    </div>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.58 10.58A2 2 0 0010 12a2 2 0 003.42 1.42"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.88 5.09A11.2 11.2 0 0112 5c6.5 0 10 7 10 7a17.62 17.62 0 01-4.04 4.94"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.61 6.61C3.73 8.43 2 12 2 12a17.73 17.73 0 004.03 4.94A10.9 10.9 0 0012 19c1.54 0 2.95-.28 4.22-.77"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
