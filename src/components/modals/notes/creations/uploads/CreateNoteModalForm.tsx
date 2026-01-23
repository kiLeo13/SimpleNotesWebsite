import { uploadSchema, VISIBILITY_OPTIONS, type FileNoteFormFields } from "@/types/forms/notes"
import { useState, type JSX } from "react"

import clsx from "clsx"
import i18n from "@/services/i18n"

import { NOTE_EXTENSIONS, NOTE_MAX_SIZE_BYTES } from "@/services/noteService"
import { ModalActionRow } from "../../shared/sections/ModalActionRow"
import { ModalFileInput } from "../../shared/inputs/ModalFileInput"
import { FormProvider, useForm } from "react-hook-form"
import { ModalTextInput } from "../../shared/inputs/ModalTextInput"
import { ModalSelectInput } from "../../shared/inputs/ModalSelectInput"
import { ModalLabel } from "../../shared/sections/ModalLabel"
import { ModalSection } from "../../shared/sections/ModalSection"
import { IoMdClose } from "react-icons/io"
import { ModalArrayInput } from "../../shared/inputs/ModalArrayInput"
import { getPrettySize } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNoteStore } from "@/stores/useNotesStore"
import { toasts } from "@/utils/toastUtils"

import styles from "./CreateNoteModal.module.css"

const t = i18n.t

type CreateNoteModalFormProps = {
  setShowUploadModal: (show: boolean) => void
}

export function CreateNoteModalForm({ setShowUploadModal }: CreateNoteModalFormProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const createNoteAndOpen = useNoteStore((state) => state.createNoteAndOpen)
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

  const onSubmit = async (data: FileNoteFormFields) => {
    // This should be impossible, but better
    if (!data.file) {
      toasts.warning(null, { description: t("warnings.noteCreation.noFiles") })
      return
    }

    setIsLoading(true)
    const success = await createNoteAndOpen(
      {
        name: data.name,
        mode: "UPLOAD",
        tags: data.tags || [],
        visibility: data.visibility,
        file: data.file
      },
      "REFERENCE"
    )
    setIsLoading(false)

    if (success) {
      toasts.success("Nota criada com sucesso!")
      setShowUploadModal(false)
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
          <div className={styles.title}>Criar Nota</div>

          <ModalActionRow>
            <ModalSection
              label={<ModalLabel title="Nome" required />}
              input={<ModalTextInput name="name" autoComplete="off" />}
            />
          </ModalActionRow>

          <ModalActionRow>
            <ModalSection
              label={
                <ModalLabel
                  title="Visibilidade"
                  required
                />
              }
              input={<ModalSelectInput name="visibility" options={VISIBILITY_OPTIONS} />}
            />
          </ModalActionRow>

          <ModalActionRow>
            <ModalSection
              label={<ModalLabel title="Palavras-chave" required={false} />}
              input={
                <ModalArrayInput
                  name="tags"
                  placeholder="Adicione apelidos..."
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
                  title="Conteúdo"
                  hint={`Arquivo máximo: ${getPrettySize(NOTE_MAX_SIZE_BYTES)}.`}
                  required
                />
              }
              input={<ModalFileInput name="file" allowedExtensions={NOTE_EXTENSIONS} />}
            />
          </ModalActionRow>

          <div className={styles.bottomContainer}>
            <button
              disabled={isLoading}
              className={styles.submitButton}
              onClick={handleSubmit(onSubmit)}
              type="submit"
            >
              Criar
              {isLoading && (
                <div className={styles.loaderContainer}>
                  <div className={clsx("loader", styles.buttonLoader)}></div>
                </div>
              )}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
