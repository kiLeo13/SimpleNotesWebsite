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

const resyncReasonSchema = z.enum(["CURSOR_TOO_OLD", "SCOPE_CHANGED"])

export const presenceUpdatedEventSchema = z.object({
  id: z.string(),
  presence: userPresenceSchema
})

export const resyncRequiredSchema = z.object({
  reason: resyncReasonSchema,
  latest_event_id: z.string().optional()
})

export type ConnectionKillCode = z.infer<typeof connectionKillCodeSchema>
export type ConnectionKill = z.infer<typeof connectionKillSchema>
export type ResyncRequired = z.infer<typeof resyncRequiredSchema>

// ---- Helpers ----

type CodeBehavior = {
  shouldReconnect: boolean
}

export const connectionKillBehaviors: Record<ConnectionKillCode, CodeBehavior> =
  {
    SUSPENDED_ACCOUNT: { shouldReconnect: false },
    DELETED: { shouldReconnect: false },
    LOGOUT: { shouldReconnect: false },
    IDLE_TIMEOUT: { shouldReconnect: true }
  }
