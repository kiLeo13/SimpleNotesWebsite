import type { JSX } from "react"
import type { FullNoteResponseData } from "../../../../../types/api/notes"

import { FaDatabase } from "react-icons/fa"
import { getPrettySize } from "../../../../../utils/utils"

import styles from "./ModalNoteFileView.module.css"
import clsx from "clsx"

type ModalNoteFileViewProps = {
  note: FullNoteResponseData | null
}

export function ModalNoteFileView({ note }: ModalNoteFileViewProps): JSX.Element {
  const isText = note?.note_type === 'TEXT'
  const nameView = normalizeFileName(note?.content, isText)
  const sizeView = getPrettySize(note?.content_size ?? 0)

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <FaDatabase color="#7a6494ff" />
        <span className={styles.size}>{sizeView}</span>
      </div>
      <span className={clsx(styles.name, isText && styles.textDisclaimer)}>{nameView}</span>
    </div>
  )
}

function normalizeFileName(content: string | undefined, isText: boolean): string {
  if (isText) {
    return "Anotações de texto não têm arquivo."
  }
  return content ?? '-'
}