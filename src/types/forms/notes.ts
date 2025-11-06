import z from "zod"

import i18n from "../../services/i18n"

import { NOTE_EXTENSIONS, NOTE_MAX_SIZE_BYTES } from "../../services/noteService"
import { getPrettySize } from "../../utils/utils"

const hasValidExtension = (fileName: string): boolean => {
  const ext = (fileName.split(".").pop() || "").toLowerCase()
  return NOTE_EXTENSIONS.includes(ext)
}

const t = i18n.t

export const noteSchema = z.object({
  name: z
    .string()
    .min(2, t('errors.string.min', { count: 2 }))
    .max(80, t('errors.string.max', { count: 80 })),

  visibility: z.enum(["PUBLIC", "CONFIDENTIAL"], t("errors.enum.invalid")),

  tags: z.string().optional(),

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

export type NoteFormFields = z.infer<typeof noteSchema>