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
const RawLoginResponse = z.object({
  access_token: z.string(),
  id_token: z.string()
})

export const LoginResponseSchema = RawLoginResponse.transform((data) => ({
  accessToken: data.access_token,
  idToken: data.id_token
}))

export const CheckUserStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "TAKEN", "VERIFYING"])
})

// Users
const RawUserResponse = z.object({
  id: z.number(),
  username: z.string(),
  is_admin: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
})

export const UserResponseSchema = RawUserResponse.transform((data) => ({
  id: data.id,
  username: data.username,
  isAdmin: data.is_admin,
  createdAt: data.created_at,
  updatedAt: data.updated_at
}))

export const ListUserResponseSchema = z.object({
  users: z.array(UserResponseSchema)
})

// ----------------------------------
// Exported zod response schemas
// ----------------------------------

// Auth
export type LoginResponseData = z.infer<typeof LoginResponseSchema>
export type CheckUserStatusData = z.infer<typeof CheckUserStatusSchema>

// Users
export type UserResponseData = z.infer<typeof UserResponseSchema>
export type ListUsersResponseData = z.infer<typeof ListUserResponseSchema>
