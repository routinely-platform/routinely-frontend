import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPreviewPanel from './LoginPreviewPanel'

describe('LoginPreviewPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 17))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('미리보기 날짜는 접속한 날이다', () => {
    render(<LoginPreviewPanel />)

    expect(screen.getByText('10월 17일 토요일')).toBeInTheDocument()
  })

  it('홈 규칙을 따른다 — 분모는 지정형만, 빈도형은 "언제든"', () => {
    render(<LoginPreviewPanel />)

    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByText('언제든')).toBeInTheDocument()
  })
})
