import type { NoteResponseData } from "@/types/api/notes"
import { useState, type JSX, type MouseEventHandler } from "react"

import clsx from "clsx"

import { AppTooltip } from "../ui/AppTooltip"
import { DarkWrapper } from "../DarkWrapper"
import { Permission } from "@/models/Permission"
import { IoMdSettings } from "react-icons/io"
import { UpdateNoteModal } from "../modals/notes/updates/UpdateNoteModal"
import { useNoteStore } from "@/stores/useNotesStore"
import { usePermission } from "@/hooks/usePermission"
import { useTranslation } from "react-i18next"

import styles from "./SidebarNote.module.css"

type SidebarNoteProps = {
  note: NoteResponseData
  onClick?: MouseEventHandler<HTMLDivElement>
}

export function SidebarNote({ note, onClick }: SidebarNoteProps): JSX.Element {
  const { t } = useTranslation()
  const [isPatching, setIsPatching] = useState(false)
  const canEdit = usePermission(Permission.EditNotes)
  const shownNote = useNoteStore((state) => state.shownNote)
  const isOpen = shownNote?.id === note.id

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setIsPatching(true)
  }

  return (
    <div onClick={onClick} className={clsx(styles.noteItem, isOpen && styles.open)}>
      <span className={styles.noteItemTitle}>{note.name}</span>

      {canEdit && (
        <AppTooltip label={t("sidebar.notes.edit")}>
          <button onClick={handleClick} className={styles.patch}>
            <IoMdSettings size={"1.2em"} color="#9a83b4ff" />
          </button>
        </AppTooltip>
      )}

      <DarkWrapper open={isPatching}>
        <UpdateNoteModal noteId={note.id} setIsPatching={setIsPatching} />
      </DarkWrapper>
    </div>
  )
}
