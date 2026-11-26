import { describe, expect, it } from 'vitest'
import { MAX_EXECUTION_PHOTO_BYTES, PHOTO_MESSAGES, validateExecutionPhoto } from './executionPhoto'

/** size만 흉내 낸다 — 5MB를 실제로 채우지 않는다 */
const fileOf = (type: string, size: number, name = 'photo') => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('validateExecutionPhoto — 백엔드 ExecutionInputValidator와 같은 기준', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp', 'IMAGE/PNG'])('%s는 받는다', (type) => {
    expect(validateExecutionPhoto(fileOf(type, 1024))).toBeNull()
  })

  it.each([
    ['image/gif', 'gif'],
    ['image/heic', 'iPhone HEIC'],
    ['application/pdf', 'PDF'],
    ['', 'MIME이 비어 있는 파일'],
  ])('%s(%s)는 형식 오류다', (type) => {
    expect(validateExecutionPhoto(fileOf(type, 1024))).toBe(PHOTO_MESSAGES.type)
  })

  it('정확히 5MB는 받는다 — 한도는 "이하"다', () => {
    expect(validateExecutionPhoto(fileOf('image/png', MAX_EXECUTION_PHOTO_BYTES))).toBeNull()
  })

  it('5MB에서 1바이트라도 넘으면 크기 오류다', () => {
    expect(validateExecutionPhoto(fileOf('image/png', MAX_EXECUTION_PHOTO_BYTES + 1))).toBe(
      PHOTO_MESSAGES.size
    )
  })

  it('0바이트는 빈 파일 오류다', () => {
    expect(validateExecutionPhoto(fileOf('image/jpeg', 0))).toBe(PHOTO_MESSAGES.empty)
  })

  it('형식과 크기가 둘 다 틀리면 형식을 먼저 알린다 — 줄여도 못 올리는 파일이다', () => {
    expect(validateExecutionPhoto(fileOf('image/gif', MAX_EXECUTION_PHOTO_BYTES + 1))).toBe(
      PHOTO_MESSAGES.type
    )
  })
})
