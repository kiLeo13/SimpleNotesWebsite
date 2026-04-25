import { describe, expect, it } from "vitest"

import { fullNoteResponseSchema, noteResponseSchema } from "./notes"

describe("note schemas", () => {
  it("preserves explicit note variants in the summary union", () => {
    const markdown = noteResponseSchema.parse({
      id: "1",
      name: "Docs",
      tags: ["guide"],
      visibility: "PUBLIC",
      note_type: "MARKDOWN",
      created_by_id: "3",
      content_size: 120,
      created_at: "2026-04-21T10:00:00.000Z",
      updated_at: "2026-04-21T10:00:00.000Z"
    })

    expect(markdown.note_type).toBe("MARKDOWN")
    expect("content" in markdown).toBe(false)
  })

  it("requires content for full text-note responses", () => {
    const result = fullNoteResponseSchema.safeParse({
      id: "1",
      name: "Docs",
      tags: ["guide"],
      visibility: "PUBLIC",
      note_type: "FLOWCHART",
      created_by_id: "3",
      content_size: 120,
      created_at: "2026-04-21T10:00:00.000Z",
      updated_at: "2026-04-21T10:00:00.000Z"
    })

    expect(result.success).toBe(false)
  })

  it("accepts reference notes with attachment content in both unions", () => {
    const input = {
      id: "9",
      name: "Invoice",
      tags: [],
      visibility: "PRIVATE" as const,
      note_type: "REFERENCE" as const,
      created_by_id: "5",
      content_size: 2048,
      created_at: "2026-04-21T10:00:00.000Z",
      updated_at: "2026-04-21T10:00:00.000Z",
      content: "attachments/invoice.pdf"
    }

    expect(noteResponseSchema.parse(input).note_type).toBe("REFERENCE")
    expect(fullNoteResponseSchema.parse(input).content).toBe(
      "attachments/invoice.pdf"
    )
  })
})
