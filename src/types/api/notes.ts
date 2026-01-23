import z from "zod"

export type NoteVisibility = "PUBLIC" | "CONFIDENTIAL"

export type NoteType = "MARKDOWN" | "FLOWCHART" | "REFERENCE"

// --- REQUEST PAYLOADS ---
interface BaseNotePayload {
  name: string
  tags: string[]
  visibility: NoteVisibility
  note_type: NoteType
}

export type CreateFileNotePayload = BaseNotePayload

export interface CreateTextNotePayload extends BaseNotePayload {
  content: string
}

// 4. Update Payload
export interface UpdateNoteRequestPayload {
  name?: string
  tags?: string[]
  visibility?: NoteVisibility
}

// --- API Responses ---
const NoteBaseSchema = z.object({
  id: z.number(),
  name: z.string(),
  tags: z.array(z.string()),
  visibility: z.enum(["PUBLIC", "CONFIDENTIAL"]),
  note_type: z.enum(["MARKDOWN", "MERMAID", "REFERENCE"]),
  created_by_id: z.number(),
  content_size: z.number(),
  created_at: z.string(),
  updated_at: z.string()
})

const TextNoteSchema = NoteBaseSchema.extend({
  note_type: z.enum(["TEXT", "MARKDOWN", "MERMAID"])
})

// Specific Schema for File Notes (PDFs, Images)
const ReferenceNoteSchema = NoteBaseSchema.extend({
  note_type: z.literal("REFERENCE"),
  // Reference notes usually contain a filename/UUID in 'content'
  content: z.string()
})

export const NoteResponseSchema = z.discriminatedUnion("note_type", [
  TextNoteSchema,
  ReferenceNoteSchema
])

export const FullNoteResponseSchema = NoteBaseSchema.extend({
  content: z.string()
})

export const ListNoteResponseSchema = z.object({
  notes: z.array(NoteResponseSchema)
})

// --- INFERRED TYPES ---
export type NoteResponseData = z.infer<typeof NoteResponseSchema>
export type FullNoteResponseData = z.infer<typeof FullNoteResponseSchema>
export type ListNoteResponseData = z.infer<typeof ListNoteResponseSchema>
