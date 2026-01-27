import type { JSX } from "react"
import type { FullNoteResponseData, NoteType } from "@/types/api/notes"

import { MdHeadphones, MdImage } from "react-icons/md"
import { LuClapperboard } from "react-icons/lu"
import { FaMarkdown } from "react-icons/fa"
import { RiFlowChart } from "react-icons/ri"
import { RiFileGifLine } from "react-icons/ri"
import { FaFilePdf } from "react-icons/fa6"
import { useTranslation } from "react-i18next"
import { ext } from "@/utils/utils"

import styles from "./ModalHeader.module.css"

type UpdateModalHeaderProps = {
  noteId: number
  note: FullNoteResponseData | null
}

export function ModalHeader({ noteId, note }: UpdateModalHeaderProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <h2 className={styles.title}>{t("updateNoteModal.title", { note: noteId })}</h2>

      <h3 className={styles.subtitle}>
        <span className={styles.noteName}>
          {resolveIcon(note?.content, note?.note_type)}
          <span>{note?.name}</span>
        </span>
      </h3>
    </header>
  )
}

function resolveIcon(fileName: string | undefined, noteType: NoteType | undefined): JSX.Element {
  const fileExt = ext(fileName || "")

  if (noteType === "MARKDOWN") {
    return <FaMarkdown />
  }

  if (noteType === "FLOWCHART") {
    return <RiFlowChart />
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
      return <LuClapperboard />

    case "mp3":
      return <MdHeadphones />

    default:
      return <></>
  }
}
