import type { JSX } from "react"
import type { NoteResponseData } from "@/types/api/notes"

import clsx from "clsx"

import { FaDatabase } from "react-icons/fa"
import { getPrettySize } from "@/utils/utils"
import { useTranslation } from "react-i18next"

import styles from "./ModalNoteFileView.module.css"

type ModalNoteFileViewProps = {
  note: NoteResponseData | null
}

export function ModalNoteFileView({ note }: ModalNoteFileViewProps): JSX.Element {
  const { t } = useTranslation()

  const hasFileName = ["FLOWCHART", "MARKDOWN"].includes(note?.note_type ?? "")
  const sizeView = getPrettySize(note?.content_size ?? 0)

  const contentStr = note?.note_type === "REFERENCE" ? note.content : undefined
  const nameView = normalizeFileName(contentStr, hasFileName, t)

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <FaDatabase color="#7a6494ff" />
        <span className={styles.size}>{sizeView}</span>
      </div>
      <span className={clsx(styles.name, hasFileName && styles.textDisclaimer)}>{nameView}</span>
    </div>
  )
}

function normalizeFileName(content: string | undefined, hasFileName: boolean, t: (s: string) => string): string {
  if (hasFileName) {
    return t("updateNoteModal.noFile")
  }
  return content ?? "-"
}
