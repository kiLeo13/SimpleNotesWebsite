import { z } from "zod"

// =====================
// API Response Wrappers
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

// =========================
// Route Specific Payloads & Data
// =========================

/* ---------- Auth ---------- */

// Request Payloads
export interface LoginRequestPayload {
  email: string
  password: string
}

export interface SignupRequestPayload {
  username: string
  email: string
  password: string
}

export interface ConfirmRequestPayload {
  email: string
  code: string
}

export interface CheckUserStatusPayload {
  email: string
}

// Raw API Responses (if transformation is needed)
const RawLoginResponse = z.object({
  access_token: z.string().min(1),
  id_token: z.string().min(1)
})

// API Response Data after transformation (schemas)
export const LoginResponseSchema = RawLoginResponse.transform((data) => ({
  accessToken: data.access_token,
  idToken: data.id_token
}))

export const SignupResponseSchema = z.object({})

export const ConfirmResponseSchema = z.object({})

export const CheckUserStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'TAKEN', 'VERIFYING'])
})

// Exported zod response schemas
export type LoginResponseData = z.infer<typeof LoginResponseSchema>
export type SignupResponseData = z.infer<typeof SignupResponseSchema>
export type ConfirmResponseData = z.infer<typeof ConfirmResponseSchema>
export type CheckUserStatusData = z.infer<typeof CheckUserStatusSchema>