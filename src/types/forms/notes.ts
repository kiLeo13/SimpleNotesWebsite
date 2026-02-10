import z from "zod"

import i18n from "@/services/i18n"

import { NOTE_EXTENSIONS, NOTE_MAX_SIZE_BYTES } from "@/services/noteService"
import { getPrettySize, isAlphanumeric } from "@/utils/utils"

const hasValidExtension = (fileName: string): boolean => {
  const ext = (fileName.split(".").pop() || "").toLowerCase()
  return NOTE_EXTENSIONS.includes(ext)
}

const t = i18n.t

export const VISIBILITY_OPTIONS = [
  { label: "notes.visibility.public", value: "PUBLIC" },
  { label: "notes.visibility.org", value: "ORG" },
  { label: "notes.visibility.private", value: "PRIVATE" }
]

const baseNoteSchema = z.object({
  name: z
    .string()
    .min(2, t("errors.string.min", { count: 2 }))
    .max(80, t("errors.string.max", { count: 80 })),

  visibility: z.enum(["PUBLIC", "ORG", "PRIVATE"], t("errors.enum.invalid")),

  tags: z
    .array(
      z
        .string()
        .min(2, t("errors.tags.min", { val: 2 }))
        .max(30, t("errors.tags.max", { val: 30 }))
        .refine((s) => isAlphanumeric(s), t("errors.tags.pattern"))
    )
    .max(50, t("errors.tags.array.max", { val: 50 }))
})

export const uploadSchema = baseNoteSchema.extend({
  mode: z.literal("UPLOAD"),
  file: z
    .instanceof(FileList, { error: t("errors.file.required") })
    .refine((files) => files?.length === 1, t("errors.file.required"))
    .refine(
      (files) => files?.[0].size <= NOTE_MAX_SIZE_BYTES,
      t("errors.file.maxSize", {
        size: getPrettySize(NOTE_MAX_SIZE_BYTES)
      })
    )
    .refine(
      (files) => hasValidExtension(files?.[0].name),
      t("errors.file.invalidExtension", {
        extensions: NOTE_EXTENSIONS.join(", ")
      })
    )
})

export const editorSchema = baseNoteSchema.extend({
  mode: z.literal("EDITOR"),
  content: z
    .string()
    .min(1, t("errors.content.min", { val: 1 }))
    .max(1_000_000, t("errors.content.max", { val: 1_000_000 }))
})

export const createNoteSchema = z.discriminatedUnion("mode", [uploadSchema, editorSchema])

export const updateNoteSchema = baseNoteSchema.pick({
  name: true,
  tags: true,
  visibility: true
})

export type FileNoteFormFields = z.infer<typeof uploadSchema>
export type TextNoteFormFields = z.infer<typeof editorSchema>
export type NoteFormFields = z.infer<typeof createNoteSchema>

export type UpdateNoteFormFields = z.infer<typeof updateNoteSchema>
