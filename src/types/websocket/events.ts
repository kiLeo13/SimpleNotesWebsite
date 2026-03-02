import z from "zod"

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
