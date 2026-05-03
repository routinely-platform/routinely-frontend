import { useState, type ChangeEvent, type ClipboardEvent, type InputHTMLAttributes } from 'react'
import styles from './authForm.module.css'

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  errorMessage?: string
}

const ASCII_PRINTABLE_PATTERN = /[ -~]/g

export default function PasswordField({
  errorMessage,
  className,
  onChange,
  onPaste,
  ...props
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const inputClassName = [styles.input, errorMessage ? styles.inputError : '', className]
    .filter(Boolean)
    .join(' ')

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
      <div className={styles.passwordInputWrap}>
        <input
          {...props}
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
          onClick={() => setIsVisible((prev) => !prev)}
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
