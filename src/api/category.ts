import { apiClient } from './client'
import { unwrapApiResponse } from './response'
import type { ApiResponse } from '@/types/api'
import type { Category } from '@/types/routine'

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<ApiResponse<Category[]>>('/categories')
  const categories = unwrapApiResponse(res.data, '카테고리를 불러오지 못했습니다.')
  return [...categories].sort((a, b) => a.displayOrder - b.displayOrder)
}
