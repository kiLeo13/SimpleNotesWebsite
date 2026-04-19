import z from "zod"

import { presenceSchema } from "../api/users"

const connKillCodeSchema = z.enum([
  "SUSPENDED_ACCOUNT",
  "IDLE_TIMEOUT",
  "DELETED",
  "LOGOUT"
])

export const connKillSchema = z.object({
  code: connKillCodeSchema,
  reason: z.string().optional()
})

export const presenceUpdatedSchema = z.object({
  id: z.number(),
  presence: presenceSchema
})

export type ConnectionKillCode = z.infer<typeof connKillCodeSchema>
export type ConnectionKill = z.infer<typeof connKillSchema>

// ---- Helpers ----

type CodeBehavior = {
  shouldReconnect: boolean
}

export const KillCodeBehaviors: Record<ConnectionKillCode, CodeBehavior> = {
  SUSPENDED_ACCOUNT: { shouldReconnect: false },
  DELETED: { shouldReconnect: false },
  LOGOUT: { shouldReconnect: false },
  IDLE_TIMEOUT: { shouldReconnect: true }
}
