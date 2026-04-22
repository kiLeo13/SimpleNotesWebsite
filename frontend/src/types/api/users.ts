import { z } from "zod"

// ------------------------------
// Request Payloads
// ------------------------------
export interface LoginRequestPayload {
  email: string
  password: string
}

export interface SignupRequestPayload {
  username: string
  email: string
  password: string
}

export interface UpdateUserRequestPayload {
  username?: string
  permissions?: number
  suspended?: boolean
}

export interface LogoutRequestPayload {
  access_token: string
}

export interface ConfirmRequestPayload {
  email: string
  code: string
}

export interface CheckUserStatusPayload {
  email: string
}

// --------------------------------------------------
// API Responses (transformation may be needed)
// --------------------------------------------------

// Auth
const rawLoginResponseSchema = z.object({
  access_token: z.string(),
  id_token: z.string()
})

export const loginResponseSchema = rawLoginResponseSchema.transform((data) => ({
  accessToken: data.access_token,
  idToken: data.id_token
}))

export const checkUserStatusResponseSchema = z.object({
  status: z.enum(["AVAILABLE", "TAKEN", "VERIFYING"])
})

export const userPresenceSchema = z.enum(["ONLINE", "OFFLINE"])

// Users
export const userResponseSchema = z
  .object({
    id: z.number(),
    username: z.string(),
    permissions: z.number(),
    presence: userPresenceSchema,
    is_verified: z.boolean().optional(),
    suspended: z.boolean().optional(),
    created_at: z.string(),
    updated_at: z.string()
  })
  .transform((data) => ({
    id: data.id,
    username: data.username,
    permissions: data.permissions,
    presence: data.presence,
    isVerified: data.is_verified,
    suspended: data.suspended,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }))

export const listUsersResponseSchema = z.object({
  users: z.array(userResponseSchema)
})

// ----------------------------------
// Exported zod response schemas
// ----------------------------------

// Auth
export type LoginResponseData = z.infer<typeof loginResponseSchema>
export type CheckUserStatusData = z.infer<typeof checkUserStatusResponseSchema>

// Users
export type UserPresenceData = z.infer<typeof userPresenceSchema>
export type UserResponseData = z.infer<typeof userResponseSchema>
export type ListUsersResponseData = z.infer<typeof listUsersResponseSchema>
