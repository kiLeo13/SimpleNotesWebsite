import { type JSX, useState } from "react"

import { IoMdClose } from "react-icons/io"
import {
  editorSchema,
  VISIBILITY_OPTIONS,
  type NoteFormFields,
  type TextNoteFormFields
} from "@/types/forms/notes"
import { useForm, FormProvider, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ModalActionRow } from "../../shared/sections/ModalActionRow"
import { ModalSection } from "../../shared/sections/ModalSection"
import { ModalLabel } from "../../shared/sections/ModalLabel"
import { BsDiagram3 } from "react-icons/bs"
import { CodeEditor } from "@/components/board/editors/CodeEditor"
import { ModalTextInput } from "../../shared/inputs/ModalTextInput"
import { ModalSelectInput } from "../../shared/inputs/ModalSelectInput"
import { LivePreview } from "./LivePreview"
import { LoaderContainer } from "@/components/LoaderContainer"
import { ModalArrayInput } from "../../shared/inputs/ModalArrayInput"
import { useNoteStore } from "@/stores/useNotesStore"
import { useTranslation } from "react-i18next"
import { toasts } from "@/utils/toastUtils"

import styles from "./CreateEditorModal.module.css"

export type EditorMode = "MARKDOWN" | "FLOWCHART"

type CreateEditorModalProps = {
  mode: EditorMode
  onClose: () => void
}

export function CreateEditorModal({ mode, onClose }: CreateEditorModalProps): JSX.Element {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const createNoteAndOpen = useNoteStore((state) => state.createNoteAndOpen)
  const methods = useForm<TextNoteFormFields>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      mode: "EDITOR",
      name: "",
      visibility: "PUBLIC",
      tags: [],
      content: ""
    }
  })

  const { handleSubmit, control } = methods
  const liveContent = useWatch({ control, name: "content" })

  const onSubmit = async (data: NoteFormFields) => {
    setIsLoading(true)
    const success = await createNoteAndOpen({ ...data }, mode)
    setIsLoading(false)

    if (success) {
      toasts.success(t("success.noteCreated"))
      onClose()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.close} onClick={onClose}>
        <IoMdClose color="#5e4c79" size={"24px"} />
      </div>

      <div className={styles.header}>
        <div className={styles.headerIconWrapper}>
          <BsDiagram3 size={"1.5em"} color="#6d5c88" />
        </div>
        <div className={styles.title}>
          {mode === "FLOWCHART" ? "Novo Diagrama" : "Nova Nota Markdown"}
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.editorPanel}>
          <FormProvider {...methods}>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
              <ModalActionRow>
                <ModalSection
                  label={<ModalLabel title="Nome" required />}
                  input={<ModalTextInput name="name" autoComplete="off" />}
                />
              </ModalActionRow>

              <ModalActionRow>
                <ModalSection
                  label={<ModalLabel title="Visibilidade" required />}
                  input={<ModalSelectInput name="visibility" options={VISIBILITY_OPTIONS} />}
                />
              </ModalActionRow>

              <ModalActionRow>
                <ModalSection
                  label={<ModalLabel title="Tags" required={false} />}
                  input={
                    <ModalArrayInput
                      name="tags"
                      placeholder="Adicione tags..."
                      minLength={2}
                      maxLength={30}
                    />
                  }
                />
              </ModalActionRow>

              <div className={styles.codeEditorWrapper}>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <CodeEditor code={field.value || ""} onChange={(val) => field.onChange(val)} />
                  )}
                />
              </div>

              <button disabled={isLoading} className={styles.submitButton} type="submit">
                {isLoading && <LoaderContainer />}
                Criar Nota
              </button>
            </form>
          </FormProvider>
        </div>

        <LivePreview mode={mode} content={liveContent} />
      </div>
    </div>
  )
}
