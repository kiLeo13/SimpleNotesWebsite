import { z } from "zod"

export const passwords = {
  minLength: 8,
  maxLength: 64
}

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(64)
})

export const signupSchema = z.object({
  username: z.string().min(2).max(80),
  email: z.email(),
  password: z.string().min(8).max(64)
})

export const confirmSchema = z.object({
  email: z.email(),
  code: z.string().length(6)
})

export const checkUserStatusSchema = z.object({
  email: z.email()
})

export type LoginFormFields = z.infer<typeof loginSchema>
export type SignupFormFields = z.infer<typeof signupSchema>
export type ConfirmFormFields = z.infer<typeof confirmSchema>
export type CheckUserStatusFields = z.infer<typeof checkUserStatusSchema>