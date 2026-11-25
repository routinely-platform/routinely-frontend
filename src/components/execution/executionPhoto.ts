// 백엔드 ExecutionInputValidator와 같은 값 — 서버가 최종 검증하고, 여기서는 왕복 전에 거른다
export const MAX_EXECUTION_PHOTO_BYTES = 5 * 1024 * 1024 // 5MB

export const ALLOWED_EXECUTION_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** `<input type="file" accept>` — 파일 선택 창에서 먼저 거른다. 그래도 고를 수 있으니 아래 검증이 본다 */
export const EXECUTION_PHOTO_ACCEPT = ALLOWED_EXECUTION_PHOTO_TYPES.join(',')

export const PHOTO_MESSAGES = {
  type: '이 형식은 올릴 수 없어요 — JPG · PNG · WEBP만 돼요',
  size: '사진이 너무 커요 — 5MB까지 올릴 수 있어요',
  empty: '빈 파일은 올릴 수 없어요',
} as const

const isAllowedType = (type: string): boolean =>
  (ALLOWED_EXECUTION_PHOTO_TYPES as readonly string[]).includes(type.toLowerCase())

/**
 * 고른 사진을 받을 수 있나 — 받을 수 없으면 사진 필드 옆에 보일 문구, 받으면 null.
 * 형식은 브라우저가 정한 MIME으로만 본다. 확장자만 바꾼 파일은 서버가 시그니처로 다시 거른다(UNSUPPORTED_IMAGE_TYPE).
 * MIME이 비어 있는 파일(iPhone HEIC · 확장자 없는 파일)은 형식 오류다
 */
export function validateExecutionPhoto(file: File): string | null {
  if (!isAllowedType(file.type)) return PHOTO_MESSAGES.type
  if (file.size <= 0) return PHOTO_MESSAGES.empty
  if (file.size > MAX_EXECUTION_PHOTO_BYTES) return PHOTO_MESSAGES.size
  return null
}
