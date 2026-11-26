import { describe, expect, it } from 'vitest'
import { apiError, networkError } from '@/test/axiosError'
import { executionErrorMessage, NETWORK_MESSAGE } from './executionErrors'
import { PHOTO_MESSAGES } from './executionPhoto'

const FALLBACK = '인증하지 못했어요. 잠시 후 다시 시도해 주세요.'

const fail = (status: number, errorCode: string, message = '서버 문구') =>
  apiError(status, { success: false, errorCode, message })

describe('executionErrorMessage — 서버 오류 코드 → 화면 문구', () => {
  it.each([
    [400, 'FILE_SIZE_EXCEEDED', PHOTO_MESSAGES.size],
    [400, 'UNSUPPORTED_IMAGE_TYPE', '이 형식은 올릴 수 없어요 — 사진 파일이 맞는지 확인해 주세요'],
    [400, 'EMPTY_FILE', PHOTO_MESSAGES.empty],
    [500, 'FILE_UPLOAD_FAILED', '사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.'],
    [409, 'EXECUTION_ALREADY_COMPLETED', '이미 인증한 날짜예요.'],
    [404, 'EXECUTION_NOT_FOUND', '이미 취소된 인증이에요.'],
    [409, 'CHALLENGE_NOT_STARTED', '아직 시작하지 않은 챌린지예요.'],
    [409, 'CHALLENGE_ALREADY_ENDED', '이미 끝난 챌린지예요.'],
    [403, 'NOT_CHALLENGE_MEMBER', '챌린지 멤버가 아니라 인증할 수 없어요.'],
    [404, 'ROUTINE_NOT_FOUND', '루틴을 찾을 수 없어요.'],
  ])('%i %s → 화면 문구', (status, code, expected) => {
    expect(executionErrorMessage(fail(status, code), FALLBACK)).toBe(expected)
  })

  it.each([
    // 코드 하나에 이유가 여섯이다 — 서버 문구만이 이유를 안다
    [400, 'VALIDATION_FAILED', '아직 오지 않은 날짜는 완료할 수 없습니다.'],
    [400, 'VALIDATION_FAILED', '오늘은 이 루틴의 수행 요일이 아닙니다.'],
    [400, 'EXECUTION_BACKFILL_WINDOW_EXCEEDED', '챌린지 루틴은 지난 3일까지만 인증할 수 있습니다.'],
    [
      503,
      'SERVICE_UNAVAILABLE',
      '일시적인 서버 문제로 인증할 수 없습니다. 지난 날짜는 3일 안에 다시 인증할 수 있습니다.',
    ],
    [429, 'TOO_MANY_REQUESTS', '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'],
  ])('%i %s → 서버 문구 그대로', (status, code, message) => {
    expect(executionErrorMessage(fail(status, code, message), FALLBACK)).toBe(message)
  })

  it('서버 문구를 쓰는 코드인데 문구가 비면 폴백', () => {
    expect(executionErrorMessage(fail(400, 'VALIDATION_FAILED', ''), FALLBACK)).toBe(FALLBACK)
  })

  it.each(['INTERNAL_SERVER_ERROR', 'CHALLENGE_NOT_FOUND', 'SOMETHING_NEW'])(
    '%s — 내부 문구를 보이지 않고 폴백',
    (code) => {
      expect(executionErrorMessage(fail(500, code, 'NullPointerException ...'), FALLBACK)).toBe(
        FALLBACK
      )
    }
  )

  it('응답이 없으면(네트워크 · 타임아웃) 연결 문구', () => {
    expect(executionErrorMessage(networkError(), FALLBACK)).toBe(NETWORK_MESSAGE)
  })

  it('axios 오류가 아니면 폴백', () => {
    expect(executionErrorMessage(new Error('boom'), FALLBACK)).toBe(FALLBACK)
  })
})
