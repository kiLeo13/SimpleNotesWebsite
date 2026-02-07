import z from "zod"

import { NoteBaseSchema, NoteResponseSchema } from "@/types/api/notes"
import { UserResponseSchema } from "@/types/api/users"
import { connKillSchema } from "@/types/websocket/events"

export class GatewayEvent<S extends z.ZodType> {
  public readonly type: string
  public readonly schema: S

  constructor(type: string, schema: S) {
    this.type = type
    this.schema = schema
  }

  validate(data: unknown): z.infer<S> {
    return this.schema.parse(data)
  }
}

export class ServerEvents {
  // System
  static readonly Ping = new GatewayEvent("ping", z.unknown())
  static readonly Ack = new GatewayEvent("ACK", z.unknown())

  // Session
  static readonly SessionExpired = new GatewayEvent("SESSION_EXPIRED", z.void())

  static readonly ConnectionKill = new GatewayEvent(
    "CONNECTION_KILL",
    connKillSchema
  )

  // Notes
  static readonly NoteCreated = new GatewayEvent(
    "NOTE_CREATED",
    NoteResponseSchema
  )

  static readonly NoteUpdated = new GatewayEvent(
    "NOTE_UPDATED",
    NoteResponseSchema
  )

  static readonly NoteDeleted = new GatewayEvent(
    "NOTE_DELETED",
    NoteBaseSchema.pick({ id: true })
  )

  // Users
  static readonly UserUpdated = new GatewayEvent(
    "USER_UPDATED",
    UserResponseSchema
  )
}
