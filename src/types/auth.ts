import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Por favor, insira um e-mail válido"),
  password: z.string()
    .min(8, "Mínimo: 8 caracteres")
    .max(64, "Máximo: 64 caracteres")
})

export const signupSchema = z.object({
  username: z.string().min(2).max(8),
  email: z.email("Please, enter a valid email address KJAHSDSJKAH"),
  password: z.string().min(8).max(64)
})

export type LoginFormFields = z.infer<typeof loginSchema>
export type SignupFormFields = z.infer<typeof signupSchema>