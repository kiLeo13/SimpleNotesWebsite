import type { FullNoteResponseData } from "../../../../types/api/notes"
import { noteSchema, type NoteFormFields } from "../../../../types/forms/notes"
import { useState, type JSX, type MouseEventHandler } from "react"

import clsx from "clsx"

import { getPrettySize } from "../../../../utils/utils"
import { NOTE_EXTENSIONS, NOTE_MAX_SIZE_BYTES, noteService } from "../../../../services/noteService"
import { ModalActionRow } from "./sections/ModalActionRow"
import { ModalFileInput } from "./sections/inputs/ModalFileInput"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { ModalTextInput } from "./sections/inputs/ModalTextInput"
import { ModalSelectInput } from "./sections/inputs/ModalSelectInput"
import { ModalLabel } from "./sections/ModalLabel"

import styles from "./CreateNoteModal.module.css"

type CreateNoteModalFormProps = {
  setShownNote: (note: FullNoteResponseData) => void
  setShowUploadModal: (show: boolean) => void
}

export function CreateNoteModalForm({ setShowUploadModal, setShownNote }: CreateNoteModalFormProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const methods = useForm<NoteFormFields>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      name: "",
      visibility: "PUBLIC",
      tags: "",
      file: undefined
    }
  })
  const { handleSubmit } = methods

  const onSubmit = async (data: NoteFormFields) => {
    const file = data.file[0]
    if (!file) {
      alert('Arquivo não encontrado? Isso é possível aqui? Bem, de qualquer jeito, deixe o Léo ciente sobre isso.')
      return
    }

    setIsLoading(true)
    const rawTags = data.tags?.trim()
    const tags = !rawTags || rawTags === '' ? [] : rawTags.split(" ")
    const resp = await noteService.createNote({ name: data.name, tags: tags, visibility: data.visibility }, file)
    setIsLoading(false)

    if (resp.success) {
      setShownNote(resp.data)
      setShowUploadModal(false)
    } else {
      alert(`Erro:\n${JSON.stringify(resp.errors, null, 2)}`)
    }
  }

  const handleCloseClick: MouseEventHandler<HTMLButtonElement> = () => {
    setShowUploadModal(false)
  }

  return (
    <div className={styles.container}>
      <button onClick={handleCloseClick} className={styles.closeTabContainer}>
        <span className={styles.closeIcon}>+</span>
      </button>

      <FormProvider {...methods}>
        <form className={styles.form} noValidate>
          <div className={styles.title}>Criar Nota</div>

          <ModalActionRow
            label={<ModalLabel title="Nome" />}
            input={<ModalTextInput name="name" autoComplete="off" />}
          />

          <ModalActionRow
            label={
              <ModalLabel
                title="Visibilidade"
                hint="A visibilidade de uma nota é apenas para fins de organização e não afeta
                      a privacidade a nível de permissões de visualização do arquivo."
              />
            }
            input={<ModalSelectInput name="visibility" options={[
              { label: "Público", value: "PUBLIC" },
              { label: "Confidencial", value: "CONFIDENTIAL" }
            ]} />}
          />

          <ModalActionRow
            label={<ModalLabel title="Apelidos" required={false} />}
            input={<ModalTextInput name="tags" placeholder="Separe os apelidos por espaço" />}
          />

          <ModalActionRow
            label={<ModalLabel title="Conteúdo" hint={`Arquivo máximo: ${getPrettySize(NOTE_MAX_SIZE_BYTES)}.`} />}
            input={<ModalFileInput name="file" allowedExtensions={NOTE_EXTENSIONS} />}
          />

          <div className={styles.bottomContainer}>
            <button disabled={isLoading} className={styles.submitButton} onClick={handleSubmit(onSubmit)} type="submit">
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