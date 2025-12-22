import z from "zod"

// Request Payloads
export interface NoteRequestPayload {
  name: string
  tags: string[]
  visibility: "PUBLIC" | "CONFIDENTIAL"
}

export interface UpdateNoteRequestPayload {
  name?: string
  tags?: string[]
  visibility?: "PUBLIC" | "CONFIDENTIAL"
}

// Raw API Responses (if transformation is needed)
// ---
// I am also defining building blocks for discriminated unions.
const NoteBaseSchema = z.object({
  id: z.number(),
  name: z.string(),
  tags: z.array(z.string()),
  visibility: z.enum(["PUBLIC", "CONFIDENTIAL"]),
  created_by_id: z.number(),
  content_size: z.number(),
  created_at: z.string(),
  updated_at: z.string()
})

const TextNoteSchema = NoteBaseSchema.extend({
  note_type: z.literal("TEXT")
})

const ReferenceNoteSchema = NoteBaseSchema.extend({
  note_type: z.literal("REFERENCE"),
  content: z.string()
})

const FlowchartNoteSchema = NoteBaseSchema.extend({
  note_type: z.literal("FLOWCHART")
})

export const NoteResponseSchema = z.discriminatedUnion("note_type", [
  TextNoteSchema,
  ReferenceNoteSchema,
  FlowchartNoteSchema
])

export const FullNoteResponseSchema = NoteBaseSchema.extend({
  note_type: z.enum(["TEXT", "REFERENCE", "FLOWCHART"]),
  content: z.string()
})

export const ListNoteResponseSchema = z.object({
  notes: z.array(NoteResponseSchema)
})

export type NoteResponseData = z.infer<typeof NoteResponseSchema>
export type FullNoteResponseData = z.infer<typeof FullNoteResponseSchema>
export type ListNoteResponseData = z.infer<typeof ListNoteResponseSchema>