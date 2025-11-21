import i18n from "../../services/i18n"

import { z } from "zod"

const t = i18n.t

export const passwords = {
  minLength: 8,
  maxLength: 64
}

export const loginSchema = z.object({
  email: z.email(t('errors.email.invalid')),

  password: z
    .string()
    .min(8, t('errors.string.min', { count: 8 }))
    .max(64, t('errors.string.max', { count: 64 }))
})

export const signupSchema = z.object({
  username: z
    .string()
    .min(2, t('errors.string.min', { count: 2 }))
    .max(80, t('errors.string.max', { count: 80 })),

  email: z.email(t('errors.email.invalid')),

  password: z
    .string()
    .min(8, t('errors.string.min', { count: 8 }))
    .max(64, t('errors.string.max', { count: 64 }))
})

export const confirmSchema = z.object({
  email: z.email(t('errors.email.invalid')),

  code: z
    .string()
    .length(6, t('errors.string.fixed', { val: 6 }))
})

// No i18n for this, since we don't use it for forms
export const checkUserStatusSchema = z.object({
  email: z.email()
})

export type LoginFormFields = z.infer<typeof loginSchema>
export type SignupFormFields = z.infer<typeof signupSchema>
export type ConfirmFormFields = z.infer<typeof confirmSchema>
export type CheckUserStatusFields = z.infer<typeof checkUserStatusSchema>