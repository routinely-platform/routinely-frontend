import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './client'
import { cancelExecution, completeExecution } from './execution'

vi.mock('./client', () => ({ apiClient: { post: vi.fn(), delete: vi.fn() } }))

const mockedPost = vi.mocked(apiClient.post)
const mockedDelete = vi.mocked(apiClient.delete)

const OK = {
  data: {
    success: true,
    data: {
      executionId: 10,
      routineId: 1,
      scheduledDate: '2026-11-06',
      status: 'COMPLETED',
      completedAt: '2026-11-08T09:00:00',
      photoUrl: null,
      feedCardId: 20,
    },
  },
}

/** 보낸 FormData를 꺼낸다 */
const sentForm = () => mockedPost.mock.calls[0][1] as FormData

describe('completeExecution', () => {
  beforeEach(() => {
    mockedPost.mockReset()
    mockedPost.mockResolvedValue(OK)
  })

  it('routineId + date 경로에 multipart로 보낸다 — 기본 JSON 헤더를 요청별로 덮는다', async () => {
    await completeExecution(1, '2026-11-06')

    const [url, , config] = mockedPost.mock.calls[0]
    expect(url).toBe('/routines/1/executions/2026-11-06/complete')
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } })
  })

  it('사진 · 메모는 photo · memo 파트로 — 메모를 query로 보내지 않는다', async () => {
    const photo = new File(['x'], 'a.png', { type: 'image/png' })
    await completeExecution(1, '2026-11-06', { photo, memo: '  첫 줄\n둘째 줄  ' })

    const form = sentForm()
    expect(form.get('photo')).toBeInstanceOf(File)
    expect((form.get('photo') as File).name).toBe('a.png')
    // 내용이 있으면 손대지 않는다 — 앞뒤 공백도 그대로
    expect(form.get('memo')).toBe('  첫 줄\n둘째 줄  ')
    expect(mockedPost.mock.calls[0][0]).not.toContain('memo')
  })

  it('사진 · 메모가 없으면 파트를 싣지 않는다 — 공백뿐인 메모도', async () => {
    await completeExecution(1, '2026-11-06', { photo: null, memo: '   ' })

    const form = sentForm()
    expect(form.has('photo')).toBe(false)
    expect(form.has('memo')).toBe(false)
  })

  it('실패 바디면 서버 문구로 던진다', async () => {
    mockedPost.mockResolvedValue({ data: { success: false, message: '안 됨' } })
    await expect(completeExecution(1, '2026-11-06')).rejects.toThrow('안 됨')
  })
})

describe('cancelExecution', () => {
  it('같은 경로에 DELETE', async () => {
    mockedDelete.mockResolvedValue({ data: { ...OK.data, data: { ...OK.data.data } } })
    await cancelExecution(1, '2026-11-07')
    expect(mockedDelete).toHaveBeenCalledWith('/routines/1/executions/2026-11-07/complete')
  })
})
