import z from "zod"

// API Response Data after transformation (schemas)
export const VoidSchema = z.undefined()
  .or(z.null())
  .or(z.literal(''))
  .transform(() => undefined)

// =====================
// General API Response Wrappers
// =====================
export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  errors: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse