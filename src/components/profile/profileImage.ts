import { getApiErrorPayload } from '@/components/auth/authFormErrors'

export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB — 백엔드 제약과 동일

export const ALLOWED_PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

// 백엔드가 최종 검증하지만, 불필요한 업로드/왕복을 줄이기 위해 클라이언트에서 1차 검증한다.
export function validateProfileImageFile(file: File): string | null {
  if (file.size <= 0) {
    return '빈 파일은 업로드할 수 없습니다.'
  }
  if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_PROFILE_IMAGE_TYPES)[number])) {
    return 'JPEG, PNG, WEBP 형식만 업로드할 수 있습니다.'
  }
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    return '이미지 크기는 5MB 이하여야 합니다.'
  }
  return null
}

// 백엔드 ErrorCode → 사용자 노출 메시지 매핑 (user-service #95)
const BACKEND_ERROR_MESSAGES: Record<string, string> = {
  EMPTY_FILE: '빈 파일은 업로드할 수 없습니다.',
  UNSUPPORTED_IMAGE_TYPE: 'JPEG, PNG, WEBP 형식만 업로드할 수 있습니다.',
  FILE_SIZE_EXCEEDED: '이미지 크기는 5MB 이하여야 합니다.',
  FILE_UPLOAD_FAILED: '이미지 업로드에 실패했습니다. 다시 시도해주세요.',
  FILE_DELETE_FAILED: '이미지 삭제에 실패했습니다. 다시 시도해주세요.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
}

export function resolveProfileImageErrorMessage(error: unknown, fallback: string): string {
  const payload = getApiErrorPayload<unknown>(error)
  if (payload?.errorCode && BACKEND_ERROR_MESSAGES[payload.errorCode]) {
    return BACKEND_ERROR_MESSAGES[payload.errorCode]
  }
  if (payload?.message) {
    return payload.message
  }
  return error instanceof Error ? error.message : fallback
}
