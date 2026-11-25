import axios from 'axios'
import { getApiErrorPayload } from '@/components/auth/authFormErrors'
import { PHOTO_MESSAGES } from './executionPhoto'

/**
 * 서버 오류 코드 → 화면 문구 (routine-service `ErrorCode`, WORKPLAN 오류 표).
 * 여기 없는 코드 중 아래 SERVER_MESSAGE_CODES는 서버 문구를 그대로 쓰고, 나머지는 폴백 문구를 쓴다
 */
const MESSAGES: Record<string, string> = {
  FILE_SIZE_EXCEEDED: PHOTO_MESSAGES.size,
  UNSUPPORTED_IMAGE_TYPE: '이 형식은 올릴 수 없어요 — 사진 파일이 맞는지 확인해 주세요',
  EMPTY_FILE: PHOTO_MESSAGES.empty,
  FILE_UPLOAD_FAILED: '사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.',
  EXECUTION_ALREADY_COMPLETED: '이미 인증한 날짜예요.',
  EXECUTION_NOT_FOUND: '이미 취소된 인증이에요.',
  CHALLENGE_NOT_STARTED: '아직 시작하지 않은 챌린지예요.',
  CHALLENGE_ALREADY_ENDED: '이미 끝난 챌린지예요.',
  NOT_CHALLENGE_MEMBER: '챌린지 멤버가 아니라 인증할 수 없어요.',
  ROUTINE_NOT_FOUND: '루틴을 찾을 수 없어요.',
}

/**
 * 서버 문구를 그대로 보여 주는 코드 — 백엔드가 사용자에게 읽히는 한국어 문구를 담아 보낸다.
 * VALIDATION_FAILED는 코드 하나에 이유가 여섯(미래 · 중단 · 기간 밖 · 수행 요일 아님 · 메모 길이 · 날짜 형식)이라
 * 코드로는 가를 수 없다. SERVICE_UNAVAILABLE은 백필 3일 안내가 문구 안에 있다
 */
const SERVER_MESSAGE_CODES = new Set([
  'VALIDATION_FAILED',
  'EXECUTION_BACKFILL_WINDOW_EXCEEDED',
  'SERVICE_UNAVAILABLE',
  'TOO_MANY_REQUESTS',
])

export const NETWORK_MESSAGE = '연결이 불안정해요. 다시 시도해 주세요.'

/** 캐시가 낡아서 난 오류 — 다시 받으면 달력이 서버 상태로 돌아온다(WORKPLAN D9) */
export const STALE_CACHE_CODES = new Set(['EXECUTION_ALREADY_COMPLETED', 'EXECUTION_NOT_FOUND'])

export function executionErrorCode(error: unknown): string | null {
  return getApiErrorPayload(error)?.errorCode ?? null
}

/** 완료 · 취소 실패 → 버튼 줄 위에 보일 한 줄 */
export function executionErrorMessage(error: unknown, fallback: string): string {
  // 응답 자체가 없다 — 네트워크 끊김 · 타임아웃
  if (axios.isAxiosError(error) && !error.response) return NETWORK_MESSAGE

  const payload = getApiErrorPayload(error)
  const code = payload?.errorCode
  if (code && MESSAGES[code]) return MESSAGES[code]
  if (code && SERVER_MESSAGE_CODES.has(code) && payload?.message) return payload.message
  return fallback
}
