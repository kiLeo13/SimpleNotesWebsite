import { describe, expect, it } from "vitest"

import { gatewayMessageSchema } from "./GatewayEvent"

describe("gatewayMessageSchema", () => {
  it("parses note events through the explicit discriminant", () => {
    const result = gatewayMessageSchema.parse({
      type: "NOTE_CREATED",
      data: {
        id: "1",
        name: "Docs",
        tags: [],
        department_id: null,
        note_type: "MARKDOWN",
        created_by_id: "2",
        content_size: 128,
        created_at: "2026-04-21T10:00:00.000Z",
        updated_at: "2026-04-21T10:00:00.000Z"
      }
    })

    if (result.type !== "NOTE_CREATED") {
      throw new Error("expected NOTE_CREATED event")
    }

    expect(result.type).toBe("NOTE_CREATED")
    expect(result.data.note_type).toBe("MARKDOWN")
  })

  it("rejects connection-kill events with invalid codes", () => {
    const result = gatewayMessageSchema.safeParse({
      type: "CONNECTION_KILL",
      data: {
        code: "BANHAMMER"
      }
    })

    expect(result.success).toBe(false)
  })
})
