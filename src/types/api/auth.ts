import { z } from "zod"

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
  access_token: z.string(),
  id_token: z.string()
})

export const LoginResponseSchema = RawLoginResponse.transform((data) => ({
  accessToken: data.access_token,
  idToken: data.id_token
}))

export const CheckUserStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'TAKEN', 'VERIFYING'])
})

// Exported zod response schemas
export type LoginResponseData = z.infer<typeof LoginResponseSchema>
export type CheckUserStatusData = z.infer<typeof CheckUserStatusSchema>