import {
  uploadSchema,
  VISIBILITY_OPTIONS,
  type FileNoteFormFields
} from "@/types/forms/notes"
import { useState, type JSX } from "react"

import {
  NOTE_EXTENSIONS,
  NOTE_MAX_SIZE_BYTES,
  noteService
} from "@/services/noteService"
import { ModalActionRow } from "../../shared/sections/ModalActionRow"
import { ModalFileInput } from "../../shared/inputs/ModalFileInput"
import { FormProvider, useForm } from "react-hook-form"
import { Button } from "@/components/ui/buttons/Button"
import { IoMdClose } from "react-icons/io"
import { ModalTextInput } from "../../shared/inputs/ModalTextInput"
import { ModalSelectInput } from "../../shared/inputs/ModalSelectInput"
import { ModalLabel } from "../../shared/sections/ModalLabel"
import { ModalSection } from "../../shared/sections/ModalSection"
import { ModalArrayInput } from "../../shared/inputs/ModalArrayInput"
import { getPrettySize } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNoteStore } from "@/stores/useNotesStore"
import { useTranslation } from "react-i18next"
import { toasts } from "@/utils/toastUtils"

import styles from "./CreateNoteModal.module.css"

type CreateNoteModalFormProps = {
  setShowUploadModal: (show: boolean) => void
}

export function CreateNoteModalForm({
  setShowUploadModal
}: CreateNoteModalFormProps): JSX.Element {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const openNote = useNoteStore((state) => state.openNote)
  const methods = useForm<FileNoteFormFields>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      mode: "UPLOAD",
      name: "",
      visibility: "PUBLIC",
      tags: [],
      file: undefined
    }
  })
  const { handleSubmit } = methods
  const viewOptions = [...VISIBILITY_OPTIONS].map((o) => ({
    label: t(o.label),
    value: o.value
  }))

  const onSubmit = async (data: FileNoteFormFields) => {
    // This should be impossible, but better
    if (!data.file?.[0]) {
      toasts.warning(null, { description: t("warnings.noteCreation.noFiles") })
      return
    }

    setIsLoading(true)
    const resp = await noteService.createFileNote(
      {
        name: data.name,
        note_type: "REFERENCE",
        tags: data.tags || [],
        visibility: data.visibility
      },
      data.file[0]
    )
    setIsLoading(false)

    if (resp.success) {
      toasts.success(t("createNoteModal.toasts.success"))
      openNote(resp.data)
      setShowUploadModal(false)
    } else {
      toasts.apiError(t("createNoteModal.toasts.error"), resp)
    }
  }

  const handleCloseModal = () => setShowUploadModal(false)

  return (
    <div className={styles.container}>
      <div className={styles.close} onClick={handleCloseModal}>
        <IoMdClose color="rgba(94, 76, 121, 1)" size={"24px"} />
      </div>

      <FormProvider {...methods}>
        <form className={styles.form} noValidate>
          <div className={styles.title}>{t("createNoteModal.title")}</div>

          <ModalActionRow>
            <ModalSection
              label={<ModalLabel title={t("createNoteModal.name")} required />}
              input={<ModalTextInput name="name" autoComplete="off" />}
            />
          </ModalActionRow>

          <ModalActionRow>
            <ModalSection
              label={
                <ModalLabel title={t("createNoteModal.visibility")} required />
              }
              input={
                <ModalSelectInput name="visibility" options={viewOptions} />
              }
            />
          </ModalActionRow>

          <ModalActionRow>
            <ModalSection
              label={
                <ModalLabel
                  title={t("createNoteModal.tags")}
                  required={false}
                />
              }
              input={
                <ModalArrayInput
                  name="tags"
                  placeholder={t("createNoteModal.tagsPlaceholder")}
                  minLength={2}
                  maxLength={30}
                />
              }
            />
          </ModalActionRow>

          <ModalActionRow>
            <ModalSection
              label={
                <ModalLabel
                  title={t("createNoteModal.content")}
                  hint={t("createNoteModal.contentHint", {
                    size: getPrettySize(NOTE_MAX_SIZE_BYTES)
                  })}
                  required
                />
              }
              input={
                <ModalFileInput
                  name="file"
                  allowedExtensions={NOTE_EXTENSIONS}
                />
              }
            />
          </ModalActionRow>

          <div className={styles.bottomContainer}>
            <Button
              isLoading={isLoading}
              disabled={isLoading}
              className={styles.submitButton}
              onClick={handleSubmit(onSubmit)}
              type="submit"
              loaderProps={{ scale: 0.7 }}
            >
              {t("createNoteModal.submit")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
