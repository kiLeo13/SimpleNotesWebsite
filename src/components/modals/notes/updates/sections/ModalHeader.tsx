import type { JSX } from "react"
import type { FullNoteResponseData } from "../../../../../types/api/notes"

import { MdHeadphones, MdImage } from "react-icons/md"
import { FaClapperboard } from "react-icons/fa6"
import { RiFileGifLine } from "react-icons/ri"
import { ext } from "../../../../../utils/utils"
import { FaFilePdf } from "react-icons/fa6"
import { IoDocumentText } from "react-icons/io5"

import styles from "./ModalHeader.module.css"

type UpdateModalHeaderProps = {
  noteId: number
  note: FullNoteResponseData | null
}

export function ModalHeader({ noteId, note }: UpdateModalHeaderProps): JSX.Element {
  return (
    <header className={styles.header}>
      <h2 className={styles.title}>{`Editar Nota #${noteId}`}</h2>
      
      <h3 className={styles.subtitle}>
        <span className={styles.noteName}>
          {resolveIcon(note?.content, note?.note_type)}
          <span>{note?.name}</span>
        </span>
      </h3>
    </header>
  )
}

function resolveIcon(fileName: string | undefined, noteType: "TEXT" | "REFERENCE" | undefined): JSX.Element {
  const fileExt = ext(fileName || '')

  if (noteType === 'TEXT') {
    return <IoDocumentText />
  }

  switch (fileExt) {
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
    case "jfif":
      return <MdImage />

    case "pdf":
      return <FaFilePdf />

    case "gif":
      return <RiFileGifLine />

    case "mp4":
      return <FaClapperboard />

    case "mp3":
      return <MdHeadphones />

    default:
      return <></>
  }
}