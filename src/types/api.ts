export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  errorCode?: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  hasNext: boolean
  totalElements?: number
}
