import { useQuery } from '@tanstack/react-query'

import { getCategories } from '@/api/category'
import type { Category } from '@/types/routine'

const CATEGORIES_QUERY_KEY = ['categories'] as const

// 카테고리는 서버 시드로만 바뀌는 정적 데이터다 — 한 번 받아 세션 내내 재사용한다 (#53)
export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getCategories,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

/** 코드 → 카테고리. 목록을 아직 못 받았거나 실패하면 undefined — 카드는 코드만 보여 준다 */
export function useCategoryLookup(): (code: string) => Category | undefined {
  const { data } = useCategories()
  return (code) => data?.find((c) => c.code === code)
}
