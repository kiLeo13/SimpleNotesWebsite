import { z } from "zod"

export const noteVisibilitySchema = z.enum(["PUBLIC", "PRIVATE"])
export type NoteVisibility = z.infer<typeof noteVisibilitySchema>

export const noteTypeSchema = z.enum(["MARKDOWN", "FLOWCHART", "REFERENCE"])
export type NoteType = z.infer<typeof noteTypeSchema>

// --- REQUEST PAYLOADS ---
interface BaseNotePayload {
  name: string
  tags: string[]
  visibility: NoteVisibility
  department_id?: string | null
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
  department_id?: string | null
}

// --- API Responses ---
export const noteBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  tags: z.array(z.string()),
  visibility: noteVisibilitySchema,
  department_id: z.string().nullable(),
  note_type: noteTypeSchema,
  created_by_id: z.string(),
  content_size: z.number(),
  created_at: z.string(),
  updated_at: z.string()
})

const markdownNoteResponseSchema = noteBaseSchema.extend({
  note_type: z.literal("MARKDOWN")
})

const flowchartNoteResponseSchema = noteBaseSchema.extend({
  note_type: z.literal("FLOWCHART")
})

// Specific Schema for File Notes (PDFs, Images)
const referenceNoteResponseSchema = noteBaseSchema.extend({
  note_type: z.literal("REFERENCE"),
  // Reference notes usually contain a filename/UUID in 'content'
  content: z.string()
})

export const noteResponseSchema = z.discriminatedUnion("note_type", [
  markdownNoteResponseSchema,
  flowchartNoteResponseSchema,
  referenceNoteResponseSchema
])

const markdownFullNoteResponseSchema = markdownNoteResponseSchema.extend({
  content: z.string()
})

const flowchartFullNoteResponseSchema = flowchartNoteResponseSchema.extend({
  content: z.string()
})

export const fullNoteResponseSchema = z.discriminatedUnion("note_type", [
  markdownFullNoteResponseSchema,
  flowchartFullNoteResponseSchema,
  referenceNoteResponseSchema
])

export const listNoteResponseSchema = z.object({
  notes: z.array(noteResponseSchema)
})

// --- INFERRED TYPES ---
export type NoteResponseData = z.infer<typeof noteResponseSchema>
export type FullNoteResponseData = z.infer<typeof fullNoteResponseSchema>
export type ListNoteResponseData = z.infer<typeof listNoteResponseSchema>
