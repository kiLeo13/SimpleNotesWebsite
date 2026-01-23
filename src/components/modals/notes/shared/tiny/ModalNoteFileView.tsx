import type { JSX } from "react"
import type { FullNoteResponseData } from "@/types/api/notes"

import { FaDatabase } from "react-icons/fa"
import { getPrettySize } from "@/utils/utils"

import styles from "./ModalNoteFileView.module.css"
import clsx from "clsx"

type ModalNoteFileViewProps = {
  note: FullNoteResponseData | null
}

export function ModalNoteFileView({ note }: ModalNoteFileViewProps): JSX.Element {
  const hasFileName = ["FLOWCHART", "MARKDOWN"].includes(note?.note_type ?? "")
  const nameView = normalizeFileName(note?.content, hasFileName)
  const sizeView = getPrettySize(note?.content_size ?? 0)

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

function normalizeFileName(content: string | undefined, hasFileName: boolean): string {
  if (hasFileName) {
    return "Anotações desse tipo não têm arquivo."
  }
  return content ?? '-'
}