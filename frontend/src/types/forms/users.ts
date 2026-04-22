import i18n from "@/services/i18n"

import { hasCustom, hasDigits, hasLower, hasUpper } from "@/utils/pwdUtils"
import { z } from "zod"

const t = i18n.t

export const passwords = {
  minLength: 8,
  maxLength: 64
}

export const signupFormSchema = z.object({
  username: z
    .string()
    .min(2, t('errors.string.min', { count: 2 }))
    .max(80, t('errors.string.max', { count: 80 })),

  email: z.email(t('errors.email.invalid')),

  password: z
    .string()
    .min(8, t('errors.string.min', { count: 8 }))
    .max(64, t('errors.string.max', { count: 64 }))
    .refine((e) => hasLower(e), t('errors.string.hasLower'))
    .refine((e) => hasUpper(e), t('errors.string.hasUpper'))
    .refine((e) => hasDigits(e), t('errors.string.hasDigits'))
    .refine((e) => hasCustom(e), t('errors.string.hasSpecial'))
})

export const loginFormSchema = signupFormSchema.pick({
  email: true,
  password: true
})

export const confirmSignupFormSchema = z.object({
  email: z.email(t('errors.email.invalid')),

  code: z
    .string()
    .length(6, t('errors.string.fixed', { val: 6 }))
})

// No i18n for this, since we don't use it for forms
export const checkUserStatusFormSchema = z.object({
  email: z.email()
})

export type LoginFormFields = z.infer<typeof loginFormSchema>
export type SignupFormFields = z.infer<typeof signupFormSchema>
export type ConfirmFormFields = z.infer<typeof confirmSignupFormSchema>
export type CheckUserStatusFields = z.infer<typeof checkUserStatusFormSchema>
