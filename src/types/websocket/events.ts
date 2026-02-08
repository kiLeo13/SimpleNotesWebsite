import z from "zod"

export const connKillSchema = z.object({
  code: z.string(),
  reason: z.string().optional()
})

export type ConnectionKill = z.infer<typeof connKillSchema>