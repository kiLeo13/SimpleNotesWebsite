import { z } from "zod"

import { userPresenceSchema } from "../api/users"

const connectionKillCodeSchema = z.enum([
  "SUSPENDED_ACCOUNT",
  "IDLE_TIMEOUT",
  "DELETED",
  "LOGOUT"
])

export const connectionKillSchema = z.object({
  code: connectionKillCodeSchema,
  reason: z.string().optional()
})

export const presenceUpdatedEventSchema = z.object({
  id: z.string(),
  presence: userPresenceSchema
})

export type ConnectionKillCode = z.infer<typeof connectionKillCodeSchema>
export type ConnectionKill = z.infer<typeof connectionKillSchema>

// ---- Helpers ----

type CodeBehavior = {
  shouldReconnect: boolean
}

export const connectionKillBehaviors: Record<ConnectionKillCode, CodeBehavior> = {
  SUSPENDED_ACCOUNT: { shouldReconnect: false },
  DELETED: { shouldReconnect: false },
  LOGOUT: { shouldReconnect: false },
  IDLE_TIMEOUT: { shouldReconnect: true }
}
