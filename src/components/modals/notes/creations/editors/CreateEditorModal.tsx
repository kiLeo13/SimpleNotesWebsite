import { type JSX, useMemo, useState } from "react"

import { IoMdClose } from "react-icons/io"
import {
  editorSchema,
  VISIBILITY_OPTIONS,
  type NoteFormFields,
  type TextNoteFormFields
} from "@/types/forms/notes"
import { useForm, FormProvider, Controller, useWatch } from "react-hook-form"
import { ModalActionRow } from "../../shared/sections/ModalActionRow"
import { ModalSection } from "../../shared/sections/ModalSection"
import { ModalLabel } from "../../shared/sections/ModalLabel"
import { FaMarkdown } from "react-icons/fa"
import { BsDiagram3 } from "react-icons/bs"
import { CodeEditor } from "@/components/board/editors/CodeEditor"
import { ModalTextInput } from "../../shared/inputs/ModalTextInput"
import { ModalSelectInput } from "../../shared/inputs/ModalSelectInput"
import { LoaderWrapper } from "@/components/loader/LoaderWrapper"
import { LivePreview } from "./LivePreview"
import { ModalArrayInput } from "../../shared/inputs/ModalArrayInput"
import { useNoteStore } from "@/stores/useNotesStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { useDebounce } from "@/hooks/useDebounce"
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
  const isChart = mode === "FLOWCHART"
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
  const debouncedContent = useDebounce(liveContent, 300)
  const viewOptions = useMemo(() => {
    return [...VISIBILITY_OPTIONS].map((o) => ({
      label: t(o.label),
      value: o.value
    }))
  }, [t])

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
          {mode === "FLOWCHART" ? (
            <BsDiagram3 size={"1.5em"} color="#6d5c88" />
          ) : (
            <FaMarkdown size={"1.5em"} color="#6d5c88" />
          )}
        </div>
        <div className={styles.title}>
          {mode === "FLOWCHART"
            ? t("createNoteModal.modeFlowchart")
            : t("createNoteModal.modeMarkdown")}
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.editorPanel}>
          <FormProvider {...methods}>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
              <ModalActionRow className={styles.actionRow}>
                <ModalSection
                  label={<ModalLabel title={t("createNoteModal.name")} required />}
                  input={<ModalTextInput name="name" autoComplete="off" />}
                />
                <ModalSection
                  label={<ModalLabel title={t("createNoteModal.visibility")} required />}
                  input={<ModalSelectInput name="visibility" options={viewOptions} />}
                />
              </ModalActionRow>

              <ModalActionRow>
                <ModalSection
                  label={<ModalLabel title={t("createNoteModal.tags")} required={false} />}
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
                  label={<ModalLabel title={t("createNoteModal.content")} required />}
                  input={
                    <Controller
                      name="content"
                      control={control}
                      render={({ field }) => (
                        <CodeEditor
                          code={field.value || ""}
                          onChange={(val) => field.onChange(val)}
                        />
                      )}
                    />
                  }
                />
              </ModalActionRow>

              <LoaderWrapper isLoading={isLoading} loaderProps={{ scale: 0.8 }}>
                <button disabled={isLoading} className={styles.submitButton} type="submit">
                  {t("createNoteModal.submit")}
                </button>
              </LoaderWrapper>
            </form>
          </FormProvider>
        </div>

        <LivePreview mode={mode} content={isChart ? debouncedContent : liveContent} />
      </div>
    </div>
  )
}
