import { useEffect, useState, type JSX } from "react"
import type { NoteResponseData, FullNoteResponseData } from "@/types/api/notes"

import { Link } from "react-router-dom"
import { ContentBoard } from "@/components/board/ContentBoard"
import { AppTooltip } from "@/components/ui/AppTooltip"
import { FiExternalLink } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { noteService } from "@/services/noteService"
import { toasts } from "@/utils/toastUtils"

import styles from "./NoteFrame.module.css"
import clsx from "clsx"

interface NoteFrameProps {
  baseNote: NoteResponseData
}

export function NoteFrame({ baseNote }: NoteFrameProps): JSX.Element {
  const { t } = useTranslation()
  const [fullNote, setFullNote] = useState<FullNoteResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isFlowChart = baseNote.note_type === "FLOWCHART"
  const isReference = baseNote.note_type === "REFERENCE"
  const isPdf = isReference && fullNote?.content.endsWith(".pdf")

  useEffect(() => {
    let isMounted = true

    async function loadNote() {
      if (baseNote.note_type === "REFERENCE") {
        if (isMounted) {
          setFullNote(baseNote as FullNoteResponseData)
          setIsLoading(false)
        }
        return
      }

      if (!isMounted) return

      setIsLoading(true)
      const resp = await noteService.fetchNote(baseNote.id)
      setIsLoading(false)

      if (resp.success) {
        setFullNote(resp.data)
      } else {
        toasts.apiError(t("errors.notes.cantOpen"), resp)
        console.error("Failed to load note content for preview")
      }
    }

    loadNote()
    return () => {
      isMounted = false
    }
  }, [baseNote, t])

  return (
    <div className={styles.frameContainer}>
      <div className={styles.frameHeader}>
        <span className={styles.noteTitle}>{baseNote.name}</span>
        <AppTooltip label={t("labels.notes.openFull")} side="right">
          <Link to={`/?id=${baseNote.id}`} className={styles.redirectLink}>
            <FiExternalLink />
          </Link>
        </AppTooltip>
      </div>

      <div
        className={clsx(
          styles.frameContent,
          isFlowChart && styles.flowChart,
          isPdf && styles.pdf
        )}
      >
        {isLoading ? (
          <div className={styles.loadingState}>
            <span className={styles.spinner} />
          </div>
        ) : (
          <div className={styles.boardWrapper}>
            {fullNote && <ContentBoard note={fullNote} />}
          </div>
        )}
      </div>
    </div>
  )
}
