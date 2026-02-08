import z from "zod"

import { createEvent } from "./eventFactory"
import { connKillSchema } from "@/types/websocket/events"
import { NoteBaseSchema, NoteResponseSchema } from "@/types/api/notes"
import { UserResponseSchema } from "@/types/api/users"

const Registry = {
  // System
  Ping: createEvent("ping", z.unknown()),
  Ack: createEvent("ACK", z.unknown()),
  SessionExpired: createEvent("SESSION_EXPIRED", z.unknown()),
  ConnectionKill: createEvent("CONNECTION_KILL", connKillSchema),

  // Notes
  NoteCreated: createEvent("NOTE_CREATED", NoteResponseSchema),
  NoteUpdated: createEvent("NOTE_UPDATED", NoteResponseSchema),
  NoteDeleted: createEvent("NOTE_DELETED", NoteBaseSchema.pick({ id: true })),

  // Users
  UserUpdated: createEvent("USER_UPDATED", UserResponseSchema)
}

type AllEnvelopes = (typeof Registry)[keyof typeof Registry]["envelope"]

const schemas = Object.values(Registry).map((e) => e.envelope) as [AllEnvelopes, ...AllEnvelopes[]]

// Exports
export const ServerEvents = Registry

export const gatewayMessageSchema = z.discriminatedUnion("type", schemas)

export type GatewayMessage = z.infer<typeof gatewayMessageSchema>