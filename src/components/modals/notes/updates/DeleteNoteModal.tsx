import { useState, type ChangeEvent, type JSX } from "react"
import type { NoteResponseData } from "@/types/api/notes"

import { IoIosWarning } from "react-icons/io"
import { BaseModalTextInput } from "../shared/inputs/BaseModalTextInput"
import { LoaderWrapper } from "@/components/loader/LoaderWrapper"
import { MarkdownDisplay } from "@/components/displays/markdowns/MarkdownDisplay"
import { toasts } from "@/utils/toastUtils"
import { useTranslation } from "react-i18next"
import { noteService } from "@/services/noteService"

import styles from "./DeleteNoteModal.module.css"

type DeleteNoteModalProps = {
  note: NoteResponseData
  setIsDeleting: (show: boolean) => void
}

export function DeleteNoteModal({
  note,
  setIsDeleting
}: DeleteNoteModalProps): JSX.Element {
  const { t } = useTranslation()

  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const answerMatches = answer == note.name
  const canConfirm = answerMatches && !isLoading

  const handleAnswer = (e: ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value)
  }

  const handleClose = () => setIsDeleting(false)

  const handleDeletion = async () => {
    setIsLoading(true)
    const resp = await noteService.deleteNote(note.id)
    setIsLoading(false)

    if (resp) {
      toasts.success(t("modals.delNote.toasts.success"), {
        style: { color: "#b9be66ff" }
      })
      setIsDeleting(false)
    } else {
      toasts.apiError(t("modals.delNote.toasts.error"), resp)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <IoIosWarning size={"1.6em"} color="#ff6161ff" />
        <h2 className={styles.title}>{t("modals.delNote.title")}</h2>
      </div>
      <div className={styles.body}>
        <span className={styles.question}>
          <MarkdownDisplay content={t("modals.delNote.subtitle")} />
        </span>

        <span className={styles.prompt}>
          {t("modals.delNote.instruct", { val: note.name })}
        </span>
        <BaseModalTextInput value={answer} onChange={handleAnswer} />

        <div className={styles.footer}>
          <button className={styles.cancel} onClick={handleClose}>
            {t("modals.delNote.buttons.cancel")}
          </button>
          <LoaderWrapper isLoading={isLoading} loaderProps={{ scale: 0.7 }}>
            <button
              className={styles.confirm}
              disabled={!canConfirm}
              onClick={handleDeletion}
            >
              {t("modals.delNote.buttons.confirm")}
            </button>
          </LoaderWrapper>
        </div>
      </div>
    </div>
  )
}
