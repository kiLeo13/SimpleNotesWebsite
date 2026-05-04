import { describe, expect, it } from "vitest"

import { departmentSchema } from "./departments"

describe("department API schemas", () => {
  it("requires the backend note count on department responses", () => {
    const parsed = departmentSchema.parse({
      id: "42",
      name: "Support",
      icon_type: "EMOJI",
      icon_value: "#",
      color_rgba: null,
      note_count: 3,
      created_at: "2026-05-03T10:00:00.000Z",
      updated_at: "2026-05-03T10:00:00.000Z"
    })

    expect(parsed.note_count).toBe(3)
  })

  it("rejects department responses without a note count", () => {
    const result = departmentSchema.safeParse({
      id: "42",
      name: "Support",
      icon_type: "EMOJI",
      icon_value: "#",
      color_rgba: null,
      created_at: "2026-05-03T10:00:00.000Z",
      updated_at: "2026-05-03T10:00:00.000Z"
    })

    expect(result.success).toBe(false)
  })
})
