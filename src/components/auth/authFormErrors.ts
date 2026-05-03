import axios from 'axios'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ApiResponse } from '@/types/api'

export type ValidationFieldErrors = Record<string, string>

export function getApiErrorPayload<T>(error: unknown): ApiResponse<T> | null {
  if (!axios.isAxiosError<ApiResponse<T>>(error)) {
    return null
  }

  return error.response?.data ?? null
}

export function applyValidationFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors: ValidationFieldErrors,
) {
  Object.entries(fieldErrors).forEach(([field, message]) => {
    setError(field as Path<T>, { message })
  })
}
