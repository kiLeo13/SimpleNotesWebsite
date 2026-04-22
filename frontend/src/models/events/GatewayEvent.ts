import { z } from "zod"

import { createEvent } from "./eventFactory"
import {
  connectionKillSchema,
  presenceUpdatedEventSchema
} from "@/types/websocket/events"
import { noteBaseSchema, noteResponseSchema } from "@/types/api/notes"
import { userResponseSchema } from "@/types/api/users"

const eventRegistry = {
  // System
  Ping: createEvent("ping", z.unknown()),
  Ack: createEvent("ACK", z.unknown()),
  SessionExpired: createEvent("SESSION_EXPIRED", z.unknown()),
  ConnectionKill: createEvent("CONNECTION_KILL", connectionKillSchema),

  // Notes
  NoteCreated: createEvent("NOTE_CREATED", noteResponseSchema),
  NoteUpdated: createEvent("NOTE_UPDATED", noteResponseSchema),
  NoteDeleted: createEvent("NOTE_DELETED", noteBaseSchema.pick({ id: true })),

  // Users
  UserCreated: createEvent("USER_CREATED", userResponseSchema),
  UserUpdated: createEvent("USER_UPDATED", userResponseSchema),
  UserDeleted: createEvent("USER_DELETED", z.object({ id: z.number() })),

  PresenceUpdated: createEvent("PRESENCE_UPDATED", presenceUpdatedEventSchema)
}

export interface EventDefinition<S extends z.ZodTypeAny> {
  type: string
  schema: S
}

type AllEnvelopes = (typeof eventRegistry)[keyof typeof eventRegistry]["envelope"]

const schemas = Object.values(eventRegistry).map((e) => e.envelope) as [
  AllEnvelopes,
  ...AllEnvelopes[]
]

// Exports
export const serverEvents = eventRegistry

export const gatewayMessageSchema = z.discriminatedUnion("type", schemas)

export type GatewayMessage = z.infer<typeof gatewayMessageSchema>
