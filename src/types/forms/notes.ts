import z from "zod"

import i18n from "../../services/i18n"

import { NOTE_EXTENSIONS, NOTE_MAX_SIZE_BYTES } from "../../services/noteService"
import { getPrettySize } from "../../utils/utils"

const hasValidExtension = (fileName: string): boolean => {
  const ext = (fileName.split(".").pop() || "").toLowerCase()
  return NOTE_EXTENSIONS.includes(ext)
}

const t = i18n.t

export const VISIBILITY_OPTIONS = [
  { label: "Público", value: "PUBLIC" },
  { label: "Confidencial", value: "CONFIDENTIAL" }
]

export const createNoteSchema = z.object({
  name: z
    .string()
    .min(2, t('errors.string.min', { count: 2 }))
    .max(80, t('errors.string.max', { count: 80 })),

  visibility: z.enum(["PUBLIC", "CONFIDENTIAL"], t("errors.enum.invalid")),

  tags: z.array(
    z
      .string()
      .min(2)
      .max(30)
      .regex(/^[a-zA-Z0-9-]+$/)
  ),

  file: z.instanceof(FileList, { error: t('errors.file.required') })
    .refine(files => files?.length === 1, t('errors.file.required'))
    .refine(
      files => files?.[0].size <= NOTE_MAX_SIZE_BYTES,
      t('errors.file.maxSize', {
        size: getPrettySize(NOTE_MAX_SIZE_BYTES)
      })
    )
    .refine(
      files => hasValidExtension(files?.[0].name),
      t('errors.file.invalidExtension', {
        extensions: NOTE_EXTENSIONS.join(', ')
      })
    )
})

export const updateNoteSchema = createNoteSchema.pick({
  name: true,
  tags: true,
  visibility: true
})

export type NoteFormFields = z.infer<typeof createNoteSchema>
export type UpdateNoteFormFields = z.infer<typeof updateNoteSchema>